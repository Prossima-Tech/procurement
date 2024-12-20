const express = require('express');
const router = express.Router();
const partController = require('../controllers/part.controller');

// PartCode routes
router.post('/createPart', partController.createPart);
router.get('/allParts', partController.getAllParts);
router.get('/getPart/:partId', partController.getPart);
router.delete('/deletePart/:id', partController.deletePart);
router.put('/updatePart/:id', partController.updatePart);
router.get('/getPartByCode/:code', partController.getPartByCode);
router.get('/getPartByItemCode/:itemCode', partController.getPartByItemCode);
// SizeName routes
router.post('/sizes/createSizeName', partController.createSizeName);
router.get('/sizes/allSizeNames', partController.getAllSizeNames);
router.get('/sizes/searchSizeNames', partController.searchSizeNames);
router.delete('/sizes/:id', partController.deleteSizeName);

// ColourName routes
router.post('/colours/createColourName', partController.createColourName);
router.get('/colours/allColourNames', partController.getAllColourNames);
router.get('/colours/searchColourNames', partController.searchColourNames);
router.delete('/colours/:id', partController.deleteColourName);

// MakerName routes
router.post('/makers/createMakerName', partController.createMakerName);
router.get('/makers/allMakerNames', partController.getAllMakerNames);
router.get('/makers/searchMakerNames', partController.searchMakerNames);
router.delete('/makers/:id', partController.deleteMakerName);

// MeasurementUnit routes
router.post('/units/createMeasurementUnit', partController.createMeasurementUnit);
router.get('/units/allMeasurementUnits', partController.getAllMeasurementUnits);
router.get('/units/searchMeasurementUnits', partController.searchMeasurementUnits);
router.delete('/units/:id', partController.deleteMeasurementUnit);

router.get('/search', partController.searchParts);

module.exports = router;
