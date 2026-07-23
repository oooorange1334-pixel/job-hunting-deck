const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const dir = '/Users/jujuliu/WorkBuddy/2026-07-20-10-06-41/求职直播演示稿';
  const fileUrl = 'file://' + path.join(dir, 'index.html');
  const shotsDir = path.join(dir, '_pdfshots');
  if (!fs.existsSync(shotsDir)) fs.mkdirSync(shotsDir);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(2000);

  // 获取总页数
  const total = await page.evaluate(() => document.querySelectorAll('.slide').length);
  console.log('总页数:', total);

  // 逐页激活并截图
  for (let i = 0; i < total; i++) {
    await page.evaluate((idx) => {
      const slides = document.querySelectorAll('.slide');
      slides.forEach((s, j) => s.classList.toggle('active', j === idx));
      // 确保 deck 居中显示这一页
      const deck = document.querySelector('.deck');
      if (deck) deck.style.transform = 'translate(-50%,-50%) scale(1)';
    }, i);
    await page.waitForTimeout(400);
    const out = path.join(shotsDir, `p${String(i + 1).padStart(2, '0')}.png`);
    await page.screenshot({ path: out, fullPage: false, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
    process.stdout.write('.');
  }
  console.log('\n截图完成');

  // 用 pdf-lib 把所有 PNG 合成多页 PDF
  const { PDFDocument } = require('pdf-lib');
  const out = path.join(dir, '求职直播演示稿.pdf');
  const files = fs.readdirSync(shotsDir).filter(f => f.endsWith('.png')).sort();
  const imgs = files.map(f => path.join(shotsDir, f));
  console.log('生成PDF, 图片数:', imgs.length);
  const pdfDoc = await PDFDocument.create();
  for (const f of imgs) {
    const pngBytes = fs.readFileSync(f);
    const pngImg = await pdfDoc.embedPng(pngBytes);
    const pg = pdfDoc.addPage([1920, 1080]);
    pg.drawImage(pngImg, { x: 0, y: 0, width: 1920, height: 1080 });
  }
  fs.writeFileSync(out, await pdfDoc.save());
  console.log('DONE', out);

  await browser.close();
})();
