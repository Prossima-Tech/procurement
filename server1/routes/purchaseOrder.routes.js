const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrder.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { generatePoPdf } = require('../services/pdfService');
const PurchaseOrder = require('../models/purchaseOrder.model');


router.post('/createPO', authenticate, authorize(['admin', 'manager']), purchaseOrderController.createPurchaseOrder);

router.get('/getAllPOs', authenticate, purchaseOrderController.getAllPurchaseOrders);

router.get('/getPO/:id', authenticate, purchaseOrderController.getPurchaseOrderById);

router.put('/updatePO/:id', authenticate, authorize(['admin', 'manager']), purchaseOrderController.updatePurchaseOrder);

router.delete('/deletePO/:id', authenticate, authorize(['admin']), purchaseOrderController.deletePurchaseOrder);

router.get('/generatePdf/:id', async (req, res) => {
    try {
      const purchaseOrder = await PurchaseOrder.findById(req.params.id)
        .populate('vendorId')
        .populate('projectId')
        .populate('unitId')
        .populate({
          path: 'items.partCode',
          populate: {
            path: 'ItemCode',
            select: 'ItemCode ItemName'
          }
        });
  
      if (!purchaseOrder) {
        return res.status(404).json({ message: 'Purchase Order not found' });
      }
  
      const pdfBuffer = await generatePoPdf(purchaseOrder);
  
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=PO_${purchaseOrder.poCode}.pdf`,
        'Content-Length': pdfBuffer.length
      });
  
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ message: 'Error generating PDF' });
    }
  });
  

module.exports = router;