const express = require("express");
const router = express.Router();
const Client = require("../models/Client");

// Get all clients
router.get("/", async (req, res) => {
    try {
        const clients = await Client.find();
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Add a new client
router.post("/add", async (req, res) => {
    try {
        const { name, aadharNumber, panNumber, bankAccount, ifscCode } = req.body;
        const newClient = new Client({ name, aadharNumber, panNumber, bankAccount, ifscCode });
        await newClient.save();
        res.json({ message: "Client Added!" });
    } catch (error) {
        res.status(500).json({ message: "Error adding client" });
    }
});

module.exports = router;
