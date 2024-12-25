// inspection.controller.js

const mongoose = require('mongoose');
const Inspection = require('../models/Inspection.model');
const GRN = require('../models/grn.model');

class InspectionController {
    // Generate inspection number helper method
    generateInspectionNumber = async () => {
        try {
            const date = new Date();
            const year = date.getFullYear().toString().slice(-2);
            const month = String(date.getMonth() + 1).padStart(2, '0');

            const count = await Inspection.countDocuments({
                createdAt: {
                    $gte: new Date(date.getFullYear(), date.getMonth(), 1),
                    $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
                }
            });

            return `INSP-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
        } catch (error) {
            throw new Error('Error generating inspection number: ' + error.message);
        }
    }

    // Create inspection method
    createInspection = async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { grnId } = req.body;

            // Fetch GRN and validate
            const grn = await GRN.findById(grnId).session(session);
            if (!grn) {
                throw new Error('GRN not found');
            }
            if (grn.status !== 'inspection_pending' && grn.status !== 'submitted') {
                throw new Error('GRN must be in inspection_pending or submitted status');
            }

            // Generate inspection number
            const inspectionNumber = await this.generateInspectionNumber();

            // Map GRN items to inspection items
            const inspectionItems = grn.items.map(grnItem => ({
                grnItem: grnItem._id,
                partCode: grnItem.partCode,
                receivedQuantity: grnItem.receivedQuantity,
                acceptedQuantity: 0,
                rejectedQuantity: 0,
                itemDetails: {
                    partCodeNumber: grnItem.itemDetails.partCodeNumber || grnItem.partCode,
                    itemName: grnItem.itemDetails.itemName || '',
                    itemCode: grnItem.itemDetails.itemCode || grnItem.partCode,
                    measurementUnit: grnItem.itemDetails.measurementUnit || 'Units'
                },
                parameters: [],
                result: 'pending',
                remarks: ''
            }));

            const inspection = new Inspection({
                inspectionNumber,
                grn: grnId,
                inspector: req.user._id,
                startDate: new Date(),
                items: inspectionItems,
                status: 'pending',
                overallResult: 'pending',
                remarks: ''
            });

            await inspection.save({ session });

            // Update GRN status
            await GRN.findByIdAndUpdate(
                grnId,
                { status: 'inspection_in_progress' },
                { session }
            );

            await session.commitTransaction();

            res.status(201).json({
                success: true,
                message: 'Inspection created successfully',
                data: inspection
            });

        } catch (error) {
            await session.abortTransaction();
            console.error('Inspection creation error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        } finally {
            session.endSession();
        }
    }

    // Get all inspections
    getInspections = async (req, res) => {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                status,
                dateFrom,
                dateTo
            } = req.query;

            const query = {};

            if (search) {
                query.$or = [
                    { inspectionNumber: { $regex: search, $options: 'i' } },
                    { 'items.partCode': { $regex: search, $options: 'i' } }
                ];
            }

            if (status) {
                query.status = status;
            }

            if (dateFrom || dateTo) {
                query.createdAt = {};
                if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
                if (dateTo) query.createdAt.$lte = new Date(dateTo);
            }

            const inspections = await Inspection.paginate(query, {
                page,
                limit,
                sort: { createdAt: -1 },
                populate: [
                    {
                        path: 'grn',
                        select: 'grnNumber vendor purchaseOrder status',
                        populate: [
                            { path: 'vendor.id', select: 'name' },
                            { path: 'purchaseOrder', select: 'poNumber' }
                        ]
                    },
                    { path: 'inspector', select: 'username' }
                ]
            });

            // Get GRNs pending inspection
            const pendingGRNs = await GRN.find({
                status: 'inspection_pending'
            })
                .populate('vendor.id', 'name')
                .populate('purchaseOrder', 'poNumber');

            res.status(200).json({
                success: true,
                data: {
                    pendingGRNs,
                    inspections: inspections.docs
                },
                pagination: {
                    total: inspections.totalDocs,
                    pages: inspections.totalPages,
                    page: inspections.page,
                    limit: inspections.limit
                }
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get single inspection
    getInspection = async (req, res) => {
        try {
            const inspection = await Inspection.findById(req.params.id)
                .populate({
                    path: 'grn',
                    populate: [
                        { path: 'vendor.id', select: 'name' },
                        { path: 'purchaseOrder', select: 'poNumber items' }
                    ]
                })
                .populate('inspector', 'username');

            if (!inspection) {
                return res.status(404).json({
                    success: false,
                    message: 'Inspection not found'
                });
            }

            res.status(200).json({
                success: true,
                data: inspection
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Update inspection method in inspection.controller.js
    updateInspection = async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { items, status, remarks } = req.body;
            const inspectionId = req.params.id;

            const inspection = await Inspection.findById(inspectionId);
            if (!inspection) {
                throw new Error('Inspection not found');
            }

            // Update inspection items
            if (items) {
                // Modified validation to only check against receivedQuantity
                for (const item of items) {
                    if (item.acceptedQuantity > item.receivedQuantity) {
                        throw new Error('Accepted quantity cannot exceed received quantity');
                    }
                    // Calculate rejected quantity
                    item.rejectedQuantity = item.receivedQuantity - item.acceptedQuantity;
                }

                inspection.items = items;
            }

            if (status) {
                inspection.status = status;
            }

            if (remarks !== undefined) {
                inspection.remarks = remarks;
            }

            if (status === 'completed') {
                inspection.completionDate = new Date();

                // Calculate overall result
                const results = inspection.items.map(item => item.result);
                if (results.includes('fail')) {
                    inspection.overallResult = 'fail';
                } else if (results.includes('conditional')) {
                    inspection.overallResult = 'conditional';
                } else {
                    inspection.overallResult = 'pass';
                }

                // Update GRN status
                const grnStatus = {
                    'pass': 'approved',
                    'fail': 'rejected',
                    'conditional': 'inspection_completed'
                }[inspection.overallResult];

                await GRN.findByIdAndUpdate(
                    inspection.grn,
                    { status: grnStatus },
                    { session }
                );
            }

            await inspection.save({ session });
            await session.commitTransaction();

            res.status(200).json({
                success: true,
                message: 'Inspection updated successfully',
                data: inspection
            });

        } catch (error) {
            await session.abortTransaction();
            res.status(400).json({
                success: false,
                message: error.message
            });
        } finally {
            session.endSession();
        }
    }
}

module.exports = new InspectionController();