const PurchaseOrder = require('../models/purchaseOrder.model');

exports.calculateTotals = (items) => {
  const totals = {
    subtotal: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    grandTotal: 0
  };

  items.forEach(item => {
    const itemTotal = item.quantity * item.unitPrice; // Changed from rate to unitPrice to match your schema
    totals.subtotal += itemTotal;

    // Add tax amounts if they exist
    if (item.cgst) totals.cgst += (item.cgst.rate / 100) * itemTotal;
    if (item.sgst) totals.sgst += (item.sgst.rate / 100) * itemTotal;
    if (item.igst) totals.igst += (item.igst.rate / 100) * itemTotal;
  });

  totals.grandTotal = totals.subtotal + totals.cgst + totals.sgst + totals.igst;
  return totals;
};

exports.generatePoNumber = async (unitId) => {
  try {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');

    // Find the latest PO for the given unit
    const latestPo = await PurchaseOrder.findOne({ unitId })
      .sort({ createdAt: -1 })
      .select('poCode');

    let sequence = 1;
    if (latestPo && latestPo.poCode) {
      const parts = latestPo.poCode.split('/');
      if (parts.length === 4) {
        sequence = parseInt(parts[3]) + 1;
      }
    }

    // Format: PO/UNIT/YYYYMM/SEQUENCE
    return `PO/${unitId.substring(unitId.length - 4)}/${year}${month}/${sequence.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating PO number:', error);
    throw error;
  }
};