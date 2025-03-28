const express = require("express");
const router = express.Router();
const NotOnBSE = require("../models/NotOnBSE")
const { addNotOnBSE, updateSIP, getAllNotOnBSE , deleteSIPStatus } = require("../controllers/notOnBSEController");

// Make sure the functions exist in the controller before using them
router.post("/add", addNotOnBSE);
router.put("/update-sip", updateSIP);
router.get("/", getAllNotOnBSE);
router.delete("/delete/:entryId" , deleteSIPStatus)
router.get('/year/:entryId/:year', async (req, res) => {
    try {
        const { entryId, year } = req.params;
        
        // Find the SIP entry by ID
        const entry = await NotOnBSE.findById(entryId);

        if (!entry) {
            return res.status(404).json({ message: "SIP entry not found" });
        }

        // Check if the year exists in the database
        if (!entry.years[year]) {
            return res.status(404).json({ message: `No data found for year ${year}` });
        }

        // Return data for the requested year
        res.json({ message: "SIP data retrieved", yearData: entry.years[year] });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
