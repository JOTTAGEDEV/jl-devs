const { open } = require('./lib');
(async () => {
  const s = await open({ width: 1440, height: 900 });
  await s.step(7000);
  const H = await s.page.evaluate(() => document.documentElement.scrollHeight);
  const n = 12; const out = [];
  for (let i = 0; i < n; i++) { const y = Math.round((H - 900) * i / (n - 1)); await s.scroll(y, 1200); out.push(await s.shot('quick_' + String(i).padStart(2, '0'))); }
  console.log('height', H, 'errors:', s.errors.length ? s.errors.slice(0, 8).join('\n') : 'none');
  await s.close();
})().catch(e => { console.error(e); process.exit(1); });
