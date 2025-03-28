const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Set upload directory
const uploadDir = path.join(__dirname, "../uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Multer Upload Middleware
const upload = multer({ storage });

module.exports = upload;
