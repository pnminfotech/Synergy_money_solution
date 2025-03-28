const XLSX = require("xlsx");
const SIP = require("../models/SipRegistration");

// ✅ Upload and Process Excel File
exports.uploadSIPData = async (req, res) => {
    try {
        console.log("📂 Uploaded File Info:", req.file);

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        if (!req.file.mimetype.includes("spreadsheet")) {
            return res.status(400).json({ message: "Invalid file format. Please upload an Excel file." });
        }

        if (!req.file.buffer || req.file.buffer.length === 0) {
            return res.status(400).json({ message: "Uploaded file is empty." });
        }

        // ✅ Read Excel File from Buffer
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });

        if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
            return res.status(400).json({ message: "Invalid Excel file: No sheets found." });
        }

        console.log("📜 Sheet Names:", workbook.SheetNames); // Debug log for sheet names

        const sheetName = workbook.SheetNames[0];
        console.log("🔍 Processing Sheet:", sheetName);

        const sheet = workbook.Sheets[sheetName];

        if (!sheet) {
            return res.status(400).json({ message: "Invalid Excel file: First sheet is empty or unreadable." });
        }

        // ✅ Convert Sheet to JSON with defval to avoid missing values
        let sheetData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        console.log("📊 Raw Extracted Data Preview:", sheetData.slice(0, 5)); // Preview first 5 rows

        if (!sheetData || sheetData.length === 0) {
            return res.status(400).json({ message: "Excel sheet contains no data." });
        }

        // ✅ Map Data to Database Schema
        const formattedData = sheetData
            .map(row => ({
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
            }))
            .filter(row => row.clientCode && row.clientName);

        if (formattedData.length === 0) {
            return res.status(400).json({ message: "No valid data found in the uploaded file." });
        }

        console.log(`✅ Saving ${formattedData.length} records to the database...`);
        const result = await SIP.insertMany(formattedData);
        console.log("✅ SIP Data Saved Successfully:", result.length, "records");

        res.status(200).json({ message: "SIP Excel file processed successfully", data: result });

    } catch (error) {
        console.error("❌ Error Processing SIP Excel File:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// ✅ Helper Function to Format Dates
const formatDate = (date) => {
    if (!date) return "";
    try {
        return new Date(date).toISOString().split("T")[0]; // Convert to YYYY-MM-DD format
    } catch (error) {
        console.error("⚠️ Invalid Date:", date);
        return "";
    }
};
