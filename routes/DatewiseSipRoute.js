// const express = require("express");
// const { uploadSipRecords, getSipRecordsByDate } = require("../controllers/DatewiseSipController");

// const router = express.Router();

// router.post("/upload", uploadSipRecords);
// router.get("/:date", getSipRecordsByDate);

// module.exports = router;



const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const DatewiseSipRecord = require("../models/DatewiseSip");

const router = express.Router();

// Configure multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 📌 Upload Excel File & Store Data in MongoDB
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Parse Excel file
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Convert sipDates from string to array of numbers
    const formattedData = sheetData.map((row) => ({
      date: row["Date"],
      orderNo: row["Order No"],
      settNo: row["Sett No"],
      clientCode: row["Client Code"],
      clientName: row["Client Name"],
      schemeCode: row["Scheme Code"],
      schemeName: row["Scheme Name"],
      isin: row["ISIN"],
      buySell: row["Buy/Sell"],
      amount: row["Amount"],
      dpFolioNo: row["DP/Folio No"],
      folioNo: row["Folio No"],
      orderStatus: row["Order Status"],
      orderRemark: row["Order Remark"],
      orderType: row["Order Type"],
      sipRegnNo: row["SIP Regn No"],
      sipRegnDate: row["SIP Regn Date"],
      subOrderType: row["Sub Order Type"],
      firstOrder: row["First Order"],
      purchaseRedeem: row["Purchase/Redeem"],
      memberRemarks: row["Member Remarks"],
      sipDates: row["SIP Dates"] ? row["SIP Dates"].split(",").map(Number) : [],
    }));

    // Save to MongoDB
    await DatewiseSipRecord.insertMany(formattedData);

    res.json({ message: "SIP records uploaded successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error processing file" });
  }
});

// 📌 Fetch SIPs by Date
router.get("/sipDate", async (req, res) => {
    try {
      console.log("Fetching SIP records...");
      
      const datewiseSips = await DatewiseSipRecord.find(); // Fetch all records
  
      console.log("SIP Records Found:", datewiseSips.length);
  
      if (!datewiseSips || datewiseSips.length === 0) {
        return res.status(404).json({ error: "No SIP records found" });
      }
  
      res.json(datewiseSips);
    } catch (error) {
      console.error("Error fetching SIP records:", error);
      res.status(500).json({ error: "Error fetching data", details: error.message });
    }
  });
  

module.exports = router;
