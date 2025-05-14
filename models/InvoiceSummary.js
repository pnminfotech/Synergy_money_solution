// const mongoose = require('mongoose');

// const invoiceSummarySchema = new mongoose.Schema({
//   financialYear: { type: String, required: true }, 
//   months: [String],
//   summary: mongoose.Schema.Types.Mixed 
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('InvoiceSummary', invoiceSummarySchema);



const mongoose = require('mongoose');

const invoiceSummarySchema = new mongoose.Schema({
  financialYear: { type: String, required: true },
  months: { type: Map, of: Number },
  summary: { 
    type: Object, 
    required: true 
  },
}, {
  timestamps: true
});
module.exports = mongoose.model('InvoiceSummary', invoiceSummarySchema);



