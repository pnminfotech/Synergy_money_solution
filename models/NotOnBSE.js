const mongoose = require("mongoose");

const NotOnBSESchema = new mongoose.Schema({
    clientCode: String,
    primaryHolderName: String,
    schemeName: String,
    startDate: Date,
    endDate: Date,
    installmentAmount: Number,
    years: {
        type: Object,  // Ensure it's an object to store year-month mappings
        default: {}  
    }
}, { timestamps: true });




module.exports = mongoose.model("NotOnBSE", NotOnBSESchema);
