const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const InspectionParameterSchema = new mongoose.Schema({
    parameterName: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    },
    result: {
        type: String,
        enum: ['pass', 'fail', 'conditional'],
        required: true
    },
    remarks: String
});

const InspectionItemSchema = new mongoose.Schema({
    grnItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GRN.items',
        required: true
    },
    partCode: {
        type: String,
        required: true
    },
    receivedQuantity: {
        type: Number,
        required: true
    },
    inspectedQuantity: {
        type: Number,
        required: true,
        default: 0,
        validate: {
            validator: function (v) {
                return v <= this.receivedQuantity;
            },
            message: 'Inspected quantity cannot exceed received quantity'
        }
    },
    acceptedQuantity: {
        type: Number,
        required: true,
        default: 0
    },
    rejectedQuantity: {
        type: Number,
        required: true,
        default: 0
    },
    parameters: [InspectionParameterSchema],
    itemDetails: {
        partCodeNumber: String,
        itemName: String,
        itemCode: String,
        measurementUnit: String
    },
    result: {
        type: String,
        enum: ['pending', 'pass', 'fail', 'conditional'],
        default: 'pending'
    },
    remarks: String,
    attachments: [{
        name: String,
        url: String,
        type: String,
        uploadedAt: Date
    }]
});

const InspectionSchema = new mongoose.Schema({
    inspectionNumber: {
        type: String,
        required: true,
        unique: true
    },
    grn: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GRN',
        required: true
    },
    inspector: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    completionDate: Date,
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
    },
    items: [InspectionItemSchema],
    overallResult: {
        type: String,
        enum: ['pending', 'pass', 'fail', 'conditional'],
        default: 'pending'
    },
    remarks: String,
    attachments: [{
        name: String,
        url: String,
        type: String,
        uploadedAt: Date
    }]
}, {
    timestamps: true
});

InspectionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Inspection', InspectionSchema);