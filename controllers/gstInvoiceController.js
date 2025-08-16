const GSTInvoice = require('../models/GSTInvoice');

const generateInvoiceNumber = async (invoiceDate) => {
  try {
    const date = new Date(invoiceDate);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const prefix = `${month}${year}`;

    const lastInvoice = await GSTInvoice.findOne({
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

const specialAMCs = [
  'NJ INDIAINVEST PVT. LTD. (LAS)',
  'NJ INDIAINVEST PVT. LTD. (MF)',
  'NJ FINANCIAL SERVICES PVT. LTD.'
];

// ✅ Create Invoice
const createInvoice = async (req, res) => {
  try {
    const data = req.body;

    const requiredFields = [
      'invoiceDate', 'billType', 'amcClientName',
      'netAmount', 'gstNo', 'panNo', 'hsnNo', 'amcPanNo', 'amcGstNo'
    ];

    for (let field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    const netAmount = parseFloat(data.netAmount);
    const totalGst = parseFloat(((netAmount * 18) / 118).toFixed(2));
    const taxableAmount = parseFloat((netAmount - totalGst).toFixed(2));

    let igst = 0, cgst = 0, sgst = 0;

    let invoiceNumber = '';

    if (specialAMCs.includes(data.amcClientName)) {
      igst = totalGst;
      invoiceNumber = data.invoiceNo; // User provides it
      if (!invoiceNumber) {
        return res.status(400).json({ error: 'Invoice number is required for special AMCs' });
      }
    } else {
      cgst = parseFloat((totalGst / 2).toFixed(2));
      sgst = parseFloat((totalGst / 2).toFixed(2));
      invoiceNumber = await generateInvoiceNumber(data.invoiceDate);
    }

    const invoice = new GSTInvoice({
      ...data,
      invoiceNo: invoiceNumber,
      totalGst,
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

// ✅ Get all
const getAllInvoices = async (req, res) => {
  try {
    const invoices = await GSTInvoice.find();
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get by ID
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await GSTInvoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update Invoice
const updateInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const newData = req.body;

    const existingInvoice = await GSTInvoice.findById(invoiceId);
    if (!existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const data = {
      ...existingInvoice.toObject(),
      ...newData
    };

    const netAmount = parseFloat(data.netAmount);
    const totalGst = parseFloat(((netAmount * 18) / 118).toFixed(2));
    const taxableAmount = parseFloat((netAmount - totalGst).toFixed(2));

    let igst = 0, cgst = 0, sgst = 0;

    if (specialAMCs.includes(data.amcClientName)) {
      igst = totalGst;
    } else {
      cgst = parseFloat((totalGst / 2).toFixed(2));
      sgst = parseFloat((totalGst / 2).toFixed(2));
    }

    const updatedInvoice = await GSTInvoice.findByIdAndUpdate(
      invoiceId,
      {
        ...data,
        totalGst,
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

// ✅ Delete Invoice
const deleteInvoice = async (req, res) => {
  try {
    const deleted = await GSTInvoice.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Invoice not found" });
    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
};
