#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:1313';
const ROOT = path.join(__dirname, '..');

// North American standard business card size
const CARD_SIZE = { width: '3.5in', height: '2in' };
const NO_MARGIN = { top: '0', bottom: '0', left: '0', right: '0' };

const CARDS = [{
  lang: 'en',
  url: `${BASE_URL}/card`,
  outputDir: path.join(ROOT, 'content', 'en'),
  filename: 'card.pdf'
}, {
  lang: 'fr',
  url: `${BASE_URL}/fr/card`,
  outputDir: path.join(ROOT, 'content', 'fr'),
  filename: 'card.pdf'
}];

async function printCards() {
  const browser = await chromium.launch({ headless: true });

  try {
    for (const { lang, url, outputDir, filename } of CARDS) {
      console.log(`Printing ${lang.toUpperCase()} business card from ${url}...`);
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle' });

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputPath = path.join(outputDir, filename);
      await page.pdf({
        path: outputPath,
        width: CARD_SIZE.width,
        height: CARD_SIZE.height,
        printBackground: true,
        margin: NO_MARGIN,
      });

      await page.close();
      console.log(`  Saved: ${outputPath}`);
    }
  } finally {
    await browser.close();
  }
}

printCards().catch(err => {
  console.error(err);
  process.exit(1);
});
