import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

(async () => {
  const outDir = 'public/images/gemini-picks';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log("Launching browser in dark mode...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1080 },
    colorScheme: 'dark'
  });
  const page = await context.newPage();

  console.log("Navigating to local dev server...");
  try {
    await page.goto('http://localhost:3000/', { timeout: 10000 });
  } catch {
    console.log("Failed port 3000, trying 3002...");
    await page.goto('http://localhost:3002/', { timeout: 10000 });
  }

  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.waitForTimeout(1500);

  // ===== Navigate to Hypothesis Testing Calculator =====
  console.log("Navigating to Hypothesis Testing...");
  const navBtn = page.locator('button').filter({ hasText: 'נסה את בדיקת ההשערות' }).first();
  if (await navBtn.isVisible().catch(() => false)) {
    await navBtn.click();
  }
  await page.waitForTimeout(2000);

  // ===== SHOT 01: Initial view (parameters + chart) =====
  console.log("01 - Parameters overview...");
  await page.screenshot({ path: path.join(outDir, '01-parameters-overview.png') });

  // ===== SHOT 02: Decision matrix table =====
  console.log("02 - Decision matrix table...");
  const tables = await page.locator('table').all();
  if (tables.length > 0) {
    await tables[0].scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await tables[0].screenshot({ path: path.join(outDir, '02-decision-matrix.png') });
  }

  // ===== SHOT 03: Chart =====
  console.log("03 - Distribution chart...");
  const chartEl = page.locator('.tour-step-graph').first();
  if (await chartEl.isVisible().catch(() => false)) {
    await chartEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await chartEl.screenshot({ path: path.join(outDir, '03-chart.png') });
  }

  // ===== EXPAND EVERYTHING =====
  // Step 1: Click the "הרחב הכל" button to expand the outer HT accordion via React state
  console.log("Expanding outer accordion via 'הרחב הכל' button...");
  const expandAllBtn = page.locator('button').filter({ hasText: 'הרחב הכל' }).first();
  if (await expandAllBtn.isVisible().catch(() => false)) {
    await expandAllBtn.click();
    await page.waitForTimeout(1500);
  }

  // Step 2: Fire the 'toggle-all-accordions' custom event that AnimatedDetails listens to
  // This opens ALL inner AnimatedDetails step accordions (steps 1-6 inside HT panel)
  console.log("Dispatching 'toggle-all-accordions' custom event to open all inner steps...");
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('toggle-all-accordions', { detail: { state: 'open' } }));
  });
  await page.waitForTimeout(1500);
  await page.waitForTimeout(1500);

  // ===== SHOT 04: Calculation phase – scroll to the accordion area and capture =====
  console.log("04 - Steps area (top)...");
  const accordionEl = page.locator('.tour-step-accordion-ht').first();
  if (await accordionEl.isVisible().catch(() => false)) {
    await accordionEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    // Scroll a bit past the header to show the expanded content
    await page.evaluate(() => window.scrollBy(0, 250));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, '04-steps-expanded.png') });
  }

  // ===== SHOT 05: Step 1 – ניסוח השערות =====
  console.log("05 - Step 1 (Hypothesis formulation)...");
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, '05-step1-hypotheses.png') });

  // ===== SHOT 06: Step 5 / 6 – calculation & conclusion =====
  console.log("06 - Conclusion (step 5/6)...");
  await page.evaluate(() => window.scrollBy(0, 3000));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, '06-conclusion-phase.png') });

  // ===== SHOT 07: Final conclusion area =====
  console.log("07 - Deep conclusion...");
  await page.evaluate(() => window.scrollBy(0, 1500));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, '07-deep-conclusion.png') });

  // ===== SHOT 00: Full page composite =====
  console.log("00 - Full page screenshot...");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, '00-full-page.png'), fullPage: true });

  console.log("Done! All screenshots saved.");
  await browser.close();
})();
