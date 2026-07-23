const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const dir = '/Users/jujuliu/WorkBuddy/2026-07-20-10-06-41/求职直播演示稿';
  const fileUrl = 'file://' + path.join(dir, 'index.html');
  const shotDir = path.join(dir, '_shots');
  fs.mkdirSync(shotDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.addStyleTag({ content: '.nav{display:none !important;}' });
  await page.waitForTimeout(1200);

  const count = await page.evaluate(() => document.querySelectorAll('.slide').length);
  console.log('slides:', count);

  for (let i = 0; i < count; i++) {
    await page.evaluate((idx) => {
      const slides = document.querySelectorAll('.slide');
      slides.forEach((s, j) => s.classList.toggle('active', j === idx));
      const deck = document.querySelector('.deck');
      // reset scale to 1, center-align to viewport
      deck.style.transform = 'translate(-50%, -50%) scale(1)';
    }, i);
    await page.waitForTimeout(250);
    const p = path.join(shotDir, String(i).padStart(3, '0') + '.png');
    await page.screenshot({ path: p });
  }
  await browser.close();
  console.log('SHOTS DONE');
})();
