// unitController.js
const Unit = require('../models/unit.model');
const mongoose = require('mongoose');

// Helper function to check if string is valid ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all units
const getAllUnits = async (req, res) => {
    try {
        const units = await Unit.find();
        res.json(units);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single unit by ID or Code
const getUnitById = async (req, res) => {
    try {
        const idOrCode = req.params.id;
        let unit;

        if (isValidObjectId(idOrCode)) {
            // If it's a valid ObjectId, search by _id
            unit = await Unit.findById(idOrCode);
        } else {
            // If it's not a valid ObjectId, search by unitCode
            unit = await Unit.findOne({ unitCode: idOrCode });
        }

        if (!unit) {
            return res.status(404).json({ message: 'Unit not found' });
        }
        res.json(unit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update unit by ID or Code
const updateUnit = async (req, res) => {
    try {
        const idOrCode = req.params.id;
        let unit;

        if (isValidObjectId(idOrCode)) {
            unit = await Unit.findById(idOrCode);
        } else {
            unit = await Unit.findOne({ unitCode: idOrCode });
        }

        if (!unit) {
            return res.status(404).json({ message: 'Unit not found' });
        }

        if (req.body.unitName) unit.unitName = req.body.unitName;
        if (req.body.unitCode) unit.unitCode = req.body.unitCode;

        const updatedUnit = await unit.save();
        res.json(updatedUnit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete unit by ID or Code
const deleteUnit = async (req, res) => {
    try {
        const idOrCode = req.params.id;
        let unit;

        if (isValidObjectId(idOrCode)) {
            unit = await Unit.findById(idOrCode);
        } else {
            unit = await Unit.findOne({ unitCode: idOrCode });
        }

        if (!unit) {
            return res.status(404).json({ message: 'Unit not found' });
        }
        await unit.deleteOne();
        res.json({ message: 'Unit deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search units
const searchUnits = async (req, res) => {
    const query = req.query.q || '';
    try {
        const units = await Unit.find({
            $or: [
                { unitName: { $regex: query, $options: 'i' } },
                { unitCode: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(units);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Create a new unit
const createUnit = async (req, res) => {
    const unit = new Unit({
        unitName: req.body.unitName,
        unitCode: req.body.unitCode
    });

    try {
        const newUnit = await unit.save();
        res.status(201).json(newUnit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
module.exports = {
    getAllUnits,
    getUnitById,
    searchUnits,
    createUnit,
    updateUnit,
    deleteUnit
};