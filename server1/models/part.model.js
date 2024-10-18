const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PartCodeSchema = new Schema({
  PartCodeNumber: { type: String, required: true, unique: true },
  ItemCode: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  SizeName: { type: String, default: "NONE" },
  ColourName: { type: String, default: "NONE" },
  SerialNumber: { type: String, required: true },
  ItemMakeName: { type: String, default: "NONE" },
  MeasurementUnit: { type: String, default: "NONE" }
});

// SizeName Schema
const SizeNameSchema = new Schema({
  name: { type: String, required: true, unique: true },
});

// ColourName Schema
const ColourNameSchema = new Schema({
  name: { type: String, required: true, unique: true },
});

// MakerName Schema
const MakerNameSchema = new Schema({
  name: { type: String, required: true, unique: true },
});

// MeasurementUnit Schema
const MeasurementUnitSchema = new Schema({
  name: { type: String, required: true, unique: true },
});


// Create models
const PartCode = mongoose.model('PartCode', PartCodeSchema);
const SizeName = mongoose.model('SizeName', SizeNameSchema);
const ColourName = mongoose.model('ColourName', ColourNameSchema);
const MakerName = mongoose.model('MakerName', MakerNameSchema);
const MeasurementUnit = mongoose.model('MeasurementUnit', MeasurementUnitSchema);


module.exports = {
  PartCode,
  SizeName,
  ColourName,
  MakerName,
  MeasurementUnit
};
