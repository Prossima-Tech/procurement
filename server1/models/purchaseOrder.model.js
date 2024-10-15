const mongoose = require('mongoose');

const PurchaseOrderSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  unitCode: { type: String, required: true },
  unitName: { type: String, required: true },
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
  poDate: { type: Date, required: true },
  validUpto: { type: Date },
  deliveryDate: { type: Date, required: true },
  projectId: String,
  paymentTerms: String,
  deliveryTerms: String,
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true },
    rate: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  totals: {
    subtotal: { type: Number, required: true },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true }
  },
  poNumber: { type: String, required: true, unique: true },
  status: { type: String, enum: ['draft', 'submitted', 'approved', 'cancelled'], default: 'draft' }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);