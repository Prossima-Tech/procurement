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

// Create models
const PartCode = mongoose.model('PartCode', PartCodeSchema);
export default PartCode