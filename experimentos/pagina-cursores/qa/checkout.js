const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch();
  for (const [n, vp] of [['d', { width: 1440, height: 900 }], ['m', { width: 390, height: 844 }]]) {
    const p = await (await b.newContext({ viewport: vp, isMobile: n === 'm', hasTouch: n === 'm' })).newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + path.resolve(__dirname, '../dist/checkout.html') + '?plano=completo');
    await p.waitForTimeout(1300); await p.screenshot({ path: path.resolve(__dirname, 'out/ck_' + n + '_1.png') });
    await p.waitForTimeout(3200); await p.screenshot({ path: path.resolve(__dirname, 'out/ck_' + n + '_2.png'), fullPage: n === 'm' });
    const out = [];
    for (const v of ['basico', 'medio', 'completo']) { await p.check('input[value=' + v + ']', { force: true }); out.push(await p.evaluate(() => [document.getElementById('pay').textContent, document.getElementById('pay').href, document.getElementById('rTotal').textContent, getComputedStyle(document.getElementById('rOffRow')).display].join(' | '))); }
    console.log(n, 'errors:', errs.join('|') || 'none', 'overflow', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth), '\n ' + out.join('\n '));
    await p.close();
  }
  await b.close();
})();
