const mongoose = require("mongoose");

const ExcelDataSchema = new mongoose.Schema({
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
}, { timestamps: true });

const ExcelDataFromSheet = mongoose.model("ExcelDataFromSheet", ExcelDataSchema);

module.exports = ExcelDataFromSheet;
