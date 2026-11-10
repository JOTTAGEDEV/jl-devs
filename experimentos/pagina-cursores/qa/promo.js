// confere (sem WebGL) a abertura e os planos com a promoção, no desktop e no celular
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--disable-3d-apis'] });
  for (const [n, vp] of [['d', { width: 1440, height: 900 }], ['m', { width: 390, height: 844 }]]) {
    const p = await (await b.newContext({ viewport: vp, deviceScaleFactor: n === 'm' ? 2 : 1, isMobile: n === 'm', hasTouch: n === 'm' })).newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + path.resolve(__dirname, '../dist/jl-devs.html') + '?capture=1'); await p.waitForTimeout(300);
    const step = (ms) => p.evaluate(ms => { let l = ms; while (l > 0.01) { const d = Math.min(1000 / 60, l); window.__jl.step(d); l -= d; } }, ms);
    const shot = name => p.screenshot({ path: path.resolve(__dirname, 'out', 'promo_' + n + '_' + name + '.png') });
    await step(2300); await shot('1intro');
    await step(5200); await shot('2hero');
    const y = await p.evaluate(() => document.getElementById('planos').getBoundingClientRect().top + scrollY);
    const walkTo = async (t) => { let c = await p.evaluate(() => scrollY); c = Math.max(c, t - 2400); while (c < t) { c = Math.min(t, c + 60); await p.evaluate(y => window.scrollTo(0, y), c); await step(50); } await step(1500); };
    await walkTo(y - 60); await shot('3planos');
    if (n === 'm') { await walkTo(y + 560); await shot('4planos'); await walkTo(y + 1160); await shot('5planos'); }
    else { await walkTo(y + 260); await shot('4planos'); }
    console.log(n, 'errors:', errs.join('|') || 'none');
    await p.close();
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
