const express = require('express');
const router = express.Router();
const { createInvoice, getAllInvoices,  getInvoiceById,
    updateInvoice,
    deleteInvoice } = require('../controllers/gstInvoiceController');

router.post('/gst-invoice', createInvoice);
router.get('/gst-invoice', getAllInvoices);
router.get('/gst-invoice/:id', getInvoiceById);
router.put('/gst-invoice/:id', updateInvoice);
router.delete('/gst-invoice/:id', deleteInvoice);
module.exports = router;