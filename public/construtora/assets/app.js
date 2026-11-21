/* ==========================================================================
   ARQUEN — app.js (sem build, IIFE)
   Hidrata o HTML a partir de window.SITE (config.js), liga a cena da obra
   (obra.js) ao scroll, movimento (GSAP/ScrollTrigger/Lenis) e interações.
   Tudo degrada com elegância: sem SITE, sem obra.js, sem GSAP ou sem WebGL,
   a página continua legível e navegável.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     0. Utilidades
     ------------------------------------------------------------------ */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad2 = (n) => String(n).padStart(2, '0');

  /** Lê um caminho "a.b.c" de um objeto sem explodir. */
  const get = (obj, path, fallback) => {
    try {
      const v = path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
      return v == null || v === '' ? fallback : v;
    } catch (_) { return fallback; }
  };

  /** Cria elemento com atributos/filhos de forma segura (sem innerHTML com dados). */
  const el = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (v == null || v === false) return;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v; // só para markup próprio, nunca dados
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? '' : v);
    });
    (Array.isArray(children) ? children : [children]).forEach((c) => {
      if (c == null) return;
      node.append(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  };

  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  /* ------------------------------------------------------------------
     1. Ambiente e flags
     ------------------------------------------------------------------ */
  const html = document.documentElement;
  html.classList.remove('no-js');
  html.classList.add('js');

  const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mqFine = window.matchMedia('(pointer: fine)');
  const mqDesktop = window.matchMedia('(min-width: 900px)');
  const mqExpDesktop = window.matchMedia('(min-width: 1024px) and (hover: hover)');

  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const REDUCED = mqReduced.matches || !hasGsap; // sem GSAP tratamos como experiência estática
  if (REDUCED) html.classList.add('reduced');

  // 'low' para tudo que não é desktop folgado: tela estreita, toque como ponteiro
  // principal (celular deitado / tablet), até 4 núcleos ou até 4 GB.
  const lowPower = window.innerWidth < 768
    || window.matchMedia('(pointer: coarse)').matches
    || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
    || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  const QUALITY = lowPower ? 'low' : 'high';

  const SITE = (typeof window.SITE === 'object' && window.SITE) ? window.SITE : {};

  /* Dados de reserva (espelham o markup) usados quando SITE não traz o campo. */
  const FALLBACK = {
    etapas: [
      { id: 'terreno', nome: 'Terreno', texto: 'Leitura do terreno, topografia e orientação solar antes do primeiro traço.' },
      { id: 'fundacao', nome: 'Fundação', texto: 'Gabarito, escavação e esperas de ferro: a casa começa invisível, abaixo do solo.' },
      { id: 'estrutura', nome: 'Estrutura', texto: 'Pilares, vigas e lajes de concreto sobem com andaimes e formas.' },
      { id: 'vedacoes', nome: 'Vedações & cobertura', texto: 'Paredes fecham os volumes, a cobertura protege e as aberturas ganham lugar.' },
      { id: 'acabamentos', nome: 'Acabamentos', texto: 'Fachada, esquadrias de vidro, ripado de madeira e revestimentos.' },
      { id: 'entrega', nome: 'Entrega', texto: 'Paisagismo, calçamento e as chaves na mão. A obra vira casa.' }
    ],
    projetos: [
      {
        slug: 'casa-horizonte', nome: 'Casa Horizonte', tipo: 'Residência unifamiliar', local: 'Conceito', status: 'Conceito', ano: 'Conceito',
        resumo: 'Dois volumes brancos em balanço sobre um terreno em declive, abertos para o pôr do sol.',
        descricao: 'O programa se organiza em dois pavimentos: social e serviços no térreo, íntimo no volume superior, que avança em balanço para criar a varanda coberta. Faixas de vidro escuro emolduram a paisagem; um ripado de madeira filtra a luz da tarde.\n\nA implantação preserva as árvores existentes e usa o desnível para esconder a garagem.',
        ficha: [
          { rotulo: 'Tipologia', valor: 'Residência unifamiliar' },
          { rotulo: 'Pavimentos', valor: '2' },
          { rotulo: 'Sistema', valor: 'Concreto armado e alvenaria' },
          { rotulo: 'Status', valor: 'Conceito' }
        ],
        capa: { src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=70', alt: 'Casa modernista de dois pavimentos com volumes brancos e fachada de vidro ao entardecer' },
        galeria: [
          { src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=70', alt: 'Sala integrada com grandes aberturas de vidro para o jardim' },
          { src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=70', alt: 'Residência com volume revestido em madeira e portão escuro' },
          { src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=70', alt: 'Casa branca de dois pavimentos com piscina sob céu limpo' }
        ]
      },
      {
        slug: 'edificio-vertice', nome: 'Edifício Vértice', tipo: 'Residencial vertical', local: 'Conceito', status: 'Conceito', ano: 'Conceito',
        resumo: 'Varandas em balanço alternadas desenham uma fachada que muda com a luz.',
        descricao: 'Um edifício residencial de lâmina estreita, com varandas que se alternam a cada pavimento e criam sombra para o andar de baixo. A estrutura em concreto aparente fica legível na fachada; o embasamento abriga áreas comuns e comércio de rua.\n\nO térreo é permeável: passagem pública, jardim e acesso independente para as lojas.',
        ficha: [
          { rotulo: 'Tipologia', valor: 'Residencial vertical' },
          { rotulo: 'Pavimentos', valor: '12' },
          { rotulo: 'Sistema', valor: 'Concreto aparente e vidro' },
          { rotulo: 'Status', valor: 'Conceito' }
        ],
        capa: { src: 'https://images.unsplash.com/photo-1481253127861-534498168948?auto=format&fit=crop&w=1600&q=70', alt: 'Fachada de edifício residencial branco com varandas em balanço contra céu azul' },
        galeria: [
          { src: 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&w=1600&q=70', alt: 'Torres de vidro e concreto vistas de baixo em contraluz' },
          { src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=70', alt: 'Torres corporativas de vidro escuro vistas de baixo' },
          { src: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1600&q=70', alt: 'Edifício de volumes brancos e vidro visto de baixo' }
        ]
      },
      {
        slug: 'sede-aurora', nome: 'Sede Aurora', tipo: 'Corporativo', local: 'Conceito', status: 'Conceito', ano: 'Conceito',
        resumo: 'Uma sede corporativa de volumes brancos deslocados, pensada em torno de um pátio de luz.',
        descricao: 'Quatro pavimentos organizados ao redor de um átrio aberto que leva luz natural ao miolo dos escritórios. Os volumes se deslocam para criar terraços e marquises; o revestimento claro reflete o céu e muda de tom ao longo do dia.\n\nO projeto prevê etapas de obra com a operação do cliente mantida.',
        ficha: [
          { rotulo: 'Tipologia', valor: 'Corporativo' },
          { rotulo: 'Pavimentos', valor: '4' },
          { rotulo: 'Sistema', valor: 'Estrutura metálica e painéis' },
          { rotulo: 'Status', valor: 'Conceito' }
        ],
        capa: { src: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1600&q=70', alt: 'Edifício corporativo de volumes brancos e vidro visto de baixo' },
        galeria: [
          { src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=70', alt: 'Interior de escritório com divisórias de vidro e piso claro' },
          { src: 'https://images.unsplash.com/photo-1481253127861-534498168948?auto=format&fit=crop&w=1600&q=70', alt: 'Fachada branca com varandas em balanço' },
          { src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=70', alt: 'Casa branca de linhas retas com piscina e vegetação' }
        ]
      }
    ]
  };

  const ETAPAS = Array.isArray(SITE.etapas) && SITE.etapas.length === 6 ? SITE.etapas : FALLBACK.etapas;
  const PROJETOS = Array.isArray(SITE.projetos) && SITE.projetos.length ? SITE.projetos : FALLBACK.projetos;

  /* Estado compartilhado entre módulos */
  const state = {
    lenis: null,
    obra: null,
    progress: 0,
    stage: -1,
    heroTrigger: null,
    overlayOpen: false
  };

  /* ------------------------------------------------------------------
     2. Tema (cores de SITE.cores → variáveis CSS)
     ------------------------------------------------------------------ */
  function applyTheme() {
    const cores = SITE.cores || {};
    ['paper', 'ink', 'concrete', 'stone', 'sand', 'brass', 'night'].forEach((k) => {
      if (typeof cores[k] === 'string' && /^#[0-9a-f]{3,8}$/i.test(cores[k])) {
        html.style.setProperty('--' + k, cores[k]);
      }
    });
    const meta = $('meta[name="theme-color"]');
    if (meta && cores.ink) meta.setAttribute('content', cores.ink);
  }

  /* ------------------------------------------------------------------
     3. Imagens — srcset Unsplash, placeholder, fade-in, erro silencioso
     ------------------------------------------------------------------ */
  const WIDTHS = [480, 800, 1200, 1600, 2000];

  function unsplashSrcset(url) {
    if (!/images\.unsplash\.com/.test(url) || !/[?&]w=\d+/.test(url)) return '';
    return WIDTHS.map((w) => url.replace(/([?&])w=\d+/, '$1w=' + w) + ' ' + w + 'w').join(', ');
  }

  /** Define `sizes` conforme o contexto de layout da imagem. */
  function sizesFor(img) {
    if (img.closest('.projeto')) return '(min-width: 900px) 60vw, 100vw';
    if (img.closest('.hgal')) return '(min-width: 900px) 70vw, 80vw'; // ~69vw de coluna (e a foto ainda leva scale 1.15)
    if (img.closest('.exp')) return '(min-width: 1024px) 22vw, 100vw';
    if (img.closest('.expertise__float')) return '22vw';
    if (img.closest('.overlay__galeria')) return '(min-width: 900px) 58vw, 100vw';
    if (img.closest('.imersivo__rev--tall')) return '(min-width: 900px) 58vw, 100vw';
    if (img.closest('.imersivo__rev')) return '(min-width: 900px) 42vw, 100vw'; // coluna de 5/12
    return '100vw';
  }

  /** Liga load/error ao contêiner .media (fade-in / bloco de cor). */
  function wireMedia(img) {
    const box = img.closest('.media') || img.parentElement;
    if (!box || img.dataset.wired) return;
    img.dataset.wired = '1';
    const ok = () => { box.classList.add('is-loaded'); box.classList.remove('is-broken'); };
    const bad = () => { box.classList.remove('is-loaded'); box.classList.add('is-broken'); };
    img.addEventListener('load', ok, { once: true });
    img.addEventListener('error', bad, { once: true });
    if (img.complete && img.naturalWidth > 0) ok();
    else if (img.complete && img.currentSrc && img.naturalWidth === 0) bad();
  }

  function prepImage(img, { eager = false } = {}) {
    const src = img.getAttribute('src') || '';
    if (src && !img.getAttribute('srcset')) {
      const ss = unsplashSrcset(src);
      if (ss) { img.setAttribute('srcset', ss); img.setAttribute('sizes', sizesFor(img)); }
    }
    if (eager) { img.loading = 'eager'; img.setAttribute('fetchpriority', 'high'); }
    else if (!img.getAttribute('loading')) img.loading = 'lazy';
    if (!img.getAttribute('decoding')) img.decoding = 'async';
    wireMedia(img);
  }

  /** Cria uma figura .media a partir de {src, alt}. */
  function mediaFrom(obj, { className = '', eager = false, tag = 'div' } = {}) {
    const box = el(tag, { class: ('media ' + className).trim() });
    const img = el('img', { src: get(obj, 'src', ''), alt: get(obj, 'alt', ''), loading: eager ? 'eager' : 'lazy', decoding: 'async' });
    box.append(img);
    return { box, img };
  }

  function prepAllImages() {
    $$('img', document).forEach((img) => prepImage(img));
  }

  /* ------------------------------------------------------------------
     4. Hidratação a partir de SITE
     ------------------------------------------------------------------ */
  function hydrateTextBinds() {
    $$('[data-bind]').forEach((node) => {
      const v = get(SITE, node.dataset.bind);
      if (typeof v === 'string') node.textContent = v;
    });
    const titulo = get(SITE, 'seo.titulo');
    if (titulo) document.title = titulo;
    const desc = get(SITE, 'seo.descricao');
    if (desc) { const m = $('meta[name="description"]'); if (m) m.setAttribute('content', desc); }
    const nome = get(SITE, 'marca.nome');
    if (nome) $$('.nav__brand').forEach((a) => a.setAttribute('aria-label', nome + ' — início'));
    // Descritor curto ao lado do logo: nomeCompleto sem o nome ("Construtora & Incorporadora")
    const completo = get(SITE, 'marca.nomeCompleto');
    const tag = $('.nav__tag');
    if (tag && nome && completo) {
      const resto = completo.toLowerCase().startsWith(nome.toLowerCase()) ? completo.slice(nome.length).trim() : '';
      if (resto) tag.textContent = resto; else tag.hidden = true;
    }
  }

  /** Tenta inserir o logo SVG inline (mantém o wordmark em texto se falhar). */
  async function hydrateLogo() {
    const slot = $('[data-logo]');
    if (!slot || typeof fetch !== 'function') return;
    try {
      const res = await fetch('/construtora/assets/logo.svg', { cache: 'force-cache' });
      if (!res.ok) return;
      const txt = (await res.text()).trim();
      const start = txt.indexOf('<svg');
      if (start < 0) return;
      const tpl = document.createElement('template');
      tpl.innerHTML = txt.slice(start);
      const svg = tpl.content.querySelector('svg');
      if (!svg) return;
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      svg.removeAttribute('width'); svg.removeAttribute('height');
      const word = slot.querySelector('.nav__wordmark');
      if (word) word.classList.add('sr-only');
      slot.prepend(svg);
    } catch (_) { /* fica o texto */ }
  }

  function hydrateHero() {
    const t = get(SITE, 'hero.titulo');
    const h1 = $('#hero-titulo');
    if (t && h1 && h1.textContent.replace(/\s+/g, ' ').trim() !== t.trim()) {
      h1.textContent = t; // splitLines refaz as máscaras
    }
    const btns = $$('.hero__actions a');
    if (btns[0]) btns[0].textContent = get(SITE, 'hero.ctaPrimario', btns[0].textContent);
    if (btns[1]) btns[1].textContent = get(SITE, 'hero.ctaSecundario', btns[1].textContent);

    // Rótulos das etapas
    $$('.stage').forEach((b, i) => {
      const lab = b.querySelector('.stage__label');
      if (lab && ETAPAS[i]) lab.textContent = ETAPAS[i].nome;
    });
  }

  function hydrateManifesto() {
    const pars = get(SITE, 'manifesto.paragrafos');
    const copy = $('[data-list="manifesto.paragrafos"]');
    if (Array.isArray(pars) && pars.length && copy) {
      copy.replaceChildren(...pars.map((p, i) => el('p', { class: i === 0 ? 'lead' : '', text: p })));
    }
    const pil = get(SITE, 'manifesto.pilares');
    const list = $('[data-list="manifesto.pilares"]');
    if (Array.isArray(pil) && pil.length && list) {
      const roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];
      list.replaceChildren(...pil.map((p, i) => el('li', { class: 'pilar' }, [
        el('span', { class: 'mono pilar__num', text: roman[i] || pad2(i + 1) }),
        el('h3', { class: 'pilar__titulo', text: p.titulo || '' }),
        el('p', { class: 'pilar__texto', text: p.texto || '' })
      ])));
    }
  }

  function hydrateProjetos() {
    const list = $('#projetos-lista');
    if (!list || !Array.isArray(SITE.projetos) || !SITE.projetos.length) return;
    list.replaceChildren(...PROJETOS.map((p, i) => {
      const { box, img } = mediaFrom(p.capa, { className: 'projeto__fig', tag: 'figure' });
      box.setAttribute('data-reveal', '');
      box.append(el('span', { class: 'projeto__cursor mono', 'aria-hidden': 'true', text: 'Ver projeto' }));
      img.width = 1600; img.height = 1067;
      return el('li', { class: 'projeto', 'data-slug': p.slug }, [
        el('a', { class: 'projeto__link', href: '#projeto/' + p.slug, 'aria-label': 'Ver projeto ' + p.nome }, [
          box,
          el('div', { class: 'projeto__meta' }, [
            el('span', { class: 'mono projeto__idx', text: pad2(i + 1) }),
            el('h3', { class: 'projeto__nome', text: p.nome }),
            el('p', { class: 'projeto__tipo mono', text: [p.tipo, p.status].filter(Boolean).join(' — ') })
          ])
        ])
      ]);
    }));
  }

  function hydrateExpertise() {
    const list = $('#expertise-lista');
    const items = get(SITE, 'expertise');
    if (!list || !Array.isArray(items) || !items.length) return;
    list.replaceChildren(...items.map((s, i) => {
      const n = i + 1;
      const { box } = mediaFrom(s.imagem, { className: 'exp__media' });
      return el('li', { class: 'exp', 'data-exp': '' }, [
        el('h3', { class: 'exp__h' }, el('button', { type: 'button', class: 'exp__btn', 'aria-expanded': 'false', 'aria-controls': 'exp-painel-' + n, id: 'exp-btn-' + n }, [
          el('span', { class: 'mono exp__num', text: pad2(n) }),
          el('span', { class: 'exp__titulo', text: s.titulo || '' }),
          el('span', { class: 'exp__plus', 'aria-hidden': 'true' })
        ])),
        el('div', { class: 'exp__painel', id: 'exp-painel-' + n, role: 'region', 'aria-labelledby': 'exp-btn-' + n }, [
          box,
          el('p', { class: 'exp__texto', text: s.texto || '' })
        ])
      ]);
    }));
  }

  function hydrateImersivo() {
    const track = $('#hgal-track');
    const imgs = get(SITE, 'imersivo.imagens');
    if (!track || !Array.isArray(imgs) || !imgs.length) return;
    track.replaceChildren(...imgs.map((im, i) => {
      const { box } = mediaFrom(im, { className: 'hgal__media' });
      return el('li', { class: 'hgal__item' }, el('figure', {}, [
        box,
        el('figcaption', {}, [el('span', { class: 'mono', text: pad2(i + 1) }), el('span', { text: im.legenda || '' })])
      ]));
    }));
  }

  /** Bloco de contatos: só mostra campos preenchidos; vazio → demonstração. */
  function hydrateContato() {
    const c = SITE.contato || {};
    const list = $('#contatos-lista');
    const nota = $('#contatos-nota');
    if (!list) return;
    const digits = (s) => String(s || '').replace(/\D/g, '');
    const items = [];
    if (c.email) items.push(['E-mail', el('a', { href: 'mailto:' + c.email, text: c.email })]);
    if (c.whatsapp) items.push(['WhatsApp', el('a', { href: 'https://wa.me/' + digits(c.whatsapp), target: '_blank', rel: 'noopener', text: c.whatsapp })]);
    if (c.telefone) items.push(['Telefone', el('a', { href: 'tel:+' + digits(c.telefone), text: c.telefone })]);
    if (c.instagram) {
      const handle = String(c.instagram).replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '');
      items.push(['Instagram', el('a', { href: 'https://instagram.com/' + handle, target: '_blank', rel: 'noopener', text: '@' + handle })]);
    }
    if (c.endereco) items.push(['Endereço', el('span', { text: c.endereco })]);

    if (items.length) {
      list.replaceChildren(...items.map(([rot, val]) => el('li', { class: 'contatos__item' }, [
        el('span', { class: 'mono contatos__rotulo', text: rot }),
        el('span', { class: 'contatos__valor' }, val)
      ])));
      if (nota) nota.hidden = true;
    }

    // Rodapé — redes
    const social = $('#footer-social');
    if (social && c.instagram) {
      const handle = String(c.instagram).replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '');
      social.replaceChildren(el('li', {}, el('a', { class: 'ul', href: 'https://instagram.com/' + handle, target: '_blank', rel: 'noopener', text: 'Instagram' })));
    }
  }

  function hydrateAll() {
    hydrateTextBinds();
    hydrateHero();
    hydrateManifesto();
    hydrateProjetos();
    hydrateExpertise();
    hydrateImersivo();
    hydrateContato();
    const ano = $('#ano'); if (ano) ano.textContent = String(new Date().getFullYear());
    hydrateLogo();
  }

  /* ------------------------------------------------------------------
     5. Tipografia — divisão em linhas (máscara) e reveals
     ------------------------------------------------------------------ */
  function splitLines(node) {
    if (REDUCED || node.dataset.splitDone) return;
    const text = node.textContent.replace(/\s+/g, ' ').trim();
    if (!text) return;
    const words = text.split(' ');
    // 1) palavras em spans para medir
    node.replaceChildren(...words.flatMap((w, i) => {
      const s = el('span', { text: w }); s.style.display = 'inline-block';
      return i < words.length - 1 ? [s, document.createTextNode(' ')] : [s];
    }));
    const lines = [];
    let lastTop = null;
    $$('span', node).forEach((s) => {
      const top = s.offsetTop;
      if (lastTop === null || Math.abs(top - lastTop) > 2) { lines.push([]); lastTop = top; }
      lines[lines.length - 1].push(s.textContent);
    });
    // 2) linhas mascaradas (com espaço entre elas, para leitores de tela não juntarem palavras)
    node.replaceChildren(...lines.flatMap((ws, i) => {
      const inner = el('span', { class: 'line__in', text: ws.join(' ') });
      inner.style.setProperty('--i', String(i));
      const line = el('span', { class: 'line' }, inner);
      return i < lines.length - 1 ? [line, document.createTextNode(' ')] : [line];
    }));
    node.dataset.splitDone = '1';
  }

  function initReveals() {
    const targets = $$('[data-split-lines], [data-reveal], [data-reveal-text]');
    if (REDUCED) {
      targets.forEach((t) => t.classList.add('is-in'));
      return;
    }
    // Checagem por geometria (e não IntersectionObserver): o alvo começa com
    // clip-path fechado e o IO do Chrome trata alvo recortado como "fora da tela".
    let pending = targets.filter((t) => !t.closest('.hero')); // o hero revela no carregamento
    let queued = false;
    const check = () => {
      queued = false;
      const vh = window.innerHeight;
      pending = pending.filter((t) => {
        const r = t.getBoundingClientRect();
        if (r.top < vh * 0.9 && r.bottom > 0 && r.width > 0) { t.classList.add('is-in'); return false; }
        return true;
      });
      if (!pending.length) {
        window.removeEventListener('scroll', request);
        window.removeEventListener('resize', request);
      }
    };
    const request = () => { if (!queued) { queued = true; requestAnimationFrame(check); } };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    window.addEventListener('load', request);
    check();
  }

  function revealHero() {
    const content = $('.hero__content');
    if (content) content.classList.add('is-in');
  }

  async function fontsReady() {
    if (!document.fonts || !document.fonts.ready) return;
    await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]);
  }

  /* ------------------------------------------------------------------
     6. Rolagem — Lenis (desktop, ponteiro fino, sem reduced) + helpers
     ------------------------------------------------------------------ */
  function initLenis() {
    if (REDUCED || !mqFine.matches || !mqDesktop.matches || typeof window.Lenis !== 'function') return;
    try {
      const lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.95 });
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add((time) => lenis.raf(time * 1000));
      window.gsap.ticker.lagSmoothing(0);
      state.lenis = lenis; // o próprio Lenis marca <html class="lenis"> (usado no CSS)
    } catch (e) { console.warn('[lenis] indisponível', e); }
  }

  function scrollToY(y, { immediate = false } = {}) {
    if (state.lenis) state.lenis.scrollTo(y, { immediate, duration: 1.4, lock: false });
    else window.scrollTo({ top: y, behavior: REDUCED || immediate ? 'auto' : 'smooth' });
  }

  function scrollToEl(target) {
    if (!target) return;
    const y = target.getBoundingClientRect().top + window.scrollY;
    scrollToY(target.id === 'inicio' ? 0 : y);
    // Foco acessível no destino após a rolagem
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    setTimeout(() => target.focus({ preventScroll: true }), REDUCED ? 0 : 900);
  }

  /** Links internos (#secao) rolam com Lenis e mantêm o hash. */
  function initAnchors() {
    document.addEventListener('click', (ev) => {
      const a = ev.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href === '#' || href.startsWith('#projeto/')) return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      ev.preventDefault();
      closeMenu();
      scrollToEl(target);
      if (history.pushState) history.pushState(null, '', href);
    });
  }

  /* ------------------------------------------------------------------
     7. Hero / Obra — indicador de etapas e integração com obra.js
     ------------------------------------------------------------------ */
  const heroEl = $('#inicio');
  const stageBtns = $$('.stage');
  const barEl = $('.stages__bar');
  const fillEl = $('#etapa-fill');
  const nomeEl = $('#etapa-nome');
  const textoEl = $('#etapa-texto');
  const numEl = $('#etapa-num');

  function setStageUI(i) {
    if (i === state.stage) return;
    state.stage = i;
    const e = ETAPAS[i] || {};
    if (nomeEl) nomeEl.textContent = e.nome || '';
    if (textoEl) textoEl.textContent = e.texto || '';
    if (numEl) numEl.textContent = pad2(i + 1) + ' / ' + pad2(ETAPAS.length);
    stageBtns.forEach((b, k) => {
      if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
  }

  /** Recebe o progresso 0..1 e distribui: cena, barra, etapa. */
  function onProgress(p) {
    p = clamp(p, 0, 1);
    state.progress = p;
    if (state.obra) { try { state.obra.setProgress(p); } catch (_) { /* ignora */ } }
    if (fillEl) fillEl.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    if (barEl) barEl.setAttribute('aria-valuenow', String(Math.round(p * 100)));
    setStageUI(stageAt(p));
  }

  /* Faixas [de, ate] de cada etapa. Começam uniformes; se obra.js exportar
     ETAPAS ({id, de, ate}), passam a valer as da cena para ficarem em sincronia. */
  let ranges = ETAPAS.map((_, i) => ({ de: i / ETAPAS.length, ate: (i + 1) / ETAPAS.length }));

  function stageAt(p) {
    for (let i = ranges.length - 1; i >= 0; i--) { if (p >= ranges[i].de) return i; }
    return 0;
  }

  function adoptRanges(list) {
    if (!Array.isArray(list) || list.length !== ETAPAS.length) return;
    const ok = list.every((r) => r && typeof r.de === 'number' && typeof r.ate === 'number' && r.ate > r.de);
    if (!ok) return;
    ranges = list.map((r) => ({ de: r.de, ate: r.ate }));
    state.stage = -1; // força atualizar o rótulo
    onProgress(state.progress);
  }

  /** Posição de rolagem correspondente ao centro da etapa i. */
  function goToStage(i) {
    const r = ranges[i] || { de: 0, ate: 1 };
    // meio da faixa; a última etapa vai ao fim (casa pronta)
    const t = i === ranges.length - 1 ? 1 : (r.de + r.ate) / 2;
    const st = state.heroTrigger;
    if (st) {
      scrollToY(st.start + (st.end - st.start) * t);
    } else {
      // modo reduzido / sem pin: aplica diretamente
      onProgress(t);
    }
  }

  function initStages() {
    stageBtns.forEach((b, i) => {
      b.addEventListener('click', () => goToStage(i));
      b.addEventListener('keydown', (ev) => {
        if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
        ev.preventDefault();
        const n = (i + (ev.key === 'ArrowRight' ? 1 : -1) + stageBtns.length) % stageBtns.length;
        stageBtns[n].focus();
      });
    });
    onProgress(0);
    if (REDUCED) onProgress(1); // sem pin: a obra abre em 100% (casa pronta); os botões escolhem a etapa
  }

  async function initObra() {
    const canvas = $('#obra-canvas');
    if (!canvas || !heroEl) return;
    let mod;
    const modo = get(SITE, 'obra.modo');
    try {
      // modo "video": sequência renderizada (sem three.js); "3d"/"frames": cena do obra.js
      mod = await import(modo === 'video' ? '/construtora/assets/obra-video.js' : '/construtora/assets/obra.js');
    } catch (e) {
      console.warn('[obra] módulo indisponível — mantendo poster CSS.', e);
      return;
    }
    if (!mod || typeof mod.createObra !== 'function') return;
    adoptRanges(mod.ETAPAS); // sincroniza o indicador com as faixas da cena

    let obra;
    try {
      obra = mod.createObra(canvas, {
        quality: QUALITY,
        reducedMotion: mqReduced.matches,
        frames: modo === 'frames' ? get(SITE, 'obra.frames', []) : undefined,
        video: modo === 'video' ? get(SITE, 'obra.video') : undefined
      });
    } catch (e) {
      console.warn('[obra] falha ao criar a cena — mantendo poster CSS.', e);
      return;
    }
    if (!obra) return;

    Promise.resolve(obra.ready).then(() => {
      heroEl.classList.add('is-ready');
      try { obra.setProgress(state.progress); } catch (_) { /* ignora */ }
    }).catch((e) => {
      console.warn('[obra] sem WebGL ou falha no primeiro frame — poster mantido.', e);
      try { obra.dispose && obra.dispose(); } catch (_) { /* ignora */ }
    });

    state.obra = obra;
    try { obra.setProgress(state.progress); } catch (_) { /* ignora */ }

    // Liga/desliga o loop: só roda com o hero na tela E a aba visível
    let heroVisible = true;
    const sync = () => {
      try { heroVisible && !document.hidden ? obra.start() : obra.stop(); } catch (_) { /* ignora */ }
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { heroVisible = e.isIntersecting; });
      sync();
    }, { threshold: 0.01 });
    io.observe(heroEl);
    sync();

    window.addEventListener('resize', debounce(() => { try { obra.resize(); } catch (_) { /* ignora */ } }, 120));
    document.addEventListener('visibilitychange', sync);
  }

  /* ------------------------------------------------------------------
     8. Movimento com GSAP / ScrollTrigger (matchMedia)
     ------------------------------------------------------------------ */
  function setNavTheme(theme) {
    const nav = $('.nav');
    if (nav && nav.dataset.theme !== theme) nav.dataset.theme = theme;
  }

  function initMotion() {
    if (!hasGsap) return;
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const mm = gsap.matchMedia();

    mm.add({
      desktop: '(min-width: 900px) and (prefers-reduced-motion: no-preference)',
      mobile: '(max-width: 899px) and (prefers-reduced-motion: no-preference)',
      reduced: '(prefers-reduced-motion: reduce)'
    }, (ctx) => {
      const { desktop, reduced } = ctx.conditions;
      if (reduced) {
        // Sem pin: hero em 100% e seletor por botões (goToStage aplica o progresso)
        state.heroTrigger = null;
        return;
      }

      /* --- Hero pinned com scrub suave --- */
      const extraVh = desktop ? 4.0 : 2.2; // 500vh / 320vh no total
      const proxy = { p: 0 };
      const heroTween = gsap.to(proxy, {
        p: 1, ease: 'none',
        onUpdate: () => onProgress(proxy.p),
        scrollTrigger: {
          trigger: heroEl,
          start: 'top top',
          end: () => '+=' + Math.round(window.innerHeight * extraVh),
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: desktop ? 0.8 : 0.6,
          invalidateOnRefresh: true
        }
      });
      state.heroTrigger = heroTween.scrollTrigger;

      /* --- Blueprint: desenho por stroke-dashoffset → foto --- */
      const paths = $$('.bp__l');
      if (paths.length && $('#blueprint')) {
        paths.forEach((p) => {
          const L = p.getTotalLength();
          p.style.strokeDasharray = String(L);
          p.style.strokeDashoffset = String(L);
        });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: '#blueprint', start: 'top top', end: 'bottom bottom', scrub: 0.6 }
        });
        tl.fromTo('.bp__txt', { opacity: 0 }, { opacity: 0.7, duration: 1, ease: 'none' }, 0)
          .to(paths, { strokeDashoffset: 0, duration: 6, ease: 'none', stagger: { each: 0.12 } }, 0)
          .fromTo('.blueprint__photo', { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 3, ease: 'none' }, '-=1.6')
          .to('.blueprint__svg', { opacity: 0.16, duration: 2, ease: 'none' }, '<0.6');
      }

      /* --- Galeria horizontal pinned (desktop) --- */
      const track = $('#hgal-track');
      const viewport = $('.hgal__viewport');
      if (desktop && track && viewport) {
        const dist = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
        const hTween = gsap.to(track, {
          x: () => -dist(), ease: 'none',
          scrollTrigger: {
            trigger: '#hgal', start: 'top top', end: () => '+=' + dist(),
            pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true
          }
        });
        $$('.hgal__media img', track).forEach((img) => {
          gsap.fromTo(img, { xPercent: -5, scale: 1.15 }, {
            xPercent: 5, scale: 1.15, ease: 'none',
            scrollTrigger: { trigger: img.closest('.hgal__item'), containerAnimation: hTween, start: 'left right', end: 'right left', scrub: true }
          });
        });
      }

      /* --- Parallax leve no hero: micro-deslocamento do texto --- */
      if (desktop) {
        gsap.to('.hero__content', {
          yPercent: -6, ease: 'none',
          scrollTrigger: { trigger: heroEl, start: 'top top', end: () => '+=' + Math.round(window.innerHeight * extraVh), scrub: true }
        });
      }

      return () => { state.heroTrigger = null; };
    });

    // Atualiza após fontes e imagens mudarem alturas
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  /**
   * Nav: claro no hero/imersivo/rodapé, escuro nas seções de papel.
   * Lê a geometria real (qual seção está sob a linha da nav) a cada rolagem —
   * independe de GSAP e não se perde com seções pinned.
   */
  function initNavTheme() {
    const zones = [['#inicio', 'light'], ['#manifesto', 'dark'], ['#projetos', 'dark'], ['#expertise', 'dark'], ['#imersivo', 'light'], ['#contato', 'dark'], ['.footer', 'light']]
      .map(([sel, theme]) => [$(sel), theme]).filter(([node]) => node);
    const PROBE = 34; // meio da barra
    let queued = false;
    const update = () => {
      queued = false;
      for (let i = 0; i < zones.length; i++) {
        const r = zones[i][0].getBoundingClientRect();
        if (r.top <= PROBE && r.bottom > PROBE) { setNavTheme(zones[i][1]); return; }
      }
    };
    const request = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    window.addEventListener('load', request);
    update();
  }

  /* ------------------------------------------------------------------
     9. Nav — menu mobile acessível (aria-expanded, Esc, foco preso)
     ------------------------------------------------------------------ */
  const navEl = $('.nav');
  const menuEl = $('#menu-mobile');
  const toggleEl = $('.nav__toggle');
  let menuLastFocus = null;

  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function trapFocus(container, ev) {
    if (ev.key !== 'Tab') return;
    const items = $$(FOCUSABLE, container).filter((n) => n.offsetParent !== null || n === document.activeElement);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
  }

  function lockScroll(lock) {
    document.body.classList.toggle('is-locked', lock);
    if (state.lenis) lock ? state.lenis.stop() : state.lenis.start();
  }

  function openMenu() {
    if (!menuEl || !toggleEl) return;
    menuLastFocus = document.activeElement;
    menuEl.hidden = false;
    requestAnimationFrame(() => menuEl.classList.add('is-open'));
    navEl.classList.add('is-menu-open');
    toggleEl.setAttribute('aria-expanded', 'true');
    toggleEl.setAttribute('aria-label', 'Fechar menu');
    lockScroll(true);
    const first = $('a', menuEl);
    setTimeout(() => first && first.focus(), 60);
  }

  function closeMenu() {
    if (!menuEl || menuEl.hidden) return;
    menuEl.classList.remove('is-open');
    navEl.classList.remove('is-menu-open');
    toggleEl.setAttribute('aria-expanded', 'false');
    toggleEl.setAttribute('aria-label', 'Abrir menu');
    if (!state.overlayOpen) lockScroll(false);
    const done = () => { menuEl.hidden = true; };
    REDUCED ? done() : setTimeout(done, 650);
    if (menuLastFocus && menuLastFocus.focus) menuLastFocus.focus();
  }

  function initMenu() {
    if (!menuEl || !toggleEl) return;
    toggleEl.addEventListener('click', () => (menuEl.hidden ? openMenu() : closeMenu()));
    document.addEventListener('keydown', (ev) => {
      if (menuEl.hidden) return;
      if (ev.key === 'Escape') { ev.preventDefault(); closeMenu(); toggleEl.focus(); }
      else trapFocus(navEl, ev);
    });
    window.addEventListener('resize', debounce(() => { if (window.innerWidth >= 1024) closeMenu(); }, 150));
  }

  /* ------------------------------------------------------------------
     10. Expertise — imagem que segue o cursor (desktop) / acordeão (mobile)
     ------------------------------------------------------------------ */
  function initExpertise() {
    const list = $('#expertise-lista');
    const float = $('#expertise-float');
    const floatImg = float && $('img', float);
    if (!list) return;

    const items = $$('[data-exp]', list);
    const isDesk = () => mqExpDesktop.matches && !REDUCED;

    const syncMode = () => {
      items.forEach((li) => {
        const btn = $('.exp__btn', li);
        if (!btn) return;
        if (isDesk()) btn.setAttribute('aria-expanded', 'true');
        else if (!li.classList.contains('is-open')) btn.setAttribute('aria-expanded', 'false');
      });
    };
    syncMode();
    mqExpDesktop.addEventListener ? mqExpDesktop.addEventListener('change', syncMode) : mqExpDesktop.addListener(syncMode);

    // Acordeão (mobile/touch)
    list.addEventListener('click', (ev) => {
      const btn = ev.target.closest('.exp__btn');
      if (!btn) return;
      const li = btn.closest('[data-exp]');
      if (isDesk()) { // no desktop o clique "fixa" o item
        items.forEach((o) => o !== li && o.classList.remove('is-active'));
        li.classList.toggle('is-active');
        return;
      }
      const open = btn.getAttribute('aria-expanded') === 'true';
      items.forEach((o) => {
        const b = $('.exp__btn', o);
        o.classList.remove('is-open');
        b && b.setAttribute('aria-expanded', 'false');
      });
      if (!open) { li.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    });

    // Imagem flutuante (desktop com ponteiro fino)
    if (!float || !floatImg || !hasGsap) return;
    const qx = window.gsap.quickTo(float, 'x', { duration: 0.6, ease: 'power3' });
    const qy = window.gsap.quickTo(float, 'y', { duration: 0.6, ease: 'power3' });
    const show = (li, x, y) => {
      if (!isDesk()) return;
      const src = $('.exp__media img', li);
      if (src) {
        const s = src.getAttribute('src') || '';
        if (floatImg.getAttribute('src') !== s) {
          floatImg.setAttribute('src', s);
          const ss = unsplashSrcset(s);
          if (ss) { floatImg.setAttribute('srcset', ss); floatImg.setAttribute('sizes', '22vw'); }
          floatImg.alt = '';
        }
      }
      if (x != null) { window.gsap.set(float, { x, y }); }
      float.classList.add('is-on');
    };
    const hide = () => float.classList.remove('is-on');

    items.forEach((li) => {
      li.addEventListener('mouseenter', (e) => show(li, e.clientX, e.clientY));
      li.addEventListener('mousemove', (e) => { qx(e.clientX); qy(e.clientY); });
      li.addEventListener('mouseleave', hide);
      const btn = $('.exp__btn', li);
      if (btn) {
        btn.addEventListener('focus', () => {
          const r = li.getBoundingClientRect();
          show(li, Math.min(r.left + r.width * 0.55, window.innerWidth - 220), r.top + r.height / 2);
        });
        btn.addEventListener('blur', hide);
      }
    });
    list.addEventListener('mouseleave', hide);
  }

  /* ------------------------------------------------------------------
     11. Projetos — rótulo "Ver projeto" segue o cursor
     ------------------------------------------------------------------ */
  function initProjectCursor() {
    if (!mqFine.matches) return;
    $$('.projeto__fig').forEach((fig) => {
      const label = $('.projeto__cursor', fig);
      if (!label) return;
      const move = (e) => {
        const r = fig.getBoundingClientRect();
        label.style.left = (e.clientX - r.left) + 'px';
        label.style.top = (e.clientY - r.top) + 'px';
      };
      fig.addEventListener('mousemove', move);
      fig.addEventListener('mouseenter', move);
    });
  }

  /* ------------------------------------------------------------------
     12. Overlay de projeto — rota #projeto/<slug>
     ------------------------------------------------------------------ */
  const ov = {
    root: $('#projeto-overlay'),
    scroll: $('#overlay-scroll'),
    close: $('#overlay-close'),
    counter: $('#overlay-counter'),
    capa: $('#overlay-capa'),
    tipo: $('#overlay-tipo'),
    titulo: $('#overlay-titulo'),
    resumo: $('#overlay-resumo'),
    desc: $('#overlay-desc'),
    ficha: $('#overlay-ficha'),
    galeria: $('#overlay-galeria'),
    next: $('#overlay-next'),
    nextNome: $('#overlay-next-nome')
  };
  let ovSlug = null;
  let ovDepth = 0;           // quantas entradas de histórico abrimos
  let ovSourceRect = null;   // retângulo da capa clicada (origem do clip-path)
  let ovLastFocus = null;

  function findProject(slug) {
    const i = PROJETOS.findIndex((p) => p.slug === slug);
    return i < 0 ? null : { p: PROJETOS[i], i };
  }

  function fillOverlay(p, i) {
    const n = PROJETOS.length;
    ov.counter.textContent = pad2(i + 1) + ' / ' + pad2(n);
    ov.tipo.textContent = [p.tipo, p.status].filter(Boolean).join(' — ');
    ov.titulo.textContent = p.nome || '';
    ov.resumo.textContent = p.resumo || '';
    ov.desc.replaceChildren(...String(p.descricao || '').split(/\n{2,}/).filter(Boolean).map((t) => el('p', { text: t })));
    ov.ficha.replaceChildren(...(Array.isArray(p.ficha) ? p.ficha : []).map((f) => el('div', {}, [el('dt', { text: f.rotulo || '' }), el('dd', { text: f.valor || '' })])));

    // Capa
    const capaBox = ov.capa.closest('.media');
    capaBox.classList.remove('is-loaded', 'is-broken');
    ov.capa.removeAttribute('srcset'); delete ov.capa.dataset.wired;
    ov.capa.alt = get(p, 'capa.alt', '');
    ov.capa.setAttribute('src', get(p, 'capa.src', ''));
    prepImage(ov.capa, { eager: true });

    // Galeria
    ov.galeria.replaceChildren(...(Array.isArray(p.galeria) ? p.galeria : []).map((g) => {
      const { box, img } = mediaFrom(g);
      const li = el('li', {}, box);
      prepImage(img);
      return li;
    }));

    // Próximo
    const nx = PROJETOS[(i + 1) % n];
    ov.next.setAttribute('href', '#projeto/' + nx.slug);
    ov.nextNome.textContent = nx.nome || '';
  }

  function insetFromRect(r) {
    if (!r) return 'inset(0px 0px 100% 0px)';
    return 'inset(' + Math.max(0, r.top) + 'px ' + Math.max(0, window.innerWidth - r.right) + 'px ' + Math.max(0, window.innerHeight - r.bottom) + 'px ' + Math.max(0, r.left) + 'px)';
  }

  function openProject(slug) {
    const found = findProject(slug);
    if (!found || !ov.root) return;
    const wasOpen = state.overlayOpen;
    fillOverlay(found.p, found.i);
    ovSlug = slug;

    if (wasOpen) { // troca de projeto dentro do overlay
      ov.scroll.scrollTo({ top: 0, behavior: 'auto' });
      if (hasGsap && !REDUCED) window.gsap.fromTo(ov.scroll, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' });
      ov.close.focus();
      return;
    }

    ovLastFocus = document.activeElement;
    state.overlayOpen = true;
    ov.root.hidden = false;
    ov.scroll.scrollTop = 0;
    lockScroll(true);

    const from = insetFromRect(ovSourceRect);
    ovSourceRect = null;
    if (hasGsap && !REDUCED) {
      window.gsap.fromTo(ov.root, { clipPath: from }, { clipPath: 'inset(0px 0px 0px 0px)', duration: 1, ease: 'expo.inOut', overwrite: true });
      window.gsap.fromTo(ov.scroll, { opacity: 0.4 }, { opacity: 1, duration: 0.8, delay: 0.2, ease: 'power2.out' });
    } else {
      ov.root.style.clipPath = 'inset(0px 0px 0px 0px)';
    }
    setTimeout(() => ov.close.focus(), 80);
  }

  function closeProject() {
    if (!state.overlayOpen || !ov.root) return;
    state.overlayOpen = false;
    const finish = () => {
      ov.root.hidden = true;
      ov.root.style.clipPath = '';
      lockScroll(false);
      // Devolve o foco ao link do projeto
      const back = $('.projeto[data-slug="' + ovSlug + '"] .projeto__link') || ovLastFocus;
      if (back && back.focus) back.focus({ preventScroll: true });
      ovSlug = null;
    };
    if (hasGsap && !REDUCED) {
      window.gsap.to(ov.root, { clipPath: 'inset(0px 0px 100% 0px)', duration: 0.7, ease: 'expo.inOut', overwrite: true, onComplete: finish });
    } else finish();
  }

  /** Fecha pelo botão/Esc: volta no histórico se fomos nós que empilhamos. */
  function requestClose() {
    if (ovDepth > 0) {
      const d = ovDepth; ovDepth = 0;
      history.go(-d); // dispara hashchange → closeProject
    } else {
      if (location.hash.startsWith('#projeto/')) history.replaceState(null, '', location.pathname + location.search + '#projetos');
      closeProject();
    }
  }

  function routeHash() {
    const m = location.hash.match(/^#projeto\/([\w-]+)/);
    if (m) openProject(m[1]);
    else if (state.overlayOpen) { ovDepth = 0; closeProject(); }
  }

  function initOverlay() {
    if (!ov.root) return;
    // Guarda a origem (capa) e conta a entrada de histórico
    document.addEventListener('click', (ev) => {
      const a = ev.target.closest('a[href^="#projeto/"]');
      if (!a) return;
      const fig = a.querySelector('.projeto__fig');
      ovSourceRect = fig ? fig.getBoundingClientRect() : null;
      ovDepth += 1;
      // o navegador troca o hash → hashchange → openProject
    });
    ov.close.addEventListener('click', requestClose);
    document.addEventListener('keydown', (ev) => {
      if (!state.overlayOpen) return;
      if (ev.key === 'Escape') { ev.preventDefault(); requestClose(); }
      else trapFocus(ov.root, ev);
    });
    window.addEventListener('hashchange', routeHash);
    routeHash(); // deep link
  }

  /* ------------------------------------------------------------------
     13. Formulário demonstrativo — validação acessível, envio simulado
     ------------------------------------------------------------------ */
  function initForm() {
    const form = $('#form-contato');
    if (!form) return;
    const sucesso = $('#form-sucesso');
    const wa = $('#form-whatsapp');
    const reset = $('#form-reset');
    const whatsapp = String(get(SITE, 'contato.whatsapp', '')).replace(/\D/g, '');

    const fields = {
      nome: { el: $('#f-nome'), err: $('#e-nome'), check: (v) => v.trim().length >= 2 || 'Informe seu nome.' },
      email: { el: $('#f-email'), err: $('#e-email'), check: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Informe um e-mail válido.' },
      telefone: { el: $('#f-tel'), err: $('#e-tel'), check: (v) => !v.trim() || v.replace(/\D/g, '').length >= 10 || 'Telefone incompleto (inclua o DDD).' },
      tipo: { el: $('#f-tipo'), err: $('#e-tipo'), check: (v) => !!v || 'Escolha o tipo de projeto.' },
      mensagem: { el: $('#f-msg'), err: $('#e-msg'), check: (v) => v.trim().length >= 10 || 'Conte um pouco mais (pelo menos 10 caracteres).' }
    };

    const validate = (key) => {
      const f = fields[key];
      if (!f.el) return true;
      const r = f.check(f.el.value);
      const ok = r === true;
      f.el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      f.err.textContent = ok ? '' : r;
      return ok;
    };

    Object.keys(fields).forEach((k) => {
      const f = fields[k];
      if (!f.el) return;
      f.el.addEventListener('blur', () => { if (f.el.value) validate(k); });
      f.el.addEventListener('input', () => { if (f.el.getAttribute('aria-invalid') === 'true') validate(k); });
    });

    const buildWa = () => {
      const d = new FormData(form);
      const txt = 'Olá! Meu nome é ' + (d.get('nome') || '') + '. Tipo de projeto: ' + (d.get('tipo') || '') + '. ' + (d.get('mensagem') || '');
      return 'https://wa.me/' + whatsapp + '?text=' + encodeURIComponent(txt.trim());
    };
    if (wa && whatsapp) { wa.hidden = false; wa.setAttribute('href', buildWa()); form.addEventListener('input', () => wa.setAttribute('href', buildWa())); }

    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const results = Object.keys(fields).map((k) => [k, validate(k)]);
      const firstBad = results.find(([, ok]) => !ok);
      if (firstBad) { fields[firstBad[0]].el.focus(); return; }

      // Envio SIMULADO — nada sai do navegador.
      form.classList.add('is-sent');
      sucesso.hidden = false;
      if (whatsapp && !$('#form-sucesso-wa', sucesso)) {
        sucesso.insertBefore(el('a', { id: 'form-sucesso-wa', class: 'btn btn--dark', href: buildWa(), target: '_blank', rel: 'noopener', text: 'Enviar também pelo WhatsApp' }), reset);
      }
      sucesso.focus();
    });

    reset && reset.addEventListener('click', () => {
      form.reset();
      Object.keys(fields).forEach((k) => { fields[k].el && fields[k].el.setAttribute('aria-invalid', 'false'); fields[k].err.textContent = ''; });
      form.classList.remove('is-sent');
      sucesso.hidden = true;
      fields.nome.el && fields.nome.el.focus();
    });
  }

  /* ------------------------------------------------------------------
     14. Boot
     ------------------------------------------------------------------ */
  async function boot() {
    applyTheme();
    hydrateAll();
    prepAllImages();

    initLenis();
    initAnchors();
    initMenu();
    initStages();
    initExpertise();
    initProjectCursor();
    initOverlay();
    initForm();

    // Tipografia: divide em linhas depois das fontes e revela o hero
    await fontsReady();
    $$('[data-split-lines]').forEach(splitLines);
    initReveals();
    // setTimeout (não rAF): rAF fica pausado em abas em segundo plano e o título não pode depender disso
    setTimeout(revealHero, 60);

    initMotion();
    initNavTheme();
    // A cena é montada DEPOIS do texto do hero (não disputa a thread principal com ele);
    // o download do módulo já veio adiantado pelo <link rel="modulepreload"> do index.html.
    initObra();

    // Volta ao topo ao recarregar com pin (evita saltos do ScrollTrigger)
    if ('scrollRestoration' in history && !location.hash) history.scrollRestoration = 'manual';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
