// confere o checkout: formulário, registro do pedido (com a API simulada) e ida ao Mercado Pago
const { chromium } = require('playwright'); const path = require('path'); const http = require('http'); const fs = require('fs');
(async () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../dist/checkout.html'));
  const srv = http.createServer((q, s) => { s.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); s.end(html); }).listen(0);
  const base = 'http://127.0.0.1:' + srv.address().port;
  const b = await chromium.launch();
  for (const [n, vp] of [['d', { width: 1440, height: 900 }], ['m', { width: 390, height: 844 }]]) {
    const p = await (await b.newContext({ viewport: vp, isMobile: n === 'm', hasTouch: n === 'm' })).newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    let posted = null, mode = 'ok', mp = null;
    await p.route('**/api/pedido', r => { posted = JSON.parse(r.request().postData()); mode === 'ok' ? r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"id":7}' }) : r.fulfill({ status: 500, contentType: 'application/json', body: '{"ok":false}' }); });
    await p.route('https://mpago.la/**', r => { mp = r.request().url(); r.fulfill({ status: 200, contentType: 'text/html', body: '<title>MP</title>' }); });
    await p.goto(base + '/checkout/?plano=completo'); await p.waitForTimeout(4600);
    const out = [];
    await p.click('#pay'); out.push('vazio → ' + await p.textContent('#fErr'));
    await p.fill('#fNome', 'Maria Silva'); await p.fill('#fWa', '123'); await p.click('#pay'); out.push('whatsapp curto → ' + await p.textContent('#fErr'));
    await p.fill('#fWa', '(48) 99999-1234'); await p.fill('#fMsg', 'Site para minha loja');
    await p.screenshot({ path: path.resolve(__dirname, 'out/ck_' + n + '_form.png'), fullPage: n === 'm' });
    mode = 'falha'; await p.click('#pay'); await p.waitForSelector('#fail:not([hidden])');
    out.push('falha → caixa visível, botão "' + await p.textContent('#pay') + '", WhatsApp ' + (await p.getAttribute('#failWa', 'href')).slice(0, 60) + '…, pagar ' + await p.getAttribute('#failPay', 'href') + ', sem ir ao MP: ' + (mp === null));
    await p.screenshot({ path: path.resolve(__dirname, 'out/ck_' + n + '_falha.png'), fullPage: n === 'm' });
    await p.check('input[value=basico]', { force: true });
    mode = 'ok'; posted = null; await Promise.all([p.waitForURL('https://mpago.la/**'), p.click('#pay')]);
    out.push('ok → enviado ' + JSON.stringify(posted) + ' → ' + mp);
    console.log(n, 'errors:', errs.join('|') || 'none', '\n ' + out.join('\n '));
    await p.close();
  }
  await b.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
