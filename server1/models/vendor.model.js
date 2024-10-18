const { required } = require('joi');
const mongoose = require('mongoose');


const VendorSchema = new mongoose.Schema({

  vendorCode: {
    type: Number,
    unique: true,
  },

  poPrefix: { 
    type: String,
  },

  name: {
    type: String,
    required: true,
  },

  contactPerson: {
    type: String,
    required: true
  },

  contactNumber: {
    type: String
  },

  mobileNumber: {
    type: String,
    required: true
  },

  panNumber: {
    type: String,
    uppercase: true
  },

  email: {
    type: String,
    lowercase: true,
    required: true
  },

  gstNumber: {
    type: String,
    uppercase: true
  },

  bankDetails: {
    name: String,
    branchName: String,
    accountNumber: {
      type: String
    },
    ifscCode: {
      type: String,
      uppercase: true
    }
  },

  address: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    pinCode: {
      type: String
    }
  },

  remark: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

VendorSchema.pre('validate', async function (next) {
  if (this.isNew && !this.vendorCode) {
    try {
      const lastVendor = await this.constructor.findOne({}, {}, { sort: { 'vendorCode': -1 } });
      this.vendorCode = lastVendor && lastVendor.vendorCode ? lastVendor.vendorCode + 1 : 1;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

const Vendor = mongoose.model('Vendor', VendorSchema);

module.exports = Vendor;
