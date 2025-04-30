const ExcelDataFromSheet = require("../models/ExcelData");
const XLSX = require("xlsx");

// ✅ Upload Excel & Save to MongoDB
exports.uploadExcelData = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No Excel file uploaded" });
        }

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        let sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log("📊 Raw Extracted Data:", sheetData);

        sheetData = sheetData
            .map(row => {
                let cleanedRow = {};
                Object.keys(row).forEach(key => {
                    const trimmedKey = key.trim();
                    cleanedRow[trimmedKey] = row[key];
                });

                return {
                    userId: cleanedRow["User Id"] || "", 
                    name: cleanedRow["NAME"] || "",
                    mobile: cleanedRow["MOBILE"] || "",
                    pan: cleanedRow["PAN"] || "",
                    taxStatus: cleanedRow["TAX STATUS"] || "",
                    holdingMode: cleanedRow["HOLDING MODE"] || "",
                    email: cleanedRow["EMAIL"] || "",
                    createdOn: cleanedRow["CREATED ON"] || "",
                    clientId: cleanedRow["CLIENT ID"] || "",
                    kyc: cleanedRow["KYC"] || "",
                    bank: cleanedRow["BANK"] || "",
                    aof: cleanedRow["AOF"] || "",
                    fatca: cleanedRow["FATCA"] || "",
                    mandate: cleanedRow["MANDATE"] || ""
                };
            })
            .filter(row => row.userId && row.name && row.mobile);

        if (sheetData.length === 0) {
            return res.status(400).json({ message: "No valid data found in Excel file" });
        }

        // Fetch existing entries from DB based on userId and mobile
        const existingEntries = await ExcelDataFromSheet.find({
            $or: sheetData.map(({ userId, mobile }) => ({ userId, mobile }))
        });

        // Create a set of existing userId-mobile combinations
        const existingSet = new Set(
            existingEntries.map(entry => `${entry.userId}-${entry.mobile}`)
        );

        // Filter out duplicates based on the existing set
        const newEntries = sheetData.filter(
            entry => !existingSet.has(`${entry.userId}-${entry.mobile}`)
        );

        if (newEntries.length === 0) {
            return res.status(200).json({ message: "All entries already exist. No new data added." });
        }

        // Save new entries
        const result = await ExcelDataFromSheet.insertMany(newEntries);
        console.log("✅ New Data Saved:", result.length, "entries");

        res.status(200).json({
            message: `${result.length} new records added successfully`,
            data: result
        });

    } catch (error) {
        console.error("❌ Error Processing Excel File:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


// ✅ Get All Records
exports.getAllExcelData = async (req, res) => {
    try {
        const data = await ExcelDataFromSheet.find();
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("❌ Error Fetching Excel Data:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// ✅ Get Single Record by ID
exports.getExcelDataById = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await ExcelDataFromSheet.findById(id);

        if (!record) {
            return res.status(404).json({ success: false, message: "Record not found" });
        }

        res.status(200).json({ success: true, data: record });
    } catch (error) {
        console.error("❌ Error Fetching Record:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};


// ✅ Get All Records
exports.getAllExcelData = async (req, res) => {
    try {
        const data = await ExcelDataFromSheet.find();
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("❌ Error Fetching Excel Data:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// ✅ Get Single Record by ID
exports.getExcelDataById = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await ExcelDataFromSheet.findById(id);

        if (!record) {
            return res.status(404).json({ success: false, message: "Record not found" });
        }

        res.status(200).json({ success: true, data: record });
    } catch (error) {
        console.error("❌ Error Fetching Record:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// ✅ Create New Record (if needed manually)
exports.createExcelData = async (req, res) => {
    try {
        const newData = new ExcelDataFromSheet(req.body);
        const savedData = await newData.save();
        res.status(201).json({ success: true, data: savedData });
    } catch (error) {
        console.error("❌ Error Creating Record:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// ✅ Update Record by ID
exports.updateExcelData = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = await ExcelDataFromSheet.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedData) {
            return res.status(404).json({ success: false, message: "Record not found" });
        }

        res.status(200).json({ success: true, data: updatedData });
    } catch (error) {
        console.error("❌ Error Updating Record:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// ✅ Delete Record by ID
exports.deleteExcelData = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedData = await ExcelDataFromSheet.findByIdAndDelete(id);

        if (!deletedData) {
            return res.status(404).json({ success: false, message: "Record not found" });
        }

        res.status(200).json({ success: true, message: "Record deleted successfully" });
    } catch (error) {
        console.error("❌ Error Deleting Record:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
