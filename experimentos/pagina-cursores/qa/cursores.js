// sonda sem WebGL (rápida): onde estão os cursores no time e na chamada final
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  for (const [label, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const b = await chromium.launch({ args: ['--disable-3d-apis'] });
    const p = await b.newPage({ viewport: vp, isMobile: label === 'mobile', hasTouch: label === 'mobile' });
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto('file://' + path.resolve(__dirname, '../dist/jl-devs.html') + '?capture=1'); await p.waitForTimeout(400);
    const step = (ms) => p.evaluate(ms => { let l = ms; while (l > 0.01) { const d = Math.min(1000 / 60, l); window.__jl.step(d); l -= d; } }, ms);
    const g = () => p.evaluate(() => { const r = id => { const e = document.getElementById(id); const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; }; const o = id => document.getElementById(id).style.opacity; return { jg: r('curJG'), lc: r('curLC'), op: [o('curJG'), o('curLC')], bigJG: r('bigJG'), bigLC: r('bigLC'), btn: r('ctaBtn'), btn2: r('ctaBtn2'), chip: document.getElementById('chipTxt').textContent }; });
    await step(7500);
    const pos = await p.evaluate(() => { const t = id => document.getElementById(id).getBoundingClientRect().top + scrollY; return { team: t('time'), cta: t('contato'), H: document.documentElement.scrollHeight }; });
    // percorre a página inteira primeiro (como uma pessoa rolando) para pegar erros no caminho
    for (let y = 0; y < pos.team; y += 300) { await p.evaluate(y => window.scrollTo(0, y), y); await step(120); }
    for (const off of [-500, -300, -40, 150]) { await p.evaluate(y => window.scrollTo(0, y), pos.team + off); await step(1800); const r = await g(); console.log(label, 'TEAM' + off, JSON.stringify({ jg: r.jg.slice(0, 2), lc: r.lc.slice(0, 2), bigJG: r.bigJG, bigLC: r.bigLC, chip: r.chip })); }
    await p.evaluate(y => window.scrollTo(0, y), pos.cta); await step(3000);
    console.log(label, 'CTA ', JSON.stringify(await g()), errs.join('|') || 'no errors');
    await b.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
