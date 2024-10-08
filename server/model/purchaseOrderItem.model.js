const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const PurchaseOrderItemSchema = new Schema({
  POItemID: { type: String, required: true, unique: true },
  POID: { type: Schema.Types.ObjectId , ref: 'PurchaseOrder', required: true },
  PartCodeNumber: { type: Schema.Types.ObjectId, ref: 'PartCode', required: true }, // may need to be changed to value insted on ID
  Quantity: { type: Number, required: true },
  UnitPrice: { type: Number, required: true },
  TotalPrice: { type: Number, required: true }
});


const PurchaseOrderItem = mongoose.model('PurchaseOrderItem', PurchaseOrderItemSchema);
export default PurchaseOrderItem