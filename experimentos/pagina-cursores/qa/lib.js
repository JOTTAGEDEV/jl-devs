// Deterministic driver: the page runs in ?capture mode and only advances when we call __jl.step(ms)
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.resolve(__dirname, '../dist/jl-devs.html');

async function open({ width = 1440, height = 900, dsf = 1, mobile = false, query = '?capture=1', reduced = false } = {}) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dsf, isMobile: mobile, hasTouch: mobile, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto(FILE + query);
  await page.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))]));
  await page.waitForTimeout(120);
  const api = {
    browser, page, errors,
    async step(ms, dt = 1000 / 60) {
      await page.evaluate(([ms, dt]) => { let left = ms; while (left > 0.01) { const d = Math.min(dt, left); window.__jl.step(d); left -= d; } }, [ms, dt]);
    },
    async scroll(y, settle = 900) { await page.evaluate(y => window.scrollTo(0, y), y); await api.step(settle); },
    async shot(name, opts = {}) { const p = path.resolve(__dirname, 'out', name + '.png'); await page.screenshot({ path: p, ...opts }); return p; },
    async close() { await browser.close(); }
  };
  return api;
}
module.exports = { open, FILE };
