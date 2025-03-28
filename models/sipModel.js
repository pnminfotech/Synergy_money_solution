const mongoose = require("mongoose");

const sipSchema = new mongoose.Schema({
    clientCode: String,
    name: String,
    xsipRegnNo: String,
    schemeName: String,
    startDate: Date,
    endDate: Date,
    installmentAmt: Number,
    monthData: { type: Object, default: {} } // Stores monthly SIP status
});

module.exports = mongoose.model("Sip", sipSchema);
