const Demo = require("../models/Demo")
const xlsx = require("xlsx");
const NotOnBSE = require("../models/NotOnBSE");

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
                "Client Code": clientCode = "",  // Default to empty string if missing
                "Primary Holder First Name": name = "",
                "XSIP Regn No": xsipRegnNo = "",
                "Scheme Name": schemeName = "",
                "Start Date": startDate = "",
                "End Date": endDate = "",
                "Installments Amt": installmentAmt = 0
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

            // ✅ Insert without checking xsipRegnNo uniqueness if it's blank
            const updateQuery = {
                date: sipDate,
                ...(xsipRegnNo ? { "clients.xsipRegnNo": xsipRegnNo } : {}) // Only check if it's not empty
            };

            const existingClient = xsipRegnNo ? await Demo.findOne(updateQuery) : null;

            if (existingClient) {
                console.log(`⏭️ Skipping ${xsipRegnNo}, already exists.`);
                continue;
            }

            // ✅ Push new data, keeping missing values as blank ("")
            const updatedDoc = await Demo.findOneAndUpdate(
                { date: sipDate }, // Find based on sipDate
                { 
                    $push: { 
                        clients: { 
                            clientCode, 
                            name, 
                            xsipRegnNo, 
                            schemeName, 
                            startDate: parsedStartDate, 
                            endDate: parsedEndDate, 
                            installmentAmt 
                        } 
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
        const sipData = await Demo.findOne({ date: Number(date) });

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

         
            const existingEntry = await NotOnBSE.findOne({
                date: sipDate,
                "clients.clientCode": clientCode,
                "clients.schemeName": schemeName
            });

            if (existingEntry) {
                console.log(`⚠️ Duplicate entry skipped: ${clientCode} - ${schemeName}`);
                continue;
            }

          
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
        const { id } = req.params; 
        const { date, startDate, endDate, ...restData } = req.body;

        const updateData = {
            ...restData,
            date: date ? new Date(date) : undefined, 
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined
        };

        const updatedEntry = await NotOnBSE.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true } 
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

        const currentYear = new Date().getFullYear(); // Get the current year (e.g., 2025)
        const currentMonth = new Date().toLocaleString('en-US', { month: 'short' }); // Get month (e.g., Apr)

        for (const row of data) {
            const sipRegnNo = row["SIP Regn No"];
            const orderStatus = row["Order Status"];
            const orderRemark = row["Order Remark"] || "";

            if (!sipRegnNo || sipRegnNo === 0 || !orderStatus) {
                console.log("⚠️ Skipping row due to missing or invalid fields:", row);
                continue;
            }

            let statusUpdate = orderStatus.toLowerCase() === "valid" ? "✅" : `❌ - ${orderRemark}`.trim();

            // Ensure the deduction status is updated inside the correct year
            const updateFields = {};
            updateFields[`clients.$.deductionStatus.${currentYear}.${currentMonth}`] = statusUpdate;

            await Demo.updateOne(
                { "clients.xsipRegnNo": sipRegnNo },
                { $set: updateFields }
            );

            console.log(`✅ Updated deduction status for XSIP Regn No: ${sipRegnNo} in ${currentYear} ${currentMonth} to ${statusUpdate}`);
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
        const sipData = await Demo.findOne({ date: Number(date) });

        if (!sipData) {
            return res.status(404).json({ error: "No clients found for this date" });
        }

        res.status(200).json({ clients: sipData.clients });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching data" });
    }
};



const getSIPsByYear = async (req, res) => {
    const { year } = req.params;
    const numericYear = parseInt(year);

    try {
        const result = await Demo.aggregate([
            { $unwind: "$clients" },

            {
                $match: {
                    "clients.startDate": { $lte: new Date(`${numericYear}-12-31`) },
                    "clients.endDate": { $gte: new Date(`${numericYear}-01-01`) }
                }
            },

            {
                $addFields: {
                    "clients.deductionStatus": {
                        $let: {
                            vars: {
                                ds: { $ifNull: ["$clients.deductionStatus", {}] }
                            },
                            in: {
                                $cond: [
                                    { $in: [year, { $map: { input: { $objectToArray: "$$ds" }, as: "item", in: "$$item.k" } }] },
                                    {
                                        [year]: {
                                            $getField: {
                                                field: year,
                                                input: "$$ds"
                                            }
                                        }
                                    },
                                    {}
                                ]
                            }
                        }
                    }
                }
            },

            {
                $project: {
                    _id: 0,
                    date: 1,
                    client: "$clients"
                }
            }
        ]);

        res.json(result);
    } catch (err) {
        console.error("Error filtering by year:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Add a new SIP client
 */
const addSIPClient = async (req, res) => {
    const sipDate = parseInt(req.params.date);
    const newClient = req.body;

    try {
        const demo = await Demo.findOne({ date: sipDate });

        if (demo) {
            demo.clients.push(newClient);
            await demo.save();
        } else {
            await Demo.create({ date: sipDate, clients: [newClient] });
        }

        res.status(200).json({ message: "Client added successfully." });
    } catch (err) {
        console.error("Add client error:", err);
        res.status(500).json({ error: "Failed to add client." });
    }
};

/**
 * Update a SIP client
 */
const updateSIPClient = async (req, res) => {
    const xsipRegnNo = req.params.xsipRegnNo;
    const updatedData = req.body;

    try {
        // Build the update object dynamically
        let updateFields = {};

        for (const key in updatedData) {
            // If key is deductionStatus and it's an object (e.g., { 2025: { Jan: "Yes", Feb: "No" } })
            if (key === "deductionStatus" && typeof updatedData[key] === "object") {
                const years = updatedData[key];
                for (const year in years) {
                    const months = years[year];
                    for (const month in months) {
                        updateFields[`clients.$.deductionStatus.${year}.${month}`] = months[month];
                    }
                }
            } else {
                updateFields[`clients.$.${key}`] = updatedData[key];
            }
        }

        const updated = await Demo.updateOne(
            { "clients.xsipRegnNo": xsipRegnNo },
            { $set: updateFields }
        );

        if (updated.modifiedCount === 0) {
            return res.status(404).json({ error: "Client not found." });
        }

        res.status(200).json({ message: "Client updated successfully." });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ error: "Failed to update client." });
    }
};


/**
 * Delete a SIP client
 */
const deleteSIPClient = async (req, res) => {
    const xsipRegnNo = req.params.xsipRegnNo;

    try {
        const updated = await Demo.updateOne(
            { "clients.xsipRegnNo": xsipRegnNo },
            { $pull: { clients: { xsipRegnNo: xsipRegnNo } } }
        );

        if (updated.modifiedCount === 0) {
            return res.status(404).json({ error: "Client not found." });
        }

        res.status(200).json({ message: "Client deleted successfully." });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ error: "Failed to delete client." });
    }
};



module.exports = { uploadSIPData, getSIPByDate, updateSIPDeductions, 
    getClientsByDate, 
    getSIPsByYear,  uploadNotOnBSEData ,getNotOnBSEData,createNotOnBSEEntry , deleteNotOnBSEEntry,updateNotOnBSEEntry,  addSIPClient,
    updateSIPClient,
    deleteSIPClient};
