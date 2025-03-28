const mongoose = require("mongoose");

const sipBookSchema = new mongoose.Schema({
    date: Number, // The day of the month (1-31)
   // The SIP year
    clients: [
        {
            clientCode: String,  // Unique client identifier
            name: String,  // Primary Holder First Name
            xsipRegnNo: String, // SIP Registration Number
            schemeName: String, // Scheme Name
            startDate: Date,  // Start Date of SIP
            endDate: Date,  // End Date of SIP
            installmentAmt: Number, // SIP Installment Amount
            
            // ✅ Monthly Deduction Tracking for the given year
            deductionStatus: {
                Jan: { type: String, default: "Pending" },
                Feb: { type: String, default: "Pending" },
                Mar: { type: String, default: "Pending" },
                Apr: { type: String, default: "Pending" },
                May: { type: String, default: "Pending" },
                Jun: { type: String, default: "Pending" },
                Jul: { type: String, default: "Pending" },
                Aug: { type: String, default: "Pending" },
                Sep: { type: String, default: "Pending" },
                Oct: { type: String, default: "Pending" },
                Nov: { type: String, default: "Pending" },
                Dec: { type: String, default: "Pending" }
            }
        }
    ]
});

module.exports = mongoose.model("SIPBook", sipBookSchema);
