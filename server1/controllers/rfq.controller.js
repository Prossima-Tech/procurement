const Indent = require('../models/indent.model');
const User = require('../models/user.model');
const Unit = require('../models/unit.model');
const Project = require('../models/project.model');
const RFQ = require('../models/rfq.model');
const ItemVendors = require('../models/itemVendors.model');
const mongoose = require('mongoose');

// Create new RFQ
exports.createRFQ = async (req, res) => {
    try {
        const {
            indent,
            unit,
            project,
            items,
            selectedVendors,
            submissionDeadline,
            publishDate,
            generalTerms
        } = req.body;

        // 1. Validate required fields
        if (!indent || !unit || !project || !items || !selectedVendors || !submissionDeadline) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // 2. Validate items array
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Items must be a non-empty array'
            });
        }

        // 3. Validate items structure
        for (const item of items) {
            if (!item.indentItemType || !item.indentItemId || !item.name || !item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Each item must have indentItemType, indentItemId, name, and quantity'
                });
            }

            if (item.indentItemType === 'existing' && !item.itemCode) {
                return res.status(400).json({
                    success: false,
                    message: 'Existing items must have an itemCode'
                });
            }

            if (item.quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Item quantity must be at least 1'
                });
            }
        }

        // 4. Validate submission deadline
        const submissionDeadlineDate = new Date(submissionDeadline);
        if (submissionDeadlineDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Submission deadline must be in the future'
            });
        }

        // 5. Validate selected vendors
        if (!Array.isArray(selectedVendors) || selectedVendors.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one vendor must be selected'
            });
        }

        // 6. Check if indent exists
        const indentExists = await Indent.findById(indent);
        if (!indentExists) {
            return res.status(404).json({
                success: false,
                message: 'Indent not found'
            });
        }

        // 7. Validate vendors exist
        const vendorIds = selectedVendors.map(v => v.vendor);
        const validVendors = await Vendor.find({ _id: { $in: vendorIds } });
        
        if (validVendors.length !== vendorIds.length) {
            return res.status(404).json({
                success: false,
                message: 'One or more selected vendors not found'
            });
        }

        // 8. Create RFQ object
        const rfqData = {
            indent,
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

        // 9. Save RFQ
        const newRFQ = new RFQ(rfqData);
        await newRFQ.save();

        // 10. Send response
        return res.status(201).json({
            success: true,
            message: 'RFQ created successfully',
            data: {
                rfqId: newRFQ._id,
                rfqNumber: newRFQ.rfqNumber
            }
        });

    } catch (error) {
        console.error('Error in createRFQ:', error);
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
            .populate('indentId')
            .populate('items.itemId')
            .populate('createdBy', 'name email')
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


const RFQ = require('../models/rfq.model');
const Vendor = require('../models/vendor.model');

// Get RFQ details for vendor quote form
exports.getVendorQuoteForm = async (req, res) => {
    try {
        const { vendorId } = req.params;
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

// Submit vendor quote
exports.submitVendorQuote = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { rfq: rfqId } = req.query;
        const quoteData = req.body;

        // Basic validation
        if (!quoteData.items || !Array.isArray(quoteData.items)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid quote data'
            });
        }

        // Find RFQ and validate
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

        // Create vendor quote object
        const vendorQuote = {
            vendor: vendorId,
            quotationReference: quoteData.quotationReference,
            items: quoteData.items.map(item => ({
                rfqItem: item.rfqItemId,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                totalPrice: item.unitPrice * item.quantity,
                deliveryTime: item.deliveryTime,
                specifications: item.specifications,
                technicalRemarks: item.technicalRemarks,
                commercialRemarks: item.commercialRemarks,
                alternativeOffering: item.alternativeOffering
            })),
            totalAmount: quoteData.items.reduce((sum, item) => 
                sum + (item.unitPrice * item.quantity), 0),
            currency: quoteData.currency || 'INR',
            paymentTerms: quoteData.paymentTerms,
            deliveryTerms: quoteData.deliveryTerms,
            warranty: quoteData.warranty,
            validityPeriod: quoteData.validityPeriod,
            documents: quoteData.documents || [],
            status: 'submitted',
            submissionDate: new Date()
        };

        // Add quote to RFQ
        rfq.vendorQuotes.push(vendorQuote);
        
        // Update vendor status
        const vendorIndex = rfq.selectedVendors.findIndex(
            v => v.vendor.toString() === vendorId
        );
        if (vendorIndex !== -1) {
            rfq.selectedVendors[vendorIndex].status = 'accepted';
            rfq.selectedVendors[vendorIndex].responseDate = new Date();
        }

        await rfq.save();

        return res.status(201).json({
            success: true,
            message: 'Quote submitted successfully',
            data: {
                rfqNumber: rfq.rfqNumber,
                quotationReference: vendorQuote.quotationReference
            }
        });

    } catch (error) {
        console.error('Error submitting vendor quote:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
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
