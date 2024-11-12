const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define schema to store vendors associated with an item
const ItemVendorsSchema = new Schema({
    item: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
        unique: true // Ensures each item has only one entry in this collection
    },
    vendors: [{
        vendor: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true
        },
        price: Number,
        availability: Number, 
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Create a compound index to efficiently query vendors by item
ItemVendorsSchema.index({ item: 1 });

module.exports = mongoose.model('ItemVendors', ItemVendorsSchema);
