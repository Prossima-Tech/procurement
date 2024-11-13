const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for vendor's quote for each item
const ItemQuoteSchema = new Schema({
    rfqItem: {
        type: Schema.Types.ObjectId,
        required: true
    },
    unitPrice: {
        type: Number,
        required: [true, 'Unit price is required'],
        min: [0, 'Unit price cannot be negative']
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },
    totalPrice: {
        type: Number,
        required: true
    },
    deliveryTime: {
        type: Number,  // in days
        required: true
    },
    specifications: Schema.Types.Mixed,
    technicalRemarks: String,
    commercialRemarks: String,
    alternativeOffering: {
        suggested: Boolean,
        details: String,
        unitPrice: Number
    }
});

// Schema for vendor's complete quotation
const VendorQuoteSchema = new Schema({
    vendor: {
        type: Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    quotationReference: {
        type: String,
        required: true
    },
    items: [ItemQuoteSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentTerms: String,
    deliveryTerms: String,
    warranty: String,
    validityPeriod: {
        type: Number,  // in days
        required: false
    },
    status: {
        type: String,
        enum: [ 'submitted', 'under_review', 'selected', 'not_selected'],
        default: 'submitted'
    },
    submissionDate: Date,
    evaluationScores: {
        technical: Number,
        commercial: Number,
        delivery: Number,
        overall: Number
    },
    remarks: String
});


// RFQ Item Schema that references Indent Items
const RFQItemSchema = new Schema({
    indentItemType: {
        type: String,
        enum: ['existing', 'new'],
        required: true
    },
    indentItemId: {
        type: Schema.Types.ObjectId,
        required: false
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },
    itemCode: String,  // For existing items
    requiredDeliveryDate: Date,
});
// Main RFQ Schema
const RFQSchema = new Schema({
    rfqNumber: {
        type: String,
        unique: true,
        required: true
    },
    indent: {
        type: Schema.Types.ObjectId,
        ref: 'Indent',
        required: true
    },
    // Maintain reference to original indent details
    unit: {
        type: Schema.Types.ObjectId,
        ref: 'Unit',
        required: true
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    items: [RFQItemSchema],
    
    // Vendor selection and quotation
    selectedVendors: [{
        vendor: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor'
        },
        status: {
            type: String,
            enum: ['invited', 'accepted', 'declined', 'no_response'],
            default: 'invited'
        },
        invitationDate: Date,
        responseDate: Date
    }],
    vendorQuotes: [VendorQuoteSchema],
    
    publishDate: Date,
    submissionDeadline: {
        type: Date,
        required: true
    },
    
    status: {
        type: String,
        enum: ['published', 'evaluation','evaluated', 'awarded', 'cancelled'],
        default: 'published'
    },
    
    generalTerms: String,
    
    
    // Final Selection
    selectedQuote: {
        vendor: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor'
        },
        quotation: {
            type: Schema.Types.ObjectId,
            ref: 'VendorQuote'
        },
        selectionDate: Date,
        selectionRemarks: String
    },
    
    
}, {
    timestamps: true
});

// Generate RFQ number
RFQSchema.pre('save', async function (next) {
    if (!this.rfqNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');

        const count = await this.constructor.countDocuments({
            createdAt: {
                $gte: new Date(date.getFullYear(), date.getMonth(), 1),
                $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
            }
        });

        this.rfqNumber = `RFQ-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('RFQ', RFQSchema);










// 1. Creating a new RFQ
// // POST /api/rfq/create
// {
//     "indent": "657894abcd12345678901234",
//     "unit": "657894abcd12345678901235",
//     "project": "657894abcd12345678901236",
    
//     // Items derived from indent
//     "items": [
//         {
//             "indentItemType": "existing",
//             "indentItemId": "657894abcd12345678901237",
//             "name": "Office Chair - Executive",
//             "quantity": 10,
//             "itemCode": "FUR-CHR-001",
//             "requiredDeliveryDate": "2024-12-31"
//         },
//         {
//             "indentItemType": "new",
//             "indentItemId": "657894abcd12345678901238",
//             "name": "Custom Conference Table",
//             "quantity": 2,
//             "requiredDeliveryDate": "2024-12-31"
//         }
//     ],
    
//     // Initial vendor selection
//     "selectedVendors": [
//         {
//             "vendor": "657894abcd12345678901239",
//             "status": "invited",
//             "invitationDate": "2024-11-12T10:00:00Z"
//         },
//         {
//             "vendor": "657894abcd12345678901240",
//             "status": "invited",
//             "invitationDate": "2024-11-12T10:00:00Z"
//         }
//     ],
    
//     "publishDate": "2024-11-12T10:00:00Z",
//     "submissionDeadline": "2024-11-26T18:00:00Z",
//     "generalTerms": "1. Delivery at site\n2. Payment terms: 30 days after delivery\n3. Warranty: Minimum 1 year"
// }

// // 2. Vendor submitting quotation
// // POST /api/rfq/{rfqId}/quotes
// {
//     "vendor": "657894abcd12345678901239",
//     "quotationReference": "QT/2024/11/001",
//     "items": [
//         {
//             "rfqItem": "657894abcd12345678901241",  // Reference to RFQ item
//             "unitPrice": 15000,
//             "quantity": 10,
//             "totalPrice": 150000,
//             "deliveryTime": 15,
//             "specifications": {
//                 "material": "Premium Leather",
//                 "color": "Black",
//                 "warranty": "2 years"
//             },
//             "technicalRemarks": "BIFMA certified chairs",
//             "commercialRemarks": "Includes installation",
//             "alternativeOffering": {
//                 "suggested": true,
//                 "details": "Premium fabric version available",
//                 "unitPrice": 12000
//             }
//         },
//         {
//             "rfqItem": "657894abcd12345678901242",
//             "unitPrice": 75000,
//             "quantity": 2,
//             "totalPrice": 150000,
//             "deliveryTime": 30,
//             "specifications": {
//                 "material": "Teak Wood",
//                 "dimensions": "12ft x 4ft",
//                 "features": "Built-in power outlets"
//             },
//             "technicalRemarks": "Custom design as per requirement",
//             "commercialRemarks": "Installation and delivery included"
//         }
//     ],
//     "totalAmount": 300000,
//     "currency": "INR",
//     "paymentTerms": "50% advance, 50% after delivery",
//     "deliveryTerms": "Free delivery and installation",
//     "warranty": "2 years comprehensive warranty",
//     "validityPeriod": 45,
//     "documents": [
//         {
//             "type": "technical",
//             "name": "tech_specifications.pdf",
//             "file": "/uploads/tech_specifications.pdf"
//         },
//         {
//             "type": "commercial",
//             "name": "price_breakdown.pdf",
//             "file": "/uploads/price_breakdown.pdf"
//         }
//     ],
//     "status": "submitted",
//     "submissionDate": "2024-11-20T15:30:00Z",
//     "evaluationScores": {
//         "technical": 85,
//         "commercial": 90,
//         "delivery": 95,
//         "overall": 90
//     },
//     "remarks": "All items will be delivered within 30 days of PO"
// }

// // 3. Selecting winning quote
// // PATCH /api/rfq/{rfqId}/select-quote
// {
//     "selectedQuote": {
//         "vendor": "657894abcd12345678901239",
//         "quotation": "657894abcd12345678901243",
//         "selectionDate": "2024-11-28T10:00:00Z",
//         "selectionRemarks": "Best value for money and shortest delivery timeline"
//     }
// }

// // 4. Complete RFQ object after quote selection
// {
//     "rfqNumber": "RFQ-2411-0001",
//     "indent": "657894abcd12345678901234",
//     "unit": "657894abcd12345678901235",
//     "project": "657894abcd12345678901236",
//     "items": [
//         {
//             "indentItemType": "existing",
//             "indentItemId": "657894abcd12345678901237",
//             "name": "Office Chair - Executive",
//             "quantity": 10,
//             "itemCode": "FUR-CHR-001",
//             "requiredDeliveryDate": "2024-12-31"
//         },
//         {
//             "indentItemType": "new",
//             "indentItemId": "657894abcd12345678901238",
//             "name": "Custom Conference Table",
//             "quantity": 2,
//             "requiredDeliveryDate": "2024-12-31"
//         }
//     ],
//     "selectedVendors": [
//         {
//             "vendor": "657894abcd12345678901239",
//             "status": "accepted",
//             "invitationDate": "2024-11-12T10:00:00Z",
//             "responseDate": "2024-11-20T15:30:00Z"
//         },
//         {
//             "vendor": "657894abcd12345678901240",
//             "status": "no_response",
//             "invitationDate": "2024-11-12T10:00:00Z"
//         }
//     ],
//     "vendorQuotes": [
//         // Full quote object as shown in example 2
//     ],
//     "publishDate": "2024-11-12T10:00:00Z",
//     "submissionDeadline": "2024-11-26T18:00:00Z",
//     "status": "awarded",
//     "generalTerms": "1. Delivery at site\n2. Payment terms: 30 days after delivery\n3. Warranty: Minimum 1 year",
//     "selectedQuote": {
//         "vendor": "657894abcd12345678901239",
//         "quotation": "657894abcd12345678901243",
//         "selectionDate": "2024-11-28T10:00:00Z",
//         "selectionRemarks": "Best value for money and shortest delivery timeline"
//     },
//     "createdAt": "2024-11-12T10:00:00Z",
//     "updatedAt": "2024-11-28T10:00:00Z"
// }