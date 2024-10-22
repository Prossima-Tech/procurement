const PurchaseOrder = require('../models/purchaseOrder.model');
const { calculateTotals, generatePoNumber } = require('../utils/purchaseOrderUtils');

exports.createPurchaseOrder = async (req, res) => {
  try {
    const {
      vendorId,
      projectId,
      unitId,
      poDate,
      validUpto,
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

    // Generate PO Code
    const poCode = await generatePoNumber(unitId);

    // Create new PurchaseOrder object
    const newPurchaseOrder = new PurchaseOrder({
      vendorId,
      projectId,
      unitId,
      poCode,
      poDate: poDate || new Date(),
      validUpto,
      invoiceTo,
      dispatchTo,
      items: items.map(item => ({
        partCode: item.partCode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice
      })),
      deliveryDate: deliveryDate || validUpto,
      supplierRef,
      otherRef,
      dispatchThrough,
      destination,
      paymentTerms,
      deliveryTerms,
      poNarration,
      status: 'draft'
    });

    // Save the new PurchaseOrder
    const savedPurchaseOrder = await newPurchaseOrder.save();

    res.status(201).json(savedPurchaseOrder);
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.find().populate('vendor').populate('items.item');
    res.json(purchaseOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPurchaseOrderById = async (req, res) => {
    try {
        const purchaseOrder = await PurchaseOrder.findById(req.params.id)
            .populate('vendor')
            .populate('items.item')
            .populate('preparedBy', 'name')
            .populate('checkedBy', 'name');
        
        if (!purchaseOrder) {
            return res.status(404).json({ message: 'Purchase Order not found' });
        }
        res.json(purchaseOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updatePurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }
    res.json(purchaseOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
