const express = require("express");
const multer = require("multer");
const { uploadRedemptionData, getRedemptions, updateRedemptionStatus } = require("../controllers/redemptionController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload Excel file
router.post("/upload-redemption", upload.single("file"), uploadRedemptionData);

// Fetch all redemptions
router.get("/redemption", getRedemptions);

// Update order status
router.put("/:id", updateRedemptionStatus);

module.exports = router;
