const mongoose = require("mongoose");

const DatewiseSipSchema = new mongoose.Schema({
  date: String,
  orderNo: String,
  settNo: String,
  clientCode: String,
  clientName: String,
  schemeCode: String,
  schemeName: String,
  isin: String,
  buySell: String,
  amount: Number,
  dpFolioNo: String,
  folioNo: String,
  orderStatus: String,
  orderRemark: String,
  orderType: String,
  sipRegnNo: String,
  sipRegnDate: String,
  subOrderType: String,
  firstOrder: String,
  purchaseRedeem: String,
  memberRemarks: String,
  sipDates: [Number], // Array of SIP dates
});

module.exports = mongoose.model("DatewiseSipRecord", DatewiseSipSchema);
