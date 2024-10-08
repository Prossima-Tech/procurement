const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PurchaseOrderSchema = new Schema({
  POID: { type: String, required: true, unique: true },
  VendorID: { type: Schema.Types.ObjectId , ref: 'Vendor', required: true },
  // PurchaseIndentID: { type: String, ref: 'PurchaseIndent' },
  PaymentTerms: String,
  SupplierReference: String,
  OtherReference: String,
  DispatchThrough: String,
  Destination: String,
  DeliveryTerms: String,
  DeliveryDate: Date,
  PONarration: String,
  Status: { 
    type: String, 
    enum: ['Created', 'Approved', 'Recieved', 'Cancelled'],
    default: 'Draft'
  }
});

const PurchaseOrder = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
export default PurchaseOrder