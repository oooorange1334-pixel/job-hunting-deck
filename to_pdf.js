const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const dir = '/Users/jujuliu/WorkBuddy/2026-07-20-10-06-41/求职直播演示稿';
  const fileUrl = 'file://' + path.join(dir, 'index.html');
  const out = path.join(dir, '求职直播演示稿.pdf');

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  // wait fonts
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(1500);

  // Override the deck: show every slide stacked, each 1920x1080, no scaling.
  await page.addStyleTag({ content: `
    html, body { margin:0 !important; padding:0 !important; background:#fff !important; }
    .stage { position:static !important; width:auto !important; height:auto !important; overflow:visible !important; transform:none !important; }
    .deck { position:static !important; left:auto !important; top:auto !important; transform:none !important; width:1920px !important; height:auto !important; }
    .slide { position:relative !important; display:flex !important; width:1920px !important; height:1080px !important; opacity:1 !important; visibility:visible !important; transform:none !important; page-break-after:always; break-after:page; overflow:hidden !important; }
    .slide.active { opacity:1 !important; }
    .nav { display:none !important; }
  `});
  await page.waitForTimeout(500);

  await page.pdf({
    path: out,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    pageRanges: '',
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();
  console.log('DONE', out);
})();
