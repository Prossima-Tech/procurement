const mongoose = require('mongoose');


  const VendorSchema = new mongoose.Schema({
    
    vendorCode: { 
      type: Number, 
      required: true, 
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
    
    emailId: { 
      type: String, 
      lowercase: true
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
  
  
  const Vendor = mongoose.model('Vendor', VendorSchema);

  module.exports = Vendor;
