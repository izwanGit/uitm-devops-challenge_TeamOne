const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testPuppeteer() {
  console.log('Testing Puppeteer Launch...');
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
    console.log('Browser launched successfully.');

    const page = await browser.newPage();
    await page.setContent('<h1>Hello World</h1>');

    const outputPath = path.join(__dirname, 'test-puppeteer.pdf');
    await page.pdf({ path: outputPath, format: 'A4' });
    console.log('PDF generated at:', outputPath);

    await browser.close();
    console.log('Browser closed.');

    if (fs.existsSync(outputPath)) {
      console.log('Verification: PDF file exists.');
      fs.unlinkSync(outputPath);
    } else {
      console.error('Verification: PDF file MISSING.');
    }
  } catch (error) {
    console.error('Puppeteer Error:', error);
  }
}

testPuppeteer();
