const mongoose = require("mongoose");

const sipBookSchema = new mongoose.Schema({
    date: Number, 
   
    clients: [
        {
            clientCode: String,  
            name: String,  
            xsipRegnNo: String, 
            schemeName: String,
            startDate: Date,  
            endDate: Date,  
            installmentAmt: Number, 
            
           
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
