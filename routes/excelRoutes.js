const express = require("express");
const router = express.Router();
const excelController = require("../controllers/excelController");



// ✅ Get All Records
router.get("/getallclients", excelController.getAllExcelData);

// ✅ Get Single Record by ID
router.get("/getsingle/:id", excelController.getExcelDataById);

// ✅ Create New Record (if required)
router.post("/createclient", excelController.createExcelData);

// ✅ Update Record by ID
router.put("/update/:id", excelController.updateExcelData);

// ✅ Delete Record by ID
router.delete("/delete/:id", excelController.deleteExcelData);

module.exports = router;
