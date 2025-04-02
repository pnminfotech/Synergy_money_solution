// const axios = require("axios");
// const Book = require("../models/Book");
// const ExcelDataFromSheet = require("../models/ExcelData");
// require("dotenv").config();

// const sendWhatsAppMessage = async (req, res) => {
//     try {
//         const { clientCode } = req.body;

       
//         const book = await Book.findOne({ "clients.clientCode": clientCode });

//         if (!book) {
//             return res.status(404).json({ success: false, error: "Client not found in Book" });
//         }

  
//         const client = book.clients.find(c => c.clientCode === clientCode);
//         if (!client) {
//             return res.status(404).json({ success: false, error: "Client not found in clients array" });
//         }

      
//         const excelData = await ExcelDataFromSheet.findOne({ clientId: clientCode });
//         if (!excelData) {
//             return res.status(404).json({ success: false, error: "Client not found in ExcelDataFromSheet" });
//         }

//         const recipientNumber = excelData.mobile; 
//         const sipStartDate = new Date(client.startDate); 
//         const sipDay = sipStartDate.getDate();

        
//         const today = new Date();
//         const currentYear = today.getFullYear();
//         const currentMonth = today.getMonth();
//         const nextSIPDate = new Date(currentYear, currentMonth, sipDay);

//         const differenceInDays = Math.ceil((nextSIPDate - today) / (1000 * 60 * 60 * 24));

//         console.log(`Today's Date: ${today.toISOString().split("T")[0]}`);
//         console.log(`Next SIP Date: ${nextSIPDate.toISOString().split("T")[0]}`);
//         console.log(`Days Until SIP: ${differenceInDays}`);

//         if (differenceInDays !== 2) {
//             return res.status(400).json({ success: false, error: "Message can only be sent 2 days before SIP start date" });
//         }

 
//         const url = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_ID}/messages`;
//         const payload = {
//             messaging_product: "whatsapp",
//             to: recipientNumber,
//             type: "text",
//             text: { body: `Reminder: Your SIP deduction for ${client.schemeName} is scheduled for ${nextSIPDate.toISOString().split("T")[0]}.` },
//         };

//         const response = await axios.post(url, payload, {
//             headers: {
//                 "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
//                 "Content-Type": "application/json",
//             },
//         });

//         return res.status(200).json({
//             success: true,
//             message: "WhatsApp message sent successfully!",
//             data: response.data,
//         });

//     } catch (error) {
//         console.error("Error sending WhatsApp message:", error.response?.data);
//         return res.status(500).json({
//             success: false,
//             error: error.response?.data || "Something went wrong",
//         });
//     }
// };

// module.exports = { sendWhatsAppMessage };



