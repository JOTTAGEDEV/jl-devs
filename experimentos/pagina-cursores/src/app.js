(function () {
  'use strict';

  /* ======================================================================
     JL Devs — a página é montada por dois cursores (JG Dev e LC Dev).
     Tudo que aparece na tela é função de duas coisas: o tempo (só na
     abertura) e o scroll. Nenhuma biblioteca externa.
     ====================================================================== */

  var W = window, D = document, R = D.documentElement;
  var id = function (s) { return D.getElementById(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };

  // ---------- matemática ----------
  function clamp(v, a, b) { if (a === undefined) a = 0; if (b === undefined) b = 1; return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function prog(v, a, b) { return clamp((v - a) / (b - a)); }
  function sstep(a, b, v) { var t = prog(v, a, b); return t * t * (3 - 2 * t); }
  var E = {
    lin: function (t) { return t; },
    o2: function (t) { return 1 - (1 - t) * (1 - t); },
    io2: function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; },
    o3: function (t) { return 1 - Math.pow(1 - t, 3); },
    io3: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    o5: function (t) { return 1 - Math.pow(1 - t, 5); },
    back: function (t) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  };
  function arc(a, b, e, amt) {
    var s = Math.sin(e * Math.PI) * (amt || 0);
    return { x: lerp(a.x, b.x, e) - (b.y - a.y) * s, y: lerp(a.y, b.y, e) + (b.x - a.x) * s };
  }
  function mixRGB(a, b, t) {
    return 'rgb(' + Math.round(lerp(a[0], b[0], t)) + ',' + Math.round(lerp(a[1], b[1], t)) + ',' + Math.round(lerp(a[2], b[2], t)) + ')';
  }

  // ---------- ambiente ----------
  var QS = new URLSearchParams(location.search);
  var CAPTURE = QS.has('capture');
  var REDUCED = !CAPTURE && W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = W.matchMedia && W.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (REDUCED) R.classList.add('reduced');

  var S = {
    t: 0, dt: 16, ready: false, started: false,
    vw: W.innerWidth, vh: W.innerHeight, sy: 0, ry: 0,
    px: 0, py: 0, spx: 0, spy: 0,          // ponteiro (-1…1) e versão suavizada
    dive: 0, sweepX: -60, introT: 0, introDone: false, world: ''
  };
  var G = {};                               // geometria medida no resize

  // ---------- geometria ----------
  var memo = new Map();
  function frameRect(el) { var r = memo.get(el); if (!r) { r = el.getBoundingClientRect(); memo.set(el, r); } return r; }
  function local(el, frame) {              // caixa de layout relativa a um ancestral posicionado (ignora transforms)
    var x = 0, y = 0, e = el;
    while (e && e !== frame) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
    return { x: x, y: y, w: el.offsetWidth, h: el.offsetHeight };
  }

  /* ======================================================================
     Cursores
     ====================================================================== */
  function Actor(key, el, sel, seed) {
    this.key = key; this.el = el; this.sel = sel; this.selLabel = sel ? sel.querySelector('b') : null;
    this.svg = el.querySelector('svg'); this.ring = el.querySelector('.cur__ring');
    this.x = -200; this.y = -200; this.tx = -200; this.ty = -200;
    this.down = false; this.dn = 0; this.vis = 0; this.tvis = 0; this.placed = false;
    this.clickAt = -1e9; this.seed = seed; this.selA = 0;
  }
  Actor.prototype.aim = function (x, y, down, vis) {
    if (x === x && y === y) { this.tx = x; this.ty = y; }      // ignora NaN
    if (down && !this.down) this.clickAt = S.t;
    this.down = !!down; this.tvis = vis === undefined ? 1 : vis;
  };
  Actor.prototype.step = function (dt) {
    if (!this.placed || this.x !== this.x || this.y !== this.y) { this.x = this.tx; this.y = this.ty; this.placed = true; }
    var k = 1 - Math.exp(-dt * 0.03);
    this.x += (this.tx - this.x) * k; this.y += (this.ty - this.y) * k;
    this.dn += ((this.down ? 1 : 0) - this.dn) * (1 - Math.exp(-dt * 0.03));
    this.vis += (this.tvis - this.vis) * (1 - Math.exp(-dt * 0.012));
  };
  Actor.prototype.draw = function () {
    var ix = Math.sin(S.t * 0.0011 + this.seed) * 1.5, iy = Math.cos(S.t * 0.0013 + this.seed * 1.7) * 1.5;
    this.el.style.transform = 'translate3d(' + (this.x + ix).toFixed(2) + 'px,' + (this.y + iy).toFixed(2) + 'px,0)';
    this.el.style.opacity = this.vis < 0.01 ? 0 : this.vis.toFixed(3);
    this.svg.style.transform = 'scale(' + (1 - 0.15 * this.dn).toFixed(3) + ')';
    var c = (S.t - this.clickAt) / 460;
    if (c >= 0 && c < 1) {
      this.ring.style.opacity = ((1 - c) * 0.9 * this.vis).toFixed(3);
      this.ring.style.transform = 'scale(' + (0.35 + E.o3(c) * 1.25).toFixed(3) + ')';
    } else if (this.ring.style.opacity !== '0') this.ring.style.opacity = '0';
  };
  Actor.prototype.select = function (r) {    // r: {x,y,w,h,a,label} em px de viewport, ou null
    var s = this.sel; if (!s) return;
    if (!r || r.a <= 0.01 || r.w < 2 || r.h < 2) { if (this.selA) { s.style.opacity = '0'; this.selA = 0; } return; }
    s.style.opacity = clamp(r.a).toFixed(3); this.selA = r.a;
    s.style.transform = 'translate3d(' + r.x.toFixed(1) + 'px,' + r.y.toFixed(1) + 'px,0)';
    s.style.width = r.w.toFixed(1) + 'px'; s.style.height = r.h.toFixed(1) + 'px';
    var txt = r.label || (Math.round(r.w) + ' × ' + Math.round(r.h));
    if (this.selLabel.textContent !== txt) this.selLabel.textContent = txt;
  };
  var jg = new Actor('jg', id('curJG'), id('selJG'), 0.3);
  var lc = new Actor('lc', id('curLC'), id('selLC'), 2.1);
  var actors = { jg: jg, lc: lc };

  /* ======================================================================
     Cenas e batidas
     Uma cena tem um quadro de referência (frame), um progresso q (0…1) e
     uma lista de batidas. Cada batida diz onde o cursor está, se está
     apertado e o que acontece com a peça em função de u (0…1).
     ====================================================================== */
  var scenes = [];
  function Scene(o) {
    for (var k in o) this[k] = o[k];
    this.tracks = { jg: [], lc: [] };
    var self = this;
    (o.beats || []).forEach(function (b) { self.tracks[b.who].push(b); });
    this.tracks.jg.sort(function (a, b) { return a.t0 - b.t0; });
    this.tracks.lc.sort(function (a, b) { return a.t0 - b.t0; });
    this.q = null;
    scenes.push(this);
  }
  Scene.prototype.k = function () { return this.scale ? this.scale() : 1; };
  Scene.prototype.rect = function (el, frame) {
    var f = frame || this.frame, F = frameRect(f), s = frame ? 1 : this.k(), l = local(el, f);
    return { x: F.left + l.x * s, y: F.top + l.y * s, w: l.w * s, h: l.h * s };
  };
  Scene.prototype.pt = function (x, y) { var F = frameRect(this.frame), s = this.k(); return { x: F.left + x * s, y: F.top + y * s }; };

  function carry(who, el, t0, t1, o) {
    o = o || {};
    var grab = o.grab || [0.5, 0.5];
    var b = {
      who: who, t0: t0, t1: t1, say: o.say, el: el, _dx: 0, _dy: 0,
      home: function (sc) { var r = sc.rect(el, o.frame); return { x: r.x + r.w * grab[0], y: r.y + r.h * grab[1], r: r }; },
      pos: function (u, sc) { var h = this.home(sc); return arc(o.from(sc, h), h, E.io3(u), o.arc === undefined ? 0.1 : o.arc); },
      down: function (u) { return u > 0 && u < 1; },
      apply: function (u, q, sc, holder) {
        var h = this.home(sc), s = o.frame ? 1 : sc.k(), dx, dy, op, rot, scl;
        if (u <= 0) { var f = o.from(sc, h); dx = (f.x - h.x) / s; dy = (f.y - h.y) / s; op = 0; rot = o.rot || 0; scl = o.scale || 1; }
        else if (u < 1) {
          var P = holder || this.pos(u, sc), e = E.io3(u);
          dx = (P.x - h.x) / s; dy = (P.y - h.y) / s; op = clamp(u * 7); rot = (o.rot || 0) * (1 - e); scl = lerp(o.scale || 1, 1, e);
        } else {
          var v = prog(q, t1, t1 + (o.settle || 0.02));
          dx = 0; dy = 0; op = 1; rot = 0; scl = 1 + 0.05 * Math.sin(v * Math.PI) * (1 - v);
        }
        this._dx = dx * s; this._dy = dy * s;
        if (o.set) o.set(dx, dy, op, rot, scl, u, q);
        else {
          el.style.transform = 'translate3d(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px,0) rotate(' + rot.toFixed(2) + 'deg) scale(' + scl.toFixed(4) + ')';
          el.style.opacity = op;
        }
      },
      selRect: function (u, q, sc) {
        var linger = o.linger === undefined ? 0.03 : o.linger;
        if (o.sel === false || u <= 0 || q > t1 + linger) return null;
        var r = sc.rect(el, o.frame);
        return { x: r.x + this._dx, y: r.y + this._dy, w: r.w, h: r.h, a: u < 1 ? clamp(u * 7) : 1 - prog(q, t1 + linger * 0.5, t1 + linger), label: o.label };
      }
    };
    return b;
  }

  function draw(who, el, t0, t1, o) {      // ferramenta retângulo: desenha do canto de cima ao de baixo
    o = o || {};
    var label = el.querySelector('span');
    return {
      who: who, t0: t0, t1: t1, say: o.say, el: el,
      pos: function (u, sc) { var r = sc.rect(el), e = E.io2(u); return { x: r.x + r.w * e, y: r.y + r.h * e }; },
      down: function (u) { return u > 0 && u < 1; },
      apply: function (u, q) {
        var e = E.io2(u);
        if (u <= 0) { el.style.opacity = 0; }
        else if (u < 1) { el.style.opacity = 1; el.style.clipPath = 'inset(0 ' + ((1 - e) * 100).toFixed(2) + '% ' + ((1 - e) * 100).toFixed(2) + '% 0 round 999px)'; }
        else { el.style.opacity = 1; el.style.clipPath = 'none'; }
        if (label) label.style.opacity = sstep(t1, t1 + 0.03, q);
      },
      selRect: function (u, q, sc) {
        if (u <= 0 || q > t1 + 0.03) return null;
        var r = sc.rect(el), e = u < 1 ? E.io2(u) : 1;
        return { x: r.x, y: r.y, w: r.w * e, h: r.h * e, a: u < 1 ? 1 : 1 - prog(q, t1 + 0.012, t1 + 0.03) };
      }
    };
  }

  function click(who, target, t0, t1, o) {
    o = o || {};
    var at = o.at === undefined ? 0.5 : o.at, hold = o.hold === undefined ? 0.3 : o.hold;
    return {
      who: who, t0: t0, t1: t1, say: o.say,
      pos: function (u, sc) {
        if (typeof target === 'function') return target(sc, u);
        var r = sc.rect(target, o.frame);
        return { x: r.x + r.w * (o.fx === undefined ? 0.5 : o.fx), y: r.y + r.h * (o.fy === undefined ? 0.56 : o.fy) };
      },
      down: function (u) { return u >= at && u < at + hold; },
      apply: function (u, q, sc) { if (o.apply) o.apply(u, q, sc, u >= at && u < at + hold); }
    };
  }

  function move(who, fn, t0, t1, o) {
    o = o || {};
    return {
      who: who, t0: t0, t1: t1, say: o.say,
      pos: function (u, sc) { return fn(u, sc); },
      down: function (u) { return o.down ? (typeof o.down === 'function' ? o.down(u) : u > 0 && u < 1) : false; },
      apply: function (u, q, sc, holder) { if (o.apply) o.apply(u, q, sc, holder); },
      selRect: o.selRect
    };
  }

  function resolve(sc, who, q) {
    var list = sc.tracks[who], prev = null, cur = null, next = null, i, b, p, g;
    for (i = 0; i < list.length; i++) { b = list[i]; if (q < b.t0) { next = b; break; } if (q <= b.t1) { cur = b; break; } prev = b; }
    if (cur) {
      var u = (q - cur.t0) / Math.max(1e-6, cur.t1 - cur.t0);
      p = cur.pos(u, sc);
      return { x: p.x, y: p.y, down: cur.down ? cur.down(u) : false, beat: cur, u: u };
    }
    var bend = who === 'jg' ? 0.09 : -0.09;
    if (prev && next) {
      g = E.io3(prog(q, prev.t1, next.t0));
      p = arc(prev.pos(1, sc), next.pos(0, sc), g, bend);
      return { x: p.x, y: p.y, down: false, beat: null, prev: prev };
    }
    if (next) {
      var a = sc.entry ? sc.entry(who) : null, to = next.pos(0, sc);
      if (!a) return { x: to.x, y: to.y, down: false, beat: null };
      g = E.io3(prog(q, Math.max(0, next.t0 - (sc.lead || 0.1)), next.t0));
      p = arc(a, to, g, bend);
      return { x: p.x, y: p.y, down: false, beat: null };
    }
    if (prev) {
      var from = prev.pos(1, sc), rest = sc.rest ? sc.rest(who) : null;
      if (rest) { g = E.io3(prog(q, prev.t1, prev.t1 + (sc.restDur || 0.07))); p = arc(from, rest, g, bend); }
      else p = from;
      return { x: p.x, y: p.y, down: false, beat: null, prev: prev };
    }
    var r0 = sc.rest ? sc.rest(who) : null;
    return r0 ? { x: r0.x, y: r0.y, down: false, beat: null } : null;
  }

  /* ======================================================================
     WebGL: o estúdio do logo e a aurora da chamada final
     ====================================================================== */
  var GL = (function () {
    var cv = id('gl'), gl = null;
    try { gl = cv.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' }); } catch (e) { gl = null; }
    if (!gl) { R.classList.add('no-gl'); return null; }
    var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    function program(fsSrc) {
      function sh(type, src) {
        var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
        return s;
      }
      var pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fsSrc));
      gl.bindAttribLocation(pr, 0, 'p'); gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr) || 'link');
      var u = {}, n = gl.getProgramParameter(pr, gl.ACTIVE_UNIFORMS);
      for (var i = 0; i < n; i++) { var info = gl.getActiveUniform(pr, i); u[info.name] = gl.getUniformLocation(pr, info.name); }
      return { pr: pr, u: u };
    }
    var studio, aurora;
    try { studio = program("{{GLSL_STUDIO}}"); aurora = program("{{GLSL_AURORA}}"); }
    catch (err) { if (W.console) console.warn('WebGL indisponível:', err.message); R.classList.add('no-gl'); return null; }
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    function texture(img) {
      var t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      var pot = (img.naturalWidth & (img.naturalWidth - 1)) === 0 && (img.naturalHeight & (img.naturalHeight - 1)) === 0;
      if (pot) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
      else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      return t;
    }
    var api = { ok: true, dpr: 1, texLogo: null, texMaps: null, lost: false };
    api.textures = function (logoImg, mapsImg) { api.texLogo = texture(logoImg); api.texMaps = texture(mapsImg); };
    api.resize = function () {
      var dpr = Math.min(W.devicePixelRatio || 1, 2), w = cv.clientWidth || S.vw, h = cv.clientHeight || S.vh;
      var px = w * h * dpr * dpr, cap = 3.4e6;
      if (px > cap) dpr *= Math.sqrt(cap / px);
      api.dpr = dpr;
      var cw = Math.max(2, Math.round(w * dpr)), ch = Math.max(2, Math.round(h * dpr));
      if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; }
      gl.viewport(0, 0, cw, ch);
    };
    api.studio = function (o) {
      if (api.lost || !api.texLogo) return;
      var u = studio.u, d = api.dpr;
      gl.useProgram(studio.pr);
      gl.uniform2f(u.uRes, cv.width, cv.height);
      gl.uniform1f(u.uTime, o.time);
      gl.uniform3f(u.uBox, o.cx * d, o.cy * d, o.size * d);
      gl.uniform1f(u.uSweep, o.sweep * d);
      gl.uniform1f(u.uScan, o.scan);
      gl.uniform1f(u.uFill, o.fill);
      gl.uniform1f(u.uOutline, o.outline);
      gl.uniform1f(u.uGlass, o.glass);
      gl.uniform1f(u.uFlood, o.flood);
      gl.uniform1f(u.uLive, o.live);
      gl.uniform2f(u.uPointer, o.px, o.py);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, api.texLogo); gl.uniform1i(u.uLogo, 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, api.texMaps); gl.uniform1i(u.uMaps, 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    api.aurora = function (o) {
      if (api.lost) return;
      var u = aurora.u;
      gl.useProgram(aurora.pr);
      gl.uniform2f(u.uRes, cv.width, cv.height);
      gl.uniform1f(u.uTime, o.time);
      gl.uniform1f(u.uAmp, o.amp);
      gl.uniform1f(u.uShift, o.shift);
      gl.uniform2f(u.uPointer, o.px, o.py);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); api.lost = true; R.classList.add('no-gl'); });
    return api;
  })();

  /* ======================================================================
     1 · Abertura: os cursores montam o topo e o JG aperta Renderizar
     ====================================================================== */
  var hero = {
    sec: id('topo'), stage: id('heroStage'), slot: id('logoSlot'), img: id('logoImg'), copy: id('heroCopy'),
    title: id('heroTitle'), sub: id('heroSub'), cta1: id('cta1'), cta2: id('cta2'),
    toolbar: id('toolbar'), renderBtn: id('renderBtn'), renderLabel: id('renderLabel'), hint: id('hint'),
    bp: id('bp'), nav: id('nav'), navwrap: id('navwrap'), scan: id('scan'), caret: id('caret'), boxes: []
  };
  var logo = { dx: 0, dy: 0, ghost: 0, fill: 0, scale: 1 };   // estado do logo desenhado no WebGL
  var INTRO = 5.5;                                            // segundos
  function T(sec) { return sec / INTRO; }

  // título em letras (o texto continua acessível pelo aria-label)
  var titleChars = (function () {
    var out = [], label = [];
    Array.prototype.slice.call(hero.title.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = D.createDocumentFragment();
        n.nodeValue.split('').forEach(function (c) {
          var s = D.createElement('span'); s.className = 'ch'; s.textContent = c; s.setAttribute('aria-hidden', 'true');
          frag.appendChild(s); out.push(s);
        });
        label.push(n.nodeValue);
        hero.title.replaceChild(frag, n);
      }
    });
    hero.title.setAttribute('aria-label', label.join(' '));
    return out;
  })();

  function bpBox(el, name, frame) {
    var b = D.createElement('div'); b.className = 'bp__box'; b.innerHTML = '<b>' + name + '</b>';
    hero.bp.appendChild(b); hero.boxes.push({ el: el, box: b, frame: frame });
  }
  bpBox(hero.slot, 'logo.svg'); bpBox(hero.title, 'h1'); bpBox(hero.sub, 'p');
  bpBox(hero.cta1, 'botão'); bpBox(hero.cta2, 'botão'); bpBox(hero.nav, 'menu', hero.navwrap);

  function setCaret(c) {
    if (!c) { hero.caret.style.opacity = '0'; return; }
    hero.caret.style.opacity = (Math.floor(S.t / 260) % 2) ? '1' : '0.25';
    hero.caret.style.height = (c.h * 0.86).toFixed(1) + 'px';
    hero.caret.style.transform = 'translate3d(' + (c.x + 2).toFixed(1) + 'px,' + (c.y + c.h * 0.08).toFixed(1) + 'px,0)';
  }
  var typeBeat = (function () {
    var last = -1, N = titleChars.length, t0 = T(0.95), t1 = T(2.2);
    function caretAt(sc, n) {
      var c = titleChars[clamp(n - 1, 0, N - 1)], r = sc.rect(c);
      return n <= 0 ? { x: r.x, y: r.y, h: r.h } : { x: r.x + r.w, y: r.y, h: r.h };
    }
    return {
      who: 'lc', t0: t0, t1: t1, say: 'LC Dev está escrevendo o título',
      pos: function (u, sc) { var c = caretAt(sc, Math.round(u * N)); return { x: c.x + 8, y: c.y + c.h * 0.8 }; },
      down: function () { return false; },
      apply: function (u, q, sc) {
        var n = u >= 1 ? N : u <= 0 ? 0 : Math.round(u * N);
        if (n !== last) { for (var i = 0; i < N; i++) titleChars[i].style.visibility = i < n ? 'visible' : 'hidden'; last = n; }
        if (u > 0 && u < 1) setCaret(caretAt(sc, n)); else if (q < t1 + 0.02 || u <= 0) setCaret(null);
      }
    };
  })();

  var tools = $$('.tool', hero.toolbar), toolNow = '';
  function setTool(name) {
    if (name === toolNow) return; toolNow = name;
    tools.forEach(function (t) { t.classList.toggle('is-on', t.getAttribute('data-tool') === name); });
  }

  var intro = new Scene({
    id: 'intro', frame: hero.stage, world: 'light',
    progress: function () {
      if (S.ry > G.hero.top + G.hero.h + S.vh * 0.3) return null;
      return clamp(S.introT / (INTRO * 1000));
    },
    entry: function (who) { return who === 'jg' ? { x: -80, y: S.vh * 0.62 } : { x: S.vw + 80, y: S.vh * 0.36 }; },
    rest: function (who) {
      if (who === 'jg') { var r = this.rect(hero.slot); return { x: r.x - 26, y: r.y + r.h * 0.84 }; }
      var t = this.rect(hero.title); return { x: t.x + t.w + 22, y: t.y + t.h * 0.3 };
    },
    restDur: T(0.6), lead: T(0.5),
    beats: [
      carry('jg', hero.slot, T(0.35), T(1.5), {
        grab: [0.71, 0.42], arc: 0.14, say: 'JG Dev está posicionando o logo', label: 'logo.svg', linger: T(0.35), settle: T(0.4),
        from: function (sc, h) { return { x: -S.vw * 0.24, y: h.y + S.vh * 0.2 }; },
        set: function (dx, dy, op, rot, scl, u, q) {
          logo.dx = dx; logo.dy = dy; logo.ghost = op; logo.scale = scl;
          logo.fill = u >= 1 ? E.o3(prog(q, T(1.5), T(1.72))) : 0.16 * op;
        }
      }),
      draw('jg', hero.cta1, T(1.95), T(2.42), { say: 'JG Dev está desenhando os botões' }),
      draw('jg', hero.cta2, T(2.62), T(2.98), {}),
      click('jg', hero.renderBtn, T(3.5), T(4.05), { at: 0.5, hold: 0.32, say: 'JG Dev apertou Renderizar',
        apply: function (u, q, sc, down) { hero.renderBtn.style.transform = down ? 'scale(.94)' : ''; } }),

      click('lc', function (sc) { var r = sc.rect(titleChars[0]); return { x: r.x + 4, y: r.y + r.h * 0.8 }; }, T(0.72), T(0.94), { at: 0.35, hold: 0.4 }),
      typeBeat,
      move('lc', function (u, sc) { var r = sc.rect(hero.sub), e = E.io2(u); return { x: r.x + r.w * e, y: r.y + r.h * (0.3 + 0.6 * e) }; }, T(2.5), T(2.9), {
        say: 'LC Dev colou o texto de apoio', down: true,
        apply: function (u) {
          var e = E.io2(u);
          hero.sub.style.opacity = u <= 0 ? 0 : 1;
          hero.sub.style.clipPath = u >= 1 ? 'none' : 'inset(-10% ' + ((1 - e) * 100).toFixed(2) + '% -10% 0)';
        },
        selRect: function (u, q, sc) {
          if (u <= 0 || q > T(3.05)) return null;
          var r = sc.rect(hero.sub), e = u < 1 ? E.io2(u) : 1;
          return { x: r.x - 6, y: r.y - 4, w: (r.w + 12) * e, h: r.h + 8, a: u < 1 ? 1 : 1 - prog(q, T(2.95), T(3.05)), label: 'p' };
        }
      }),
      carry('lc', hero.nav, T(3.05), T(3.65), {
        frame: hero.navwrap, grab: [0.5, 0.62], arc: 0.05, say: 'LC Dev está encaixando o menu', label: 'menu', linger: T(0.3), settle: T(0.35),
        from: function (sc, h) { return { x: h.x + 40, y: -110 }; }
      })
    ],
    sayAt: function (q) {
      var t = q * INTRO;
      if (t >= 5.0) return 'Pronto. Agora role: a obra continua.';
      if (t >= 3.86) return 'Renderizando o vidro…';
      return null;
    },
    update: function (q) {
      var t = q * INTRO, x, sw;
      // prancheta e barra de ferramentas entram
      hero.bp.style.opacity = sstep(0, 0.45, t);
      var tbIn = E.o3(prog(t, 0.12, 0.6)), tbOut = E.io2(prog(t, 4.75, 5.2));
      hero.toolbar.style.transform = 'translate3d(0,' + ((1 - tbIn) * 96 + tbOut * 120).toFixed(1) + 'px,0)';
      hero.toolbar.style.opacity = (tbIn * (1 - tbOut)).toFixed(3);
      setTool(t < 1.9 ? (t > 0.9 && t < 1.2 ? 'text' : 'move') : t < 3.0 ? 'rect' : 'move');
      // a linha do render atravessa a tela
      sw = E.io2(prog(t, 3.84, 5.0)); x = lerp(-60, S.vw + 60, sw); S.sweepX = x;
      hero.bp.style.setProperty('--sweep', x.toFixed(1) + 'px');
      hero.scan.style.opacity = sw > 0 && sw < 1 ? '1' : '0';
      hero.scan.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
      hero.renderLabel.textContent = sw > 0 ? (sw < 1 ? 'Renderizando' : 'Pronto') : 'Renderizar';
      // os botões ganham o acabamento quando a linha passa por eles
      var r1 = this.rect(hero.cta1), a1 = sstep(r1.x, r1.x + r1.w, x);
      hero.cta1.style.setProperty('--r', a1.toFixed(3));
      hero.cta1.style.color = mixRGB([0, 0, 0], [255, 255, 255], sstep(0.35, 0.65, a1));
      hero.hint.style.opacity = (sstep(5.0, 5.4, t) * (1 - sstep(0.004, 0.05, S.dive))).toFixed(3);
      if (!GL) hero.img.style.opacity = logo.fill.toFixed(3);
      if (q >= 1 && !S.introDone) introFinish();
    }
  });
  function introFinish() {
    S.introDone = true;
    hero.bp.classList.add('is-off');
    hero.cta1.style.color = ''; hero.cta1.style.removeProperty('--r');
    hero.toolbar.style.display = 'none';
    setCaret(null);
  }

  /* ---------- o mergulho: JG e LC puxam os cantos e o logo engole a tela ---------- */
  function logoGeom() {
    var r = intro.rect(hero.slot), k = r.w / 1018, h = S.dive;
    var lx = r.x + r.w / 2 + logo.dx, ly = r.y + r.h / 2 + logo.dy;
    var a = E.io2(prog(h, 0, 0.3)), b = E.io3(prog(h, 0.12, 0.62));
    var ax = lerp(lx, S.vw / 2, a), ay = lerp(ly, S.vh / 2, a);
    var ix = lerp(629, 721, b), iy = lerp(613.5, 566, b);
    var Sc = Math.exp(Math.log(34) * E.io3(prog(h, 0.06, 0.9))) * logo.scale;
    var cx = ax - (ix - 627) * k * Sc, cy = ay - (iy - 627) * k * Sc;
    return { cx: cx, cy: cy, size: 1254 * k * Sc, Sc: Sc, k: k,
      box: { x: cx + (120 - 627) * k * Sc, y: cy + (297 - 627) * k * Sc, w: 1018 * k * Sc, h: 633 * k * Sc } };
  }
  var dive = new Scene({
    id: 'dive', frame: hero.stage, world: 'light',
    progress: function () {
      if (!S.introDone || S.ry > G.hero.top + G.hero.h + S.vh * 0.3) return null;
      return S.dive;
    },
    entry: function (who) { return intro.rest(who); },
    lead: 0.05,
    beats: [
      move('jg', function () { var g = logoGeom().box; return { x: g.x + g.w + 5, y: g.y - 5 }; }, 0.05, 1, { down: true, say: 1 }),
      move('lc', function () { var g = logoGeom().box; return { x: g.x - 5, y: g.y + g.h + 5 }; }, 0.05, 1, { down: true })
    ],
    sayAt: function (q) {
      if (q < 0.05) return null;
      return 'JG Dev e LC Dev estão ampliando o logo: ' + Math.round(logoGeom().Sc * 100).toLocaleString('pt-BR') + '%';
    },
    customSel: function (who, q) {
      if (who !== 'jg' || q < 0.05) return null;
      var g = logoGeom();
      return { x: g.box.x, y: g.box.y, w: g.box.w, h: g.box.h, a: sstep(0.05, 0.09, q) * (1 - sstep(0.6, 0.72, q)), label: Math.round(g.Sc * 100).toLocaleString('pt-BR') + '%' };
    },
    update: function (q) {
      var f = 1 - sstep(0.015, 0.15, q);
      hero.copy.style.opacity = f.toFixed(3);
      hero.copy.style.transform = 'translate3d(0,' + (-q * 260).toFixed(1) + 'px,0)';
      hero.copy.style.visibility = f <= 0.001 ? 'hidden' : 'visible';
      if (!GL) {                              // sem WebGL: a própria imagem cresce
        var g = logoGeom();
        hero.img.style.transform = 'translate(-50.16%,-48.92%) scale(' + Math.min(g.Sc, 14).toFixed(3) + ')';
        hero.stage.style.backgroundColor = mixRGB([225, 233, 237], [144, 238, 31], sstep(0.55, 0.85, q));
      }
    }
  });

  /* ======================================================================
     2 · Manifesto: LC escreve, JG circula o principal
     ====================================================================== */
  var man = { sec: id('manifesto'), stage: id('manifestoStage'), inner: id('manifestoInner'), text: id('manifestoText'), mark: id('markWords'), svg: id('markCircle'), path: id('markPath'), words: [], len: 1 };
  (function () {
    var full = man.text.textContent.replace(/\s+/g, ' ').trim();
    function wrap(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = D.createDocumentFragment();
          n.nodeValue.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(D.createTextNode(' ')); return; }
            var s = D.createElement('span'); s.className = 'w'; s.textContent = part; s.setAttribute('aria-hidden', 'true');
            frag.appendChild(s); man.words.push(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) wrap(n);
      });
    }
    wrap(man.text);
    man.text.setAttribute('aria-label', full);
    man.mark.style.display = 'inline-block'; man.mark.style.whiteSpace = 'nowrap';
    man.len = man.path.getTotalLength();
    man.path.style.strokeDasharray = man.len + ' ' + man.len;
  })();
  var WORDS_T0 = 0.07, WORDS_T1 = 0.68;
  var manifesto = new Scene({
    id: 'manifesto', frame: man.inner, world: 'lime',
    progress: function () {
      if (S.ry + S.vh < G.man.top - S.vh * 0.2 || S.ry > G.man.top + G.man.h + S.vh * 0.2) return null;
      return clamp((S.sy - G.man.top + S.vh * 0.35) / (G.man.h - S.vh * 0.65));
    },
    entry: function (who) { return who === 'jg' ? { x: S.vw + 70, y: S.vh * 0.3 } : { x: -70, y: S.vh * 0.5 }; },
    rest: function (who) {
      var r = this.rect(man.text);
      return who === 'jg' ? { x: Math.min(S.vw - 90, r.x + r.w + 16), y: r.y + r.h * 0.2 } : { x: r.x + r.w * 0.5, y: r.y + r.h + 30 };
    },
    lead: 0.06,
    beats: [
      {
        who: 'lc', t0: WORDS_T0, t1: WORDS_T1, say: 'LC Dev está escrevendo o que a JL faz',
        pos: function (u, sc) {
          var N = man.words.length, f = u * N, i = clamp(Math.ceil(f) - 1, 0, N - 1), r = sc.rect(man.words[i]);
          var part = clamp(f - i);
          return { x: r.x + r.w * part + 6, y: r.y + r.h * 0.82 };
        },
        down: function () { return false; },
        apply: function (u) {
          var N = man.words.length, f = u * N;
          for (var i = 0; i < N; i++) man.words[i].style.opacity = (0.16 + 0.84 * clamp(f - i)).toFixed(3);
        }
      },
      {
        who: 'jg', t0: 0.72, t1: 0.9, say: 'JG Dev circulou o que mais importa',
        pos: function (u, sc) {
          var p = man.path.getPointAtLength(man.len * E.io2(u)), b = man.box;
          if (!b) return sc.pt(0, 0);
          return sc.pt(b.x + p.x / 400 * b.w, b.y + p.y / 120 * b.h);
        },
        down: function (u) { return u > 0 && u < 1; },
        apply: function (u) {
          man.svg.style.opacity = u > 0 ? 1 : 0;
          man.path.style.strokeDashoffset = (man.len * (1 - E.io2(u))).toFixed(1);
        }
      }
    ]
  });

  /* ======================================================================
     3 · Processo: um site nasce dentro do navegador
     ====================================================================== */
  var pr = {
    sec: id('processo'), stage: id('processStage'), canvas: id('processCanvas'), board: id('board'), brw: id('brw'), view: id('brwView'),
    steps: $$('.step', id('steps')), stepA: [0, 0, 0, 0],
    wNav: id('wNav'), wText: id('wText'), wImg: id('wImg'), wC1: id('wC1'), wC2: id('wC2'), wC3: id('wC3'),
    fin: id('siteFinal'), fTitle: id('fTitle'), fBtn: id('fBtn'), fImg: id('fImg'), orb: id('orb'), orbShadow: id('orbShadow'),
    cards: [id('fC1'), id('fC2'), id('fC3')],
    palette: id('palette'), swatch: id('swatchLime'), editor: id('editor'), code: id('code'), perfNum: id('perfNum'), perfBar: id('perfBar'),
    phone: id('phone'), phoneScreen: id('phone').firstElementChild, url: id('urlText'), pub: id('pubBtn'), pubBar: id('pubBar'), toast: id('pubToast'),
    scale: 1, chW: 7.5, lines: [], total: 0
  };
  var CODE = [
    [['c', '// animação do seu site']],
    [['k', 'const'], ['', ' orb = $('], ['s', '".orb"'], ['', ')']],
    [['k', 'const'], ['', ' cards = $$('], ['s', '".card"'], ['', ')']],
    [],
    [['', 'orb.'], ['k', 'flutuar'], ['', '({ altura: '], ['n', '14'], ['', ' })']],
    [['', 'cards.'], ['k', 'entrar'], ['', '({ atraso: '], ['n', '120'], ['', ' })']],
    [['', 'botao.'], ['k', 'aoPassar'], ['', '(crescer)']],
    [],
    [['k', 'publicar'], ['', '()  '], ['c', '// no ar']]
  ];
  (function () {
    CODE.forEach(function (toks) {
      var ln = D.createElement('span'), inn = D.createElement('span'), n = 0;
      ln.className = 'ln'; inn.className = 'ln__in';
      toks.forEach(function (tk) {
        var s = D.createElement('span'); if (tk[0]) s.className = 'tk-' + tk[0]; s.textContent = tk[1]; inn.appendChild(s); n += tk[1].length;
      });
      ln.appendChild(inn); pr.code.appendChild(ln);
      pr.lines.push({ el: inn, n: n, start: pr.total }); pr.total += n;
    });
  })();
  var URL_DEV = 'localhost:3000', URL_LIVE = 'suamarca.com.br';

  function brwState(p) {                      // o navegador encolhe para dar lugar ao editor e depois ao celular
    var a = E.io3(prog(p, 0.5, 0.555)), b = E.io3(prog(p, 0.75, 0.805));
    return lerp(lerp(1, 0.62, a), 0.8, b);
  }
  function viewPt(sc, vx, vy, p) {            // ponto dentro da página do navegador → viewport
    var s = brwState(p);
    return sc.pt(40 + vx * s, 320 + (vy + 44 - 286) * s);
  }
  function inView(el) { return local(el, pr.view); }
  var fromBoard = function (x, y) { return function (sc) { return sc.pt(x, y); }; };

  var process = new Scene({
    id: 'process', frame: pr.board, world: 'dark',
    scale: function () { return pr.scale; },
    progress: function () {
      if (S.ry + S.vh < G.proc.top - S.vh * 0.1 || S.ry > G.proc.top + G.proc.h + S.vh * 0.1) return null;
      return clamp((S.sy - G.proc.top) / (G.proc.h - G.proc.vh));
    },
    entry: function (who) { return who === 'jg' ? this.pt(1040, -30) : this.pt(-40, 660); },
    rest: function (who) { return who === 'jg' ? this.pt(1010, 600) : this.pt(-10, 610); },
    lead: 0.012, restDur: 0.02,
    beats: [
      // 01 rascunho
      carry('jg', pr.wNav, 0.012, 0.05, { from: fromBoard(1060, -40), rot: -3, say: 'JG Dev e LC Dev estão montando o rascunho', linger: 0.012, settle: 0.012 }),
      carry('lc', pr.wText, 0.028, 0.082, { from: fromBoard(-80, 420), rot: 4, linger: 0.012, settle: 0.012 }),
      carry('jg', pr.wImg, 0.07, 0.122, { from: fromBoard(1090, 250), rot: 5, linger: 0.012, settle: 0.012 }),
      carry('lc', pr.wC1, 0.1, 0.146, { from: fromBoard(-60, 700), rot: -5, linger: 0.012, settle: 0.012 }),
      carry('lc', pr.wC2, 0.158, 0.2, { from: fromBoard(380, 730), rot: 3, linger: 0.012, settle: 0.012 }),
      carry('jg', pr.wC3, 0.146, 0.196, { from: fromBoard(1080, 680), rot: -4, linger: 0.012, settle: 0.012 }),
      // 02 design
      click('lc', pr.swatch, 0.285, 0.325, { at: 0.5, hold: 0.3, fy: 0.5, say: 'LC Dev está pintando o site' }),
      move('jg', function (u, sc) {
        var r = inView(pr.fTitle), s = lerp(0.82, 1, E.io2(u));
        return viewPt(sc, r.x + r.w * s + 4, r.y + r.h * s + 4, 0.4);
      }, 0.395, 0.455, {
        down: true, say: 'JG Dev está ajustando o título',
        selRect: function (u, q, sc) {
          if (q > 0.475) return null;
          var r = inView(pr.fTitle), s = lerp(0.82, 1, E.io2(clamp(u))), a = viewPt(sc, r.x, r.y, 0.4), k = sc.k();
          return { x: a.x - 5, y: a.y - 5, w: r.w * s * k + 10, h: r.h * s * k + 10, a: u < 1 ? clamp(u * 8 + 0.2) : 1 - prog(q, 0.462, 0.475), label: Math.round(47 * s) + ' px' };
        }
      }),
      // 03 código
      {
        who: 'jg', t0: 0.57, t1: 0.705, say: 'JG Dev está programando a animação',
        pos: function (u, sc) {
          var n = Math.round(u * pr.total), i, L = pr.lines[0];
          for (i = 0; i < pr.lines.length; i++) { if (pr.lines[i].start <= n) L = pr.lines[i], L.i = i; }
          var col = Math.min(L.n, n - L.start);
          return sc.pt(630 + 15 + col * pr.chW + 4, 66 + 40 + 16 + (L.i + 0.72) * 21.875);
        },
        down: function () { return false; },
        apply: function (u) {
          var n = Math.round(clamp(u) * pr.total);
          if (n === pr._typed) return; pr._typed = n;
          pr.lines.forEach(function (L) { L.el.style.width = clamp(n - L.start, 0, L.n) + 'ch'; });
        }
      },
      click('lc', function (sc) { var r = inView(pr.fBtn); return viewPt(sc, r.x + r.w * 0.6, r.y + r.h * 0.6, 0.62); }, 0.6, 0.655, { at: 0.55, hold: 0.25, say: 'LC Dev está testando o botão' }),
      move('lc', function (u, sc) {
        var a = inView(pr.cards[0]), b = inView(pr.cards[2]);
        return viewPt(sc, lerp(a.x + a.w * 0.5, b.x + b.w * 0.5, E.io2(u)), a.y + a.h * 0.55 + Math.sin(u * Math.PI) * -14, 0.62);
      }, 0.675, 0.725, {}),
      // 04 no ar
      click('jg', function (sc, u) { var s = brwState(0.9); return sc.pt(40 + (920 - 54) * s, 320 + (22 - 286) * s); }, 0.862, 0.915, { at: 0.45, hold: 0.3, say: 'JG Dev publicou o site' }),
      move('lc', function (u, sc) { return sc.pt(796 + 88, 112 + 250 - E.io2(u) * 70); }, 0.875, 0.945, { down: true })
    ],
    sayAt: function (q) { return q >= 0.945 ? 'No ar: ' + URL_LIVE : null; },
    update: function (p) {
      var i, t = S.t;
      // passos
      var act = p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.75 ? 2 : 3, lo = G.narrow ? 0 : 0.3, k = 1 - Math.exp(-S.dt * 0.012);
      for (i = 0; i < 4; i++) {
        pr.stepA[i] += ((i === act ? 1 : lo) - pr.stepA[i]) * (REDUCED ? 1 : k);
        pr.steps[i].style.opacity = pr.stepA[i].toFixed(3);
      }
      // 02: a paleta abre, o verde entra como uma mancha de tinta
      var pal = E.back(prog(p, 0.255, 0.285)) * (1 - E.io2(prog(p, 0.335, 0.36)));
      pr.palette.style.opacity = clamp(pal * 1.4).toFixed(3);
      pr.palette.style.transform = 'scale(' + (0.6 + 0.4 * pal).toFixed(3) + ')';
      var wipe = E.io2(prog(p, 0.305, 0.455));
      pr.fin.style.clipPath = wipe >= 1 ? 'none' : 'circle(' + (wipe * 1180).toFixed(1) + 'px at 352px 338px)';
      pr.fin.style.visibility = wipe <= 0 ? 'hidden' : 'visible';
      var ts = lerp(0.82, 1, E.io2(prog(p, 0.395, 0.455)));
      pr.fTitle.style.transform = 'scale(' + ts.toFixed(4) + ')'; pr.fTitle.style.transformOrigin = '0 0';
      // 03: navegador encolhe, editor entra, o site ganha vida
      var bs = brwState(p);
      pr.brw.style.transform = 'scale(' + bs.toFixed(4) + ')';
      var edIn = E.o3(prog(p, 0.515, 0.565)), edOut = E.io2(prog(p, 0.75, 0.79));
      pr.editor.style.transform = 'translate3d(' + ((1 - edIn) * 90 + edOut * 420).toFixed(1) + 'px,0,0)';
      pr.editor.style.opacity = (edIn * (1 - edOut)).toFixed(3);
      var perf = E.o3(prog(p, 0.665, 0.735));
      pr.perfNum.textContent = Math.round(perf * 100);
      pr.perfBar.style.transform = 'scaleX(' + perf.toFixed(3) + ')';
      var floatAmp = sstep(0.6, 0.64, p), fy = Math.sin(t * 0.0021) * 9 * floatAmp;
      pr.orb.style.transform = 'translate3d(0,' + fy.toFixed(2) + 'px,0) rotate(' + (Math.sin(t * 0.0013) * 6 * floatAmp).toFixed(2) + 'deg)';
      pr.orbShadow.style.transform = 'scale(' + (1 - fy / 60).toFixed(3) + ')';
      pr.orbShadow.style.opacity = (0.9 + fy / 40).toFixed(3);
      for (i = 0; i < 3; i++) {
        var hop = Math.sin(prog(p, 0.635 + i * 0.012, 0.675 + i * 0.012) * Math.PI);
        var over = Math.sin(prog(p, 0.675 + i * 0.016, 0.705 + i * 0.016) * Math.PI);
        pr.cards[i].style.transform = 'translate3d(0,' + (-(hop * 16 + over * 7)).toFixed(2) + 'px,0)';
      }
      var hov = sstep(0.612, 0.625, p) * (1 - sstep(0.655, 0.67, p)), press = sstep(0.628, 0.632, p) * (1 - sstep(0.642, 0.648, p));
      pr.fBtn.style.transform = 'scale(' + (1 + 0.09 * hov - 0.07 * press).toFixed(3) + ')';
      pr.fBtn.style.background = hov > 0.5 ? '#1E9E08' : '';
      // 04: celular entra, endereço é digitado, publicar
      var phIn = E.o3(prog(p, 0.785, 0.845));
      pr.phone.style.transform = 'translate3d(' + ((1 - phIn) * 260).toFixed(1) + 'px,0,0)';
      pr.phone.style.opacity = phIn.toFixed(3);
      pr.phoneScreen.style.transform = 'translate3d(0,' + (-E.io2(prog(p, 0.885, 0.945)) * 34).toFixed(1) + 'px,0)';
      var url, n;
      if (p < 0.795) url = URL_DEV;
      else if (p < 0.808) { n = Math.round((1 - prog(p, 0.795, 0.808)) * URL_DEV.length); url = URL_DEV.slice(0, n); }
      else { n = Math.round(prog(p, 0.808, 0.858) * URL_LIVE.length); url = URL_LIVE.slice(0, n); }
      if (pr._url !== url) { pr.url.textContent = url || '​'; pr._url = url; }
      var pressed = p >= 0.886 && p < 0.9;
      pr.pub.style.transform = pressed ? 'scale(.92)' : '';
      var bar = prog(p, 0.888, 0.94);
      pr.pubBar.style.transform = 'scaleX(' + E.io2(bar).toFixed(3) + ')';
      pr.pubBar.style.opacity = (1 - sstep(0.945, 0.96, p)).toFixed(3);
      var done = p >= 0.94, lbl = done ? 'Publicado' : 'Publicar';
      if (pr._pub !== lbl) { pr.pub.textContent = lbl; pr.pub.style.background = done ? '#1E9E08' : ''; pr._pub = lbl; }
      var toast = E.back(prog(p, 0.94, 0.965));
      pr.toast.style.opacity = clamp(toast * 1.5).toFixed(3);
      pr.toast.style.transform = 'translate3d(0,' + ((1 - toast) * 30).toFixed(1) + 'px,0)';
    }
  });

  /* ======================================================================
     4 · Serviços: três demonstrações
     ====================================================================== */
  function demoProgress(g) {                 // começa quando o topo da demo passa de 82% da tela
    if (!g || S.ry + S.vh < g.top - S.vh * 0.2 || S.ry > g.top + g.h + S.vh * 0.2) return null;
    return clamp((S.sy + S.vh * 0.82 - g.top) / (S.vh * 0.62));
  }

  // --- sites: JG encolhe a janela do computador até o celular
  var rsp = { root: id('rsp'), win: id('rspWin'), size: id('rspSize'), grip: id('rspGrip'), f: 1 };
  function rspMin() { var w = rsp.root.offsetWidth || 1; return Math.max(0.33, Math.min(0.62, 236 / w)); }
  var svcSites = new Scene({
    id: 'sites', frame: rsp.root, world: 'dark',
    progress: function () { return demoProgress(G.svc && G.svc[0]); },
    entry: function (who) { var r = frameRect(rsp.root); return who === 'jg' ? { x: S.vw + 60, y: r.top + r.height * 0.3 } : null; },
    rest: function (who) { var r = frameRect(rsp.root); return who === 'lc' ? { x: r.left - 34, y: r.top + r.height * 0.86 } : null; },
    lead: 0.1,
    beats: [
      move('jg', function (u, sc) {
        var w = rsp.root.offsetWidth, h = rsp.root.offsetHeight - 34;
        return sc.pt(w * lerp(1, rspMin(), E.io3(u)) + 3, h * 0.5 + 6);
      }, 0.12, 0.84, { down: true })
    ],
    sayAt: function (q) { return q > 0.02 ? 'JG Dev está encolhendo a janela: ' + Math.round(lerp(1280, 390, E.io3(prog(q, 0.12, 0.84)))) + ' px' : null; },
    update: function (q) {
      var e = E.io3(prog(q, 0.12, 0.84)), f = lerp(1, rspMin(), e), w = rsp.root.offsetWidth;
      rsp.win.style.width = (f * 100).toFixed(2) + '%';
      var px = Math.round(lerp(1280, 390, e)) + ' px';
      if (rsp.size.textContent !== px) rsp.size.textContent = px;
      rsp.size.style.transform = 'translate3d(' + Math.max(0, f * w - rsp.size.offsetWidth).toFixed(1) + 'px,0,0)';
    }
  });

  // --- programas: LC seleciona a planilha e ela vira painel
  var xls = { root: id('xls'), sheet: id('xlsSheet'), old: id('xlsOld'), neu: id('xlsNew'), kpi1: id('xlsKpi1'), kpi2: id('xlsKpi2'), axis: id('xlsAxis'), cells: [], C: 6, Rn: 7, pick: null,
    bars: [0.46, 0.6, 0.52, 0.76, 0.68, 0.92] };
  (function () {
    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var r = 0; r < xls.Rn; r++) for (var c = 0; c < xls.C; c++) {
      var d = D.createElement('div'), s = D.createElement('span');
      d.className = 'xls__cell'; s.textContent = r === 0 ? ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][c] : String(Math.round(40 + rnd() * 900));
      d.appendChild(s); xls.sheet.appendChild(d); xls.cells.push({ el: d, txt: s, c: c, r: r });
    }
    xls.pick = D.createElement('div'); xls.pick.className = 'xls__pick'; xls.sheet.appendChild(xls.pick);
  })();
  var svcProg = new Scene({
    id: 'programas', frame: xls.root, world: 'dark',
    progress: function () { return demoProgress(G.svc && G.svc[1]); },
    entry: function (who) { var r = frameRect(xls.root); return who === 'lc' ? { x: r.left - 60, y: r.top + 20 } : { x: S.vw + 60, y: r.top + r.height * 0.4 }; },
    rest: function (who) { var r = frameRect(xls.root); return who === 'lc' ? { x: r.left + r.width * 0.5, y: r.top + r.height + 18 } : { x: r.left + r.width + 8, y: r.top + 100 }; },
    lead: 0.07,
    beats: [
      move('lc', function (u, sc) {
        var l = local(xls.sheet, xls.root), e = E.io2(u);
        return sc.pt(l.x + l.w * e, l.y + l.h * e);
      }, 0.07, 0.29, { down: true, say: 'LC Dev selecionou a planilha inteira' }),
      click('lc', function (sc) { var l = local(xls.sheet, xls.root); return sc.pt(l.x + l.w * 0.5, l.y + l.h * 0.5); }, 0.31, 0.37, { at: 0.5, hold: 0.3 }),
      carry('jg', xls.kpi1, 0.6, 0.72, { from: function (sc, h) { return { x: S.vw + 40, y: h.y - 40 }; }, rot: 4, linger: 0.03, settle: 0.03 }),
      carry('jg', xls.kpi2, 0.75, 0.86, { from: function (sc, h) { return { x: S.vw + 40, y: h.y + 60 }; }, rot: -4, linger: 0.03, settle: 0.03 })
    ],
    sayAt: function (q) { return q >= 0.5 ? 'A planilha virou painel' : null; },
    update: function (q) {
      var Wd = xls.sheet.offsetWidth, Hd = xls.sheet.offsetHeight, C = xls.C, Rn = xls.Rn, cw = Wd / C, rh = Hd / Rn;
      var m = prog(q, 0.36, 0.86), maxH = Math.min(0.78, (Hd - 100) / Hd), i, o;
      // seleção
      var se = E.io2(prog(q, 0.07, 0.29)), sa = (q > 0.07 ? 1 : 0) * (1 - sstep(0.34, 0.39, q));
      xls.pick.style.opacity = sa.toFixed(3);
      xls.pick.style.width = (Wd * se).toFixed(1) + 'px'; xls.pick.style.height = (Hd * se).toFixed(1) + 'px';
      for (i = 0; i < xls.cells.length; i++) {
        o = xls.cells[i];
        var e = E.io3(prog(m, o.c * 0.07, 0.62 + o.c * 0.07));
        var Hb = xls.bars[o.c] * maxH * Hd, seg = Hb / Rn, bw = cw * 0.58;
        var x = lerp(o.c * cw, o.c * cw + (cw - bw) / 2, e), y = lerp(o.r * rh, Hd - Hb + o.r * seg, e);
        var w = lerp(cw - 1, bw, e), h = lerp(rh - 1, seg + 0.7, e);
        o.el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0)';
        o.el.style.width = w.toFixed(2) + 'px'; o.el.style.height = h.toFixed(2) + 'px';
        o.el.style.backgroundColor = o.r === 0 && e < 0.02 ? '#E9ECEB' : mixRGB(o.r === 0 ? [233, 236, 235] : [255, 255, 255], [144, 238, 31], e);
        o.el.style.borderRadius = o.r === 0 ? (e * 9).toFixed(1) + 'px ' + (e * 9).toFixed(1) + 'px 0 0' : '0';
        o.txt.style.opacity = (1 - prog(e, 0, 0.3)).toFixed(3);
      }
      xls.old.style.textDecorationColor = q > 0.3 ? '#fff' : 'transparent';
      xls.old.style.opacity = (1 - sstep(0.36, 0.46, q)).toFixed(3);
      xls.neu.style.opacity = sstep(0.5, 0.6, q).toFixed(3);
      xls.neu.style.transform = 'translate3d(0,' + ((1 - sstep(0.5, 0.6, q)) * 8).toFixed(1) + 'px,0)';
      xls.axis.style.opacity = sstep(0.7, 0.86, q).toFixed(3);
    }
  });

  // --- automações: os cursores ligam os fios e o fluxo passa a rodar sozinho
  var flow = { root: id('flow'), svg: id('flowSvg'), nodes: { A: id('nA'), B: id('nB'), C: id('nC'), D: id('nD') },
    wires: [{ el: id('wire1'), a: 'A', b: 'B', pulse: id('pulse1'), t0: 0.08, t1: 0.3, len: 1 }, { el: id('wire2'), a: 'B', b: 'C', pulse: id('pulse2'), t0: 0.36, t1: 0.56, len: 1 }, { el: id('wire3'), a: 'B', b: 'D', pulse: id('pulse3'), t0: 0.62, t1: 0.82, len: 1 }] };
  function flowLayout() {
    flow.wires.forEach(function (w) {
      var a = local(flow.nodes[w.a], flow.root), b = local(flow.nodes[w.b], flow.root), x1, y1, x2, y2, d;
      if (b.x >= a.x + a.w - 4) {            // lado a lado
        x1 = a.x + a.w; y1 = a.y + a.h / 2; x2 = b.x; y2 = b.y + b.h / 2;
        var mx = (x2 - x1) * 0.5; d = 'M' + x1 + ' ' + y1 + ' C' + (x1 + mx) + ' ' + y1 + ' ' + (x2 - mx) + ' ' + y2 + ' ' + x2 + ' ' + y2;
      } else {                               // empilhados (celular)
        x1 = a.x + a.w / 2; y1 = a.y + a.h; x2 = b.x + b.w / 2; y2 = b.y;
        var my = (y2 - y1) * 0.5; d = 'M' + x1 + ' ' + y1 + ' C' + x1 + ' ' + (y1 + my) + ' ' + x2 + ' ' + (y2 - my) + ' ' + x2 + ' ' + y2;
      }
      w.el.setAttribute('d', d); w.len = w.el.getTotalLength() || 1;
      w.el.style.strokeDasharray = w.len + ' ' + w.len;
    });
  }
  function wireBeat(who, w, say) {
    return move(who, function (u, sc) { var p = w.el.getPointAtLength(w.len * E.io2(u)); return sc.pt(p.x, p.y); }, w.t0, w.t1, { down: true, say: say });
  }
  var svcAuto = new Scene({
    id: 'automacoes', frame: flow.root, world: 'dark',
    progress: function () { return demoProgress(G.svc && G.svc[2]); },
    entry: function (who) { var r = frameRect(flow.root); return who === 'jg' ? { x: r.left - 60, y: r.top + r.height * 0.3 } : { x: S.vw + 60, y: r.top + r.height * 0.6 }; },
    rest: function (who) { var r = frameRect(flow.root); return who === 'jg' ? { x: r.left + r.width * 0.2, y: r.top + r.height + 14 } : { x: r.left + r.width * 0.74, y: r.top + r.height + 20 }; },
    lead: 0.08,
    beats: [
      wireBeat('jg', flow.wires[0], 'JG Dev está ligando o pedido ao robô'),
      wireBeat('lc', flow.wires[1], 'LC Dev ligou o aviso ao cliente'),
      wireBeat('lc', flow.wires[2], 'LC Dev ligou o registro no sistema')
    ],
    sayAt: function (q) { return q >= 0.86 ? 'Automação rodando sozinha' : null; },
    update: function (q) {
      var on = { A: q > 0.04, B: q >= 0.3, C: q >= 0.56, D: q >= 0.82 }, k;
      for (k in on) flow.nodes[k].classList.toggle('is-on', on[k]);
      flow.wires.forEach(function (w, i) {
        var u = prog(q, w.t0, w.t1);
        w.el.style.strokeDashoffset = (w.len * (1 - E.io2(u))).toFixed(1);
        w.el.style.opacity = u > 0 ? 1 : 0;
        if (u >= 1) {
          var f = ((S.t * 0.00042 + i * 0.37) % 1), p = w.el.getPointAtLength(w.len * f);
          w.pulse.setAttribute('cx', p.x.toFixed(1)); w.pulse.setAttribute('cy', p.y.toFixed(1));
          w.pulse.style.opacity = Math.sin(f * Math.PI).toFixed(3);
        } else w.pulse.style.opacity = 0;
      });
    }
  });

  /* ======================================================================
     5 · Planos: os recibos saem da impressora e o JG carimba
     ====================================================================== */
  var pl = { desk: id('plansDesk'), rc: [id('rc1'), id('rc2'), id('rc3')], paper: [], stamp: id('stamp') };
  pl.paper = pl.rc.map(function (r) { return r.firstElementChild; });
  function pull(who, i, t0, t1, say) {
    return move(who, function (u, sc) {
      var r = sc.rect(pl.rc[i]), e = E.io3(u);
      return { x: r.x + r.w * (0.5 + (i - 1) * 0.06), y: r.y + (pl.paper[i].offsetHeight - 14) * e + 6 };
    }, t0, t1, { down: true, say: say,
      apply: function (u) { pl.paper[i].style.transform = 'translate3d(0,' + (-(1 - E.io3(clamp(u))) * 101).toFixed(2) + '%,0)'; } });
  }
  var plans = new Scene({
    id: 'planos', frame: pl.desk, world: 'dark',
    progress: function () {
      var g = G.plans;
      if (!g || S.ry + S.vh < g.top - S.vh * 0.2 || S.ry > g.top + g.h + S.vh * 0.2) return null;
      return clamp((S.sy + S.vh * 0.8 - g.top) / Math.max(S.vh * 0.7, g.h * (G.narrow ? 0.86 : 0.5)));
    },
    entry: function (who) { var r = frameRect(pl.desk); return who === 'lc' ? { x: r.left - 50, y: r.top - 30 } : { x: S.vw + 50, y: r.top - 20 }; },
    rest: function (who) { var r = frameRect(pl.desk); return who === 'lc' ? { x: r.left + r.width * 0.3, y: r.top + r.height + 10 } : null; },
    lead: 0.05,
    beats: [
      pull('lc', 0, 0.05, 0.3, 'LC Dev está imprimindo os recibos'),
      pull('lc', 1, 0.36, 0.6),
      (pl.pull3 = pull('jg', 2, 0.2, 0.5)),
      (pl.stampBeat = click('jg', pl.stamp, 0.7, 0.84, { at: 0.4, hold: 0.3, say: 'JG Dev carimbou: pagamento único' }))
    ],
    update: function (q) {
      var b = pl.stampBeat, at = lerp(b.t0, b.t1, 0.4), s = prog(q, at, at + 0.035);
      pl.stamp.style.opacity = s > 0 ? clamp(s * 3).toFixed(3) : 0;
      pl.stamp.style.transform = 'rotate(-14deg) scale(' + lerp(1.9, 1, E.o3(s)).toFixed(3) + ')';
    }
  });

  /* ======================================================================
     6 · Time: os cursores assinam a obra
     ====================================================================== */
  var tm = { grid: id('teamGrid'), big: { jg: id('bigJG'), lc: id('bigLC') }, dev: { jg: id('devJG'), lc: id('devLC') } };
  function dock(who) {
    return move(who, function (u, sc) {
      var r = frameRect(tm.dev[who]), g = G.team;        // tm.big é <svg> (sem offsetLeft/Top): a caixa vem do cartão + medidas de layout
      return { x: r.left + g.bw * 0.06, y: r.top + g.pad + g.bw * 1.02 };   // logo abaixo do cursor grande, sem cobrir o texto
    }, 0.42, 1, {});
  }
  var team = new Scene({
    id: 'time', frame: tm.grid, world: 'dark',
    progress: function () {
      var g = G.team;
      if (!g || S.ry + S.vh < g.top - S.vh * 0.2 || S.ry > g.top + g.h + S.vh * 0.2) return null;
      return clamp((S.sy + S.vh * 0.86 - g.top) / (S.vh * 0.5));
    },
    entry: function (who) { var r = frameRect(tm.grid); return who === 'jg' ? { x: r.left - 60, y: r.top - 60 } : { x: S.vw + 60, y: r.top - 40 }; },
    lead: 0.4,
    beats: [dock('jg'), dock('lc')],
    sayAt: function (q) { return q > 0.3 ? 'JG Dev e LC Dev assinam a obra' : null; },
    update: function (q) {
      ['jg', 'lc'].forEach(function (k, i) {
        var e = E.back(prog(q, 0.1 + i * 0.12, 0.6 + i * 0.12));
        tm.big[k].style.transform = 'scale(' + (0.4 + 0.6 * e).toFixed(3) + ') rotate(' + ((1 - e) * -18).toFixed(2) + 'deg)';
        tm.big[k].style.transformOrigin = '13% 9%';
        tm.big[k].style.opacity = clamp(prog(q, 0.1 + i * 0.12, 0.3 + i * 0.12) * 1.5).toFixed(3);
      });
    }
  });

  /* ======================================================================
     7 · Chamada final: aurora verde, os dois esperando o terceiro cursor
     ====================================================================== */
  var ct = { sec: id('contato'), inner: id('ctaInner'), btn: id('ctaBtn'), btn2: id('ctaBtn2'), logo: id('ctaLogo'), hover: 0, hot: false };
  [ct.btn, ct.btn2].forEach(function (b) {
    b.addEventListener('pointerenter', function () { ct.hot = true; });
    b.addEventListener('pointerleave', function () { ct.hot = false; });
  });
  function wait(who, side) {
    return move(who, function (u, sc) {
      var r = sc.rect(side < 0 ? ct.btn : ct.btn2), hop = Math.abs(Math.sin(S.t * 0.004 + (side > 0 ? 1.3 : 0))) * (6 + ct.hover * 12);
      /* empilhados (celular): os dois esperam embaixo dos botões */
      if (S.vw < 760) { var r2 = sc.rect(ct.btn2); return { x: side < 0 ? r2.x + 8 : r2.x + r2.w - 92, y: r2.y + r2.h + 14 + hop * 0.6 }; }
      return { x: side < 0 ? r.x - 88 : r.x + r.w + 10, y: r.y + r.h * 0.5 - 8 - hop };
    }, 0.5, 1, {});
  }
  var cta = new Scene({
    id: 'cta', frame: ct.inner, world: 'dark',
    progress: function () {
      var g = G.cta;
      if (!g || S.ry + S.vh < g.top - S.vh * 0.1) return null;
      /* só assume os cursores quando a chamada já ocupa a parte de baixo da tela: antes disso eles terminam de assinar no time */
      return clamp((S.sy + S.vh * 0.62 - g.top) / (S.vh * 0.55));
    },
    entry: function (who) { return who === 'jg' ? { x: -60, y: S.vh * 0.5 } : { x: S.vw + 60, y: S.vh * 0.5 }; },
    lead: 0.45,
    beats: [wait('jg', -1), wait('lc', 1)],
    sayAt: function (q) { return q > 0.4 ? 'Só falta o seu cursor' : null; },
    update: function () {
      ct.hover += ((ct.hot ? 1 : 0) - ct.hover) * (1 - Math.exp(-S.dt * 0.01));
      ct.logo.style.transform = 'translate3d(0,' + (Math.sin(S.t * 0.0012) * 7).toFixed(2) + 'px,0) rotate(' + (S.spx * 2.4).toFixed(2) + 'deg)';
    }
  });

  /* ======================================================================
     Medidas (resize) e laço principal
     ====================================================================== */
  var hud = id('hud'), chip = id('chip'), chipTxt = id('chipTxt'), you = id('curYou');
  var svcDemos = $$('.svc__demo');
  function docTop(el) { return el.getBoundingClientRect().top + W.scrollY; }
  function measure() {
    S.vw = D.documentElement.clientWidth || W.innerWidth; S.vh = W.innerHeight;
    G.narrow = S.vw <= 900;
    G.hero = { top: docTop(hero.sec), h: hero.sec.offsetHeight, vh: hero.stage.offsetHeight };
    G.man = { top: docTop(man.sec), h: man.sec.offsetHeight };
    G.proc = { top: docTop(pr.sec), h: pr.sec.offsetHeight, vh: pr.stage.offsetHeight };
    G.svc = svcDemos.map(function (d) { return { top: docTop(d), h: d.offsetHeight }; });
    G.plans = { top: docTop(pl.desk), h: pl.desk.offsetHeight };
    G.team = { top: docTop(tm.grid), h: tm.grid.offsetHeight, pad: parseFloat(getComputedStyle(tm.dev.jg).paddingTop) || 0, bw: parseFloat(getComputedStyle(tm.big.jg).width) || 120 };
    G.cta = { top: docTop(ct.sec), h: ct.sec.offsetHeight };
    // recibos: lado a lado (JG puxa o terceiro junto) ou empilhados (um depois do outro)
    pl.pull3.t0 = G.narrow ? 0.62 : 0.2; pl.pull3.t1 = G.narrow ? 0.82 : 0.5;
    pl.stampBeat.t0 = G.narrow ? 0.86 : 0.7; pl.stampBeat.t1 = G.narrow ? 0.97 : 0.84;
    plans.tracks.jg.sort(function (a, b) { return a.t0 - b.t0; });
    // prancheta do processo
    var cw = pr.canvas.clientWidth, chh = pr.canvas.clientHeight;
    pr.scale = Math.max(0.2, Math.min(cw / 1000, chh / 640, 1.25));
    pr.board.style.transform = 'scale(' + pr.scale.toFixed(4) + ')';
    var probe = D.createElement('span'); probe.textContent = '0000000000'; probe.style.cssText = 'position:absolute;visibility:hidden';
    pr.code.appendChild(probe); pr.chW = probe.offsetWidth / 10 || 7.5; pr.code.removeChild(probe);
    // caixas tracejadas do rascunho
    hero.boxes.forEach(function (b) {
      var r = local(b.el, b.frame || hero.stage), pad = b.el === hero.slot ? 0 : 7;
      b.box.style.transform = 'translate3d(' + (r.x - pad) + 'px,' + (r.y - pad) + 'px,0)';
      b.box.style.width = (r.w + pad * 2) + 'px'; b.box.style.height = (r.h + pad * 2) + 'px';
    });
    // círculo do manifesto
    var m = local(man.mark, man.inner), padX = m.w * 0.05 + 10, padY = m.h * 0.12;
    man.box = { x: m.x - padX, y: m.y - padY + m.h * 0.03, w: m.w + padX * 2, h: m.h + padY * 2 };
    man.svg.style.left = man.box.x + 'px'; man.svg.style.top = man.box.y + 'px';
    man.svg.style.width = man.box.w + 'px'; man.svg.style.height = man.box.h + 'px';
    flowLayout();
    if (GL) GL.resize();
    memo.clear();
  }

  var lastSay = '', sayShown = 0;
  function setSay(txt) {
    if (!txt || txt === lastSay) return;
    lastSay = txt; chipTxt.textContent = txt; sayShown = S.t;
  }

  function tick(dt) {
    dt = Math.min(dt, 64); S.dt = dt; S.t += dt;
    memo.clear();
    S.ry = W.scrollY;
    if (!S.ready) return;
    var ks = REDUCED ? 1 : 1 - Math.exp(-dt * 0.0125);
    S.sy += (S.ry - S.sy) * ks; if (Math.abs(S.ry - S.sy) < 0.06) S.sy = S.ry;
    var kp = 1 - Math.exp(-dt * 0.006);
    S.spx += (S.px - S.spx) * kp; S.spy += (S.py - S.spy) * kp;

    // abertura: tempo; se a pessoa já rolou, acelera até o fim
    if (S.started && !S.introDone) S.introT += dt * (S.ry > 30 ? 9 : 1);
    S.dive = (S.introDone && !REDUCED) ? clamp((S.sy - G.hero.top) / Math.max(1, G.hero.h - G.hero.vh)) : 0;

    // quem dirige os cursores: a última cena visível que já começou
    var i, sc, director = null, vis = [];
    for (i = 0; i < scenes.length; i++) {
      sc = scenes[i]; sc.q = REDUCED ? 1 : sc.progress();
      if (sc.q === null) continue;
      vis.push(sc);
      if (!director || sc.q > 0) director = sc;
    }
    var res = { jg: null, lc: null };
    if (director && !REDUCED) {
      ['jg', 'lc'].forEach(function (k) {
        var r = resolve(director, k, director.q), a = actors[k];
        res[k] = r;
        if (r) a.aim(r.x, r.y, r.down, 1);
        else a.aim(a.tx, a.ty, false, 0);
      });
    } else { jg.tvis = 0; lc.tvis = 0; }
    jg.step(dt); lc.step(dt);

    // peças
    for (i = 0; i < vis.length; i++) {
      sc = vis[i];
      var q = sc.q, both = sc.tracks.jg.concat(sc.tracks.lc), j, b, u, holder;
      for (j = 0; j < both.length; j++) {
        b = both[j]; if (!b.apply) continue;
        u = (q - b.t0) / Math.max(1e-6, b.t1 - b.t0); u = u < 0 ? 0 : u > 1 ? 1 : u;
        holder = (sc === director && res[b.who] && res[b.who].beat === b) ? actors[b.who] : null;
        b.apply(u, q, sc, holder);
      }
      if (sc.update) sc.update(q);
    }

    // seleção e legenda
    if (director && !REDUCED) {
      ['jg', 'lc'].forEach(function (k) {
        var r = res[k], rect = null, b;
        if (director.customSel) rect = director.customSel(k, director.q);
        if (!rect && r) {
          b = r.beat || r.prev;
          if (b && b.selRect) rect = b.selRect(r.beat ? r.u : 1, director.q, director);
        }
        actors[k].select(rect);
      });
      var txt = director.sayAt ? director.sayAt(director.q) : null;
      if (!txt) {
        var best = null;
        director.tracks.jg.concat(director.tracks.lc).forEach(function (b) { if (typeof b.say === 'string' && b.t0 <= director.q && (!best || b.t0 > best.t0)) best = b; });
        if (best) txt = best.say;
      }
      setSay(txt);
      var world = director.world;
      if (director === dive && S.dive > 0.74) world = 'lime';
      if (world !== S.world) { S.world = world; hud.className = 'hud on-' + world; }
    } else { jg.select(null); lc.select(null); }
    jg.draw(); lc.draw();
    var chipOn = S.started && lastSay && !REDUCED ? 1 : 0, pop = prog(S.t - sayShown, 0, 260);
    chip.style.opacity = chipOn;
    chip.style.transform = 'translate3d(0,' + ((1 - E.o3(pop)) * 6).toFixed(2) + 'px,0)';

    // WebGL
    if (GL) {
      var heroOn = S.ry < G.man.top + S.vh * 0.2, ctaOn = S.ry + S.vh > G.cta.top - S.vh * 0.1;
      if (heroOn) {
        var g = logoGeom(), rendered = S.introDone ? 1 : prog(S.sweepX, 0, S.vw);
        GL.studio({
          time: S.t / 1000, cx: g.cx, cy: g.cy, size: g.size,
          sweep: S.introDone ? 1e6 : S.sweepX, scan: !S.introDone && S.sweepX > -50 && S.sweepX < S.vw + 50 ? 1 : 0,
          fill: logo.fill, outline: logo.ghost,
          glass: sstep(3.2, 9, g.Sc), flood: sstep(0.74, 0.9, S.dive),
          live: rendered * (FINE ? 1 : 0.0) * (1 - sstep(0.02, 0.2, S.dive)), px: S.spx, py: S.spy
        });
      } else if (ctaOn) {
        GL.aurora({ time: S.t / 1000, amp: sstep(0.05, 0.75, cta.q === null ? 0 : cta.q), shift: (S.sy - G.cta.top) / S.vh, px: S.spx, py: S.spy });
      }
    }
  }

  /* ======================================================================
     O terceiro cursor: o seu
     ====================================================================== */
  if (FINE && !REDUCED) {
    var youOn = false;
    W.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      S.px = (e.clientX / S.vw) * 2 - 1; S.py = (e.clientY / S.vh) * 2 - 1;
      you.style.transform = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0)';
      if (!youOn) { youOn = true; you.style.opacity = '1'; R.classList.add('has-you'); }
    }, { passive: true });
    D.addEventListener('mouseleave', function () { youOn = false; you.style.opacity = '0'; });
    W.addEventListener('pointerdown', function () { you.firstElementChild.style.transform = 'scale(.85)'; }, { passive: true });
    W.addEventListener('pointerup', function () { you.firstElementChild.style.transform = ''; }, { passive: true });
  }

  // âncoras
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var t = id(a.getAttribute('href').slice(1)); if (!t) return;
      e.preventDefault();
      W.scrollTo({ top: Math.max(0, docTop(t)), behavior: REDUCED ? 'auto' : 'smooth' });
    });
  });

  /* ======================================================================
     Partida
     ====================================================================== */
  var loader = id('loader'), loaderBar = id('loaderBar'), bootT = 0, booted = false, assets = false;
  function whenImage(img) {
    return new Promise(function (ok) {
      if (img.complete && img.naturalWidth) return ok();
      img.addEventListener('load', ok, { once: true }); img.addEventListener('error', ok, { once: true });
    });
  }
  var mapsImg = new Image(); mapsImg.src = '{{IMG_MAPS}}';
  var fontsReady = (D.fonts && D.fonts.ready) ? D.fonts.ready : Promise.resolve();
  Promise.all([whenImage(hero.img), whenImage(mapsImg), fontsReady]).then(function () {
    if (GL) { try { GL.textures(hero.img, mapsImg); } catch (e) { R.classList.add('no-gl'); GL = null; } }
    assets = true;
  });

  function boot(dt) {                         // roda no lugar do tick até a cortina subir
    bootT += dt;
    var p = Math.min(bootT / 620, assets ? 1 : 0.86);
    loaderBar.style.transform = 'scaleX(' + E.o2(clamp(p)).toFixed(3) + ')';
    if (!S.ready && assets && bootT >= 620) {
      measure(); S.ready = true; S.started = true; S.sy = S.ry = W.scrollY;
      if (S.ry > 40 || location.hash.length > 1) { S.introT = INTRO * 1000; }
      bootT = 620;
    }
    if (S.ready) {
      var u = prog(bootT, 620, 1300);
      loader.style.transform = 'translate3d(0,' + (-E.io3(u) * 101).toFixed(2) + '%,0)';
      if (u >= 1) { loader.style.display = 'none'; booted = true; }
    }
  }
  function frame(dt) { if (!booted) boot(dt); tick(dt); }

  if (REDUCED) {
    Promise.all([whenImage(hero.img), fontsReady]).then(function () {
      measure(); S.ready = true; S.started = true; S.introT = INTRO * 1000; booted = true;
      var last = 0;
      (function loop(now) { frame(last ? now - last : 16); last = now; W.requestAnimationFrame(loop); })(0);
    });
  } else if (CAPTURE) {
    W.__jl = { step: function (ms) { frame(ms); }, S: S, G: G, scenes: scenes, measure: measure };
  } else {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (location.hash.length <= 1) W.scrollTo(0, 0);
    var prev = 0;
    W.requestAnimationFrame(function loop(now) { frame(prev ? now - prev : 16); prev = now; W.requestAnimationFrame(loop); });
  }

  var rz = 0;
  W.addEventListener('resize', function () { if (!S.ready) return; W.cancelAnimationFrame(rz); rz = W.requestAnimationFrame(measure); });
  W.addEventListener('load', function () { if (S.ready) measure(); });
})();
