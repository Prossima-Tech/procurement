const mongoose = require('mongoose');

const PurchaseOrderSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  // purchaseIndent: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseIndent' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  poCode: { type: String, required: true, unique: true },
  poDate: { type: Date, required: true },
  validUpto: { type: Date },

  invoiceTo: {
    name: { type: String, required: true },
    branchName: String,
    address: { type: String, required: true },
    city: String,
    state: String,
    pin: String
  },
  dispatchTo: {
    name: { type: String, required: true },
    branchName: String,
    address: { type: String, required: true },
    city: String,
    state: String,
    pin: String
  },
  items: [{
    partCode: { type: mongoose.Schema.Types.ObjectId, ref: 'PartCode', required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true }
  }],

  deliveryDate: { type: Date, required: true },
  supplierRef: String,
  otherRef: String,
  dispatchThrough: String,
  destination: String,
  paymentTerms: String,
  deliveryTerms: String,
  poNarration: String,
  
  
  status: { type: String, enum: ['draft','created' ,'submitted', 'approved', 'cancelled'], default: 'draft' }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);