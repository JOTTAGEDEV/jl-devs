const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--disable-3d-apis'] });
  for (const vp of [{ width: 390, height: 844 }, { width: 360, height: 740 }, { width: 320, height: 568 }, { width: 430, height: 932 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
    const p = await (await b.newContext({ viewport: vp, isMobile: vp.width < 800, hasTouch: vp.width < 800 })).newPage();
    await p.goto('file://' + path.resolve(__dirname, '../dist/jl-devs.html') + '?capture=1'); await p.waitForTimeout(300);
    await p.evaluate(() => { let l = 7500; while (l > 0.01) { window.__jl.step(16.667); l -= 16.667; } });
    console.log(vp.width + 'x' + vp.height, JSON.stringify(await p.evaluate(() => { const t = document.getElementById('heroTitle'); const fs = parseFloat(getComputedStyle(t).fontSize); const lines = [[]]; for (const n of t.childNodes) { if (n.nodeName === 'BR') lines.push([]); else lines[lines.length - 1].push(n); } const widths = lines.map(ns => { let w = 0; for (const n of ns) for (const c of (n.classList && n.classList.contains('ch') ? [n] : n.querySelectorAll('.ch'))) w += c.getBoundingClientRect().width; return Math.round(w); }); const tops = new Set([...t.querySelectorAll('.ch')].map(c => Math.round(c.getBoundingClientRect().top))); return { fs: +fs.toFixed(2), avail: Math.round(t.getBoundingClientRect().width), lineW: widths, emPerLine: widths.map(w => +(w / fs).toFixed(3)), rows: tops.size, titleH: Math.round(t.getBoundingClientRect().height) }; })));
    await p.close();
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
