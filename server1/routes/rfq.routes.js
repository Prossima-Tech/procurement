const express = require('express');
const router = express.Router();
const rfqController = require('../controllers/rfq.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.post('/createRFQ', authenticate, rfqController.createRFQ);
router.get('/getallRFQ', authenticate, rfqController.getallRFQ);
router.delete('/deleteRFQ/:id', authenticate, rfqController.deleteRFQ);

// router.get('/getRFQById/:id', authenticate, rfqController.getRFQById);
// router.put('/updateRFQ/:id', authenticate, rfqController.updateRFQ);
router.post('/ItemVendorsRelation', authenticate, rfqController.createOrUpdateItemVendors);// required list of items and list of vendors with price and availability
module.exports = router;
