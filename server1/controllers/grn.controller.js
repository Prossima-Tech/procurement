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
    async generateInvoiceNumber(grnNumber) {
        // Generate a random 3-digit number
        // Extract year, month and GRN sequence from GRN number
        const [year, month, grnSeq] = grnNumber.split('-').slice(1);
        
        // Use the GRN sequence number as part of invoice number for traceability
        return `INV-${year}-${month}-${grnSeq}`;
    }
    // Create new GRN
    async createGRN(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const {
                purchaseOrder: poId,
                challanNumber,
                challanDate,
                receivedDate,
                status,
                transportDetails,
                items
            } = req.body;

            console.log('Creating GRN for PO:', poId);

            // Fetch PO with items
            const po = await PurchaseOrder.findById(poId)
                .populate('vendorId')
                .populate('projectId')
                .populate('unitId');

            if (!po) {
                throw new Error('Purchase Order not found');
            }

            // console.log(items);
            // console.log(po);

            // Validate and update PO items
            for (const grnItem of items) {

                const poItem = po.items.find(pi => {
                    console.log('pi partcode', pi.partCode.toString());
                    console.log('grnitem partcode', grnItem.partId);
                    return pi.partCode.toString() === grnItem.partId._id.toString();
                }
                );

                console.log(poItem);

                if (!poItem) {
                    throw new Error(`Item ${grnItem.partCode} not found in Purchase Order`);
                }

                // Calculate new delivered quantity
                const newDeliveredQty = (poItem.deliveredQuantity || 0) + grnItem.receivedQuantity;

                // Validate total delivered quantity
                if (newDeliveredQty > poItem.quantity) {
                    throw new Error(
                        `Total received quantity (${newDeliveredQty}) exceeds ordered quantity (${poItem.quantity}) for item ${grnItem.partCode}`
                    );
                }

                // Update PO item quantities
                poItem.deliveredQuantity = newDeliveredQty;
                poItem.pendingQuantity = poItem.quantity - newDeliveredQty;

                // Add GRN delivery reference
                poItem.grnDeliveries.push({
                    grnId: null, // Will update after GRN creation
                    receivedQuantity: grnItem.receivedQuantity,
                    receivedDate: receivedDate,
                    status: status === 'submitted' ? 'inspection_pending' : 'pending'
                });
            }

            // Generate GRN number and create GRN
            const grnNumber = await this.generateGRNNumber();
            const invoiceNumber = await this.generateInvoiceNumber(grnNumber);
            console.log("invoiceNumber generated", invoiceNumber);
            const grn = new GRN({
                grnNumber,
                purchaseOrder: poId,
                projectId: po.projectId._id,
                unitId: po.unitId._id,
                vendor: {
                    id: po.vendorId._id,
                    name: po.vendorId.name,
                    code: po.vendorId.code,
                    gstNumber: po.vendorId.gstNumber
                },
                challanNumber,
                challanDate,
                receivedDate,
                status: status === 'submitted' ? 'inspection_pending' : status,
                transportDetails,
                items: items.map(item => ({
                    partId: item.partId,
                    partCode: item.partCode,
                    orderedQuantity: item.orderedQuantity,
                    receivedQuantity: item.receivedQuantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.receivedQuantity * item.unitPrice,
                    remarks: item.remarks || '',
                    itemDetails: item.itemDetails
                })),
                invoiceNumber,
                totalValue: items.reduce((sum, item) =>
                    sum + (item.receivedQuantity * item.unitPrice), 0
                )
            });

            await grn.save({ session });

            // Update GRN IDs in PO item references
            po.items.forEach(poItem => {
                const lastDelivery = poItem.grnDeliveries[poItem.grnDeliveries.length - 1];
                if (lastDelivery && !lastDelivery.grnId) {
                    lastDelivery.grnId = grn._id;
                }
            });

            // Update PO status and delivery status
            const allItemsDelivered = po.items.every(item =>
                item.deliveredQuantity === item.quantity
            );

            if (allItemsDelivered) {
                po.deliveryStatus = 'fully_delivered';
                po.isFullyDelivered = true;
                po.status = 'grn_created'; // Set status to GRN_created when fully delivered
            } else {
                po.deliveryStatus = 'partially_delivered';
                po.status = 'in_progress';
            }

            // Add GRN reference to PO
            if (!po.grns) {
                po.grns = [];
            }
            po.grns.push(grn._id);

            await po.save({ session });
            await session.commitTransaction();

            res.status(201).json({
                success: true,
                message: 'GRN created successfully',
                data: grn
            });

        } catch (error) {
            await session.abortTransaction();
            console.error('Error creating GRN:', error);
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


            const grns = await GRN.find({
                'vendor.id': vendorId
            })
                .populate('purchaseOrder')
                .populate('invoiceId', 'totalAmount') // Populate invoiceId and get totalAmount
                .sort({ createdAt: -1 })
                .lean();

            res.status(200).json({
                success: true,
                data: grns
            });

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

            // Fetch GRN with populated part details and Item details
            const grn = await GRN.findById(grnId)
                .populate({
                    path: 'items.partId',
                    populate: {
                        path: 'ItemCode',
                        model: 'Item',
                        //  select: 'itemName gstRate sacHsnCode' // Add the fields you need from Item model
                    }
                })
                .lean();

            console.log("grn", grn)
            console.log("grn items", JSON.stringify(grn.items[0]))
            // Fetch inspection data
            const inspection = await Inspection.findOne({ grn: grnId }).lean();

            if (!inspection) {
                return res.status(404).json({
                    success: false,
                    message: 'No inspection found for this GRN'
                });
            }

            // Transform the data combining GRN and Inspection data
            const transformedData = {
                inspectionId: inspection._id,
                status: inspection.status,
                items: grn.items.map(grnItem => {
                    // Find corresponding inspection item
                    const inspectionItem = inspection.items.find(
                        item => item.partCode === grnItem.partCode
                    );

                    return {
                        // GRN item details
                        partCode: grnItem.partCode,
                        partId: grnItem.partId._id,
                        itemName: grnItem.itemDetails.itemName,

                        // Tax related details
                        igstRate: grnItem.partId.ItemCode?.IGST_Rate || 0,
                        cgstRate: grnItem.partId.ItemCode?.CGST_Rate || 0,
                        sgstRate: grnItem.partId.ItemCode?.SGST_Rate || 0,
                        utgstRate: grnItem.partId.ItemCode?.UTGST_Rate || 0,
                        sacHsnCode: grnItem.partId.ItemCode?.SAC_HSN_Code || '',

                        // Part details
                        description: grnItem.partId.description,
                        category: grnItem.partId.category,
                        uom: grnItem.partId.measurementUnit,
                        specifications: grnItem.partId.specifications,

                        // Quantities and pricing
                        receivedQuantity: grnItem.receivedQuantity,
                        unitPrice: grnItem.unitPrice,
                        totalPrice: grnItem.totalPrice,

                        // Inspection details
                        inspectedQuantity: inspectionItem?.inspectedQuantity || 0,
                        acceptedQuantity: inspectionItem?.acceptedQuantity || 0,
                        rejectedQuantity: inspectionItem?.rejectedQuantity || 0,
                        remarks: inspectionItem?.remarks || '',

                        // Additional details from itemDetails
                        itemDetails: {
                            partCodeNumber: grnItem.itemDetails.partCodeNumber,
                            itemName: grnItem.itemDetails.itemName,
                            itemCode: grnItem.itemDetails.itemCode,
                            measurementUnit: grnItem.itemDetails.measurementUnit
                        }
                    };
                })
            };
            console.log("transformedData", transformedData)
            res.status(200).json({
                success: true,
                data: transformedData
            });

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