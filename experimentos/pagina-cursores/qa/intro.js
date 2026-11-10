const { open } = require('./lib');
(async () => {
  const s = await open({ width: 1440, height: 900 });
  let now = 0;
  const times = [900, 1450, 2000, 2500, 3000, 3500, 4100, 4700, 5300, 6400];   // ms since page start (intro starts at 620)
  for (const t of times) { await s.step(t - now); now = t; await s.shot('intro_' + String(t).padStart(5, '0')); }
  console.log('errors:', s.errors.length ? s.errors.join('\n') : 'none');
  console.log(JSON.stringify(await s.page.evaluate(() => ({ noGl: document.documentElement.classList.contains('no-gl'), introDone: window.__jl.S.introDone, G: window.__jl.G.hero }))));
  await s.close();
})().catch(e => { console.error(e); process.exit(1); });
