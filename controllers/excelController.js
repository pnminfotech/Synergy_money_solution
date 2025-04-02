const ExcelDataFromSheet = require("../models/ExcelData");




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
