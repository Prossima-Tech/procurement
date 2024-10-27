const PDFDocument = require('pdfkit');

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'Invalid Date' : date.toDateString();
};

exports.generatePoPdf = (purchaseOrder) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Header
    doc.fontSize(16).text('KING SECURITY GUARD SERVICES (P) LTD.', { align: 'center' });
    doc.fontSize(10).text('Company Address', { align: 'center' }); // Replace with actual company address
    doc.text('Telephone: Company Phone, Email: Company Email', { align: 'center' }); // Replace with actual company contact info
    doc.moveDown();

    // Purchase Order title
    doc.fontSize(14).text('PURCHASE ORDER', { align: 'center', underline: true });
    doc.moveDown();

    // Order details
    doc.fontSize(10);
    doc.text(`PO Code: ${purchaseOrder.poCode || 'N/A'}`);
    doc.text(`PO Date: ${formatDate(purchaseOrder.poDate)}`);
    doc.text(`Valid Upto: ${formatDate(purchaseOrder.validUpto)}`);
    doc.moveDown();

    // Invoice To
    doc.text('Invoice To:');
    doc.text(`${purchaseOrder.invoiceTo?.name || 'N/A'}`);
    doc.text(`${purchaseOrder.invoiceTo?.branchName || 'N/A'}`);
    doc.text(`${purchaseOrder.invoiceTo?.address || 'N/A'}`);
    doc.text(`${purchaseOrder.invoiceTo?.city || 'N/A'}, ${purchaseOrder.invoiceTo?.state || 'N/A'} - ${purchaseOrder.invoiceTo?.pin || 'N/A'}`);
    doc.moveDown();

    // Dispatch To
    doc.text('Dispatch To:');
    doc.text(`${purchaseOrder.dispatchTo?.name || 'N/A'}`);
    doc.text(`${purchaseOrder.dispatchTo?.branchName || 'N/A'}`);
    doc.text(`${purchaseOrder.dispatchTo?.address || 'N/A'}`);
    doc.text(`${purchaseOrder.dispatchTo?.city || 'N/A'}, ${purchaseOrder.dispatchTo?.state || 'N/A'} - ${purchaseOrder.dispatchTo?.pin || 'N/A'}`);
    doc.moveDown();

    doc.text(`Supplier Ref.: ${purchaseOrder.supplierRef || 'N/A'}`);
    doc.text(`Other Ref.: ${purchaseOrder.otherRef || 'N/A'}`);
    doc.text(`Dispatch Through: ${purchaseOrder.dispatchThrough || 'N/A'}`);
    doc.text(`Destination: ${purchaseOrder.destination || 'N/A'}`);
    doc.text(`Payment Terms: ${purchaseOrder.paymentTerms || 'N/A'}`);
    doc.text(`Delivery Terms: ${purchaseOrder.deliveryTerms || 'N/A'}`);
    doc.moveDown();

    // Items table
    const tableTop = doc.y + 10;
    const tableHeaders = ['S.No', 'Part Code', 'Quantity', 'Unit Price', 'Total Price'];
    const tableData = (purchaseOrder.items || []).map((item, index) => [
      (index + 1).toString(),
      item.partCode?.$oid || 'N/A',
      item.quantity?.toString() || 'N/A',
      item.unitPrice?.toFixed(2) || 'N/A',
      item.totalPrice?.toFixed(2) || 'N/A'
    ]);

    // Draw table
    const cellPadding = 5;
    const cellWidth = (doc.page.width - 100) / tableHeaders.length;
    const cellHeight = 20;

    // Draw headers
    doc.font('Helvetica-Bold').fontSize(8);
    tableHeaders.forEach((header, i) => {
      doc.text(header, 50 + (i * cellWidth), tableTop, {
        width: cellWidth,
        align: 'center'
      });
    });

    // Draw rows
    let y = tableTop + cellHeight;
    doc.font('Helvetica').fontSize(8);
    tableData.forEach((row) => {
      row.forEach((cell, i) => {
        doc.text(cell, 50 + (i * cellWidth), y + cellPadding, {
          width: cellWidth,
          align: 'center'
        });
      });
      y += cellHeight;
    });

    // Draw lines
    doc.lineWidth(1);
    // Horizontal lines
    for (let i = 0; i <= tableData.length + 1; i++) {
      doc.moveTo(50, tableTop + (i * cellHeight))
         .lineTo(doc.page.width - 50, tableTop + (i * cellHeight))
         .stroke();
    }
    // Vertical lines
    for (let i = 0; i <= tableHeaders.length; i++) {
      doc.moveTo(50 + (i * cellWidth), tableTop)
         .lineTo(50 + (i * cellWidth), tableTop + ((tableData.length + 1) * cellHeight))
         .stroke();
    }

    // PO Narration
    doc.moveDown();
    doc.text(`PO Narration: ${purchaseOrder.poNarration || 'N/A'}`);

    // Footer
    doc.moveDown();
    doc.fontSize(8).text('This is a computer-generated document. No signature is required.', { align: 'center' });

    doc.end();
  });
};