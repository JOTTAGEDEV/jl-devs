// percorre a página inteira como uma pessoa rolando (sem WebGL, para ser rápido) e tira screenshots
// uso: node qa/walk.js m|d [passo em px]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const mode = process.argv[2] || 'm', stepPx = +(process.argv[3] || 0);
  const vp = mode === 'm' ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const b = await chromium.launch({ args: ['--disable-3d-apis'] });
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1, isMobile: mode === 'm', hasTouch: mode === 'm' });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.resolve(__dirname, '../dist/jl-devs.html') + '?capture=1'); await p.waitForTimeout(400);
  const step = (ms) => p.evaluate(ms => { let l = ms; while (l > 0.01) { const d = Math.min(1000 / 60, l); window.__jl.step(d); l -= d; } }, ms);
  const out = path.resolve(__dirname, 'out'); fs.mkdirSync(out, { recursive: true });
  for (const f of fs.readdirSync(out)) if (f.startsWith('walk_' + mode + '_')) fs.unlinkSync(path.join(out, f));
  await step(7500);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  const every = stepPx || Math.round(vp.height * 0.8); let n = 0, y = 0, overflow = 0;
  while (true) {
    await p.screenshot({ path: path.join(out, 'walk_' + mode + '_' + String(n++).padStart(2, '0') + '.png') });
    overflow = Math.max(overflow, await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth));
    if (y >= H - vp.height) break;
    const target = Math.min(H - vp.height, y + every);
    while (y < target) { y = Math.min(target, y + 60); await p.evaluate(y => window.scrollTo(0, y), y); await step(50); }
    await step(700);
  }
  console.log(mode, 'height', H, 'shots', n, 'h-overflow', overflow, 'errors:', errs.join(' | ') || 'none');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
