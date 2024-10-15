const mongoose = require('mongoose');


const VendorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      country: String,
      pinCode: String
    },
    gstNumber: String,
    phone: String,
    email: String,
    cinNumber: String,
    paymentTerms: String,
    deliveryTerms: String,
    items: [{
      item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
      unitPrice: Number,
      currency: { type: String, default: 'INR' },
      leadTime: Number // in days
    }],
    isActive: { type: Boolean, default: true },
  }, { timestamps: true });
  
  const Vendor = mongoose.model('Vendor', VendorSchema);

  module.exports = Vendor;

  