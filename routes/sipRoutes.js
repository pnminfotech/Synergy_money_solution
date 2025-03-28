const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const SipRegistration = require("../models/SipRegistration");



const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Function to format date correctly
const formatDate = (dateValue) => {
    if (!dateValue) return ""; // Return empty if no date is present
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0]; // Convert to YYYY-MM-DD format
};

router.post("/upload-excel", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Read Excel file
        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log("📊 Extracted Data from Excel:", sheetData); // Debugging extracted data

        if (!sheetData.length) {
            return res.status(400).json({ message: "No valid data found in the Excel file" });
        }

        // Clean & format data dynamically
        const formattedData = sheetData.map(row => ({
            status: row["Status"] || "",
            clientCode: row["Client Code"] || "",
            clientName: row["Client Name"] || "",
            xsipRegnNo: row["XSIP Regn No"] || "",
            regnDate: formatDate(row["Regn Date"]),
            amcName: row["AMC NAME"] || "",
            schemeName: row["Scheme Name"] || "",
            startDate: formatDate(row["Start Date"]),
            endDate: formatDate(row["End Date"]),
            installmentAmt: parseFloat(row["Installments Amt"]) || 0,
            mandateId: row["Mandate ID"] || "",
            folioNo: row["Folio No"] || "",
            remarks: row["Remarks"] || "",
            numOfInstallments: parseInt(row["No. Of Installments"]) || 0,
            primaryHolderEmail: row["Primary Holder Email"] || "",
            primaryHolderMobile: row["Primary Holder Mobile"] || ""
        })).filter(row => row.clientCode && row.clientName); // Remove invalid rows

        if (!formattedData.length) {
            console.log("⚠ No valid rows found! Raw data:", sheetData);
            return res.status(400).json({ 
                message: "No valid rows to insert. Check your Excel file format.",
                rawExtractedData: sheetData 
            });
        }

        console.log("✅ Final Data Before Insertion:", formattedData);

        // Insert data into MongoDB
        const insertedRecords = await SipRegistration.insertMany(formattedData);
        return res.status(200).json({ 
            message: "Excel data uploaded successfully",
            insertedCount: insertedRecords.length 
        });

    } catch (error) {
        console.error("❌ Error uploading Excel file:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});



// ✅ API to Fetch Excel Data
router.get("/data", async (req, res) => {
    try {
        const data = await SipRegistration.find();
        res.json(data);
    } catch (error) {
        console.error("❌ Fetch Error:", error);
        res.status(500).json({ message: "Failed to fetch Excel data", error: error.message });
    }
});






///////////////////////////////////////////////////////////////////////////////////////////////////////////////




/////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = router;
