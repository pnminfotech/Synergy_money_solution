const mongoose = require("mongoose");

const RedemptionSchema = new mongoose.Schema({
    date: String,
    orderNo: String,
    settNo: String,
    clientCode: String,
    clientName: String,
    schemeCode: String,
    schemeName: String,
    ISIN: String,
    buySell: String,
    amount: String,
    dpFolioNo: String,
    folioNo: String,
    entryBy: String,
    orderStatus: {
        type: String,
        enum: ["VALID", "INVALID"], // ✅ Ensure both values are allowed
        required: true
    },
    orderRemark: String,
    orderType: String,
    sipRegnNo: String,
    sipRegnDate: String,
    subOrderType: String,
    firstOrder: String,
    purchaseRedeem: String,
    memberRemarks: String,
    kycFlag: String,
    minRedemptionFlag: String
});

module.exports = mongoose.model("Redemption", RedemptionSchema);
