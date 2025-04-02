const mongoose = require("mongoose");

const ExcelDataFromSheetSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    pan: { type: String },
    taxStatus: { type: String },
    holdingMode: { type: String },
    email: { type: String },
    createdOn: { type: String },
    clientId: { type: String },
    kyc: { type: String },
    bank: { type: String },
    aof: { type: String },
    fatca: { type: String },
    mandate: { type: String }
});

module.exports = mongoose.model("ExcelDataFromSheet", ExcelDataFromSheetSchema);
