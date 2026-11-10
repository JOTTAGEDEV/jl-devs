# Página de teste: "Você rola. A gente constrói."

Página de apresentação da JL Devs em que dois cursores, JG Dev e LC Dev, montam o site conforme a pessoa rola.
Fica tudo em um único arquivo HTML, sem dependências externas (fontes, imagens e shaders vão embutidos).

## Ver

Abra `dist/jl-devs.html` no navegador.

## Alterar

- `src/index.html`, `src/styles.css`, `src/app.js`: marcação, estilos e animações.
- `src/studio.glsl` e `src/aurora.glsl`: shaders WebGL do logo de vidro e das fitas de luz.
- `python3 build.py` junta tudo de novo em `dist/jl-devs.html`.
- `work/assets.py` recria as imagens de `assets/` a partir de `work/logo-src.png`.
- `work/fonts.py` recria `work/fonts.json` (as fontes embutidas).
- `qa/*.js` tiram screenshots com Playwright (`node qa/quick.js`).

## Estado

Primeira versão completa. Conferida no desktop (1440×900, Chromium) do início ao fim, sem erros de JavaScript.
Ainda falta conferir no celular e fazer o acabamento fino. Os textos são rascunho.
