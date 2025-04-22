const SipRegistration = require("../models/SipRegistration");
const xlsx = require("xlsx");

// Function to format date correctly
const formatDate = (dateValue) => {
    if (!dateValue) return ""; // Return empty if no date is present
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0]; // Convert to YYYY-MM-DD format
};

// Handle Excel file upload and data insertion
// Handle Excel file upload and data insertion with duplication check
const uploadExcelData = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (!sheetData.length) {
            return res.status(400).json({ message: "No valid data found in the Excel file" });
        }

        // Format data
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
        })).filter(row => row.clientCode && row.clientName && row.xsipRegnNo); // Filter valid rows

        if (!formattedData.length) {
            return res.status(400).json({ message: "No valid rows to insert." });
        }

        // Get existing XSIP Regn Nos from DB
        const xsipRegnNos = formattedData.map(d => d.xsipRegnNo);
        const existingRecords = await SipRegistration.find({ xsipRegnNo: { $in: xsipRegnNos } }).select('xsipRegnNo');

        const existingXsips = new Set(existingRecords.map(r => r.xsipRegnNo));

        // Filter out duplicates
        const newRecords = formattedData.filter(record => !existingXsips.has(record.xsipRegnNo));

        if (!newRecords.length) {
            return res.status(200).json({
                message: "All records in the uploaded Excel already exist. No new records inserted.",
                duplicates: xsipRegnNos.length
            });
        }

        // Insert only non-duplicates
        const inserted = await SipRegistration.insertMany(newRecords);
        return res.status(200).json({
            message: "Excel data uploaded successfully",
            insertedCount: inserted.length,
            skippedDuplicates: formattedData.length - inserted.length
        });

    } catch (error) {
        console.error("❌ Error uploading Excel file:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


// Fetch all data (Read)
const getAllData = async (req, res) => {
    try {
        const data = await SipRegistration.find();
        res.json(data);
    } catch (error) {
        console.error("❌ Fetch Error:", error);
        res.status(500).json({ message: "Failed to fetch data", error: error.message });
    }
};

// Update record (Update)
const updateRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        // Validate that required fields are provided (optional)
        if (!updatedData.clientCode || !updatedData.clientName) {
            return res.status(400).json({ message: "Client code and client name are required" });
        }

        // Update the record
        const updatedRecord = await SipRegistration.findByIdAndUpdate(id, updatedData, { new: true });
        if (!updatedRecord) {
            return res.status(404).json({ message: "Record not found" });
        }

        return res.status(200).json({
            message: "Record updated successfully",
            updatedRecord
        });
    } catch (error) {
        console.error("❌ Update Error:", error);
        res.status(500).json({ message: "Failed to update record", error: error.message });
    }
};

// Delete record (Delete)
const deleteRecord = async (req, res) => {
    try {
        const { id } = req.params;

        // Delete the record
        const deletedRecord = await SipRegistration.findByIdAndDelete(id);
        if (!deletedRecord) {
            return res.status(404).json({ message: "Record not found" });
        }

        return res.status(200).json({
            message: "Record deleted successfully",
            deletedRecord
        });
    } catch (error) {
        console.error("❌ Delete Error:", error);
        res.status(500).json({ message: "Failed to delete record", error: error.message });
    }
};
// Create new record (Create)
const createRecord = async (req, res) => {
    try {
        const newRecord = req.body;

        // Validate that required fields are provided (optional)
        if (!newRecord.clientCode || !newRecord.clientName) {
            return res.status(400).json({ message: "Client code and client name are required" });
        }

        // Create a new SIP registration record
        const createdRecord = new SipRegistration(newRecord);

        // Save the record in the database
        await createdRecord.save();

        return res.status(201).json({
            message: "Record created successfully",
            createdRecord
        });
    } catch (error) {
        console.error("❌ Create Error:", error);
        res.status(500).json({ message: "Failed to create record", error: error.message });
    }
};


module.exports = {
    uploadExcelData,
    getAllData,
    updateRecord,
    deleteRecord, createRecord 
};
