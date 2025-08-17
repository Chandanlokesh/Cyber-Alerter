const puppeteer = require('puppeteer');

exports.generatePDF = async (htmlContent, filePath) => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  await page.pdf({ path: filePath, format: 'A4' });
  await browser.close();
};
