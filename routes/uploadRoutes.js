const express = require("express");
const upload = require("../config/multer");
const router = express.Router();

router.post("/upload", upload.single("file"), (req, res) => {
    res.json({ message: "File uploaded successfully!", filename: req.file.filename });
});

module.exports = router;
