const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrder.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { generatePoPdf } = require('../services/pdfService');

router.post('/createPO', authenticate, authorize(['admin', 'manager']), purchaseOrderController.createPurchaseOrder);

router.get('/getAllPOs', authenticate, purchaseOrderController.getAllPurchaseOrders);

router.get('/getPO/:id', authenticate, purchaseOrderController.getPurchaseOrderById);

router.put('/updatePO/:id', authenticate, authorize(['admin', 'manager']), purchaseOrderController.updatePurchaseOrder);

router.delete('/deletePO/:id', authenticate, authorize(['admin']), purchaseOrderController.deletePurchaseOrder);

module.exports = router;