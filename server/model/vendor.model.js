const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VendorSchema = new Schema({
  VendorID: { type: String, required: true, unique: true },
  POPrefix: String,
  VendorName: { type: String, required: true },
  ContactPerson: { type: String, required: true },
  ContactNumber: Number,
  MobileNumber: { type: Number, required: true },
  PANNumber: String,
  EmailID: String,
  GSTNumber: String,
  BankName: String,
  BankBranchName: String,
  BankAccountNumber: Number,
  BankIFSCCode: String,
  Address: String,
  StateName: String,
  CityName: String,
  PINCode: { type: Number, required: true },
  Remark: String
});


const Vendor = mongoose.model('Vendor', VendorSchema);
export default Vendor