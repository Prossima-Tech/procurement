// services/pdfService.js
const PDFDocument = require('pdfkit');
const { formatCurrency, numberToWords } = require('../utils/purchaseOrderUtils');

exports.generatePoPdf = (purchaseOrder) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Add content to PDF
    doc.fontSize(18).text('PURCHASE ORDER', { align: 'center' });
    doc.fontSize(12).text(`PO Number: ${purchaseOrder.poNumber}`, { align: 'right' });
    
    // Vendor Information
    doc.fontSize(14).text('Vendor:', { underline: true });
    doc.fontSize(10).text(purchaseOrder.vendor.name);
    doc.text(purchaseOrder.vendor.address.line1);
    doc.text(purchaseOrder.vendor.address.city + ', ' + purchaseOrder.vendor.address.state + ' - ' + purchaseOrder.vendor.address.pinCode);
    doc.text('GST: ' + purchaseOrder.vendor.gstNumber);
    
    // Ship To
    doc.moveDown();
    doc.fontSize(14).text('Ship To:', { underline: true });
    doc.fontSize(10).text(purchaseOrder.shipTo.name);
    doc.text(purchaseOrder.shipTo.address);
    
    // Items Table
    doc.moveDown();
    doc.fontSize(14).text('Items:', { underline: true });
    const tableTop = doc.y + 10;
    doc.fontSize(10);
    
    purchaseOrder.items.forEach((item, i) => {
      const y = tableTop + (i + 1) * 30;
      doc.text(item.item.name, 50, y);
      doc.text(item.quantity.toString(), 200, y);
      doc.text(formatCurrency(item.rate), 250, y);
      doc.text(formatCurrency(item.total), 350, y);
    });
    
    // Totals
    doc.moveDown();
    doc.fontSize(12).text(`Subtotal: ${formatCurrency(purchaseOrder.totals.subtotal)}`, { align: 'right' });
    doc.text(`CGST: ${formatCurrency(purchaseOrder.totals.cgst)}`, { align: 'right' });
    doc.text(`SGST: ${formatCurrency(purchaseOrder.totals.sgst)}`, { align: 'right' });
    doc.text(`IGST: ${formatCurrency(purchaseOrder.totals.igst)}`, { align: 'right' });
    doc.fontSize(14).text(`Grand Total: ${formatCurrency(purchaseOrder.totals.grandTotal)}`, { align: 'right' });
    
    // Amount in words
    doc.moveDown();
    doc.fontSize(10).text(`Amount in words: ${numberToWords(purchaseOrder.totals.grandTotal)}`);
    
    // Prepared by and Checked by
    doc.moveDown();
    doc.text(`Prepared by: ${purchaseOrder.preparedBy.name}`);
    doc.text(`Checked by: ${purchaseOrder.checkedBy ? purchaseOrder.checkedBy.name : 'N/A'}`);

    doc.end();
  });
};