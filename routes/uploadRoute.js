const express = require('express');
const router = express.Router();
const multer = require('../middleware/upload');
const XLSX = require('xlsx');
const UserData = require('../models/UserData');
const fs = require('fs');

// Upload & Process Excel File
router.post('/upload', multer.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Read uploaded Excel file
        const filePath = req.file.path;
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Read first sheet
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Transform data to match MongoDB schema
        const formattedData = data.map(row => ({
            userId: row['User Id'],
            name: row['NAME'],
            mobile: row['MOBILE'],
            pan: row['PAN'],
            taxStatus: row['TAX STATUS'],
            holdingMode: row['HOLDING MODE'],
            email: row['EMAIL'],
            createdOn: new Date(row['CREATED ON']),
            clientId: row['CLIENT ID'],
            kyc: row['KYC'],
            bank: row['BANK'],
            aof: row['AOF'],
            fatca: row['FATCA'],
            mandate: row['MANDATE']
        }));

        // Insert into MongoDB
        await UserData.insertMany(formattedData);

        // Delete the file after processing
        fs.unlinkSync(filePath);

        res.json({ message: 'File processed successfully', recordsInserted: formattedData.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
