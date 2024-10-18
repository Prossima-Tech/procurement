const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  ItemCode: { 
    type: String, 
    required: true, 
    unique: true
  },
  ItemName: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    required: true, 
    enum: ['good', 'service']
  },
  SAC_HSN_Code: { 
    type: String
  },
  ItemCategory: { 
    type: String
  },
  SerialNumber: { 
    type: String
  },
  Remarks: { 
    type: String
  },
  IGST_Rate: { 
    type: Number 
  },
  CGST_Rate: { 
    type: Number
  },
  SGST_Rate: { 
    type: Number 
  },
  UTGST_Rate: { 
    type: Number
  }
}, { 
  timestamps: true
});

const Item = mongoose.model('Item', ItemSchema);

const ItemCategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  }
});

const ItemCategory = mongoose.model('ItemCategory', ItemCategorySchema);

module.exports = { Item, ItemCategory };
