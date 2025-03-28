const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const Sip = require("../models/sipModel"); // Your Mongoose Model



const { processOrderFile } = require("../controllers/sipBookController");


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Upload SIP Data Route
router.post("/upload-sips", upload.single("file"), async (req, res) => {
    try {
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        for (const row of rows) {
            const sipRegnNo = row["XSIP Regn No"];
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth(); // 0-indexed (Jan = 0)
            const currentDay = currentDate.getDate();

            if (!sipRegnNo) continue;

            let sipToUpdate = await Sip.findOne({ xsipRegnNo: sipRegnNo });

            if (sipToUpdate) {
                console.log(`✅ Matched SIP: ${sipRegnNo}`);

                if (!sipToUpdate.monthData) sipToUpdate.monthData = {};
                if (!sipToUpdate.monthData[currentMonth]) sipToUpdate.monthData[currentMonth] = {};

                sipToUpdate.monthData[currentMonth][currentDay] = "Yes"; // ✅ Mark as Yes

                await sipToUpdate.save();
            }
        }

        res.json({ success: true, message: "SIP Data Uploaded Successfully" });
    } catch (error) {
        console.error("Error uploading SIP data:", error);
        res.status(500).json({ success: false, message: "Error processing SIP data" });
    }
});

// ✅ Upload Order Status Route












// Upload order status file and update database
router.post("/upload-order-status", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const validOrders = await processOrderFile(req.file.buffer.toString("utf-8")); // Convert file to text
        res.json({ success: true, message: "File processed successfully", validOrders });
    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});



router.get("/valid-orders", async (req, res) => {
    try {
        const { date, year } = req.query;

        if (!date || !year) {
            return res.status(400).json({ success: false, message: "Date and year are required" });
        }

        const sipRecords = await Sip.find({});

        // Process data to return month-wise "Yes" values
        const processedData = sipRecords.map((sip) => {
            let monthData = Array(12).fill({});

            sip.validOrders.forEach((order) => {
                const orderDate = new Date(order.date);
                const orderYear = orderDate.getFullYear();
                const orderMonth = orderDate.getMonth(); // 0-based index

                if (orderYear == year && orderDate.getDate() == date) {
                    monthData[orderMonth] = { [date]: "Yes" };
                }
            });

            return {
                ...sip.toObject(),
                monthData
            };
        });

        res.json({ success: true, clients: processedData });
    } catch (error) {
        console.error("Error fetching valid SIP orders:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


module.exports = router;
