const mongoose = require('mongoose');

const gstInvoiceSchema = new mongoose.Schema({
  invoiceDate: { type: Date, required: true },
  billType: { type: String, required: true },
  invoiceNo: { type: String, required: true },
  amcClientName: { type: String, required: true },
  taxableAmount: { type: Number, required: true },
  igst: { type: Number, required: true },
  cgst: { type: Number, required: true },
  sgst: { type: Number, required: true },
  totalGst: { type: Number, required: true },
  netAmount: { type: Number, required: true },
  gstNo: { type: String, required: true },
  panNo: { type: String, required: true },
  hsnNo: { type: String, required: true },
  amcPanNo: { type: String, required: true },
  amcGstNo: { type: String, required: true }
});

module.exports = mongoose.model('GSTInvoice', gstInvoiceSchema);