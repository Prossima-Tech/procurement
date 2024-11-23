const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const GRNItemSchema = new mongoose.Schema({
    partCode: {
        type: String,
        required: true
    },
    partId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Part',
        required: true
    },
    poItem: {
        type: String,
        default: ''
    },
    orderedQuantity: {
        type: Number,
        required: true
    },
    receivedQuantity: {
        type: Number,
        required: true
    },
    unitPrice: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    remarks: {
        type: String,
        default: ''
    },
    itemDetails: {
        partCodeNumber: String,
        itemName: String,
        itemCode: String,
        measurementUnit: String
    }
});

const TransportDetailsSchema = new mongoose.Schema({
    vehicleNumber: String,
    transporterName: String,
    ewayBillNumber: String,
    freightTerms: String,
    freightAmount: {
        type: Number,
        default: 0
    }
});

const GRNSchema = new mongoose.Schema({
    grnNumber: {
        type: String,
        required: true,
        unique: true
    },
    purchaseOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PurchaseOrder',
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    unitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Unit',
        required: true
    },
    vendor: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true
        },
        name: String,
        code: String,
        gstNumber: String
    },
    challanNumber: {
        type: String,
        required: true
    },
    challanDate: {
        type: Date,
        required: true
    },
    receivedDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'inspection_pending', 'inspection_in_progress', 'inspection_completed', 'approved', 'rejected'],
        default: 'draft'
    },
    transportDetails: TransportDetailsSchema,
    items: [GRNItemSchema],
    totalValue: {
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
}, {
    timestamps: true
});

// Apply the mongoose-paginate-v2 plugin to the schema
GRNSchema.plugin(mongoosePaginate);

// Create the model
const GRN = mongoose.model('GRN', GRNSchema);

// Export the model
module.exports = GRN;