const PurchaseOrder = require('../models/purchaseOrder.model');
const { calculateTotals, generatePoNumber } = require('../utils/purchaseOrderUtils');

exports.createPurchaseOrder = async (req, res) => {
    try {
      const poData = req.body;
      poData.poNumber = await generatePoNumber(poData.unitCode);
      poData.poDate = poData.poDate || new Date();
      poData.deliveryDate = poData.deliveryDate || poData.validUpto;
  
      // Calculate totals
      poData.totals = calculateTotals(poData.items);
  
      // Calculate total for each item
      poData.items = poData.items.map(item => ({
        ...item,
        total: item.quantity * item.rate
      }));
  
      const purchaseOrder = new PurchaseOrder(poData);
      await purchaseOrder.save();
      
      res.status(201).json(purchaseOrder);
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