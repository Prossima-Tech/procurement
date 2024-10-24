const { calculateTotals, generatePoNumber } = require('../utils/purchaseOrderUtils');
const PurchaseOrder = require('../models/purchaseOrder.model');
const Project = require('../models/project.model'); // Import the Project model
const Unit = require('../models/unit.model'); // Import the Unit model
const { PartCode } = require('../models/part.model'); // Make sure to import this
const mongoose = require('mongoose');

exports.createPurchaseOrder = async (req, res) => {
  try {
    console.log(" Starting purchase order creation");
    console.log(" Request body:", JSON.stringify(req.body, null, 2));

    const {
      vendorId,
      vendorCode,
      vendorName,
      vendorAddress,
      vendorGst,
      projectCode,
      unitId,
      unitName,
      poDate,
      validUpto,
      status,
      invoiceTo,
      dispatchTo,
      items,
      deliveryDate,
      supplierRef,
      otherRef,
      dispatchThrough,
      destination,
      paymentTerms,
      deliveryTerms,
      poNarration
    } = req.body;

    console.log(" Generating PO Code");
    // const poCode = await generatePoNumber(unitId);

    // New function to generate PO code
    const generatePoCode = async (unitId) => {
      const latestPo = await PurchaseOrder.findOne({ unitId }).sort('-createdAt');
      const lastNumber = latestPo ? parseInt(latestPo.poCode.split('-')[1]) : 0;
      // const unitCode = await Unit.findById(unitId).select('unitCode');
      return `${(lastNumber + 1).toString().padStart(5, '0')}`;
    };

    const poCode = await generatePoCode(unitId);
    console.log(" Generated PO Code:", poCode);

    console.log(" Finding project by projectCode:", projectCode);
    const project = await Project.findOne({ projectCode });
    if (!project) {
      console.log(" Project not found for projectCode:", projectCode);
      return res.status(400).json({ success: false, message: 'Project not found' });
    }
    console.log(" Found project:", project._id);

    console.log(" Processing items");
    const processedItems = await Promise.all(items.map(async (item, index) => {
      console.log(` Processing item ${index + 1}:`, JSON.stringify(item, null, 2));
      const part = await PartCode.findOne({ partCode: item.partCode });
      if (!part) {
        console.log(` Part not found for partCode:`, item.partCode);
        throw new Error(`Part with code ${item.partCode} not found`);
      }
      console.log(` Found part:`, part._id);
      return {
        partCode: part._id,
        // masterItemName: item.masterItemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice
      };
    }));
    console.log(" Processed items:", JSON.stringify(processedItems, null, 2));

    console.log(" Creating new PurchaseOrder object");
    const newPurchaseOrder = new PurchaseOrder({
      vendorId: mongoose.Types.ObjectId(vendorId),
      vendorCode,
      vendorName,
      vendorAddress,
      vendorGst,
      projectId: project._id,
      unitId: mongoose.Types.ObjectId(unitId),
      unitName,
      poCode,
      poDate: poDate || new Date(),
      validUpto,
      status: status || 'draft',
      invoiceTo,
      dispatchTo,
      items: processedItems,
      deliveryDate,
      supplierRef,
      otherRef,
      dispatchThrough,
      destination,
      paymentTerms,
      deliveryTerms,
      poNarration,
      createdBy: req.user._id
    });

    console.log(" Calculating totals");
    const totals = calculateTotals(newPurchaseOrder.items);
    newPurchaseOrder.subTotal = totals.subTotal;
    newPurchaseOrder.tax = totals.tax;
    newPurchaseOrder.total = totals.total;
    console.log(" Calculated totals:", JSON.stringify(totals, null, 2));

    console.log(" Saving new PurchaseOrder");
    const savedPurchaseOrder = await newPurchaseOrder.save();
    console.log(" Saved PurchaseOrder:", savedPurchaseOrder._id);

    res.status(201).json({
      success: true,
      message: 'Purchase Order created successfully',
      data: savedPurchaseOrder
    });
    console.log(" Purchase order creation completed successfully");
  } catch (error) {
    console.error('[createPurchaseOrder] Error creating purchase order:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalPurchaseOrders = await PurchaseOrder.countDocuments();
    const totalPages = Math.ceil(totalPurchaseOrders / limit);

    const purchaseOrders = await PurchaseOrder.find()
      .populate('vendorId', 'name code')
      .populate({
        path: 'items.partCode',
        populate: {
          path: 'ItemCode',
          select: 'ItemCode ItemName'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!purchaseOrders) {
      return res.status(404).json({ message: 'No purchase orders found' });
    }

    res.json({
      purchaseOrders,
      currentPage: page,
      totalPages,
      totalItems: totalPurchaseOrders
    });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.getPurchaseOrderById = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate('vendorId')
      .populate({
        path: 'items.partCode',
        populate: {
          path: 'ItemCode',
          select: 'ItemCode ItemName'
        }
      });

    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }

    const formattedPO = {
      ...purchaseOrder.toObject(),
      items: purchaseOrder.items.map(item => ({
        partCode: item.partCode?.PartCodeNumber || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        masterItemName: item.partCode?.ItemCode?.ItemName || ''
      }))
    };

    res.json(formattedPO);
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.updatePurchaseOrder = async (req, res) => {
  try {
    const {
      vendorId,
      vendorCode,
      vendorName,
      vendorAddress,
      vendorGst,
      projectCode,
      unitId,
      unitName,
      poDate,
      validUpto,
      status,
      invoiceTo,
      dispatchTo,
      items,
      deliveryDate,
      supplierRef,
      otherRef,
      dispatchThrough,
      destination,
      paymentTerms,
      deliveryTerms,
      poNarration
    } = req.body;

    // Validate project
    const project = await Project.findOne({ projectCode });
    if (!project) {
      return res.status(400).json({ success: false, message: 'Project not found' });
    }

    // Process items
    const processedItems = await Promise.all(items.map(async (item) => {
      const part = await PartCode.findOne({ PartCodeNumber: item.partCode });
      if (!part) {
        throw new Error(`Part with code ${item.partCode} not found`);
      }
      return {
        partCode: part._id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice
      };
    }));

    const updateData = {
      vendorId: mongoose.Types.ObjectId(vendorId),
      vendorCode,
      vendorName,
      vendorAddress,
      vendorGst,
      projectId: project._id,
      unitId: mongoose.Types.ObjectId(unitId),
      unitName,
      poDate,
      validUpto,
      status,
      invoiceTo,
      dispatchTo,
      items: processedItems,
      deliveryDate,
      supplierRef,
      otherRef,
      dispatchThrough,
      destination,
      paymentTerms,
      deliveryTerms,
      poNarration,
      updatedBy: req.user._id,
      updatedAt: new Date()
    };

    // Calculate totals
    const totals = calculateTotals(processedItems);
    updateData.subTotal = totals.subTotal;
    updateData.tax = totals.tax;
    updateData.total = totals.total;

    const updatedPO = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('items.partCode');

    if (!updatedPO) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }

    res.json({
      success: true,
      message: 'Purchase Order updated successfully',
      data: updatedPO
    });
  } catch (error) {
    console.error('Error updating purchase order:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deletePurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }
    res.json({ message: 'Purchase Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/vendors/:code
exports.getVendorByCode = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ code: req.params.code });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/vendors/search?query=:query
exports.searchVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({
      $or: [
        { code: { $regex: req.query.query, $options: 'i' } },
        { name: { $regex: req.query.query, $options: 'i' } }
      ]
    }).limit(10);
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
