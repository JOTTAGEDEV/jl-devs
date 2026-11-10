# Página de teste: "Você rola. A gente constrói."

Página de apresentação da JL Devs em que dois cursores, JG Dev e LC Dev, montam o site conforme a pessoa rola.
Fica tudo em um único arquivo HTML, sem dependências externas (fontes, imagens e shaders vão embutidos).

## Ver

No site ela é servida em `/obra/` (arquivo `public/obra/index.html`). Também abre direto no navegador, sem servidor.

## Alterar

- `src/index.html`, `src/styles.css`, `src/app.js`: marcação, estilos e animações.
- `src/studio.glsl` e `src/aurora.glsl`: shaders WebGL do logo de vidro e das fitas de luz.
- `python3 build.py` junta tudo em `dist/jl-devs.html` e copia para `public/obra/index.html`.
- `work/assets.py` recria as imagens de `assets/` a partir de `work/logo-src.png`.
- `work/fonts.py` recria `work/fonts.json` (as fontes embutidas).
- `qa/*.js` conferem a página com Playwright: `quick.js` e `contato.js` tiram screenshots; `cursores.js` confere a posição dos cursores no fim da página.

Os contatos de WhatsApp são os mesmos de `app/content.ts`.

## Estado

Primeira versão completa. Conferida no desktop (1440×900, Chromium) do início ao fim e, no celular (390×844), o time, a chamada final e o rodapé.
O restante da página ainda não foi conferido no celular. Os textos são rascunho.
