const mongoose = require("mongoose");

const DemoSchema = new mongoose.Schema({
    date: Number, // The day of the month (1-31)
    year: Number, // The SIP year
    clients: [
        {
            clientCode: String,  // Unique client identifier
            name: String,  // Primary Holder First Name
            xsipRegnNo: String, // SIP Registration Number
            schemeName: String, // Scheme Name
            startDate: Date,  // Start Date of SIP
            endDate: Date,  // End Date of SIP
            installmentAmt: Number, // SIP Installment Amount
            
            // ✅ Year-wise Monthly Deduction Tracking
            deductionStatus: {
                type: Map,
                of: {
                    Jan: { type: String, default: "⏳" },
                    Feb: { type: String, default: "⏳" },
                    Mar: { type: String, default: "⏳" },
                    Apr: { type: String, default: "⏳" },
                    May: { type: String, default: "⏳" },
                    Jun: { type: String, default: "⏳" },
                    Jul: { type: String, default: "⏳" },
                    Aug: { type: String, default: "⏳" },
                    Sep: { type: String, default: "⏳" },
                    Oct: { type: String, default: "⏳" },
                    Nov: { type: String, default: "⏳" },
                    Dec: { type: String, default: "⏳" }
                }
            }
        }
    ]
});

module.exports = mongoose.model("Demo", DemoSchema);
