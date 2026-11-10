# Página de teste: "Você rola. A gente constrói."

Página de apresentação da JL Devs em que dois cursores, JG Dev e LC Dev, montam o site conforme a pessoa rola.
Fica tudo em um único arquivo HTML, sem dependências externas (fontes, imagens e shaders vão embutidos).

## Ver

É a home do site (`public/index.html`). Também abre direto no navegador, sem servidor.
A versão anterior do site continua em `/classico`, e `/obra/` redireciona para a home.

## Checkout

`src/checkout.html` vira `public/checkout/index.html` (`/checkout/`). A pessoa escolhe o plano, o recibo se atualiza e o botão abre o link de pagamento do Mercado Pago daquele plano.
Os links e os preços ficam no objeto `PLANS`, no fim de `src/checkout.html`. Se mudar um preço, troque também o link no Mercado Pago e os recibos de `src/index.html`.
Os botões "Quero este" da home levam para `/checkout/?plano=basico|medio|completo`.

## Alterar

- `src/index.html`, `src/styles.css`, `src/app.js`: marcação, estilos e animações.
- `src/studio.glsl` e `src/aurora.glsl`: shaders WebGL do logo de vidro e das fitas de luz.
- `python3 build.py` junta tudo em `dist/jl-devs.html` e copia para `public/index.html`.
- `work/assets.py` recria as imagens de `assets/` a partir de `work/logo-src.png`.
- `work/fonts.py` recria `work/fonts.json` (as fontes embutidas).
- `qa/*.js` conferem a página com Playwright: `walk.js` percorre tudo (celular ou desktop), `promo.js`, `contato.js` e `checkout.js` tiram screenshots de trechos, `overflow.js` e `title.js` medem o layout no celular e `cursores.js` confere a posição dos cursores no fim da página.

Os contatos de WhatsApp são os mesmos de `app/content.ts`.

## Estado

Conferida no desktop (1440×900) e no celular (390×844) do início ao fim, sem erros de JavaScript e sem rolagem horizontal.
Os textos são rascunho.
