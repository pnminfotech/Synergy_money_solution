const puppeteer = require("puppeteer");

async function sendWhatsAppMessage(phoneNumber, message) {
    const browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        defaultViewport: null,
    });

    const page = await browser.newPage();
    await page.goto("https://web.whatsapp.com", { waitUntil: "networkidle2" });

    console.log("Waiting for WhatsApp Web to load...");
    await page.waitForSelector("canvas[aria-label='Scan me!']", { timeout: 60000 }).catch(() => {
        console.log("WhatsApp Web is already logged in.");
    });

    console.log(`Searching for contact: ${phoneNumber}`);
    await page.goto(`https://web.whatsapp.com/send?phone=${phoneNumber}`, { waitUntil: "networkidle2" });

    await page.waitForTimeout(5000);
    // await new Promise(resolve => setTimeout(resolve, 5000));

    console.log("Typing message...");
    await page.waitForSelector("div[role='textbox']", { timeout: 120000 });

    const inputBox = await page.$("div[role='textbox']");
    if (inputBox) {
        await inputBox.type(message);
    } else {
        console.error("❌ Message input box not found!");
        await browser.close();
        return;
    }

    console.log("Clicking Send button...");
    const sendButtonSelector = "button[aria-label='Send']";
    await page.waitForSelector(sendButtonSelector, { timeout: 60000 });
    await page.click(sendButtonSelector);

    console.log(`✅ WhatsApp message sent to ${phoneNumber}`);
    await browser.close();
}

module.exports = { sendWhatsAppMessage };
