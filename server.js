const express = require("express");
const multer = require("multer");
const cors = require("cors");
const mongoose = require("mongoose");
const XLSX = require("xlsx");
const Tesseract = require("tesseract.js");
require("dotenv").config();
const sipRoutes = require("./routes/sipRoutes");
const ocrRoutes = require("./routes/ocrRoutes");
const path = require("path");
const fs = require("fs");
const DatewiseSipRoutes = require("./routes/DatewiseSipRoute");
const SipBookRoutes = require("./routes/SipBookRoutes")
const errorHandler = require("./middleware/errorHandler");
const SipBRoutes = require("./routes/SipBRoutes")
const redemptionRoutes = require("./routes/redemptionRoutes")
const NotOnBSERoutes = require("./routes/NotOnBSERoutes")


const app = express();
app.use(cors());
app.use(express.json());

const upload = require("./config/multerConfig");



// ✅ Use SIP Routes
app.use("/api/sip", sipRoutes);

app.use("/api/ocr", ocrRoutes); 

app.use("/api/sip", DatewiseSipRoutes);


app.use("/api/sip", SipBookRoutes);
app.use(errorHandler);
app.use("/api/sips", SipBRoutes);
app.use("/api/books", SipBookRoutes);

app.use("/api/redemption", redemptionRoutes);
app.use("/api/notonbse",NotOnBSERoutes);

// ✅ Multer Configuration for File Uploads
const storage = multer.memoryStorage();
// const upload = multer({ storage: storage }).array("documents", 10);

const excelUpload = multer({ storage: storage }).single("excelFile");

// ✅ Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Atlas Connected"))
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });





    mongoose.set("debug", true);










    




// ✅ API to extract text from uploaded image
app.post("/upload-image", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const imagePath = path.join(__dirname, "uploads", req.file.filename);

        // Extract text using OCR
        const { data: { text } } = await Tesseract.recognize(imagePath, "eng");

        console.log("Extracted Text:", text);

        // Delete image after processing (optional for security)
        fs.unlinkSync(imagePath);

        return res.status(200).json({
            message: "Text extracted successfully",
            extractedText: text
        });

    } catch (error) {
        console.error("Error extracting text:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});









// ✅ Define Schema for Excel Data
const ExcelDataFromSheetSchema = new mongoose.Schema({
    userId: { type: String, required: true },  // Convert "User Id" -> "userId"
    name: { type: String, required: true },   // Convert "NAME" -> "name"
    mobile: { type: String, required: true }, // Convert "MOBILE" -> "mobile"
    pan: { type: String },                    // Convert "PAN" -> "pan"
    taxStatus: { type: String },              // Convert "TAX STATUS" -> "taxStatus"
    holdingMode: { type: String },            // Convert "HOLDING MODE" -> "holdingMode"
    email: { type: String },                  // Convert "EMAIL" -> "email"
    createdOn: { type: String },              // Convert "CREATED ON" -> "createdOn"
    clientId: { type: String },               // Convert "CLIENT ID" -> "clientId"
    kyc: { type: String },                    // Convert "KYC" -> "kyc"
    bank: { type: String },                   // Convert "BANK" -> "bank"
    aof: { type: String },                    // Convert "AOF" -> "aof"
    fatca: { type: String },                  // Convert "FATCA" -> "fatca"
    mandate: { type: String }                 // Convert "MANDATE" -> "mandate"
});


const ExcelDataFromSheet = mongoose.model("ExcelDataFromSheet", ExcelDataFromSheetSchema);

// ✅ API to Upload and Read Excel File
app.post("/api/excel/upload", excelUpload, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No Excel file uploaded" });
        }

        // Read Excel file
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        let sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log("📊 Raw Extracted Data:", sheetData); // Debugging

        // ✅ Convert Excel Headers to Match Schema
       // ✅ Convert Excel Headers to Match Schema
sheetData = sheetData
.map(row => {
    let cleanedRow = {};
    Object.keys(row).forEach(key => {
        const trimmedKey = key.trim(); // Trim spaces from headers
        cleanedRow[trimmedKey] = row[key];
    });

    return {
        userId: cleanedRow["User Id"] || "", 
        name: cleanedRow["NAME"] || "",
        mobile: cleanedRow["MOBILE"] || "",
        pan: cleanedRow["PAN"] || "",
        taxStatus: cleanedRow["TAX STATUS"] || "",
        holdingMode: cleanedRow["HOLDING MODE"] || "",
        email: cleanedRow["EMAIL"] || "",
        createdOn: cleanedRow["CREATED ON"] || "",
        clientId: cleanedRow["CLIENT ID"] || "",
        kyc: cleanedRow["KYC"] || "",
        bank: cleanedRow["BANK"] || "",
        aof: cleanedRow["AOF"] || "",
        fatca: cleanedRow["FATCA"] || "",
        mandate: cleanedRow["MANDATE"] || ""
    };
})
.filter(row => row.userId && row.name && row.mobile); // ✅ Remove invalid rows

console.log("✅ Transformed Data for MongoDB:", sheetData);


const missingRows = sheetData.filter(row => !row.userId || !row.name || !row.mobile);
if (missingRows.length > 0) {
    return res.status(400).json({
        message: "Some required fields are missing in the Excel file",
        missingRows
    });
}
console.log("📊 Final Data Before Insertion:", sheetData);

        // ✅ Save to MongoDB
        const result = await ExcelDataFromSheet.insertMany(sheetData);
        console.log("✅ Data Saved Successfully:", result);

        res.status(200).json({ message: "Excel file processed successfully", data: result });
    } catch (error) {
        console.error("❌ Error Processing Excel File:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});






// ✅ API to Fetch Excel Data
app.get("/api/excel/data", async (req, res) => {
    try {
        const data = await ExcelDataFromSheet.find();
        res.json(data);
    } catch (error) {
        console.error("❌ Fetch Error:", error);
        res.status(500).json({ message: "Failed to fetch Excel data", error: error.message });
    }
});

// ✅ MongoDB Schema & Model for Clients
const ClientSchema = new mongoose.Schema({
    clientId: { type: String, required: true, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
    clientName: { type: String, required: true },
    documents: [
        {
            filename: String,
            extractedText: String,
            uploadedAt: { type: Date, default: Date.now }
        }
    ]
});
const Client = mongoose.model("Client", ClientSchema);

// ✅ Upload Documents with OCR
// app.post("/api/clients/upload", upload, async (req, res) => {
//     try {
//         if (!req.files || req.files.length === 0) return res.status(400).json({ message: "No files uploaded" });
//         if (!req.body.clientName) return res.status(400).json({ message: "clientName is required" });

//         const clientId = new mongoose.Types.ObjectId().toString();
//         const processedDocuments = await Promise.all(req.files.map(async (file) => {
//             const extractedText = await Tesseract.recognize(file.buffer, 'eng')
//                 .then(({ data: { text } }) => text)
//                 .catch(err => (console.error("OCR Error:", err), "OCR Failed"));
//             return { filename: file.originalname, extractedText };
//         }));

//         const client = new Client({ clientId, clientName: req.body.clientName, documents: processedDocuments });
//         await client.save();
//         res.json({ message: "Files uploaded and processed successfully", client });
//     } catch (error) {
//         console.error("❌ Upload Error:", error);
//         res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
// });

// ✅ Delete Specific Document
app.delete("/api/clients/:clientId/documents/:documentId", async (req, res) => {
    try {
        const { clientId, documentId } = req.params;
        const updatedClient = await Client.findOneAndUpdate(
            { clientId },
            { $pull: { documents: { _id: documentId } } },
            { new: true }
        );
        if (!updatedClient) return res.status(404).json({ message: "Client not found" });
        res.json({ message: "Document deleted successfully", client: updatedClient });
    } catch (error) {
        console.error("❌ Document Deletion Error:", error);
        res.status(500).json({ message: "Failed to delete document", error: error.message });
    }
});

// ✅ Get All Clients
app.get("/api/clients", async (req, res) => {
    try {
        const clients = await Client.find().sort({ clientName: 1 });
        res.json({ clients });
    } catch (error) {
        console.error("❌ Fetch Clients Error:", error);
        res.status(500).json({ message: "Failed to fetch clients", error: error.message });
    }
});

// ✅ Get Specific Client
app.get("/api/clients/:clientId", async (req, res) => {
    try {
        const client = await Client.findOne({ clientId: req.params.clientId });
        if (!client) return res.status(404).json({ message: "Client not found" });
        res.json({ client });
    } catch (error) {
        console.error("❌ Fetch Client Data Error:", error);
        res.status(500).json({ message: "Failed to fetch client data", error: error.message });
    }
});
///////////////////////////////////////////////////


































// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
