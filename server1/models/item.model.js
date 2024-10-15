const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true,
  },
  name: { 
    type: String, 
    required: true, 
  },
  type: { 
    type: String, 
    required: true, 
    enum: ['good', 'service'],
  },
  sacHsnCode: { 
    type: String,
    uppercase: true
  },
  category: { 
    type: String,
  },
  serialNumber: { 
    type: String,
  },
    
  igst: { type: Number },
    
  cgst: { type: Number},
    
  sgst: { type: Number },
    
  utgst: { type: Number},

  description: { 
    type: String
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

  
const Item = mongoose.model('Item', ItemSchema);

const ItemCategorySchema = new Schema({
  name: { type: String, required: true, unique: true }
});

const ItemCategory = mongoose.model('ItemCategory', ItemCategorySchema);


module.exports = {Item, ItemCategory};