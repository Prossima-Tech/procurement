const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UnitSchema = new Schema({
  unitName: { type: String, required: true, unique: true },
  unitCode: { type: String, required: true, unique: true },
  // unitLocation: { type: String, required: true },
  // unitStatus: { type: String, default: "Active" },
});

const Unit = mongoose.model('Unit', UnitSchema);

module.exports = Unit;