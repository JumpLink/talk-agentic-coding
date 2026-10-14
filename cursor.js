'use strict';
// Neon mouse pointer: a dot that follows exactly, a ring that trails behind, hidden when idle.

(() => {
  const dot = document.createElement('div'), ring = document.createElement('div');
  dot.className = 'cur-dot'; ring.className = 'cur-ring';
  document.body.append(ring, dot);
  let mx = -100, my = -100, rx = -100, ry = -100, idle;

  const wake = () => {
    document.body.classList.remove('cur-idle');
    clearTimeout(idle);
    idle = setTimeout(() => document.body.classList.add('cur-idle'), 2500);
  };
  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
    ring.classList.toggle('hover', !!e.target.closest('a'));
    wake();
  });
  addEventListener('mousedown', () => {
    ring.classList.add('down');
    const r = document.createElement('div');
    r.className = 'cur-ripple';
    r.style.left = mx + 'px'; r.style.top = my + 'px';
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 700);
    wake();
  });
  addEventListener('mouseup', () => ring.classList.remove('down'));
  document.addEventListener('mouseleave', () => document.body.classList.add('cur-idle'));

  const follow = () => {
    rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(follow);
  };
  follow();
  wake();
})();
