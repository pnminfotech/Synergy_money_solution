const GSTInvoice = require('../models/GSTInvoice');

const generateInvoiceNumber = async (invoiceDate) => {
  try {
    const date = new Date(invoiceDate);
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // '04'
    const year = date.getFullYear().toString(); // '2024'

    const prefix = `${month}${year}`; // '042024'

    // Find the last invoice for this prefix
    const lastInvoice = await GSTInvoice.findOne({
      invoiceNo: { $regex: `^${prefix}` }
    }).sort({ invoiceNo: -1 });

    let newSerial = 1;
    if (lastInvoice) {
      const lastSerial = parseInt(lastInvoice.invoiceNo.slice(-2), 10); // Get the last 2 digits
      newSerial = lastSerial + 1;
    }

    const newInvoiceNo = `${prefix}${newSerial.toString().padStart(2, '0')}`; // '04202401', '04202402', etc.
    return newInvoiceNo;
  } catch (err) {
    throw new Error('Error generating invoice number');
  }
};


const createInvoice = async (req, res) => {
    try {
      const data = req.body;
  
      const requiredFields = [
        'invoiceDate', 'billType', 'amcClientName',
        'totalGst', 'netAmount', 'gstNo', 'panNo', 'hsnNo', 'amcPanNo', 'amcGstNo'
      ];
  
      for (let field of requiredFields) {
        if (!data[field]) {
          return res.status(400).json({ error: `Missing required field: ${field}` });
        }
      }
  
      const specialAMCs = [
        'NJ INDIAINVEST PVT. LTD. (LAS)',
        'NJ INDIAINVEST PVT. LTD. (MF)',
        'NJ INDIAINVEST PVT. LTD. (CM)'
      ];
  
      const totalGst = Number(data.totalGst);
      const netAmount = Number(data.netAmount);
  
      let igst = 0, cgst = 0, sgst = 0;
      if (specialAMCs.includes(data.amcClientName)) {
        igst = totalGst;
      } else {
        cgst = totalGst / 2;
        sgst = totalGst / 2;
      }
  
      const taxableAmount = netAmount - totalGst;
  
      // ✅ Generate invoice number based on provided invoiceDate
      // const invoiceNumber = await generateInvoiceNumber(data.invoiceDate);
      let invoiceNumber;

      if (
        ['NJ INDIAINVEST PVT. LTD. (LAS)', 'NJ INDIAINVEST PVT. LTD. (MF)', 'NJ INDIAINVEST PVT. LTD. (CM)']
          .includes(data.amcClientName)
      ) {
        if (!data.invoiceNo) {
          return res.status(400).json({ error: 'Invoice number is required for special AMCs' });
        }
        invoiceNumber = data.invoiceNo; // Use provided invoice number
      } else {
        invoiceNumber = await generateInvoiceNumber(data.invoiceDate); // Auto-generate for others
      }
      
      const invoice = new GSTInvoice({
        ...data,
        invoiceNo: invoiceNumber,
        igst,
        cgst,
        sgst,
        taxableAmount
      });
  
      await invoice.save();
      res.status(201).json(invoice);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
// Get all invoices from the database
const getAllInvoices = async (req, res) => {
  try {
    const invoices = await GSTInvoice.find();
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getInvoiceById = async (req, res) => {
    try {
      const invoice = await GSTInvoice.findById(req.params.id);
      if (!invoice) return res.status(404).json({ error: "Invoice not found" });
      res.json(invoice);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  
//   const updateInvoice = async (req, res) => {
//     try {
//       const updatedInvoice = await GSTInvoice.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         { new: true, runValidators: true }
//       );
//       if (!updatedInvoice) return res.status(404).json({ error: "Invoice not found" });
//       res.json(updatedInvoice);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   };



const updateInvoice = async (req, res) => {
    try {
      const invoiceId = req.params.id;
      const newData = req.body;
  
      // Fetch existing invoice to merge missing fields
      const existingInvoice = await GSTInvoice.findById(invoiceId);
      if (!existingInvoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
  
      // Merge existing and new data
      const data = {
        ...existingInvoice.toObject(),
        ...newData
      };
  
      const specialAMCs = [
        'NJ INDIAINVEST PVT. LTD. (LAS)',
        'NJ INDIAINVEST PVT. LTD. (MF)',
        'NJ INDIAINVEST PVT. LTD. (CM)'
      ];
  
      const totalGst = parseFloat(data.totalGst);
      const netAmount = parseFloat(data.netAmount);
      const amcClientName = data.amcClientName;
  
      let igst = 0, cgst = 0, sgst = 0;
  
      if (specialAMCs.includes(amcClientName)) {
        igst = parseFloat(totalGst.toFixed(2));
      } else {
        cgst = parseFloat((totalGst / 2).toFixed(2));
        sgst = parseFloat((totalGst / 2).toFixed(2));
      }
  
      const taxableAmount = parseFloat((netAmount - totalGst).toFixed(2));
  
      const updatedInvoice = await GSTInvoice.findByIdAndUpdate(
        invoiceId,
        {
          ...data,
          igst,
          cgst,
          sgst,
          taxableAmount
        },
        { new: true }
      );
  
      res.json(updatedInvoice);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  
  const deleteInvoice = async (req, res) => {
    try {
      const deleted = await GSTInvoice.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Invoice not found" });
      res.json({ message: "Invoice deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
module.exports = { createInvoice, getAllInvoices,  getInvoiceById,
    updateInvoice,
    deleteInvoice };
