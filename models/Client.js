const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
    name: String,
    aadharNumber: String,
    panNumber: String,
    bankAccount: String,
    ifscCode: String,
    sipDetails: [{ date: String, amount: Number, status: String }]
});

module.exports = mongoose.model("Client", ClientSchema);
