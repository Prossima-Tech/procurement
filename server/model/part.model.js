const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PartCodeSchema = new Schema({
  PartCodeNumber: { type: String, required: true, unique: true },
  ItemCode: { type: String, ref: 'Item', required: true },
  SizeName:String, // { type: Schema.Types.ObjectId , ref: 'SizeName'},
  ColourName:String, // { type: Schema.Types.ObjectId , ref: 'ColourName'},
  SerialNumber: String,
  ItemMakeName: String,// { type: Schema.Types.ObjectId , ref: 'MakerName'},
  MeasurementUnit: String //{ type: Schema.Types.ObjectId , ref: 'Measureunit'},
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