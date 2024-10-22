const express = require('express');
const router = express.Router();
const Unit = require('../models/unit.model');
const Project = require('../models/project.model');
// // Unit routes
// router.post('/createUnit', unitController.createUnit);
// router.get('/allUnits', unitController.getAllUnits);
// router.get('/getUnit/:unitId', unitController.getUnit);
// router.delete('/deleteUnit/:id', unitController.deleteUnit);

router.post('/createUnit', async (req, res) => {
    try {
        const { unitName, unitCode } = req.body;
        const unit = await Unit.create({ unitName, unitCode });
        res.status(201).json(unit);
    } catch (error) {
        console.error('Error creating unit:', error);
        res.status(500).json({ message: 'Error creating unit', error: error.message });
    }
});

router.post('/createProject', async (req, res) => {
    try {
        const { projectName, projectCode, projectLocation } = req.body;
        const project = await Project.create({ projectName, projectCode, projectLocation });
        res.status(201).json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Error creating project', error: error.message });
    }
});
module.exports = router;
