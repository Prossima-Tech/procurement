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
