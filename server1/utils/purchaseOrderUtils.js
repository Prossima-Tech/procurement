const PurchaseOrder = require('../models/purchaseOrder.model');
// utils/purchaseOrderUtils.js

exports.calculateTotals = (items) => {
    const totals = {
      subtotal: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      grandTotal: 0
    };
  
    items.forEach(item => {
      const itemTotal = item.quantity * item.rate;
      totals.subtotal += itemTotal;
  
      // Add tax amounts if they exist
      if (item.cgst) totals.cgst += (item.cgst.rate / 100) * itemTotal;
      if (item.sgst) totals.sgst += (item.sgst.rate / 100) * itemTotal;
      if (item.igst) totals.igst += (item.igst.rate / 100) * itemTotal;
    });
  
    totals.grandTotal = totals.subtotal + totals.cgst + totals.sgst + totals.igst;
    return totals;
};

exports.generatePoNumber = async () => {
    const latestPo = await PurchaseOrder.findOne().sort('-createdAt');
    const lastNumber = latestPo ? parseInt(latestPo.poNumber.split('-')[1]) : 0;
    return `PO-${(lastNumber + 1).toString().padStart(5, '0')}`;
};

