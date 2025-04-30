// routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const { createInvoice, getYearlyData, updateMonthData, deleteYearlyData } = require('../controllers/invoiceController');

// Create a new invoice
router.post('/create', createInvoice);

// Get yearly data for a specific year
router.get('/:year', getYearlyData);

// Update a specific month's data for a specific AMC and year
router.put('/:year/:amcClientName/:month', updateMonthData);

// Delete year-wise data for a specific AMC
router.delete('/:year/:amcClientName', deleteYearlyData);

module.exports = router;
