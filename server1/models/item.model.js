const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    unitOfMeasure: String,
    isService: { type: Boolean, default: false },
    parts: [{
      partNumber: { type: String, unique: true },
      name: String,
      description: String
    }],
    taxes: [{
      taxName: String,
      rate: Number
    }],
  }, { timestamps: true });
  
  const Item = mongoose.model('Item', ItemSchema);

  module.exports = Item;