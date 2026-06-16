Because the Dashboard V2 Figgy also has a purple screen const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log("Navigating to http://127.0.0.1:3000/ ...");
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });
  
  console.log("Clicking the hypothesis testing button...");
  // Evaluate click on the button with id 'hypothesis' or text 'hypothesis'
  // Let's just evaluate a script to click it
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.innerText.includes('השערות') || b.textContent.includes('hypothesis') || b.innerHTML.includes('Award'));
    if (btn) btn.click();
    else console.log('BUTTON NOT FOUND');
  });

  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
  console.log("Done.");
})();
