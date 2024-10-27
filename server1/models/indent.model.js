const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for existing items
const ExistingItemSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Item name is required']
    },
    // quantity: {
    //     type: Number,
    //     required: [true, 'Quantity is required'],
    //     min: [1, 'Quantity must be at least 1']
    // },
    // specifications: {
    //     size: String,
    //     material: String,
    //     unit: String
    // },
    // urgency: {
    //     type: String,
    //     enum: ['normal', 'urgent'],
    //     default: 'normal'
    // },
    // remarks: String
});

// Schema for new items
const NewItemSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Item name is required']
    },
    // description: {
    //     type: String,
    //     required: [true, 'Description is required']
    // },
    // quantity: {
    //     type: Number,
    //     required: [true, 'Quantity is required'],
    //     min: [1, 'Quantity must be at least 1']
    // },
    // estimatedUnitPrice: {
    //     type: Number,
    //     required: [true, 'Estimated unit price is required'],
    //     min: [0, 'Price cannot be negative']
    // },
    // specifications: {
    //     size: String,
    //     material: String,
    //     make: String,
    //     model: String,
    //     unit: String
    // },
    // remarks: String
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
    },

    // expectedDeliveryDate: Date,

    // attachments: [{
    //     filename: String,
    //     path: String,
    //     uploadDate: Date
    // }],

    // remarks: String

}, {
    timestamps: true
});

// Pre-save middleware for indent number generation
IndentSchema.pre('save', async function (next) {
    if (!this.indentNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');

        const count = await this.constructor.countDocuments({
            createdAt: {
                $gte: new Date(date.getFullYear(), date.getMonth(), 1),
                $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
            }
        });

        this.indentNumber = `IND-${year}-${month}-${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Indent', IndentSchema);