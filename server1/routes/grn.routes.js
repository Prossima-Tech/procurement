const express = require('express');
const router = express.Router();
const GRNController = require('../controllers/grn.controller');

// GET Requests
router.get('/', GRNController.getGRNs.bind(GRNController));
router.get('/:id', GRNController.getGRNById.bind(GRNController));

// POST Request
router.post('/', GRNController.createGRN.bind(GRNController));

// PUT Request
router.put('/:id', GRNController.updateGRN.bind(GRNController));

// DELETE Request
router.delete('/:id', GRNController.deleteGRN.bind(GRNController));

router.get('/vendor/:id',GRNController.getVendorGRN.bind(GRNController))
router.get('/inspection/:grnId', GRNController.getInspectionByGRN.bind(GRNController));
module.exports = router;