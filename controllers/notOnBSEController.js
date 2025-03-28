const NotOnBSE = require("../models/NotOnBSE"); // Ensure correct path

// Add a new entry
const addNotOnBSE = async (req, res) => {
    try {
        const { clientCode, primaryHolderName, schemeName, startDate, endDate, installmentAmount } = req.body;
        
        const newEntry = new NotOnBSE({
            clientCode,
            primaryHolderName,
            schemeName,
            startDate,
            endDate,
            installmentAmount,
            years: {} // Initialize years data
        });

        await newEntry.save();
        res.status(201).json(newEntry);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

// PUT - Update SIP Status for Multiple Months
const updateSIP = async (req, res) => {
    try {
        const { entryId, year, months } = req.body;
        const entry = await NotOnBSE.findOne({ _id: entryId });

        if (!entry) {
            return res.status(404).json({ message: "SIP entry not found" });
        }

        if (!entry.years) {
            entry.years = {}; // Initialize if missing
        }

        if (!entry.years[year]) {
            entry.years[year] = {}; // Initialize year if missing
        }

        // Update months dynamically
        Object.keys(months).forEach((month) => {
            entry.years[year][month] = months[month];
        });

        // Check if the current year has all 12 months (even if "No")
        const monthsList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const isYearComplete = monthsList.every(month => entry.years[year].hasOwnProperty(month));

        if (isYearComplete) {
            const nextYear = (parseInt(year) + 1).toString();
            if (!entry.years[nextYear]) {
                entry.years[nextYear] = {}; // Initialize next year
                monthsList.forEach(month => {
                    entry.years[nextYear][month] = "Pending"; // Default status
                });
            }
        }

        // Mark `years` as modified
        entry.markModified("years");
        await entry.save();

        res.json({ message: "SIP status updated", entry });
    } catch (error) {
        console.error("Error updating SIP status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};




// DELETE - Remove specific months from a SIP entry
const deleteSIPStatus = async (req, res) => {
  // DELETE - Remove a Client Entry Completely

    try {
        const { entryId } = req.params; // Get entry ID from URL params

        const entry = await NotOnBSE.findById(entryId);
        if (!entry) {
            return res.status(404).json({ message: "Client entry not found" });
        }

        await NotOnBSE.findByIdAndDelete(entryId);

        res.json({ message: "Client deleted successfully" });
    } catch (error) {
        console.error("Error deleting client:", error);
        res.status(500).json({ message: "Internal server error" });
    }

};



// Get all entries
const getAllNotOnBSE = async (req, res) => {
    try {
        const entries = await NotOnBSE.find();
        res.status(200).json(entries);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

module.exports = { addNotOnBSE, updateSIP, getAllNotOnBSE, deleteSIPStatus };
