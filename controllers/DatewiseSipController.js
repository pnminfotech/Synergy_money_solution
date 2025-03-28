const DatewiseSip = require("../models/DatewiseSip");

// Upload SIP records
const uploadSipRecords = async (req, res) => {
  try {
    const datewiseSips = req.body;
    await DatewiseSip.insertMany(datewiseSips);
    res.status(201).json({ message: "SIP records uploaded successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error uploading SIP records", error });
  }
};

// Get SIP records by date
const getSipRecordsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const datewiseSips = await DatewiseSip.find({ sipDates: { $in: [Number(date)] } });
    res.status(200).json(sipRecords);
  } catch (error) {
    res.status(500).json({ message: "Error fetching SIP records", error });
  }
};

module.exports = { uploadSipRecords, getSipRecordsByDate };
