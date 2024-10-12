const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  ItemCode: { type: String, required: true, unique: true },
  ItemName: { type: String, required: true },
  type: { type: String, required: true, enum: ['good', 'service'] },
  SAC_HSN_Code: String,
  ItemCategory: String,
  SerialNumber: String,
  Remarks: String,
  IGST_Rate: Number,
  CGST_Rate: Number,
  SGST_Rate: Number,
  UTGST_Rate: Number
});

const Item = mongoose.model('Item', ItemSchema);

const ItemCategorySchema = new Schema({
  name: { type: String, required: true, unique: true }
});

const ItemCategory = mongoose.model('ItemCategory', ItemCategorySchema);

module.exports = { Item, ItemCategory };