// const express = require('express');
// const router = express.Router();
// const {
//   createInvoice,
//   getSummaryByYear,
//   generateConsolidatedSummary,
//   getStoredSummary
// } = require('../controllers/Invcontroller');

// router.post('/create', createInvoice);
// router.get('/summary/year/:year', getSummaryByYear); // Old yearly summary
// router.get('/summary/consolidated/:year', generateConsolidatedSummary); // Generates & stores
// router.get('/summary/stored/:financialYear', getStoredSummary); // Fetches from DB

// module.exports = router;



const Invoice = require('../models/Invoice'); 
const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getSummaryByYear,
  // getAllInvoicesWithTotals,
  generateConsolidatedSummary,
  getStoredSummary, getInvoicesByMonthYear,getInvoiceById, deleteInvoice
} = require('../controllers/Invcontroller');


 

router.post('/create', createInvoice);
router.get('/summary/year/:year', getSummaryByYear); 
router.get('/summary/consolidated/:year', generateConsolidatedSummary); 
router.get('/summary/stored/:financialYear', getStoredSummary); 

// router.get('/invoices',  getAllInvoicesWithTotals);
router.get('/invoice/:month/:year', getInvoicesByMonthYear);

router.get('/invoices/:month/:year', async (req, res) => {
  const { month, year } = req.params;
  try {
    const invoices = await Invoice.find({ month, year });
    if (!invoices || invoices.length === 0) {
      return res.status(404).json({ message: 'No invoices found for this month and year' });
    }
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.get('/invoices/:id', getInvoiceById);
// router.put('/invoices/:id', updateInvoice);
router.delete('/invoices/:id', deleteInvoice);

module.exports = router;
