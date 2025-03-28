const mongoose = require("mongoose");

const SipRegistrationSchema = new mongoose.Schema({
    status: { type: String, default: "" },
    clientCode: { type: String, required: true },
    clientName: { type: String, required: true },
    xsipRegnNo: { type: String, default: "" },
    regnDate: { type: Date },  // Stored as Date format
    amcName: { type: String, default: "" },
    schemeName: { type: String, default: "" },
    startDate: { type: Date },  // Stored as Date format
    endDate: { type: Date },    // Stored as Date format
    installmentAmt: { type: Number, default: 0 }, // Stored as Number
    mandateId: { type: String, default: "" },
    folioNo: { type: String, default: "" },
    remarks: { type: String, default: "" },
    numOfInstallments: { type: Number, default: 0 }, // Stored as Number
    primaryHolderEmail: { type: String, default: "" },
    primaryHolderMobile: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("SipRegistration", SipRegistrationSchema);






