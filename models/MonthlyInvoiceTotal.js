// models/MonthlyInvoiceTotal.js
const mongoose = require('mongoose');

const monthlyTotalSchema = new mongoose.Schema({
  month: String,
  year: String,
  totals: {
    totalTaxableAmount: Number,
    totalIGST: Number,
    totalCGST: Number,
    totalSGST: Number,
    totalGST: Number,
    totalNetAmount: Number
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MonthlyInvoiceTotal', monthlyTotalSchema);
