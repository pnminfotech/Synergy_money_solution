const Invoice = require('../models/Invoice');
const InvoiceSummary = require('../models/InvoiceSummary');
const InvoiceTotal = require('../models/InvoiceTotal'); // Add this line
const MonthlyInvoiceTotal = require('../models/MonthlyInvoiceTotal');




const generateInvoiceNumber = async (invoiceDate) => {
  try {
    const date = new Date(invoiceDate);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const prefix = `${month}${year}`;

    const lastInvoice = await Invoice.findOne({
      invoiceNo: { $regex: `^${prefix}` }
    }).sort({ invoiceNo: -1 });

    let newSerial = 1;
    if (lastInvoice) {
      const lastSerial = parseInt(lastInvoice.invoiceNo.slice(-2), 10);
      newSerial = lastSerial + 1;
    }

    return `${prefix}${newSerial.toString().padStart(2, '0')}`;
  } catch (err) {
    throw new Error('Error generating invoice number');
  }
};
// const specialAMCs = [
//   'NJ INDIAINVEST PVT. LTD. (LAS)',
//   'NJ INDIAINVEST PVT. LTD. (MF)',
//   'NJ FINANCIAL SERVICES PVT. LTD',
  
// ];

const specialAMCsManualInvoice = [
  'NJ INDIAINVEST PVT. LTD. (LAS)',
  'NJ INDIAINVEST PVT. LTD. (MF)',
  'NJ FINANCIAL SERVICES PVT. LTD',
];

const igstOnlyAMCsAutoInvoice = [
  'QUANTUM MUTUAL FUND' // IGST but invoice number auto
];
// const createInvoice = async (req, res) => {
//   try {
//     const data = req.body;
//     const netAmount = parseFloat(data.netAmount);
//     const totalGst = parseFloat(((netAmount * 18) / 118).toFixed(2));
//     const taxableAmount = parseFloat((netAmount - totalGst).toFixed(2));

//     let igst = 0, cgst = 0, sgst = 0;
//     let invoiceNumber = '';
    
//     if (specialAMCs.includes(data.amcClientName)) {
//       igst = totalGst;
//     } else {
//       cgst = parseFloat((totalGst / 2).toFixed(2));
//       sgst = parseFloat((totalGst / 2).toFixed(2));
//       invoiceNumber = await generateInvoiceNumber(data.invoiceDate); // This will generate the invoice number correctly
//     }

//     const invoiceDate = new Date(data.invoiceDate);
//     const month = invoiceDate.toLocaleString('default', { month: 'short' }) + '-' + invoiceDate.getFullYear().toString().slice(-2);
//     const year = invoiceDate.getFullYear().toString();

//     const invoice = new Invoice({
//       ...data,
//       invoiceNo: invoiceNumber, // Ensure this is included in the invoice object
//       totalGst,
//       taxableAmount,
//       igst,
//       cgst,
//       sgst,
//       month,
//       year
//     });

//     await invoice.save();
//     res.status(201).json(invoice);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


const calculateTaxes = (netAmount, isSpecialAMC) => {
  const totalGst = parseFloat(((netAmount * 18) / 118).toFixed(2));
  const taxableAmount = parseFloat((netAmount - totalGst).toFixed(2));

  let igst = 0, cgst = 0, sgst = 0;
  if (isSpecialAMC) {
    igst = totalGst;
  } else {
    cgst = parseFloat((totalGst / 2).toFixed(2));
    sgst = parseFloat((totalGst / 2).toFixed(2));
  }
  return { totalGst, taxableAmount, igst, cgst, sgst };
};

// const createInvoice = async (req, res) => {
//   try {
//     const data = req.body;
//     const netAmount = parseFloat(data.netAmount);
//     const { totalGst, taxableAmount, igst, cgst, sgst } = calculateTaxes(netAmount, specialAMCs.includes(data.amcClientName));

//     let invoiceNumber = '';
//     if (!specialAMCs.includes(data.amcClientName)) {
//       invoiceNumber = await generateInvoiceNumber(data.invoiceDate);
//     }

//     const invoiceDate = new Date(data.invoiceDate);
//     const month = invoiceDate.toLocaleString('default', { month: 'short' }) + '-' + invoiceDate.getFullYear().toString().slice(-2);
//     const year = invoiceDate.getFullYear().toString();
    

//     if (specialAMCs.includes(data.amcClientName)) {
     
//       invoiceNumber = data.invoiceNo; // User provides it
//       if (!invoiceNumber) {
//         return res.status(400).json({ error: 'Invoice number is required for special AMCs' });
//       }
//     } else {
      
//       invoiceNumber = await generateInvoiceNumber(data.invoiceDate);
//     }

//     const invoice = new Invoice({
//       ...data,
//       invoiceNo: invoiceNumber,
//       totalGst,
//       taxableAmount,
//       igst,
//       cgst,
//       sgst,
//       month,
//       year
//     });

//     await invoice.save();
//     res.status(201).json(invoice);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const createInvoice = async (req, res) => {
  try {
    const data = req.body;
    const netAmount = parseFloat(data.netAmount);

    // Determine GST split
    let isIGSTOnly = specialAMCsManualInvoice.includes(data.amcClientName) 
                     || igstOnlyAMCsAutoInvoice.includes(data.amcClientName);
    const { totalGst, taxableAmount, igst, cgst, sgst } = calculateTaxes(netAmount, isIGSTOnly);

    let invoiceNumber = '';

    // Invoice number rules
    if (specialAMCsManualInvoice.includes(data.amcClientName)) {
      // Manual entry required
      invoiceNumber = data.invoiceNo;
      if (!invoiceNumber) {
        return res.status(400).json({ error: 'Invoice number is required for special AMCs' });
      }
    } else {
      // Auto-generate for all other cases (including IGST-only auto AMCs)
      invoiceNumber = await generateInvoiceNumber(data.invoiceDate);
    }

    const invoiceDate = new Date(data.invoiceDate);
    const month = invoiceDate.toLocaleString('default', { month: 'short' }) + '-' + invoiceDate.getFullYear().toString().slice(-2);
    const year = invoiceDate.getFullYear().toString();

    const invoice = new Invoice({
      ...data,
      invoiceNo: invoiceNumber,
      totalGst,
      taxableAmount,
      igst,
      cgst,
      sgst,
      month,
      year
    });

    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



function getFinancialYearMonths(year) {
  const months = [];
  const start = new Date(`${year}-04-01`);
  for (let i = 0; i < 12; i++) {
    const date = new Date(start);
    date.setMonth(date.getMonth() + i);
    const label = date.toLocaleString('default', { month: 'short' }) + '-' + date.getFullYear().toString().slice(-2);
    months.push(label);
  }
  return months;
}

const generateConsolidatedSummary = async (req, res) => {
  const { year } = req.params;
  const startYear = parseInt(year);
  const endYear = startYear + 1;
  const financialYearKey = `${startYear}-${endYear}`;

  try {
    const invoices = await Invoice.find({
      $or: [
        { year: startYear.toString() },
        { year: endYear.toString() }
      ]
    });

    const summary = {};
    const columnTotals = {};
    const months = getFinancialYearMonths(startYear); // ["Apr-24", ..., "Mar-25"]

    invoices.forEach(inv => {
      let amc = inv.amcClientName;
      const month = inv.month;
      const taxableAmount = inv.taxableAmount;

      // Sanitize AMC name to prevent MongoDB key errors (e.g., replace "." with "_")
      const safeAmc = amc.replace(/[.$]/g, '_');

      if (!summary[safeAmc]) summary[safeAmc] = {};

      summary[safeAmc][month] = (summary[safeAmc][month] || 0) + taxableAmount;

      columnTotals[month] = (columnTotals[month] || 0) + taxableAmount;
    });

    // Add half-yearly and total summaries for each AMC
    Object.keys(summary).forEach(amc => {
      let firstHalf = 0;
      let secondHalf = 0;

      months.forEach((month, idx) => {
        const val = summary[amc][month] || 0;
        if (idx < 6) firstHalf += val;
        else secondHalf += val;
      });

      summary[amc]['6Months'] = parseFloat(firstHalf.toFixed(2));
      summary[amc]['6To12Months'] = parseFloat(secondHalf.toFixed(2));
      summary[amc]['Total'] = parseFloat((firstHalf + secondHalf).toFixed(2));
    });

    // Total of all AMCs per half-year and overall
    let total6Months = 0;
    let total6To12Months = 0;
    let totalTotal = 0;

    Object.values(summary).forEach(amcData => {
      total6Months += amcData['6Months'];
      total6To12Months += amcData['6To12Months'];
      totalTotal += amcData['Total'];
    });

    columnTotals['6Months'] = parseFloat(total6Months.toFixed(2));
    columnTotals['6To12Months'] = parseFloat(total6To12Months.toFixed(2));
    columnTotals['Total'] = parseFloat(totalTotal.toFixed(2));

    // Save the summary in DB
    await InvoiceSummary.findOneAndUpdate(
      { financialYear: financialYearKey },
      {
        financialYear: financialYearKey,
        months: columnTotals,
        summary: summary
      },
      { upsert: true, new: true }
    );

    res.json({
      financialYear: financialYearKey,
      months,
      summary,
      columnTotals
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// const generateConsolidatedSummary = async (req, res) => {
//   const { year } = req.params;
//   const startYear = parseInt(year);
//   const endYear = startYear + 1;
//   const financialYearKey = `${startYear}-${endYear}`;

//   try {
   
//     const invoices = await Invoice.find({
//       $or: [
//         { year: startYear.toString() },
//         { year: endYear.toString() }
//       ]
//     });

   
//     const months = getFinancialYearMonths(startYear); 
//     const monthlyTotals = {}; 
//     const amcSummary = {}; 

    
//     months.forEach(month => {
//       monthlyTotals[month] = 0;
//     });

    
//     invoices.forEach(inv => {
//       const amc = inv.amcClientName; 
//       const month = inv.month;
//       const taxableAmount = inv.taxableAmount;

     
//       if (!amcSummary[amc]) {
//         amcSummary[amc] = {};
//         months.forEach(month => amcSummary[amc][month] = 0);
//       }

    
//       if (months.includes(month)) {
//         amcSummary[amc][month] += taxableAmount;
//         monthlyTotals[month] += taxableAmount;
//       }
//     });

   
//     await InvoiceSummary.findOneAndUpdate(
//       { financialYear: financialYearKey },
//       {
//         financialYear: financialYearKey,
//         months: monthlyTotals,
//         summary: amcSummary,
//       },
//       { upsert: true, new: true }
//     );

    
//     res.json({ financialYear: financialYearKey, months: monthlyTotals, summary: amcSummary });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const getStoredSummary = async (req, res) => {
  try {
    const { financialYear } = req.params;
    const summaryDoc = await InvoiceSummary.findOne({ financialYear });
    if (!summaryDoc) return res.status(404).json({ message: 'Summary not found' });
    res.json(summaryDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSummaryByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const invoices = await Invoice.find({ year });
    const summary = {};

    invoices.forEach(inv => {
      const amc = inv.amcClientName;
      if (!summary[amc]) summary[amc] = {};
      summary[amc][inv.month] = (summary[amc][inv.month] || 0) + inv.taxableAmount;
    });

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// const getInvoicesByMonthYear = async (req, res) => {
//   const { month, year } = req.params;

//   try {
//     // Get invoices for given month & year
//     const invoices = await Invoice.find({ month, year });

//     // Calculate totals from the retrieved invoices
//     const totals = invoices.reduce(
//       (acc, curr) => {
//         acc.totalTaxableAmount += curr.taxableAmount || 0;
//         acc.totalIGST += curr.igst || 0;
//         acc.totalCGST += curr.cgst || 0;
//         acc.totalSGST += curr.sgst || 0;
//         acc.totalGST += curr.totalGst || 0;
//         acc.totalNetAmount += curr.netAmount || 0;
//         return acc;
//       },
//       {
//         totalTaxableAmount: 0,
//         totalIGST: 0,
//         totalCGST: 0,
//         totalSGST: 0,
//         totalGST: 0,
//         totalNetAmount: 0,
//       }
//     );

//     res.status(200).json({ invoices, totals });
//   } catch (error) {
//     console.error("Error fetching invoices and totals:", error);
//     res.status(500).json({ message: "Server Error", error });
//   }
// };










const getInvoicesByMonthYear = async (req, res) => {
  const { month, year } = req.params;

  try {
    // Fetch all invoices for the given month and year
    const invoices = await Invoice.find({ month, year });

    // Calculate totals
    const totals = invoices.reduce(
      (acc, curr) => {
        acc.totalTaxableAmount += curr.taxableAmount || 0;
        acc.totalIGST += curr.igst || 0;
        acc.totalCGST += curr.cgst || 0;
        acc.totalSGST += curr.sgst || 0;
        acc.totalGST += curr.totalGst || 0;
        acc.totalNetAmount += curr.netAmount || 0;
        return acc;
      },
      {
        totalTaxableAmount: 0,
        totalIGST: 0,
        totalCGST: 0,
        totalSGST: 0,
        totalGST: 0,
        totalNetAmount: 0,
      }
    );

    // Upsert monthly total in MonthlyInvoiceTotal
    await MonthlyInvoiceTotal.findOneAndUpdate(
      { month, year },
      { month, year, totals },
      { upsert: true, new: true }
    );

    res.status(200).json({ invoices, totals });
  } catch (error) {
    console.error("Error fetching or saving monthly invoice totals:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};
// const getAllInvoicesWithTotals = async (req, res) => {
//   try {
//     const invoices = await Invoice.find();

//     let totalTaxableAmount = 0;
//     let totalIGST = 0;
//     let totalCGST = 0;
//     let totalSGST = 0;
//     let totalGST = 0;
//     let totalNetAmount = 0;

//     invoices.forEach(inv => {
//       totalTaxableAmount += inv.taxableAmount || 0;
//       totalIGST += inv.igst || 0;
//       totalCGST += inv.cgst || 0;
//       totalSGST += inv.sgst || 0;
//       totalGST += inv.totalGst || 0;
//       totalNetAmount += inv.netAmount || 0;
//     });

//     const totals = {
//       totalTaxableAmount: parseFloat(totalTaxableAmount.toFixed(2)),
//       totalIGST: parseFloat(totalIGST.toFixed(2)),
//       totalCGST: parseFloat(totalCGST.toFixed(2)),
//       totalSGST: parseFloat(totalSGST.toFixed(2)),
//       totalGST: parseFloat(totalGST.toFixed(2)),
//       totalNetAmount: parseFloat(totalNetAmount.toFixed(2)),
//     };

  
//     const invoiceTotalDoc = new InvoiceTotal(totals);
//     await invoiceTotalDoc.save();

//     res.json({ invoices, totals });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };



// Get invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.status(200).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// const updateInvoice = async (req, res) => {
//   try {
//     const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!updatedInvoice) return res.status(404).json({ message: 'Invoice not found' });
//     res.status(200).json(updatedInvoice);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const deleteInvoice = async (req, res) => {
  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!deletedInvoice) return res.status(404).json({ message: 'Invoice not found' });
    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



module.exports = {
  createInvoice,
  getSummaryByYear,
  generateConsolidatedSummary,
  getStoredSummary,
  // getAllInvoicesWithTotals,
   getInvoicesByMonthYear,
   getInvoiceById, deleteInvoice
};














