const Redemption = require("../models/Redemption");
const xlsx = require("xlsx");

/**
 * Upload Redemption Data from Excel
 */
const uploadRedemptionData = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const workbook = xlsx.read(file.buffer, { type: "buffer" });

        for (const sheetName of workbook.SheetNames) {
            const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

            console.log(`📊 Parsed Redemption Excel Data from ${sheetName}:`, data);

            const formattedData = data.map((row) => ({
                date: row["Date"] || "-",
                orderNo: row["Order No"] || "-",
                settNo: row["Sett No"] || "-",
                clientCode: row["Client Code"] || "-",
                clientName: row["Client Name"] || "-",
                schemeCode: row["Scheme Code"] || "-",
                schemeName: row["Scheme Name"] || "-",
                ISIN: row["ISIN"] || "-",
                buySell: row["Buy/Sell"] || "-",
                amount: row["Amount"] || "-",
                dpFolioNo: row["DP/Folio No"] || "-",
                folioNo: row["Folio No"] || "-",
                entryBy: row["Entry By"] || "-",
                orderStatus: row["Order Status"]?.toUpperCase() === "VALID" ? "VALID" : "INVALID", // ✅ Convert to valid enum values
                orderRemark: row["Order Remark"] || "-",
                orderType: row["Order Type"] || "-",
                sipRegnNo: row["SIP Regn No"] || "-",
                sipRegnDate: row["SIP Regn Date"] ? new Date(row["SIP Regn Date"]) : "-",
                subOrderType: row["Sub Order Type"] || "-",
                firstOrder: row["First Order"] || "-",
                purchaseRedeem: row["Purchase / Redeem(Fresh/Additional)"] || "-",
                memberRemarks: row["Member Remarks"] || "-",
                kycFlag: row["KYC Flag"] || "-",
                minRedemptionFlag: row["MIN redemption flag"] || "-",
            }));

            await Redemption.insertMany(formattedData);
        }

        res.status(200).json({ message: "Redemption data uploaded successfully" });
    } catch (error) {
        console.error("❌ Error uploading redemption data:", error);
        res.status(500).json({ error: "Error processing file" });
    }
};


/**
 * Fetch Redemption Data
 */
const getRedemptions = async (req, res) => {
    try {
        const data = await Redemption.find();
        res.status(200).json(data);
    } catch (error) {
        console.error("❌ Error fetching data:", error);
        res.status(500).json({ error: "Error fetching data" });
    }
};

/**
 * Update Order Status and Remark
 */
const updateRedemptionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus = "-", orderRemark = "-" } = req.body; // Default values if missing

        const updatedData = await Redemption.findByIdAndUpdate(
            id,
            { orderStatus, orderRemark },
            { new: true }
        );

        if (!updatedData) return res.status(404).json({ error: "Redemption entry not found" });

        res.status(200).json({ message: "Redemption status updated successfully", updatedData });
    } catch (error) {
        console.error("❌ Error updating redemption status:", error);
        res.status(500).json({ error: "Error updating data" });
    }
};

module.exports = { uploadRedemptionData, getRedemptions, updateRedemptionStatus };
