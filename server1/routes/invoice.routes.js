const express = require('express');
const router = express.Router();
const Invoice = require('../models/invoice.model');
const invoiceController = require('../controllers/invoice.controller');
const { generateInvoicePdf } = require('../services/pdfService');

router.post('/create', invoiceController.createInvoice);
router.get('/:id', invoiceController.getInvoiceById);
router.get('/generatePdf/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('vendorId')
      .populate({
        path: 'poId',
        populate: [
          { path: 'invoiceTo' },
          { path: 'dispatchTo' }
        ]
      })
      // .populate('items.itemDetails');
      console.log("invoice",invoice);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const pdfBuffer = await generateInvoicePdf(invoice);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Invoice_${invoice.invoiceNumber}.pdf`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
});
module.exports = router; 