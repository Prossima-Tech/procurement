const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrder.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { generatePoPdf } = require('../services/pdfService');

router.post('/', authenticate, authorize(['admin', 'manager']), purchaseOrderController.createPurchaseOrder);
router.get('/', authenticate, purchaseOrderController.getAllPurchaseOrders);
router.get('/:id', authenticate, purchaseOrderController.getPurchaseOrderById);
router.put('/:id', authenticate, authorize(['admin', 'manager']), purchaseOrderController.updatePurchaseOrder);
router.delete('/:id', authenticate, authorize(['admin']), purchaseOrderController.deletePurchaseOrder);
router.get('/:id/pdf', authenticate, async (req, res) => {
    try {
      const po = await PurchaseOrder.findById(req.params.id)
        .populate('vendor')
        .populate('items.item')
        .populate('preparedBy', 'name')
        .populate('checkedBy', 'name');
      if (!po) {
        return res.status(404).json({ message: 'Purchase Order not found' });
      }
      const pdfBuffer = await generatePoPdf(po);
      res.contentType('application/pdf');
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;