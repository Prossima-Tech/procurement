const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');

router.post('/create', invoiceController.createInvoice);
router.get('/:id', invoiceController.getInvoiceById);
module.exports = router; 