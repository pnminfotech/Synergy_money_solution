
const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceDate: Date,
  billType: String,
  invoiceNo: String,
  amcClientName: String,
  taxableAmount: Number,
  igst: Number,
  cgst: Number,
  sgst: Number,
  totalGst: Number,
  netAmount: Number,
  gstNo: String,
  panNo: String,
  hsnNo: String,
  amcPanNo: String,
  amcGstNo: String,
  month: String,
  year: String
});

module.exports = mongoose.model('Invoice', InvoiceSchema);