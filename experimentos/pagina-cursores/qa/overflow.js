// acha o que passa da largura da tela no celular
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const vp = { width: 390, height: 844 };
  const b = await chromium.launch({ args: ['--disable-3d-apis'] });
  const p = await (await b.newContext({ viewport: vp, isMobile: true, hasTouch: true })).newPage();
  await p.goto('file://' + path.resolve(__dirname, '../dist/jl-devs.html') + '?capture=1'); await p.waitForTimeout(400);
  const step = (ms) => p.evaluate(ms => { let l = ms; while (l > 0.01) { const d = Math.min(1000 / 60, l); window.__jl.step(d); l -= d; } }, ms);
  await step(7500);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  const seen = new Map();
  for (let y = 0; y <= H - vp.height; y += 120) {
    await p.evaluate(y => window.scrollTo(0, y), y); await step(160);
    const r = await p.evaluate(() => { const W = document.documentElement.clientWidth, sw = document.documentElement.scrollWidth; if (sw <= W + 1) return null; const out = []; for (const e of document.querySelectorAll('body *')) { if (e.closest('.hud')) continue; const b = e.getBoundingClientRect(); if (b.width && b.right > W + 2 && b.bottom > -200 && b.top < innerHeight + 200) { let clipped = false; for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a); if (/(hidden|clip|auto|scroll)/.test(cs.overflowX) && a.getBoundingClientRect().right <= W + 2) { clipped = true; break; } } if (!clipped) out.push((e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + (e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className).toString().split(' ').join('.')) + ' right=' + Math.round(b.right) + ' pos=' + getComputedStyle(e).position); } } return { sw, out: out.slice(0, 6) }; });
    if (r) for (const o of r.out) { const k = o.replace(/right=\d+/, ''); if (!seen.has(k)) seen.set(k, 'y=' + y + ' sw=' + r.sw + ' ' + o); }
  }
  console.log([...seen.values()].join('\n') || 'no overflow');
  // largura do título
  await p.evaluate(() => window.scrollTo(0, 0)); await step(300);
  console.log(JSON.stringify(await p.evaluate(() => { const t = document.getElementById('heroTitle'); const cs = getComputedStyle(t); const c = t.querySelector('span span, span'); return { fs: cs.fontSize, w: t.getBoundingClientRect().width, html: t.innerHTML.slice(0, 260), charDisplay: c ? getComputedStyle(c).display : null }; })));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
