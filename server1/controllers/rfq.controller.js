const Indent = require('../models/indent.model');
const User = require('../models/user.model');
const Unit = require('../models/unit.model');
const Project = require('../models/project.model');
const RFQ = require('../models/rfq.model');
const ItemVendors = require('../models/itemPriceHistory');
const mongoose = require('mongoose');
const Vendor = require('../models/vendor.model');
const { sendEmail } = require('../services/emailService');

// Create new RFQ
exports.createRFQ = async (req, res) => {
    // console.log('🚀 Starting createRFQ process');
    // console.log('📥 Request body:', JSON.stringify(req.body, null, 2));

    try {
        const {
            indent: indentId,
            unit,
            project,
            items,
            selectedVendors,
            submissionDeadline,
            publishDate,
            generalTerms
        } = req.body;

        // console.log('🔍 Extracted request data:', {
        //     indent,
        //     unit,
        //     project,
        //     itemsCount: items?.length,
        //     vendorsCount: selectedVendors?.length,
        //     submissionDeadline,
        //     publishDate
        // });

        // 1. Validate required fields
        // console.log('✅ Validating required fields...');
        if (!indentId || !unit || !project || !items || !selectedVendors || !submissionDeadline) {
            // console.log('❌ Missing required fields:', {
            //     indent: !!indent,
            //     unit: !!unit,
            //     project: !!project,
            //     items: !!items,
            //     selectedVendors: !!selectedVendors,
            //     submissionDeadline: !!submissionDeadline
            // });
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // 2. Validate items array
        // console.log('✅ Validating items array...');
        if (!Array.isArray(items) || items.length === 0) {
            // console.log('❌ Invalid items array:', { isArray: Array.isArray(items), length: items?.length });
            return res.status(400).json({
                success: false,
                message: 'Items must be a non-empty array'
            });
        }

        // 3. Validate items structure
        // console.log('✅ Validating individual items...');
        for (const item of items) {
            // console.log('�� Checking item:', item);
            
            if (!item.indentItemType || !item.name || !item.quantity) {
                // console.log('❌ Invalid item structure:', {
                //     hasType: !!item.indentItemType,
                //     hasName: !!item.name,
                //     hasQuantity: !!item.quantity
                // });
                return res.status(400).json({
                    success: false,
                    message: 'Each item must have indentItemType, name, and quantity'
                });
            }

            if (item.indentItemType === 'existing' && !item.itemCode) {
                // console.log('❌ Existing item missing itemCode:', item);
                return res.status(400).json({
                    success: false,
                    message: 'Existing items must have an itemCode'
                });
            }

            if (item.quantity < 1) {
                // console.log('❌ Invalid quantity:', item.quantity);
                return res.status(400).json({
                    success: false,
                    message: 'Item quantity must be at least 1'
                });
            }
        }

        // 4. Validate submission deadline
        // console.log('✅ Validating submission deadline...');
        const submissionDeadlineDate = new Date(submissionDeadline);
        if (submissionDeadlineDate <= new Date()) {
            // console.log('❌ Invalid submission deadline:', { deadline: submissionDeadlineDate, now: new Date() });
            return res.status(400).json({
                success: false,
                message: 'Submission deadline must be in the future'
            });
        }

        // 5. Validate selected vendors
        // console.log('✅ Validating selected vendors...');
        if (!Array.isArray(selectedVendors) || selectedVendors.length === 0) {
            // console.log('❌ Invalid vendors array:', { isArray: Array.isArray(selectedVendors), length: selectedVendors?.length });
            return res.status(400).json({
                success: false,
                message: 'At least one vendor must be selected'
            });
        }

        // 6. Check if indent exists
        // console.log('✅ Checking indent existence...');
        const indentExists = await Indent.findById(indentId);
        if (!indentExists) {
            // console.log('❌ Indent not found:', indent);
            return res.status(404).json({
                success: false,
                message: 'Indent not found'
            });
        }

        // 7. Validate vendors exist
        // console.log('✅ Validating vendor existence...');
        const vendorIds = selectedVendors.map(v => v.vendor);
        // console.log('🔍 Checking vendors:', vendorIds);
        const validVendors = await Vendor.find({ _id: { $in: vendorIds } });
        
        if (validVendors.length !== vendorIds.length) {
            // console.log('❌ Some vendors not found:', {
            //     requested: vendorIds.length,
            //     found: validVendors.length
            // });
            return res.status(404).json({
                success: false,
                message: 'One or more selected vendors not found'
            });
        }

        // 8. Create RFQ object
        // console.log('✅ Creating RFQ object...');
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');

        // Get count of RFQs created this month
        const count = await RFQ.countDocuments({
            createdAt: {
                $gte: new Date(date.getFullYear(), date.getMonth(), 1),
                $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
            }
        });

        const rfqNumber = `RFQ-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;

        const rfqData = {
            rfqNumber,
            indent: indentId,
            unit,
            project,
            items: items.map(item => ({
                ...item,
                requiredDeliveryDate: item.requiredDeliveryDate || submissionDeadlineDate
            })),
            selectedVendors: selectedVendors.map(vendor => ({
                ...vendor,
                status: 'invited',
                invitationDate: new Date()
            })),
            submissionDeadline: submissionDeadlineDate,
            publishDate: publishDate ? new Date(publishDate) : new Date(),
            generalTerms,
            status: 'published'
        };
        // console.log('📝 RFQ Data prepared:', JSON.stringify(rfqData, null, 2));

        // 9. Save RFQ
        // console.log('💾 Saving RFQ...');
        const newRFQ = new RFQ(rfqData);
        await newRFQ.save();
        // console.log('✅ RFQ saved successfully:', {
        //     id: newRFQ._id,
        //     rfqNumber: newRFQ.rfqNumber
        // });

        // Update item statuses in the indent
        const indent = await Indent.findById(indentId);
        
        // Update status for each item
        for (const item of items) {
            if (item.indentItemType === 'existing') {
                // Update existing item
                await Indent.updateOne(
                    { 
                        _id: indentId,
                        'items.existing._id': item.indentItemId 
                    },
                    { 
                        $set: {
                            'items.existing.$.status': 'rfq',
                            'items.existing.$.rfqReference': newRFQ._id
                        }
                    }
                );
            } else if (item.indentItemType === 'new') {
                // Update new item
                await Indent.updateOne(
                    { 
                        _id: indentId,
                        'items.new.name': item.name 
                    },
                    { 
                        $set: {
                            'items.new.$.status': 'rfq',
                            'items.new.$.rfqReference': newRFQ._id
                        }
                    }
                );
            }
        }

        // 10. Send response
        // console.log('📤 Sending success response');
        return res.status(201).json({
            success: true,
            message: 'RFQ created successfully and item statuses updated',
            data: {
                rfqId: newRFQ._id,
                rfqNumber: newRFQ.rfqNumber
            }
        });

    } catch (error) {
        // console.error('❌ Error in createRFQ:', error);
        // console.error('Stack trace:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.getallRFQ = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchQuery = req.query.search || '';
        const status = req.query.status;

        let query = {};
        
        if (searchQuery) {
            query.$or = [
                { 'rfqNumber': { $regex: searchQuery, $options: 'i' } },
                { 'status': { $regex: searchQuery, $options: 'i' } }
            ];
        }

        // Add status filter
        if (status) {
            query.status = status;
        }

        // Get total count for pagination
        const total = await RFQ.countDocuments(query);

        const rfq = await RFQ.find(query)
            .populate('indent')
            .populate('items.indentItemId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
            
        res.status(200).json({
            rfqs: rfq,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit
        });

    } catch (error) {
        console.error('Error fetching RFQs:', error);
        res.status(500).json({ message: 'Error fetching RFQs', error: error.message });
    }
};

exports.deleteRFQ = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid RFQ ID format' });
        }

        const rfq = await RFQ.findById(id);
        if (!rfq) {
            return res.status(404).json({ message: 'RFQ not found' });
        }

        await RFQ.findByIdAndDelete(id);
        
        res.status(200).json({ message: 'RFQ deleted successfully' });
    } catch (error) {
        console.error('Error deleting RFQ:', error);
        res.status(500).json({ message: 'Error deleting RFQ', error: error.message });
    }
};

exports.createOrUpdateItemVendors = async (req, res) => {
  try {
    const { indentId, items, selectedVendors } = req.body;

    // Validate required fields
    if (!indentId || !Array.isArray(items) || items.length === 0 || !Array.isArray(selectedVendors) || selectedVendors.length === 0) {
        return res.status(400).json({ message: "indentId, items array, and selectedVendors array are required." });
    }

    const updatedMappings = [];

    // Loop through each item and update the associated vendors
    for (const item of items) {
        const { itemType, indentItemId, quantity, category } = item;

        // Prepare the vendor entries to be added
        const vendorEntries = selectedVendors.map(vendorId => ({
            vendor: vendorId,
            lastUpdated: Date.now(),
            // Optional fields, you can add more metadata if needed
        }));

        // Use `findOneAndUpdate` to either update the existing entry or create a new one
        const updatedMapping = await ItemVendors.findOneAndUpdate(
            { item: indentItemId }, // Query by item id
            {
                $setOnInsert: {
                    item: indentItemId,
                    category: category, // Add the category if it's a new entry
                    quantity: quantity,
                },
                $addToSet: { vendors: { $each: vendorEntries } } // Add selected vendors without duplicates
            },
            { new: true, upsert: true } // Create new document if none exists
        );

        updatedMappings.push(updatedMapping);
    }

    res.status(200).json({ message: "Item vendors updated successfully.", data: updatedMappings });
} catch (error) {
    console.error("Error updating item vendors:", error);
    res.status(500).json({ message: "Error updating item vendors.", error });
    }
};

//send notifications to vendors
exports.notifyVendors = async (req,res) =>{
    try {
        const { rfqId, vendorIds, submissionDeadline, generalTerms } = req.body;

        // Fetch RFQ details
        const rfq = await RFQ.findById(rfqId)
            .populate('items.indentItemId')
            .populate('selectedVendors.vendor');

        if (!rfq) {
            return res.status(404).json({ success: false, message: 'RFQ not found' });
        }

        // Fetch vendor details
        const vendors = await Vendor.find({ _id: { $in: vendorIds } });
        // Send emails to each vendor
        for (const vendor of vendors) {
            console.log("vendor", vendor);
            console.log(`access the given link to submit quotations: http://localhost:5173/vendor-quote/${vendor._id}/${rfq._id}`);
            const emailContent = {
                to: vendor.email,
                subject: `New RFQ Request - ${rfq._id}`,
                html: `
                    <h2>Request for Quotation</h2>
                    <p>Dear ${vendor.name},</p>
                    <p>You have been invited to submit a quotation for the following items:</p>
                    <ul>
                        ${rfq.items.map(item => `
                            <li>
                                ${item.name} - Quantity: ${item.quantity}
                                ${item.itemCode ? `(Item Code: ${item.itemCode})` : ''}
                            </li>
                        `).join('')}
                    </ul>
                    <p> ${`access the given link to submit quotations: http://localhost:5173/vendor-quote/${vendor._id}/${rfq._id}`}</p>

                    <p><strong>Submission Deadline:</strong> ${new Date(submissionDeadline).toLocaleDateString()}</p>
                    <p><strong>General Terms:</strong></p>
                    <p>${generalTerms}</p>
                    <p>Please log in to our portal to submit your quotation.</p>
                    <p>Best regards,<br>Procurement Team</p>
                `
            };

            // Send email using your email service
            await sendEmail(emailContent);
        }

        res.json({ success: true, message: 'Vendors notified successfully' });
    } catch (error) {
        console.error('Error notifying vendors:', error);
        res.status(500).json({ success: false, message: 'Failed to notify vendors' });
    }
}

// Get RFQ details for vendor quote form
exports.getVendorQuoteForm = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = id;
        const { rfq: rfqId } = req.query;

        // Validate if vendor exists
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        // Get RFQ details
        const rfq = await RFQ.findOne({
            _id: rfqId,
            'selectedVendors.vendor': vendorId,
            submissionDeadline: { $gt: new Date() }
        });

        if (!rfq) {
            return res.status(404).json({
                success: false,
                message: 'RFQ not found or submission deadline passed'
            });
        }

        // Check if vendor has already submitted a quote
        const existingQuote = rfq.vendorQuotes.find(
            quote => quote.vendor.toString() === vendorId
        );

        if (existingQuote) {
            return res.status(400).json({
                success: false,
                message: 'Quote already submitted'
            });
        }

        // Return RFQ details for the form
        return res.json({
            success: true,
            data: {
                rfqNumber: rfq.rfqNumber,
                items: rfq.items,
                submissionDeadline: rfq.submissionDeadline,
                generalTerms: rfq.generalTerms
            }
        });

    } catch (error) {
        console.error('Error getting vendor quote form:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

exports.getVendorRFQs = async (req, res) => {
    const { id } = req.params;
    console.log("fetch rfq for vendorId", id);
    const rfqs = await RFQ.find({ 'selectedVendors.vendor': id });
    res.json(rfqs);
};




exports.getRFQDetails = async (req, res) => {
    try {
        const { rfqId } = req.params;

        const rfq = await RFQ.findById(rfqId)
            .populate('unit', 'name')
            .populate('project', 'name')
            .populate('selectedVendors.vendor', 'name email contact')
            .populate('selectedQuote.vendor', 'name')
            .populate({
                path: 'vendorQuotes',
                populate: {
                    path: 'vendor',
                    select: 'name email contact'
                }
            });

        if (!rfq) {
            return res.status(404).json({
                success: false,
                message: 'RFQ not found'
            });
        }

        // Calculate comparison metrics for vendor quotes
        const quotesComparison = rfq.vendorQuotes.map(quote => ({
            vendor: quote.vendor,
            quotationReference: quote.quotationReference,
            totalAmount: quote.totalAmount,
            currency: quote.currency,
            averageDeliveryTime: quote.items.reduce((sum, item) => 
                sum + item.deliveryTime, 0) / quote.items.length,
            evaluationScores: quote.evaluationScores,
            status: quote.status
        }));

        return res.status(200).json({
            success: true,
            data: {
                rfq,
                quotesComparison
            }
        });
    } catch (error) {
        console.error('Error fetching RFQ details:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get vendor quote comparison for specific RFQ
exports.getQuotesComparison = async (req, res) => {
    try {
        const { rfqId } = req.params;

        const rfq = await RFQ.findById(rfqId)
            .populate('vendorQuotes.vendor', 'name')
            .select('vendorQuotes items');

        if (!rfq) {
            return res.status(404).json({
                success: false,
                message: 'RFQ not found'
            });
        }

        // Create item-wise comparison
        const itemComparison = rfq.items.map(rfqItem => {
            const itemQuotes = rfq.vendorQuotes.map(quote => {
                const quoteItem = quote.items.find(
                    item => item.rfqItem.toString() === rfqItem._id.toString()
                );
                return {
                    vendor: quote.vendor,
                    unitPrice: quoteItem?.unitPrice,
                    deliveryTime: quoteItem?.deliveryTime,
                    specifications: quoteItem?.specifications,
                    alternativeOffering: quoteItem?.alternativeOffering
                };
            });

            return {
                itemName: rfqItem.name,
                itemCode: rfqItem.itemCode,
                requiredQuantity: rfqItem.quantity,
                quotes: itemQuotes
            };
        });

        return res.status(200).json({
            success: true,
            data: {
                itemComparison,
                vendors: rfq.vendorQuotes.map(q => ({
                    vendor: q.vendor,
                    totalAmount: q.totalAmount,
                    currency: q.currency,
                    evaluationScores: q.evaluationScores
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching quotes comparison:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

exports.getVendorQuote = async (req, res) => {
    try {
        // const { vendorId } = req.params;
        const { rfqId } = req.params;  // Changed to match frontend query parameter
        const vendorId = req.body.vendorId;
        // console.log("vendorId",vendorId);
        // console.log("rfqId",rfqId);
        // Validate if vendor is authorized for this RFQ
        

        const rfq = await RFQ.findById(rfqId)
            .populate('unit', 'name')
            .populate('project', 'name')
            .select('-vendorQuotes -selectedQuote'); // Exclude sensitive bidding data

        if (!rfq) {
            return res.status(404).json({
                success: false,
                message: 'RFQ not found or vendor not authorized'
            });
        }

        // Get vendor details
        if(vendorId){
            const vendor = await Vendor.findById(vendorId)
                .select('name email contact address'); // Only select necessary vendor fields
        }
        // console.log("vendor",vendor);
        // console.log("rfq",rfq);
        // Format the response data
        const responseData = {
            rfq: rfq,
            // vendor: vendor?vendor:null
        };

        return res.status(200).json(responseData);

    } catch (error) {
        console.error('Error fetching vendor quote details:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

exports.submitVendorQuote = async (req, res) => {
    try {
        const { vendorId, rfqId, items } = req.body;

        // Find the RFQ by ID
        const rfq = await RFQ.findById(rfqId);
        if (!rfq) {
            return res.status(404).json({
                success: false,
                message: 'RFQ not found'
            });
        }

        // Check if the vendor is authorized for this RFQ
        const isVendorAuthorized = rfq.selectedVendors.some(v => v.vendor.toString() === vendorId);
        if (!isVendorAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'Vendor not authorized for this RFQ'
            });
        }

        // Map the incoming items to the VendorQuoteSchema structure
        const itemQuotes = items.map(item => ({
            rfqItem: item.itemId,
            unitPrice: item.quotedPrice,
            quantity: item.quotedQuantity,
            totalPrice: item.quotedPrice * item.quotedQuantity,
            deliveryTime: item.deliveryTimeline,
            specifications: {}, // Add any specifications if available
            technicalRemarks: item.remarks,
            commercialRemarks: '', // Add any commercial remarks if available
            alternativeOffering: {
                suggested: false,
                details: '',
                unitPrice: 0
            }
        }));

        // Create a new vendor quote
        const vendorQuote = {
            vendor: vendorId,
            quotationReference: `QT/${new Date().getFullYear()}/${Math.random().toString(36).substr(2, 5)}`,
            items: itemQuotes,
            totalAmount: itemQuotes.reduce((sum, item) => sum + item.totalPrice, 0),
            status: 'submitted',
            submissionDate: new Date()
        };

        // Add the vendor quote to the RFQ
        rfq.vendorQuotes.push(vendorQuote);
        await rfq.save();

        return res.status(200).json({
            success: true,
            message: 'Vendor quote submitted successfully',
            data: vendorQuote
        });

    } catch (error) {
        console.error('Error submitting vendor quote:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

exports.getVendorQuotes = async (req, res) => {
    try {
        const { rfqId } = req.params;
        console.log("rfqId", rfqId);
        const rfq = await RFQ.findById(rfqId)
            .populate('vendorQuotes.vendor')
            .select('vendorQuotes');

        if (!rfq) {
            return res.status(404).json({
                success: false,
                message: 'RFQ not found'
            });
        }
        console.log("rfq", rfq.vendorQuotes);
        return res.status(200).json({
            success: true,
            quotes: rfq.vendorQuotes || []
        });

    } catch (error) {
        console.error('Error fetching vendor quotes:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};