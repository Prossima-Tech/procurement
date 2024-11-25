const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define item status enum
const ITEM_STATUS = {
    INDENT: 'indent',
    RFQ: 'rfq',
    PO: 'po'
};

// Schema for existing items
const ExistingItemSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Item name is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    reference: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
    },
    itemCode: {
        type: String,
    },
    status: {
        type: String,
        enum: Object.values(ITEM_STATUS),
        default: ITEM_STATUS.INDENT
    },
    rfqReference: {
        type: Schema.Types.ObjectId,
        ref: 'RFQ'
    },
    poReference: {
        type: Schema.Types.ObjectId,
        ref: 'PO'
    }
});

// Schema for new items
const NewItemSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Item name is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    status: {
        type: String,
        enum: Object.values(ITEM_STATUS),
        default: ITEM_STATUS.INDENT
    },
    rfqReference: {
        type: Schema.Types.ObjectId,
        ref: 'RFQ'
    },
    poReference: {
        type: Schema.Types.ObjectId,
        ref: 'PO'
    }
});

const IndentSchema = new Schema({
    indentNumber: {
        type: String,
        unique: true
    },

    // Employee reference
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Manager reference
    manager: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Unit reference
    unit: {
        type: Schema.Types.ObjectId,
        ref: 'Unit',
        required: true
    },

    // Project reference
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },

    // Separate sections for existing and new items
    items: {
        existing: [ExistingItemSchema],
        new: [NewItemSchema]
    },

    purpose: {
        type: String,
        required: [true, 'Purpose is required']
    },

    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },

    status: {
        type: String,
        enum: ['draft', 'submitted', 'manager_approved', 'manager_rejected', 'admin_approved', 'admin_rejected', 'po_created'],
        default: 'draft'
    },

    approvalDetails: {
        managerApproval: {
            approved: Boolean,
            date: Date,
            remarks: String
        },
        adminApproval: {
            approved: Boolean,
            date: Date,
            remarks: String
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Indent', IndentSchema);