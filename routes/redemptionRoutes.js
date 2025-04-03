const express = require("express");
const multer = require("multer");
const { uploadRedemptionData, getRedemptions, updateRedemptionStatus, updateRedemption , deleteRedemption } = require("../controllers/redemptionController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload Excel file
router.post("/upload-redemption", upload.single("file"), uploadRedemptionData);

// Fetch all redemptions
router.get("/redemption", getRedemptions);

// Update order status
// router.put("/:id", updateRedemptionStatus);

// Update redemption entry by ID
router.put("/redemption/:id", updateRedemption);

// Delete redemption entry by ID
router.delete("/delete/:id", deleteRedemption);

module.exports = router;
