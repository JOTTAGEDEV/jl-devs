// confere o fim da página (time, chamada final com WhatsApp e rodapé) no desktop e no celular
const { open } = require('./lib');
(async () => {
  for (const v of [{ n: 'd', width: 1440, height: 900 }, { n: 'm', width: 390, height: 844, mobile: true, dsf: 2 }]) {
    const s = await open(v);
    await s.step(7000);
    const pos = await s.page.evaluate(() => { const t = id => document.getElementById(id).getBoundingClientRect().top + scrollY; return { team: t('time'), cta: t('contato'), end: document.documentElement.scrollHeight - innerHeight }; });
    let t0 = Date.now(); const lap = n => { console.log(v.n, n, Date.now() - t0, 'ms'); t0 = Date.now(); };
    const go = async (y, ms) => { await s.page.evaluate(y => window.scrollTo(0, y), y); await s.step(ms, 1000 / 30); };
    const shot = n => s.shot(n, { timeout: 150000 });
    await go(pos.team - 40, 1600); lap('scroll'); await shot('contato_' + v.n + '_1time'); lap('shot');
    if (v.mobile) { await go(pos.team + 520, 1400); await shot('contato_' + v.n + '_1time_b'); }
    await go(pos.cta, 2600); lap('scroll cta'); await shot('contato_' + v.n + '_2cta'); lap('shot');
    await go(pos.end, 2200); await shot('contato_' + v.n + '_3fim'); lap('fim');
    const links = await s.page.evaluate(() => [...document.querySelectorAll('a[href*="wa.me"]')].map(a => ({ t: a.textContent.trim().replace(/\s+/g, ' '), h: a.href.slice(0, 34), w: Math.round(a.getBoundingClientRect().width), ok: a.target === '_blank' })));
    const overflow = await s.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(v.n, 'errors:', s.errors.filter(e => !/GL Driver/.test(e)).join('|') || 'none', 'h-overflow:', overflow, JSON.stringify(links));
    await s.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
