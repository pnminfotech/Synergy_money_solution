const Tesseract = require("tesseract.js");

// 🔍 Extract specific text from an uploaded image
exports.extractTextFromImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        console.log("📂 Uploaded Image:", req.file.originalname);

        // Convert image buffer to Base64 for OCR processing
        const imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

        // Perform OCR using Tesseract.js
        const { data } = await Tesseract.recognize(imageBase64, "eng");

        console.log("📜 Extracted Text:", data.text);

        // 🔍 Filter out only required fields
        const keywords = ["Client Code", "Regn Date"];
        const filteredText = data.text
            .split("\n")
            .filter((line) => keywords.some((key) => line.includes(key)))
            .join("\n");

        res.status(200).json({ extractedText: filteredText || "No relevant data found." });
    } catch (error) {
        console.error("❌ Error processing image:", error);
        res.status(500).json({ message: "Failed to process image", error: error.message });
    }
};
