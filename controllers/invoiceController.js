// controllers/invoiceController.js
const GSTInvoice = require('../models/GSTInvoice');  // Assuming this exists already
const AMCMonthlyTaxableData = require('../models/AMCMonthlyTaxableData');  // Import MonthlyTaxableData schema

const generateInvoiceNumber = async (invoiceDate) => {
  const date = new Date(invoiceDate);
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const invoiceCount = await GSTInvoice.countDocuments({ 'invoiceDate': { $gte: new Date(year, month - 1, 1) } });
  return `${year}-${month}-${invoiceCount + 1}`;
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

    let invoiceNumber;
    if (specialAMCs.includes(data.amcClientName)) {
      if (!data.invoiceNo) {
        return res.status(400).json({ error: 'Invoice number is required for special AMCs' });
      }
      invoiceNumber = data.invoiceNo;
    } else {
      invoiceNumber = await generateInvoiceNumber(data.invoiceDate);
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

    const invoiceDate = new Date(data.invoiceDate);
    const prevMonth = invoiceDate.getMonth();
    const prevMonthName = new Date(invoiceDate.setMonth(prevMonth)).toLocaleString('en-us', { month: 'short' }).toUpperCase();
    const year = invoiceDate.getFullYear();

    const monthlyInvoices = await GSTInvoice.find({
      amcClientName: data.amcClientName,
      invoiceDate: {
        $gte: new Date(year, prevMonth, 1),
        $lt: new Date(year, prevMonth + 1, 1)
      }
    });

    const totalTaxableAmountForMonth = monthlyInvoices.reduce((total, invoice) => total + invoice.taxableAmount, 0);

    const existingData = await AMCMonthlyTaxableData.findOne({ year, amcClientName: data.amcClientName });
    if (existingData) {
      existingData.months[prevMonthName.toLowerCase() + '24'] = totalTaxableAmountForMonth;

      const sixMonthsTotal = Object.values(existingData.months).slice(0, 6).reduce((sum, amt) => sum + amt, 0);
      const sixToTwelveMonthsTotal = Object.values(existingData.months).slice(6, 12).reduce((sum, amt) => sum + amt, 0);
      const grandTotal = sixMonthsTotal + sixToTwelveMonthsTotal;

      existingData.sixMonthsTotal = sixMonthsTotal;
      existingData.sixToTwelveMonthsTotal = sixToTwelveMonthsTotal;
      existingData.grandTotal = grandTotal;

      await existingData.save();
    } else {
      const newData = new AMCMonthlyTaxableData({
        year,
        amcClientName: data.amcClientName,
        months: { [prevMonthName.toLowerCase() + '24']: totalTaxableAmountForMonth },
        sixMonthsTotal: totalTaxableAmountForMonth,
        sixToTwelveMonthsTotal: 0,
        grandTotal: totalTaxableAmountForMonth
      });

      await newData.save();
    }

    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getYearlyData = async (req, res) => {
  const { year } = req.params;
  try {
    const data = await AMCMonthlyTaxableData.find({ year });
    if (data.length === 0) {
      return res.status(404).json({ error: `No data found for year ${year}` });
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateMonthData = async (req, res) => {
  const { year, amcClientName, month } = req.params;
  const { taxableAmount } = req.body;

  try {
    const record = await AMCMonthlyTaxableData.findOne({ year, amcClientName });
    if (!record) {
      return res.status(404).json({ error: 'AMC or year not found' });
    }

    record.months[month] = taxableAmount;

    const sixMonthsTotal = Object.values(record.months).slice(0, 6).reduce((sum, amt) => sum + amt, 0);
    const sixToTwelveMonthsTotal = Object.values(record.months).slice(6, 12).reduce((sum, amt) => sum + amt, 0);
    const grandTotal = sixMonthsTotal + sixToTwelveMonthsTotal;

    record.sixMonthsTotal = sixMonthsTotal;
    record.sixToTwelveMonthsTotal = sixToTwelveMonthsTotal;
    record.grandTotal = grandTotal;

    await record.save();
    res.status(200).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteYearlyData = async (req, res) => {
  const { year, amcClientName } = req.params;
  try {
    const record = await AMCMonthlyTaxableData.findOneAndDelete({ year, amcClientName });
    if (!record) {
      return res.status(404).json({ error: 'AMC or year not found' });
    }
    res.status(200).json({ message: 'Data deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createInvoice, getYearlyData, updateMonthData, deleteYearlyData };
