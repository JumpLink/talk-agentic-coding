'use strict';
// Shared helpers for all slide animations. Plain script (no modules) so the show runs from file://.

const NS = 'http://www.w3.org/2000/svg';
const C = {
  cyan: '#00f0ff', mag: '#ff2bd6', lime: '#6dff8b', amber: '#ffb627',
  violet: '#a370ff', red: '#ff3b5c', blue: '#3d8bff', ink: '#e8f6ff', dim: '#6b7f99',
};
const STOP = Symbol('stop');
const ANIMS = {};

const ease = {
  io: p => (p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
  out: p => 1 - Math.pow(1 - p, 3),
  lin: p => p,
};
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const lerp = (a, b, p) => a + (b - a) * p;
const rad = d => d * Math.PI / 180;
const ept = (cx, cy, rx, ry, deg) => [cx + rx * Math.cos(rad(deg)), cy + ry * Math.sin(rad(deg))];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function sideFor(deg) {
  const d = ((deg % 360) + 360) % 360;
  if (Math.abs(d - 270) < 20) return 'top';
  if (Math.abs(d - 90) < 20) return 'bottom';
  return Math.cos(rad(d)) > 0 ? 'right' : 'left';
}

function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) {
    if (k === 'text') e.textContent = attrs[k];
    else e.setAttribute(k, attrs[k]);
  }
  if (parent) parent.appendChild(e);
  return e;
}

function restart(e, cls) {
  e.classList.remove(cls);
  void e.getBoundingClientRect();
  e.classList.add(cls);
}

// One Run per slide visit. Stopping it makes every pending sleep/tween reject with STOP,
// so a long async animation script unwinds as soon as the speaker navigates away.
class Run {
  constructor() { this.alive = true; this.frames = []; }
  sleep(ms) { return new Promise((res, rej) => setTimeout(() => (this.alive ? res() : rej(STOP)), ms)); }
  tween(ms, fn, e = ease.io) {
    return new Promise((res, rej) => {
      const t0 = performance.now();
      const step = () => {
        if (!this.alive) return rej(STOP);
        const p = Math.max(0, Math.min(1, (performance.now() - t0) / ms));
        fn(e(p));
        if (p < 1) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
  }
  frame(fn) { this.frames.push(fn); }
  stop() { this.alive = false; this.frames = []; }
  async loop(fn) { while (this.alive) { await fn(); await this.sleep(30); } }
  spawn(p) { p.catch(e => { if (e !== STOP) console.error(e); }); }
}

function svgIn(box, w, h) {
  if (typeof box === 'string') box = document.getElementById(box);
  box.innerHTML = '';
  return el('svg', { viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: 'xMidYMid meet' }, box);
}

function icon(p, kind, r, c) {
  if (kind === 'human') {
    el('circle', { cy: -r * .26, r: r * .2, fill: c }, p);
    el('path', { d: `M ${-r * .42} ${r * .44} Q ${-r * .42} ${r * .02} 0 ${r * .02} Q ${r * .42} ${r * .02} ${r * .42} ${r * .44} Z`, fill: c }, p);
  } else if (kind === 'bot') {
    el('rect', { x: -r * .42, y: -r * .28, width: r * .84, height: r * .64, rx: r * .14, fill: 'none', stroke: c, 'stroke-width': Math.max(1.5, r * .07) }, p);
    el('circle', { cx: -r * .17, cy: r * .04, r: r * .08, fill: c }, p);
    el('circle', { cx: r * .17, cy: r * .04, r: r * .08, fill: c }, p);
    el('line', { x1: 0, y1: -r * .28, x2: 0, y2: -r * .46, stroke: c, 'stroke-width': Math.max(1.5, r * .06) }, p);
    el('circle', { cy: -r * .5, r: r * .06, fill: c }, p);
  } else {
    el('text', { class: 'icon', 'font-size': r * .85, text: kind }, p);
  }
}

function node(p, x, y, o = {}) {
  const r = o.r || 40, c = o.c || C.cyan;
  const g = el('g', { class: 'nd', transform: `translate(${x},${y})`, style: `--c:${c}` }, p);
  if (!o.noHalo) el('circle', { class: 'halo', r: r + 11 }, g);
  const pop = el('g', { class: 'pop' }, g);
  el('circle', { class: 'core', r, filter: 'url(#glow)' }, pop);
  let ic = null;
  if (o.icon) { ic = el('g', {}, pop); icon(ic, o.icon, r, c); }
  if (o.label) {
    const side = o.side || 'bottom';
    let lx = 0, ly = r + 32, anchor = 'middle';
    if (side === 'top') ly = -r - (o.sub ? 44 : 20);
    if (side === 'left') { lx = -r - 20; ly = o.sub ? -4 : 7; anchor = 'end'; }
    if (side === 'right') { lx = r + 20; ly = o.sub ? -4 : 7; anchor = 'start'; }
    el('text', { class: 'lbl', x: lx, y: ly, style: `text-anchor:${anchor}`, text: o.label }, g);
    if (o.sub) el('text', { class: 'sublbl', x: lx, y: ly + 22, style: `text-anchor:${anchor}`, text: o.sub }, g);
  }
  const n = {
    g, x, y, r, c, s: 1,
    on(v = true) { if (!v) g.classList.remove('on'); else if (!g.classList.contains('on')) restart(g, 'on'); },
    pulse() { restart(g, 'on'); },
    place(nx, ny, s = n.s) { n.x = nx; n.y = ny; n.s = s; g.setAttribute('transform', `translate(${nx},${ny}) scale(${s})`); },
    glyph(kind, col = c) { ic.innerHTML = ''; icon(ic, kind, r, col); },
  };
  return n;
}

function agent(p, c = C.cyan, r = 15) {
  const g = el('g', { style: `--c:${c}` }, p);
  el('circle', { r, fill: '#050a14', stroke: c, 'stroke-width': 2, filter: 'url(#glow)' }, g);
  icon(g, 'bot', r * 1.25, c);
  return { g, x: 0, y: 0, at(x, y) { this.x = x; this.y = y; g.setAttribute('transform', `translate(${x},${y})`); } };
}

function packet(p, c = C.amber, r = 8) {
  const g = el('circle', { r, fill: c, filter: 'url(#glow2)' }, p);
  return {
    g, x: 0, y: 0,
    at(x, y) { this.x = x; this.y = y; g.setAttribute('cx', x); g.setAttribute('cy', y); },
    color(col) { g.setAttribute('fill', col); },
    remove() { g.remove(); },
  };
}

function line(p, x1, y1, x2, y2, cls, c) {
  return el('line', { x1, y1, x2, y2, class: cls, style: `--c:${c}` }, p);
}

function bubble(p, c = C.cyan) {
  const g = el('g', { class: 'bubble', style: `--c:${c};opacity:0;transition:opacity .35s` }, p);
  const rect = el('rect', { height: 38, rx: 4 }, g);
  const t = el('text', { x: 15, y: 25 }, g);
  return {
    g,
    show(text, x, y, align = 'c', col) {
      g.style.setProperty('--c', col || c);
      t.textContent = text;
      let tw = 0;
      try { tw = t.getComputedTextLength(); } catch (_) { /* not rendered yet */ }
      const w = (tw || text.length * 10.9) + 30;
      const x0 = align === 'c' ? x - w / 2 : align === 'r' ? x - w : x;
      rect.setAttribute('width', w);
      g.setAttribute('transform', `translate(${x0},${y - 19})`);
      g.style.opacity = 1;
    },
    hide() { g.style.opacity = 0; },
  };
}

function moveTo(run, obj, x2, y2, ms = 700, e = ease.io) {
  const x1 = obj.x, y1 = obj.y;
  return run.tween(ms, p => obj.at(lerp(x1, x2, p), lerp(y1, y2, p)), e);
}
