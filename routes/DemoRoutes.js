const express = require("express");
const multer = require("multer");
const Demo = require("../models/Demo")
const { uploadSIPData, getSIPByDate,  updateSIPDeductions, 
    getClientsByDate, 
    getSIPsByYear , addSIPClient,
    updateSIPClient,
    deleteSIPClient } = require("../controllers/DemoController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload-sips", upload.single("file"), uploadSIPData);



router.get("/sipDate/:date", getSIPByDate);


// Update SIP deductions (Yes/No) from uploaded Excel file
router.post("/update-deductions", upload.single("file"), updateSIPDeductions);

router.get("/sipDate/:date", getClientsByDate);

// Get all SIPs for a specific year
router.get("/sips/:year", getSIPsByYear);




// router.post("/update-deductions", upload.single("file"), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ message: "No file uploaded" });
//         }

//         const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
//         const sheetName = workbook.SheetNames[0];
//         const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//         const today = new Date();
//         const year = today.getFullYear().toString();  // "2024"
//         const month = today.toLocaleString("default", { month: "short" }); 

//         for (const row of data) {
//             const sipRegnNo = row["Sip Regn No."];
//             const orderStatus = row["Order Status"] === "Valid" ? "Yes" : "No";

//             if (!sipRegnNo) continue;

//             await Demo.updateOne(
//                 { "clients.xsipRegnNo": sipRegnNo },
//                 { $set: { [`clients.$.deductionStatus.${year}.${month}`]: orderStatus } }
//             );
//         }

//         res.status(200).json({ message: "SIP deductions updated successfully" });
//     } catch (error) {
//         console.error("Error updating SIP deductions:", error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// });














// Add SIP client
router.post("/add-sip-client/:date", addSIPClient);

// Update SIP client
router.put("/update-sip-client/:xsipRegnNo", updateSIPClient);

// Delete SIP client
router.delete("/delete-sip-client/:xsipRegnNo", deleteSIPClient);

module.exports = router;
