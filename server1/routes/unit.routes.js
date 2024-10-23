const express = require('express');
const router = express.Router();
const {
    getAllUnits,
    getUnitById,
    searchUnits,
    createUnit,
    updateUnit,
    deleteUnit
} = require('../controllers/unit.controller');

// Get all units
router.get('/', getAllUnits);

// Search units
router.get('/search', searchUnits);

// Get unit by ID
router.get('/:id', getUnitById);

// Create new unit
router.post('/', createUnit);

// Update unit
router.put('/:id', updateUnit);

// Delete unit
router.delete('/:id', deleteUnit);

module.exports = router;