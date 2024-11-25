const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  partId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part',
    required: true
  },
  itemDetails: {
    partCode: String,
    itemName: String,
    sacHsnCode: String,
    uom: String
  },
  acceptedQuantity: {
    type: Number,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  baseAmount: {
    type: Number,
    required: true
  },
  cgstRate: Number,
  cgstAmount: Number,
  sgstRate: Number,
  sgstAmount: Number,
  utgstRate: Number,
  utgstAmount: Number,
  igstRate: Number,
  igstAmount: Number,
  totalAmount: {
    type: Number,
    required: true
  }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  invoiceDate: {
    type: Date,
    required: true
  },
  grnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GRN',
    required: true
  },
  poId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  items: [invoiceItemSchema],
  taxType: {
    type: String,
    enum: ['igst', 'sgst', 'utgst'],
    required: true
  },
  subTotal: {
    type: Number,
    required: true
  },
  cgstAmount: Number,
  sgstAmount: Number,
  utgstAmount: Number,
  igstAmount: Number,
  totalAmount: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Invoice', invoiceSchema); 