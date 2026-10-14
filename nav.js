'use strict';
// Navigation, HUD, starfield and static decorations.

const slides = [...document.querySelectorAll('.slide')];
const stage = document.getElementById('stage');
let cur = -1, run = null;

function fit() {
  const s = Math.min(innerWidth / 1600, innerHeight / 900);
  stage.style.transform = `translate(-50%, -50%) scale(${s})`;
}

function actOf(sl) {
  const k = sl.querySelector('.kicker');
  if (!k) return 'INTRO';
  return k.textContent.replace(/^\s*\d+\s*\/\/\s*/, '').replace(/^\/\/\s*/, '').split('·')[0].trim().toUpperCase();
}

function go(i, back = false) {
  i = Math.max(0, Math.min(slides.length - 1, i));
  if (i === cur) return;
  if (run) run.stop();
  if (cur >= 0) {
    const old = slides[cur];
    old.classList.remove('active');
    old.classList.add('leaving');
    setTimeout(() => old.classList.remove('leaving'), 800);
  }
  cur = i;
  const sl = slides[i];
  sl.querySelectorAll('.frag').forEach(f => f.classList.toggle('shown', back));
  sl.classList.add('active');
  history.replaceState(null, '', '#' + (i + 1));
  document.getElementById('count').textContent = String(i + 1).padStart(2, '0') + '/' + String(slides.length).padStart(2, '0');
  document.getElementById('progress').style.width = ((i + 1) / slides.length * 100) + '%';
  document.getElementById('act').textContent = actOf(sl);
  document.getElementById('notes').textContent = (window.NOTES || [])[i] || '';
  run = new Run();
  const fn = ANIMS[sl.dataset.anim];
  if (fn) run.spawn(Promise.resolve().then(() => fn(run, sl)));
}

function next() {
  const f = slides[cur].querySelector('.frag:not(.shown)');
  if (f) f.classList.add('shown'); else go(cur + 1);
}
function prev() {
  const shown = slides[cur].querySelectorAll('.frag.shown');
  if (shown.length) shown[shown.length - 1].classList.remove('shown'); else go(cur - 1, true);
}

addEventListener('keydown', e => {
  const k = e.key;
  if (['ArrowRight', 'ArrowDown', ' ', 'PageDown', 'Enter'].includes(k)) { e.preventDefault(); next(); }
  else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev(); }
  else if (k === 'Home') go(0);
  else if (k === 'End') go(slides.length - 1);
  else if (k === 'f' || k === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); }
  else if (k === 'n' || k === 'N') document.getElementById('notes').classList.toggle('on');
  else if (k === 'b' || k === 'B' || k === '.') document.getElementById('black').classList.toggle('on');
  else if (k === '?' || k === 'h') document.getElementById('help').classList.toggle('on');
});
document.querySelectorAll('a[href^="http"]').forEach(a => { a.target = '_blank'; a.rel = 'noopener'; });
addEventListener('click', e => { if (!e.target.closest('a')) next(); });
addEventListener('contextmenu', e => { e.preventDefault(); prev(); });
addEventListener('resize', fit);

// Starfield flying towards the viewer.
const cv = document.getElementById('bg'), cx2 = cv.getContext('2d');
const stars = Array.from({ length: 420 }, () => ({ x: rand(-1, 1), y: rand(-1, 1), z: Math.random(), c: pick(['#ffffff', '#bfe9ff', '#bfe9ff', C.cyan, C.mag, C.violet]) }));
function sizeCanvas() { const d = devicePixelRatio || 1; cv.width = innerWidth * d; cv.height = innerHeight * d; }
sizeCanvas();
addEventListener('resize', sizeCanvas);
function drawStars() {
  const w = cv.width, h = cv.height;
  cx2.clearRect(0, 0, w, h);
  const g = cx2.createRadialGradient(w * .7, h * .3, 0, w * .7, h * .3, w * .6);
  g.addColorStop(0, 'rgba(120,40,200,.16)'); g.addColorStop(.5, 'rgba(0,120,200,.06)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  cx2.fillStyle = g; cx2.fillRect(0, 0, w, h);
  for (const s of stars) {
    s.z -= 0.0012;
    if (s.z <= 0.02) { s.z = 1; s.x = rand(-1, 1); s.y = rand(-1, 1); }
    const k = 0.5 / s.z, x = w / 2 + s.x * k * w / 2, y = h / 2 + s.y * k * h / 2;
    if (x < 0 || x > w || y < 0 || y > h) continue;
    cx2.globalAlpha = Math.min(1, (1 - s.z) * 1.4);
    cx2.fillStyle = s.c;
    const r = (1 - s.z) * 2.2 * (devicePixelRatio || 1);
    cx2.fillRect(x, y, r, r);
  }
  cx2.globalAlpha = 1;
}

function tick(t) {
  drawStars();
  if (run) for (const f of run.frames) f(t);
  requestAnimationFrame(tick);
}

setInterval(() => { document.getElementById('clock').textContent = new Date().toLocaleTimeString('de-DE'); }, 1000);

// Static decorations on the examples slide.
const apps = ['Bild', 'Vektor', 'Video', 'Foto', 'PDF', 'Motion', 'Layout', 'UI', 'Text', 'Audio', 'Folien', 'CAD', 'Tabelle'];
document.getElementById('apps').innerHTML = apps.map((a, i) => `<b style="animation-delay:${(i * .3).toFixed(1)}s">${a}</b>`).join('');
const hex = () => Array.from({ length: 12 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(' ');
const lines = Array.from({ length: 24 }, hex);
document.getElementById('binstream').innerHTML = [...lines, ...lines].map(l => `<div>${l}</div>`).join('');

fit();
go(Math.max(0, (parseInt(location.hash.slice(1), 10) || 1) - 1));
requestAnimationFrame(tick);
