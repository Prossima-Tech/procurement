const mongoose = require('mongoose');

const PurchaseOrderItemSchema = new mongoose.Schema({
  partCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PartCode',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  deliveredQuantity: {
    type: Number,
    default: 0
  },
  pendingQuantity: {
    type: Number,
    default: function () {
      return this.quantity;
    }
  },
  unitPrice: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  // Initialize grnDeliveries as an empty array by default
  grnDeliveries: {
    type: [{
      grnId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GRN'
      },
      receivedQuantity: Number,
      receivedDate: Date,
      status: {
        type: String,
        enum: ['pending', 'inspection_pending', 'inspection_completed', 'approved', 'rejected'],
        default: 'pending'
      }
    }],
    default: [] // This ensures it's always initialized as an empty array
  }
});


const PurchaseOrderSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
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

  items: [PurchaseOrderItemSchema],
  deliveryDate: { type: Date, required: true },
  supplierRef: String,
  otherRef: String,
  dispatchThrough: String,
  destination: String,
  paymentTerms: String,
  deliveryTerms: String,
  poNarration: String,

  deliveryStatus: {
    type: String,
    enum: ['pending', 'partially_delivered', 'fully_delivered'],
    default: 'pending'
  },
  isFullyDelivered: {
    type: Boolean,
    default: false
  },
  grns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GRN'
  }],

  status: {
    type: String,
    enum: [
      'draft',
      'created',
      'in_progress',
      'grn_created',
    ],
    default: 'draft'
  }
}, { timestamps: true });

// Method to update delivery status
PurchaseOrderSchema.methods.updateDeliveryStatus = function () {
  // Add null checks and default values
  this.items = this.items || [];

  this.items.forEach(item => {
    // Ensure item and its properties exist
    if (!item || typeof item.quantity === 'undefined') {
      return; // Skip invalid items
    }

    // Initialize deliveredQuantity if not present
    item.deliveredQuantity = item.deliveredQuantity || 0;

    // Calculate delivery status
    if (item.deliveredQuantity === 0) {
      item.deliveryStatus = 'pending';
    } else if (item.deliveredQuantity < item.quantity) {
      item.deliveryStatus = 'partial';
    } else if (item.deliveredQuantity >= item.quantity) {
      item.deliveryStatus = 'complete';
    }
  });

  // Update overall PO status
  // const allComplete = this.items.every(item => item.deliveryStatus === 'complete');
  // const anyPartial = this.items.some(item => item.deliveryStatus === 'partial');
  // const allPending = this.items.every(item => item.deliveryStatus === 'pending');

  // if (allComplete) {
  //   this.status = 'complete';
  // } else if (anyPartial) {
  //   this.status = 'partial';
  // } else if (allPending) {
  //   this.status = 'pending';
  // }

};

// Pre-save middleware
PurchaseOrderSchema.pre('save', function (next) {
  if (this.isModified('items') || this.isModified('items.$.deliveryDetails')) {
    this.updateDeliveryStatus();
  }
  next();
});

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);