// models/AMCMonthlyTaxableData.js
const mongoose = require('mongoose');

const AMCMonthlyTaxableDataSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true
  },
  amcClientName: {
    type: String,
    required: true
  },
  months: {
    // Key-value pairs where the key is the month (e.g., 'apr24', 'may24') and value is the taxable amount
    apr24: { type: Number, default: 0 },
    may24: { type: Number, default: 0 },
    jun24: { type: Number, default: 0 },
    jul24: { type: Number, default: 0 },
    aug24: { type: Number, default: 0 },
    sep24: { type: Number, default: 0 },
    oct24: { type: Number, default: 0 },
    nov24: { type: Number, default: 0 },
    dec24: { type: Number, default: 0 },
    jan25: { type: Number, default: 0 },
    feb25: { type: Number, default: 0 },
    mar25: { type: Number, default: 0 },
  },
  sixMonthsTotal: { type: Number, default: 0 },
  sixToTwelveMonthsTotal: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 }
});

const AMCMonthlyTaxableData = mongoose.model('AMCMonthlyTaxableData', AMCMonthlyTaxableDataSchema);

module.exports = AMCMonthlyTaxableData;
