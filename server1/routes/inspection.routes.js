// inspection.routes.js

const express = require('express');
const router = express.Router();
const inspectionController = require('../controllers/Inspection.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Create new inspection
router.post('/create', authenticate, inspectionController.createInspection);

// Get all inspections
router.get('/', authenticate, inspectionController.getInspections);

// Get single inspection
router.get('/:id', authenticate, inspectionController.getInspection);

// Update inspection
router.put('/:id', authenticate, inspectionController.updateInspection);

module.exports = router;