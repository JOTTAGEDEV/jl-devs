/* ==========================================================================
 * obra-video.js — a obra evoluindo com o scroll, a partir de um VÍDEO renderizado
 * --------------------------------------------------------------------------
 * Mesmo contrato do obra.js (o app.js escolhe um ou outro por `obra.modo`):
 *
 *   createObra(canvas, { quality, video: { src, srcMobile, srcRetrato, poster, posterRetrato, foco } })
 *     -> { setProgress(p), resize(), start(), stop(), dispose(), ready, stages: 6 }
 *
 * Como funciona
 *  - Desenha o poster no canvas na hora (ready resolve com ele na tela).
 *  - Baixa o MP4 inteiro em memória (blob) e só então passa a "esfregar" o vídeo
 *    pela rolagem: buscas em memória são instantâneas. O vídeo usa keyframe a cada
 *    4 quadros, o que mantém cada busca leve.
 *  - Cada busca concluída ("seeked") desenha o quadro no canvas com cover. Em telas
 *    estreitas o recorte centraliza em `foco` (fração da largura/altura do vídeo).
 *  - Sem vídeo (erro de rede/codec), o poster continua na tela.
 * ========================================================================== */

/** Etapas (mesmas faixas do obra.js; o vídeo foi renderizado com elas). */
export const ETAPAS = [
  { id: 'terreno', de: 0.0, ate: 0.16 },
  { id: 'fundacao', de: 0.16, ate: 0.33 },
  { id: 'estrutura', de: 0.33, ate: 0.52 },
  { id: 'vedacoes', de: 0.52, ate: 0.7 },
  { id: 'acabamentos', de: 0.7, ate: 0.88 },
  { id: 'entrega', de: 0.88, ate: 1.0 },
];

const FPS = 30;

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function progressoValido(p) { const n = Number(p); return Number.isFinite(n) ? clamp01(n) : 0; }
function criarPromessa() {
  let resolver, rejeitar;
  const promessa = new Promise((res, rej) => { resolver = res; rejeitar = rej; });
  promessa.catch(() => {});
  return { promessa, resolver, rejeitar };
}

export function createObra(canvas, opcoes = {}) {
  const cfg = opcoes.video || {};
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  const pronto = criarPromessa();
  const nada = () => {};
  if (!ctx || !cfg.src) {
    pronto.rejeitar(new Error('obra-video.js: canvas 2D ou `video.src` indisponível.'));
    return { setProgress: nada, resize: nada, start: nada, stop: nada, dispose: nada, ready: pronto.promessa, stages: 6 };
  }

  const baixa = opcoes.quality === 'low';
  const dprMax = baixa ? 1.25 : 2;
  const foco = Array.isArray(cfg.foco) ? cfg.foco.slice() : [0.5, 0.5];
  let p = 0, ativo = false, raf = 0, descartado = false;
  let poster = null, videoPronto = false, buscando = false, urlBlob = '';
  let ultimo = null; // última imagem desenhada (poster ou vídeo), para redesenhar no resize

  // <video> fora da tela (no DOM para o Safari decodificar os quadros)
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.preload = 'auto';
  video.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;left:0;top:0';
  (canvas.parentNode || document.body).appendChild(video);

  function cover(img, iw, ih) {
    const cw = canvas.width, ch = canvas.height;
    if (!iw || !ih || !cw || !ch) return;
    const e = Math.max(cw / iw, ch / ih);
    const dw = iw * e, dh = ih * e;
    // centraliza no ponto focal quando há recorte, sem deixar borda vazia
    const x = Math.min(0, Math.max(cw - dw, cw / 2 - foco[0] * dw));
    const y = Math.min(0, Math.max(ch - dh, ch / 2 - foco[1] * dh));
    ctx.drawImage(img, x, y, dw, dh);
  }
  function desenhar(origem) {
    if (descartado) return;
    if (origem === video) cover(video, video.videoWidth, video.videoHeight);
    else if (origem) cover(origem, origem.naturalWidth || origem.width, origem.naturalHeight || origem.height);
    ultimo = origem;
  }

  function resize() {
    if (descartado) return;
    const dpr = Math.min(window.devicePixelRatio || 1, dprMax);
    const w = Math.max(1, Math.round((canvas.clientWidth || window.innerWidth) * dpr));
    const h = Math.max(1, Math.round((canvas.clientHeight || window.innerHeight) * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    if (ultimo) desenhar(ultimo);
  }

  /* ----------------------------- busca pela rolagem ---------------------------- */
  function tempoAlvo() { return Math.min(Math.max(0, video.duration - 0.001), p * video.duration); }
  function talvezBuscar() {
    if (!videoPronto || buscando || descartado) return;
    const t = tempoAlvo();
    if (Math.abs(video.currentTime - t) > 0.5 / FPS) { buscando = true; video.currentTime = t; }
  }
  video.addEventListener('seeked', () => {
    buscando = false;
    desenhar(video);
    talvezBuscar(); // a rolagem pode ter andado enquanto buscava
  });
  function laco() { raf = 0; talvezBuscar(); }
  function agendar() { if (ativo && !raf && !descartado) raf = requestAnimationFrame(laco); }

  /* --------------------------------- carga ------------------------------------ */
  const imgPoster = new Image();
  imgPoster.decoding = 'async';
  imgPoster.onload = () => {
    poster = imgPoster;
    resize();
    if (!videoPronto) desenhar(poster);
    pronto.resolver();
  };
  imgPoster.onerror = () => { if (!videoPronto) pronto.rejeitar(new Error('obra-video.js: poster indisponível.')); };
  // Tela em pé usa o vídeo vertical (enquadrado para o celular), se houver.
  const emPe = (canvas.clientHeight || window.innerHeight) > (canvas.clientWidth || window.innerWidth) * 1.15;
  const retrato = emPe && cfg.srcRetrato;
  if (retrato) foco[0] = foco[1] = 0.5;
  const posterUrl = retrato && cfg.posterRetrato ? cfg.posterRetrato : cfg.poster;
  if (posterUrl) imgPoster.src = posterUrl;
  if (retrato && cfg.posterRetrato && cfg.poster) {
    imgPoster.onerror = () => { imgPoster.onerror = null; imgPoster.src = cfg.poster; };
  }

  const largura = Math.max(window.innerWidth, window.innerHeight) * Math.min(window.devicePixelRatio || 1, dprMax);
  const candidatos = (retrato ? [cfg.srcRetrato, cfg.srcMobile, cfg.src]
    : !baixa && largura > 1400 ? [cfg.src, cfg.srcMobile] : [cfg.srcMobile, cfg.src]).filter(Boolean);
  const baixar = (i) => fetch(candidatos[i])
    .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.blob(); })
    .catch((e) => { if (i + 1 < candidatos.length) return baixar(i + 1); throw e; });
  baixar(0)
    .then((b) => new Promise((ok, falha) => {
      if (descartado) return;
      urlBlob = URL.createObjectURL(b);
      video.onloadeddata = () => { video.onloadeddata = video.onerror = null; ok(); };
      video.onerror = () => { video.onloadeddata = video.onerror = null; falha(new Error('vídeo não decodificável')); };
      video.src = urlBlob;
      video.load();
    }))
    .then(() => {
      if (descartado) return;
      // destrava a decodificação em navegadores móveis (play/pause mudo)
      const pp = video.play();
      if (pp && pp.then) pp.then(() => video.pause()).catch(() => {});
      else video.pause();
      videoPronto = true;
      resize();
      desenhar(video); // quadro inicial já decodificado
      talvezBuscar();  // e vai para a posição atual da rolagem
      if (!poster) pronto.resolver();
    })
    .catch((e) => {
      console.warn('[obra-video] mantendo o poster:', e);
      if (!poster && !cfg.poster) pronto.rejeitar(e);
    });

  resize();

  return {
    setProgress(v) {
      const np = progressoValido(v);
      if (np === p) return;
      p = np;
      if (ativo) agendar(); else talvezBuscar();
    },
    resize,
    start() { if (ativo || descartado) return; ativo = true; agendar(); },
    stop() { ativo = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } },
    dispose() {
      if (descartado) return;
      descartado = true;
      ativo = false;
      if (raf) cancelAnimationFrame(raf);
      video.removeAttribute('src');
      try { video.load(); } catch (_) { /* ignora */ }
      video.remove();
      if (urlBlob) URL.revokeObjectURL(urlBlob);
    },
    ready: pronto.promessa,
    stages: 6,
  };
}

export default createObra;
