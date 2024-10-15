const express = require('express');
const router = express.Router();
const partController = require('../controllers/part.controller');

// PartCode routes
router.post('/createPart', partController.createPart);
router.get('/allParts', partController.getAllParts);
router.get('/getPart/:partId', partController.getPart);
router.delete('/deletePart/:id', partController.deletePart);

// SizeName routes
router.post('/createSizeName', partController.createSizeName);
router.get('/allSizeNames', partController.getAllSizeNames);
router.get('/searchSizeNames', partController.searchSizeNames);

// ColourName routes
router.post('/createColourName', partController.createColourName);
router.get('/allColourNames', partController.getAllColourNames);
router.get('/searchColourNames', partController.searchColourNames);

// MakerName routes
router.post('/createMakerName', partController.createMakerName);
router.get('/allMakerNames', partController.getAllMakerNames);
router.get('/searchMakerNames', partController.searchMakerNames);

// MeasurementUnit routes
router.post('/createMeasurementUnit', partController.createMeasurementUnit);
router.get('/allMeasurementUnits', partController.getAllMeasurementUnits);
router.get('/searchMeasurementUnits', partController.searchMeasurementUnits);

module.exports = router;