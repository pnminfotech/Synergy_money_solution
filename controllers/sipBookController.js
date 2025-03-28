const Book = require("../models/Book")
const xlsx = require("xlsx");
const NotOnBSE = require("../models/NotOnBSE");
const Sip = require("../models/SipModel");
/**
 * Parses a date value from Excel or string format.
 * Handles Excel serial numbers, YYYY/MM/DD, MM/DD/YYYY formats, and standalone years.
 */
const moment = require("moment-timezone");

const parseDate = (dateValue) => {
    if (!dateValue) return null;
    let parsedDate;

    if (typeof dateValue === "number") {
        if (dateValue > 1900 && dateValue < 3000) {
            parsedDate = moment.tz(`${dateValue}-01-01`, "Asia/Kolkata");
        } else {
            parsedDate = moment.tz("1899-12-30", "UTC").add(dateValue, "days");
        }
    } else if (typeof dateValue === "string") {
        if (/^\d{4}$/.test(dateValue)) {
            parsedDate = moment.tz(`${dateValue}-01-01`, "Asia/Kolkata");
        } else if (/^\d{2} [A-Za-z]{3} \d{4}$/.test(dateValue)) {
            parsedDate = moment.tz(dateValue, "DD MMM YYYY", "Asia/Kolkata");
        } else {
            parsedDate = moment.tz(dateValue, "Asia/Kolkata");
        }
    }

    return parsedDate.isValid() ? parsedDate.format("YYYY-MM-DD") : null; // Store as "YYYY-MM-DD" to prevent shifting
};


const uploadSIPData = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            console.log("❌ No file uploaded!");
            return res.status(400).json({ error: "No file uploaded" });
        }
        console.log("✅ File uploaded:", file.originalname);

     
        const workbook = xlsx.read(file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log("📊 Parsed Excel Data:", data);

        for (const row of data) {
            const { 
                "Client Code": clientCode, 
                "Primary Holder First Name": name, 
                "XSIP Regn No": xsipRegnNo, 
                "Scheme Name": schemeName, 
                "Start Date": startDate, 
                "End Date": endDate, 
                "Installments Amt": installmentAmt 
            } = row;

            console.log("📌 Raw Excel Dates - Start:", startDate, " | End:", endDate);

            const parsedStartDate = parseDate(startDate);
            const parsedEndDate = parseDate(endDate);

            if (!parsedStartDate || !parsedEndDate) {
                console.log("❌ Skipping row due to invalid date(s):", startDate, endDate);
                continue;
            }

            console.log("📅 Parsed Dates - Start:", parsedStartDate, " | End:", parsedEndDate);

            const sipDate = new Date(parsedStartDate).getDate(); 

            const updatedDoc = await Book.findOneAndUpdate(
                { date: sipDate },
                { 
                    $push: { 
                        clients: { clientCode, name, xsipRegnNo, schemeName, startDate: parsedStartDate, endDate: parsedEndDate, installmentAmt } 
                    }
                },
                { upsert: true, new: true }
            );

            console.log("✅ Updated MongoDB Document:", updatedDoc);
        }

        res.status(200).json({ message: "SIP Data uploaded successfully" });
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: "Error processing file" });
    }
};

const getSIPByDate = async (req, res) => {
    try {
        const { date } = req.params; 
        const sipData = await Book.findOne({ date: Number(date) });

        if (!sipData) return res.status(404).json({ error: "No SIP data found for this date" });

        res.status(200).json(sipData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching data" });
    }
};
// not on bse

const uploadNotOnBSEData = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            console.log("❌ No file uploaded!");
            return res.status(400).json({ error: "No file uploaded" });
        }
        console.log("✅ File uploaded:", file.originalname);

        // Read Excel file
        const workbook = xlsx.read(file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log("📊 Parsed Excel Data:", data);

        for (const row of data) {
            const { 
                "Client Code": clientCode, 
                "Primary Holder First Name": name, 
                "Scheme Name": schemeName, 
                "Start Date": startDate, 
                "End Date": endDate, 
                "Installments Amt": installmentAmt 
            } = row;

            console.log("📌 Raw Excel Dates - Start:", startDate, " | End:", endDate);

            const parsedStartDate = parseDate(startDate);
            const parsedEndDate = parseDate(endDate);

            console.log("📅 Parsed Dates - Start:", parsedStartDate, " | End:", parsedEndDate);

            const sipDate = new Date(parsedStartDate).getDate(); 

            // Check if client with same clientCode & schemeName exists
            const existingEntry = await NotOnBSE.findOne({
                date: sipDate,
                "clients.clientCode": clientCode,
                "clients.schemeName": schemeName
            });

            if (existingEntry) {
                console.log(`⚠️ Duplicate entry skipped: ${clientCode} - ${schemeName}`);
                continue;
            }

            // Insert only if not duplicate
            const updatedDoc = await NotOnBSE.findOneAndUpdate(
                { date: sipDate },
                { 
                    $push: { 
                        clients: { clientCode, name, schemeName, startDate: parsedStartDate, endDate: parsedEndDate, installmentAmt } 
                    }
                },
                { upsert: true, new: true }
            );

            console.log("✅ Updated MongoDB Document:", updatedDoc);
        }

        res.status(200).json({ message: "SIP Data uploaded successfully" });
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: "Error processing file" });
    }
};



const getNotOnBSEData = async (req, res) => {
    try {
        const allData = await NotOnBSE.find({});
        
        if (!allData || allData.length === 0) {
            return res.status(404).json({ message: "No SIP data found" });
        }

        res.status(200).json(allData);
    } catch (error) {
        console.error("❌ Error fetching data:", error);
        res.status(500).json({ error: "Error fetching SIP data" });
    }
};

const createNotOnBSEEntry = async (req, res) => {
    try {
        const { date, clientCode, name, schemeName, startDate, endDate, installmentAmt } = req.body;

        if (!clientCode || !schemeName) {
            return res.status(400).json({ error: "Client Code and Scheme Name are required" });
        }

        const sipDate = new Date(startDate).getDate();

        const updatedDoc = await NotOnBSE.findOneAndUpdate(
            { date: sipDate },
            { 
                $push: { 
                    clients: { clientCode, name, schemeName, startDate, endDate, installmentAmt } 
                }
            },
            { upsert: true, new: true }
        );

        res.status(201).json({ message: "SIP entry added successfully", data: updatedDoc });
    } catch (error) {
        console.error("❌ Error adding SIP entry:", error);
        res.status(500).json({ error: "Error adding SIP entry" });
    }
};

const updateNotOnBSEEntry = async (req, res) => {
    try {
        const { id } = req.params; // Extract ID from params
        const { date, startDate, endDate, ...restData } = req.body;

        const updateData = {
            ...restData,
            date: date ? new Date(date) : undefined,  // Convert only if present
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined
        };

        const updatedEntry = await NotOnBSE.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true } // Ensure validation runs
        );

        if (!updatedEntry) {
            return res.status(404).json({ error: "Entry not found" });
        }

        res.status(200).json(updatedEntry);
    } catch (error) {
        console.error("❌ Error updating SIP entry:", error);
        res.status(500).json({ error: "Error updating SIP entry" });
    }
};


const deleteNotOnBSEEntry = async (req, res) => {
    try {
        const { date, clientCode, schemeName } = req.body;

        if (!clientCode || !schemeName) {
            return res.status(400).json({ error: "Client Code and Scheme Name are required" });
        }

        const updatedDoc = await NotOnBSE.findOneAndUpdate(
            { date },
            { 
                $pull: { clients: { clientCode, schemeName } }
            },
            { new: true }
        );

        if (!updatedDoc) {
            return res.status(404).json({ error: "SIP entry not found" });
        }

        res.status(200).json({ message: "SIP entry deleted successfully", data: updatedDoc });
    } catch (error) {
        console.error("❌ Error deleting SIP entry:", error);
        res.status(500).json({ error: "Error deleting SIP entry" });
    }
};



/**
 * Mark SIP deductions as "Yes" or "No" based on uploaded data
 */
const updateSIPDeductions = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const workbook = xlsx.read(file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const currentMonth = new Date().toLocaleString('en-US', { month: 'short' }); // E.g., "Mar"
        
        for (const row of data) {
            const sipRegnNo = row["SIP Regn No"];
            const orderStatus = row["Order Status"];
            const orderRemark = row["Order Remark"] || ""; // Extract Order Remark

            if (!sipRegnNo || sipRegnNo === 0 || !orderStatus) {
                console.log("⚠️ Skipping row due to missing or invalid fields:", row);
                continue;
            }

            let statusUpdate = {};
            if (orderStatus.toLowerCase() === "valid") {
                statusUpdate[`clients.$.deductionStatus.${currentMonth}`] = "Yes";
            } else {
                statusUpdate[`clients.$.deductionStatus.${currentMonth}`] = `No - ${orderRemark}`.trim();
            }

            await Book.updateMany(
                { "clients.xsipRegnNo": sipRegnNo.toString() },
                { $set: statusUpdate }
            );

            console.log(`✅ Updated deduction status for XSIP Regn No: ${sipRegnNo} in ${currentMonth} to ${statusUpdate[`clients.$.deductionStatus.${currentMonth}`]}`);
        }

        res.status(200).json({ message: "SIP deductions updated successfully" });
    } catch (error) {
        console.error("❌ Error updating SIP deductions:", error);
        res.status(500).json({ error: "Error processing file" });
    }
};





/**
 * Fetch all SIP clients on a given date
 */
const getClientsByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const sipData = await Book.findOne({ date: Number(date) });

        if (!sipData) {
            return res.status(404).json({ error: "No clients found for this date" });
        }

        res.status(200).json({ clients: sipData.clients });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching data" });
    }
};

/**
 * Get all SIPs for a given year
 */
const getSIPsByYear = async (req, res) => {
    try {
        const { year } = req.params;
        const startOfYear = `${year}-01-01`;
        const endOfYear = `${year}-12-31`;

        const sipData = await Book.find({
            "clients.startDate": { $gte: startOfYear, $lte: endOfYear }
        });

        if (!sipData.length) {
            return res.status(404).json({ error: `No SIP data found for the year ${year}` });
        }

        res.status(200).json(sipData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching data" });
    }
};



module.exports = { uploadSIPData, getSIPByDate, updateSIPDeductions, 
    getClientsByDate, 
    getSIPsByYear,  uploadNotOnBSEData ,getNotOnBSEData,createNotOnBSEEntry , deleteNotOnBSEEntry,updateNotOnBSEEntry};
