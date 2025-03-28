const express = require("express");
const multer = require("multer");
const { extractTextFromImage } = require("../controllers/ocrController");

const router = express.Router();

// 📂 Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 🖼️ Image upload and text extraction route
router.post("/extract-text", upload.single("image"), extractTextFromImage);

module.exports = router;
