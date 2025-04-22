const express = require("express");
const multer = require("multer");
const { 
    uploadExcelData, 
    getAllData, 
    updateRecord, 
    deleteRecord ,createRecord 
} = require("../controllers/sipController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Route to create a new SIP registration record
router.post("/sip-registration", createRecord);


// Route to handle Excel file upload and data insertion
router.post("/upload-excel", upload.single("file"), uploadExcelData);

// Route to fetch all data
router.get("/data", getAllData);

// Route to update a record
router.put("/data/:id", updateRecord);

// Route to delete a record
router.delete("/data/:id", deleteRecord);

module.exports = router;
