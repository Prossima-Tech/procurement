const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PriceEntrySchema = new Schema({
    vendor: {
        type: Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    purchaseOrder: {
        type: Schema.Types.ObjectId,
        ref: 'PurchaseOrder',
        required: true
    },
    unitPrice: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    poDate: {
        type: Date,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    metadata: {
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project'
        },
        unit: {
            type: Schema.Types.ObjectId,
            ref: 'Unit'
        },
        department: String
    }
}, { _id: true, timestamps: true });

const ItemPriceHistorySchema = new Schema({
    item: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
        unique: true  // Ensures one document per item
    },
    priceHistory: [PriceEntrySchema],
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    statistics: {
        averagePrice: Number,
        lowestPrice: Number,
        highestPrice: Number,
        lastPrice: Number,
        totalOrders: Number
    }
}, {
    timestamps: true
});

// Index for efficient querying
ItemPriceHistorySchema.index({ item: 1, 'priceHistory.poDate': -1 });

module.exports = mongoose.model('ItemPriceHistory', ItemPriceHistorySchema);