const mongoose = require('mongoose');
const GRN = require('../models/grn.model');
const PurchaseOrder = require('../models/purchaseOrder.model');
const Inspection = require('../models/inspection.model');

class GRNController {
    // Generate GRN Number
    async generateGRNNumber() {
        try {
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');

            // Find the last GRN number for the current year and month
            const lastGRN = await GRN.findOne({
                grnNumber: new RegExp(`GRN-${year}-${month}-`)
            }, {
                grnNumber: 1
            }, {
                sort: { grnNumber: -1 }
            });

            let nextNumber = '00001';

            if (lastGRN) {
                // Extract the numeric part and increment it
                const lastNumber = parseInt(lastGRN.grnNumber.split('-')[3]);
                nextNumber = String(lastNumber + 1).padStart(5, '0');
            }

            return `GRN-${year}-${month}-${nextNumber}`;
        } catch (error) {
            throw new Error('Error generating GRN number: ' + error.message);
        }
    }

    // Create new GRN
    async createGRN(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const {
                purchaseOrder,
                challanNumber,
                challanDate,
                receivedDate,
                status,
                transportDetails,
                items
            } = req.body;

            // Validate purchase order exists and get its details
            const poExists = await PurchaseOrder.findById(purchaseOrder)
                .populate('vendorId')
                .populate('projectId')
                .populate('unitId');

            if (!poExists) {
                throw new Error('Purchase Order not found');
            }

            // Generate GRN number
            const grnNumber = await this.generateGRNNumber();

            // Calculate total value
            const totalValue = items.reduce((sum, item) => {
                return sum + (item.receivedQuantity * item.unitPrice);
            }, 0);

            const finalStatus = status === 'submitted' ? 'inspection_pending' : status;

            // Create GRN document
            const grn = new GRN({
                grnNumber,
                purchaseOrder,
                projectId: poExists.projectId._id,
                unitId: poExists.unitId._id,
                vendor: {
                    id: poExists.vendorId._id,
                    name: poExists.vendorId.name,
                    code: poExists.vendorId.code,
                    gstNumber: poExists.vendorId.gstNumber
                },
                challanNumber,
                challanDate,
                receivedDate,
                status: finalStatus,
                transportDetails,
                items: items.map(item => ({
                    partId: item.partId,
                    partCode: item.partCode,
                    poItem: item.poItem || '',
                    orderedQuantity: item.orderedQuantity,
                    receivedQuantity: item.receivedQuantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.receivedQuantity * item.unitPrice,
                    remarks: item.remarks || '',
                    itemDetails: {
                        partCodeNumber: item.itemDetails.partCodeNumber,
                        itemName: item.itemDetails.itemName,
                        itemCode: item.itemDetails.itemCode,
                        measurementUnit: item.itemDetails.measurementUnit || 'Units'
                    }
                })),
                totalValue,
                createdAt: new Date()
            });

            // Validate received quantities
            const invalidItems = items.filter(item =>
                item.receivedQuantity > item.orderedQuantity ||
                item.receivedQuantity < 0
            );

            if (invalidItems.length > 0) {
                throw new Error('Received quantity cannot exceed ordered quantity or be negative');
            }

            // Save GRN
            await grn.save({ session });

            // If status is submitted, update PO status
            if (status === 'submitted') {
                await PurchaseOrder.findByIdAndUpdate(
                    purchaseOrder,
                    { status: 'grn_created' },
                    { session }
                );
            }

            await session.commitTransaction();

            res.status(201).json({
                success: true,
                message: 'GRN created successfully',
                data: grn
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

    // Get all GRNs with pagination and filters
    async getGRNs(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                dateFrom,
                dateTo,
                status
            } = req.query;

            const query = {};

            // Apply filters
            if (search) {
                query.$or = [
                    { grnNumber: { $regex: search, $options: 'i' } },
                    { challanNumber: { $regex: search, $options: 'i' } },
                    { 'vendor.name': { $regex: search, $options: 'i' } }
                ];
            }

            if (dateFrom || dateTo) {
                query.challanDate = {};
                if (dateFrom) query.challanDate.$gte = new Date(dateFrom);
                if (dateTo) query.challanDate.$lte = new Date(dateTo);
            }

            if (status) {
                query.status = status;
            }

            try {
                const skip = (parseInt(page) - 1) * parseInt(limit);

                const [grns, total] = await Promise.all([
                    GRN.find(query)
                        .populate({
                            path: 'purchaseOrder',
                            select: 'poCode' // Changed from poNumber to poCode
                        })
                        .populate('projectId', 'projectName')
                        .populate('unitId', 'unitName')
                        .sort({ createdAt: -1 })
                        .skip(skip)
                        .limit(parseInt(limit))
                        .lean(),
                    GRN.countDocuments(query)
                ]);

                // Transform the data to show poCode
                const transformedGrns = grns.map(grn => ({
                    ...grn,
                    purchaseOrder: {
                        poCode: grn.purchaseOrder?.poCode || 'N/A' // Changed from poNumber to poCode
                    }
                }));

                res.status(200).json({
                    success: true,
                    data: transformedGrns,
                    pagination: {
                        total: total,
                        pages: Math.ceil(total / parseInt(limit)),
                        page: parseInt(page),
                        limit: parseInt(limit)
                    }
                });
            } catch (error) {
                console.error('GRN fetch error:', error);
                throw error;
            }
        } catch (error) {
            console.error('GRN fetch error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get single GRN by ID
    async getGRNById(req, res) {
        try {
            const grn = await GRN.findById(req.params.id)
                .populate({
                    path: 'purchaseOrder',
                    select: 'poCode items', // Changed from poNumber to poCode
                    populate: {
                        path: 'items.partDetails',
                        select: 'partCode partName description'
                    }
                })
                .populate('projectId', 'projectName')
                .populate('unitId', 'unitName')
                .populate('vendor.id', 'name code gstNumber')
                .lean();

            if (!grn) {
                return res.status(404).json({
                    success: false,
                    message: 'GRN not found'
                });
            }

            // Transform items to show correct part code and item name
            const transformedGrn = {
                ...grn,
                purchaseOrder: {
                    ...grn.purchaseOrder,
                    poCode: grn.purchaseOrder?.poCode || 'N/A' // Changed from poNumber to poCode
                },
                items: grn.items.map(item => {
                    const poItem = grn.purchaseOrder?.items?.find(
                        poItem => poItem.partDetails?._id.toString() === item.partCode
                    );

                    return {
                        ...item,
                        partCode: poItem?.partDetails?.partCode || item.partCode,
                        itemDetails: {
                            ...item.itemDetails,
                            partCodeNumber: poItem?.partDetails?.partCode || item.partCode,
                            itemName: poItem?.partDetails?.partName || item.itemDetails.itemName
                        }
                    };
                })
            };

            res.status(200).json({
                success: true,
                data: transformedGrn
            });

        } catch (error) {
            console.error('GRN fetch error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Update GRN
    async updateGRN(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const grn = await GRN.findById(req.params.id);

            if (!grn) {
                throw new Error('GRN not found');
            }

            // Only allow updates if GRN is in draft status
            if (grn.status !== 'draft') {
                throw new Error('Cannot update GRN that is not in draft status');
            }

            // Update status to inspection_pending if submitted
            const finalStatus = status === 'submitted' ? 'inspection_pending' : status;

            const {
                challanNumber,
                challanDate,
                receivedDate,
                status,
                transportDetails,
                items
            } = req.body;

            // Calculate new total value
            const totalValue = items.reduce((sum, item) => {
                return sum + (item.receivedQuantity * item.unitPrice);
            }, 0);

            // Update GRN
            const updatedGRN = await GRN.findByIdAndUpdate(
                req.params.id,
                {
                    challanNumber,
                    challanDate,
                    receivedDate,
                    status: finalStatus,
                    transportDetails,
                    items: items.map(item => ({
                        ...item,
                        totalPrice: item.receivedQuantity * item.unitPrice
                    })),
                    totalValue,
                    updatedBy: req.user._id,
                    updatedAt: Date.now()
                },
                { new: true, session }
            );

            // If status changed to submitted, update PO status
            if (status === 'submitted' && grn.status !== 'submitted') {
                await PurchaseOrder.findByIdAndUpdate(
                    grn.purchaseOrder,
                    { status: 'grn_created' },
                    { session }
                );
            }

            await session.commitTransaction();

            res.status(200).json({
                success: true,
                message: 'GRN updated successfully',
                data: updatedGRN
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

    // Delete GRN
    async deleteGRN(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const grn = await GRN.findById(req.params.id);

            if (!grn) {
                throw new Error('GRN not found');
            }

            // Only allow deletion of draft GRNs
            if (grn.status !== 'draft') {
                throw new Error('Cannot delete GRN that is not in draft status');
            }

            await GRN.findByIdAndDelete(req.params.id, { session });

            await session.commitTransaction();

            res.status(200).json({
                success: true,
                message: 'GRN deleted successfully'
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

    async getVendorGRN(req, res) {
        try {
            const vendorId = req.params.id;

            // Find all GRNs where vendor.id matches and populate necessary fields
            const grns = await GRN.find({
                'vendor.id': vendorId
            })
                .populate({
                    path: 'purchaseOrder',
                    select: 'poCode poDate status'
                })
                .populate('projectId', 'projectName')
                .populate('unitId', 'unitName')
                .sort({ createdAt: -1 })
                .lean();

            // Transform the data to include inspection status
            const grnsWithInspection = await Promise.all(grns.map(async grn => {
                // Find associated inspection
                const inspection = await Inspection.findOne({ grn: grn._id })
                    .select('status overallResult')
                    .lean();

                // Determine GRN status based on inspection
                let status = grn.status;
                if (inspection) {
                    if (inspection.status === 'completed') {
                        status = inspection.overallResult === 'pass' ? 'approved' : 'rejected';
                    } else if (inspection.status === 'in_progress') {
                        status = 'inspection_in_progress';
                    }
                }

                return {
                    _id: grn._id,
                    grnNumber: grn.grnNumber,
                    poReference: {
                        poNumber: grn.purchaseOrder?.poCode,
                        poDate: grn.purchaseOrder?.poDate
                    },
                    projectName: grn.projectId?.projectName,
                    unitName: grn.unitId?.unitName,
                    receiptDate: grn.receivedDate,
                    challanNumber: grn.challanNumber,
                    challanDate: grn.challanDate,
                    status: status,
                    items: grn.items.map(item => ({
                        partCode: item.partCode,
                        partCodeNumber: item.itemDetails.partCodeNumber,
                        itemName: item.itemDetails.itemName,
                        receivedQuantity: item.receivedQuantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice
                    })),
                    totalValue: grn.totalValue,
                    createdAt: grn.createdAt
                };
            }));

            res.status(200).json(grnsWithInspection);

        } catch (error) {
            console.error('Error fetching vendor GRNs:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error fetching GRNs'
            });
        }
    }
    // Add this method to your inspection controller
    async getInspectionByGRN(req, res) {
        try {
            const grnId = req.params.grnId;

            const inspection = await Inspection.findOne({ grn: grnId })
                .populate('grn')
                .lean();

            if (!inspection) {
                return res.status(404).json({
                    success: false,
                    message: 'No inspection found for this GRN'
                });
            }

            // Transform the data for the frontend
            const transformedData = {
                inspectionId: inspection._id,
                status: inspection.status,
                items: inspection.items.map(item => ({
                    partCode: item.partCode,
                    itemName: item.itemName,
                    inspectedQuantity: item.inspectedQuantity,
                    approvedQuantity: item.approvedQuantity,
                    rejectedQuantity: item.rejectedQuantity,
                    unitPrice: item.unitPrice,
                    remarks: item.remarks
                }))
            };

            res.status(200).json(transformedData);

        } catch (error) {
            console.error('Error fetching inspection:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error fetching inspection data'
            });
        }
    }
}
module.exports = new GRNController();