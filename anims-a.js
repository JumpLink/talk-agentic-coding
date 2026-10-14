'use strict';
// Act 1 + the solo workflow: title orb, adoption dots, verify loop, quote, solo workflow.

ANIMS.title = async (run, slide) => {
  const s = svgIn(slide.querySelector('.viz.orb'), 640, 640);
  const gid = 'core' + Math.random().toString(36).slice(2);
  const defs = el('defs', {}, s);
  const rg = el('radialGradient', { id: gid }, defs);
  el('stop', { offset: '0%', 'stop-color': '#ff2bd6', 'stop-opacity': .55 }, rg);
  el('stop', { offset: '60%', 'stop-color': '#a370ff', 'stop-opacity': .18 }, rg);
  el('stop', { offset: '100%', 'stop-color': '#00f0ff', 'stop-opacity': 0 }, rg);
  const g = el('g', { transform: 'translate(320,320)' }, s);
  const spin = (sec, dir) => `transform-box:fill-box;transform-origin:center;animation:spin ${sec}s linear infinite${dir < 0 ? ' reverse' : ''}`;
  [[300, C.cyan, '2 14', 2, 40, 1], [270, C.mag, '80 24 6 24', 3, 26, -1], [245, C.violet, '1 7', 2, 60, 1],
    [212, C.cyan, '140 50', 5, 18, -1], [178, C.lime, '3 10', 2, 30, 1], [150, C.amber, '30 210', 6, 9, 1]]
    .forEach(([r, c, da, w, sec, dir]) => el('circle', {
      r, fill: 'none', stroke: c, 'stroke-width': w, 'stroke-dasharray': da, opacity: .75,
      filter: 'url(#glow)', style: spin(sec, dir),
    }, g));
  const ticks = el('g', { style: spin(90, -1) }, g);
  for (let i = 0; i < 72; i++) {
    const a = rad(i * 5), r1 = 308, r2 = i % 6 ? 314 : 324;
    el('line', { x1: r1 * Math.cos(a), y1: r1 * Math.sin(a), x2: r2 * Math.cos(a), y2: r2 * Math.sin(a), stroke: C.cyan, opacity: .5 }, ticks);
  }
  const core = el('circle', { r: 120, fill: `url(#${gid})` }, g);
  const me = el('g', { style: `--c:${C.mag}` }, g);
  el('circle', { r: 58, fill: '#050a14', stroke: C.mag, 'stroke-width': 3, filter: 'url(#glow2)' }, me);
  icon(me, 'human', 58, C.mag);
  const colors = [C.cyan, C.lime, C.violet, C.cyan, C.amber, C.blue];
  const bots = colors.map(c => agent(g, c, 16));
  const radii = [150, 178, 212, 245, 212, 178];
  run.frame(t => {
    core.setAttribute('r', 112 + 10 * Math.sin(t / 600));
    bots.forEach((b, i) => {
      const a = t * (0.00035 + i * 0.00007) * (i % 2 ? -1 : 1) + i;
      b.at(radii[i] * Math.cos(a), radii[i] * Math.sin(a));
    });
  });
};

ANIMS.dots = async (run, slide) => {
  const s = svgIn('v-dots', 950, 470);
  const rows = [...slide.querySelectorAll('.dots-legend .row')];
  rows.forEach(r => r.classList.remove('on'));
  const dots = [];
  for (let i = 0; i < 1000; i++) {
    dots.push(el('circle', { cx: 12 + (i % 50) * 18.8, cy: 12 + Math.floor(i / 50) * 21.5, r: 4.2, fill: '#1a2638', class: 'dot' }, s));
  }
  const order = shuffle([...Array(1000).keys()]);
  const groups = [[order.slice(0, 750), C.blue], [order.slice(750, 950), C.violet], [order.slice(950, 952), C.cyan]];
  const rings = [];
  await run.sleep(500);
  for (let k = 0; k < 3; k++) {
    rows[k].classList.add('on');
    const [ids, c] = groups[k];
    const batch = Math.max(1, Math.ceil(ids.length / 40));
    for (let j = 0; j < ids.length; j += batch) {
      for (const i of ids.slice(j, j + batch)) dots[i].setAttribute('fill', c);
      await run.sleep(25);
    }
    if (k === 2) {
      dots.forEach((d, i) => { if (!ids.includes(i)) d.setAttribute('fill-opacity', .3); });
      for (const i of ids) {
        const d = dots[i];
        d.setAttribute('r', 8);
        d.setAttribute('filter', 'url(#glow2)');
        rings.push(el('circle', { cx: d.getAttribute('cx'), cy: d.getAttribute('cy'), r: 8, fill: 'none', stroke: C.cyan, 'stroke-width': 2 }, s));
      }
      run.frame(t => rings.forEach((r, i) => {
        const p = ((t / 1600) + i * .5) % 1;
        r.setAttribute('r', 8 + p * 40);
        r.setAttribute('opacity', 1 - p);
      }));
    }
    await run.sleep(1100);
  }
  rows[3].classList.add('on');
  el('text', { x: 475, y: 462, class: 'mono', 'font-size': 17, fill: C.mag, style: 'text-anchor:middle;letter-spacing:.08em', text: '~5.000 von 8 Mrd. Menschen: nicht mal ein einziger Punkt' }, s);
};

ANIMS.verify = async (run) => {
  const s = svgIn('v-verify', 860, 620);
  const cx = 430, cy = 320, R = 210;
  el('circle', { cx, cy, r: R, class: 'ring-path' }, s);
  const ln = el('g', {}, s), lt = el('g', {}, s);
  const code = node(ln, cx, cy - R, { c: C.cyan, icon: '{ }', label: 'Code schreiben', side: 'top' });
  const check = node(ln, cx + R, cy, { c: C.lime, icon: '▶', label: 'Prüfen', sub: 'TESTS · COMPILER', side: 'right' });
  const res = node(ln, cx, cy + R, { c: C.lime, icon: '✓', label: 'Ergebnis', side: 'bottom' });
  const train = node(ln, cx - R, cy, { c: C.mag, icon: '◈', label: 'Training', sub: 'NÄCHSTES MODELL', side: 'left' });
  el('text', { x: cx, y: cy - 42, class: 'mono', 'font-size': 15, fill: C.dim, style: 'text-anchor:middle;letter-spacing:.3em', text: 'MODELL' }, lt);
  const ver = el('text', { x: cx, y: cy + 18, 'font-size': 60, 'font-weight': 800, fill: '#fff', filter: 'url(#glow)', style: 'text-anchor:middle', text: 'v1' }, lt);
  el('rect', { x: cx - 100, y: cy + 46, width: 200, height: 10, fill: 'none', stroke: C.mag, opacity: .5 }, lt);
  const bar = el('rect', { x: cx - 100, y: cy + 46, width: 20, height: 10, fill: C.mag, filter: 'url(#glow)' }, lt);
  el('text', { x: cx, y: cy + 82, class: 'mono', 'font-size': 13, fill: C.dim, style: 'text-anchor:middle;letter-spacing:.25em', text: 'FÄHIGKEIT' }, lt);
  const pk = packet(lt, C.cyan, 9);
  let a = -90, v = 1, cap = 20;
  const go = to => { const from = a; return run.tween(850, p => { a = lerp(from, to, p); pk.at(...ept(cx, cy, R, R, a)); }); };
  pk.at(...ept(cx, cy, R, R, a));
  await run.loop(async () => {
    code.pulse(); pk.color(C.cyan);
    await run.sleep(400);
    await go(0); check.pulse();
    const ok = Math.random() < .7;
    await run.sleep(500);
    pk.color(ok ? C.lime : C.red);
    await go(90);
    res.glyph(ok ? '✓' : '✗', ok ? C.lime : C.red); res.pulse();
    await run.sleep(500);
    await go(180); train.pulse();
    await run.sleep(400);
    await go(270); a = -90;
    v += 1; cap = Math.min(200, cap + 12);
    ver.textContent = 'v' + v;
    bar.setAttribute('width', cap);
  });
};

ANIMS.quote = async (run) => {
  const q = document.getElementById('quote'), nb = document.getElementById('noback');
  nb.classList.remove('on');
  q.innerHTML = '';
  const s = svgIn('v-curve', 1600, 900);
  const defs = el('defs', {}, s);
  const lg = el('linearGradient', { id: 'curveg', x1: 0, y1: 1, x2: 1, y2: 0 }, defs);
  el('stop', { offset: '0%', 'stop-color': C.cyan }, lg);
  el('stop', { offset: '60%', 'stop-color': C.violet }, lg);
  el('stop', { offset: '100%', 'stop-color': C.mag }, lg);
  const path = el('path', { d: 'M 80 830 C 760 820, 1180 700, 1560 70', fill: 'none', stroke: 'url(#curveg)', 'stroke-width': 4, opacity: .4, filter: 'url(#glow)' }, s);
  const L = path.getTotalLength();
  path.setAttribute('stroke-dasharray', L);
  path.setAttribute('stroke-dashoffset', L);
  el('circle', { cx: 80, cy: 830, r: 9, fill: C.cyan, filter: 'url(#glow2)' }, s);
  el('text', { x: 100, y: 870, class: 'mono', 'font-size': 16, fill: C.cyan, style: 'letter-spacing:.3em', text: 'HEUTE' }, s);
  const runner = el('circle', { r: 6, fill: '#fff', filter: 'url(#glow2)', opacity: 0 }, s);
  run.spawn(run.tween(5500, p => path.setAttribute('stroke-dashoffset', L * (1 - p)), ease.out).then(() => {
    runner.setAttribute('opacity', 1);
    run.frame(t => { const pt = path.getPointAtLength(((t / 4000) % 1) * L); runner.setAttribute('cx', pt.x); runner.setAttribute('cy', pt.y); });
  }));

  const caret = document.createElement('span');
  caret.className = 'caret';
  q.appendChild(caret);
  const parts = [['Das Modell, das du heute verwendest, ist das '], ['schlechteste', 'hl'], [', das du in Zukunft verwenden wirst.']];
  await run.sleep(500);
  for (const [txt, cls] of parts) {
    const sp = document.createElement('span');
    if (cls) sp.className = cls;
    q.insertBefore(sp, caret);
    for (const ch of txt) { sp.textContent += ch; await run.sleep(ch === ' ' ? 20 : 42); }
  }
  await run.sleep(900);
  nb.classList.add('on');
};

ANIMS.solo = async (run) => {
  const s = svgIn('v-solo', 1600, 680);
  const cx = 800, cy = 330, rx = 560, ry = 255;
  el('ellipse', { cx, cy, rx, ry, class: 'ring-path' }, s);
  const lw = el('g', {}, s), lb = el('g', {}, s), ln = el('g', {}, s), la = el('g', {}, s), lt = el('g', {}, s);
  const ST = [
    { a: -90, label: 'Feature-Prompt', sub: 'MENSCH', icon: '✎', h: 1 },
    { a: -30, label: 'Plan', sub: 'KI', icon: '☰' },
    { a: 30, label: 'Plan-Review', sub: 'MENSCH', icon: '◎', h: 1 },
    { a: 90, label: 'Autonom umsetzen', sub: 'KI-AGENTS', icon: '⚙' },
    { a: 150, label: 'Features testen', sub: 'MENSCH · STICHPROBE', icon: '▶', h: 1 },
    { a: 210, label: 'Approve & Merge', sub: 'MENSCH ODER KI', icon: '✓', h: 1, c: C.lime },
  ];
  const nodes = ST.map(st => {
    const [x, y] = ept(cx, cy, rx, ry, st.a);
    const c = st.c || (st.h ? C.mag : C.cyan);
    const n = node(ln, x, y, { r: 42, c, icon: st.icon, label: st.label, sub: st.sub, side: sideFor(st.a) });
    n.beam = st.h ? line(lb, cx, cy, x, y, 'beam', C.mag) : null;
    return n;
  });
  const me = node(ln, cx, cy, { r: 62, c: C.mag, icon: 'human' });
  el('text', { x: cx, y: cy + 92, class: 'mono', 'font-size': 15, fill: C.mag, style: 'text-anchor:middle;letter-spacing:.3em', text: 'DU' }, lt);

  const ags = [0, 1, 2, 3].map(i => ({ a: agent(la, C.cyan, 17), b: 0, tx: cx, ty: cy, link: el('line', { stroke: C.cyan, 'stroke-width': 1.5, 'stroke-dasharray': '3 5', opacity: 0 }, lw), i }));
  run.frame(t => ags.forEach(g => {
    const oa = t * 0.0005 + g.i * Math.PI / 2;
    const ox = cx + 150 * Math.cos(oa), oy = cy + 105 * Math.sin(oa);
    const jx = g.tx + 50 * Math.sin(t * 0.005 + g.i * 1.7), jy = g.ty + 36 * Math.cos(t * 0.0042 + g.i * 2.3);
    const x = lerp(ox, jx, g.b), y = lerp(oy, jy, g.b);
    g.a.at(x, y);
    g.link.setAttribute('x1', x); g.link.setAttribute('y1', y);
    g.link.setAttribute('x2', g.tx); g.link.setAttribute('y2', g.ty);
    g.link.setAttribute('opacity', g.b * .7);
  }));
  const dispatch = (n, list) => Promise.all(list.map(i => { const g = ags[i]; g.tx = n.x; g.ty = n.y; const b0 = g.b; return run.tween(700, p => { g.b = lerp(b0, 1, p); }); }));
  const recall = () => Promise.all(ags.map(g => { const b0 = g.b; return run.tween(700, p => { g.b = lerp(b0, 0, p); }); }));

  const pk = packet(lt, C.amber, 10);
  let pa = -90;
  pk.at(...ept(cx, cy, rx, ry, pa));
  const movePk = to => { const from = pa; return run.tween(900, p => { pa = lerp(from, to, p); pk.at(...ept(cx, cy, rx, ry, pa)); }); };
  const counter = el('text', { x: 1560, y: 24, class: 'mono', 'font-size': 16, fill: C.lime, style: 'text-anchor:end;letter-spacing:.25em', text: 'FEATURES 000' }, lt);
  const bub = bubble(lt, C.mag);
  const prompts = ['„Alle Eingaben auch ganz ohne KI“', '„Belege automatisch zuordnen“', '„Rechnungen als PDF exportieren“', '„ELSTER-Abgabe mit Vorabprüfung“'];
  const steps = ['Tests schreiben', 'CI läuft …', 'PR erstellt', 'Self-Review', 'Refactoring', 'App durchklicken', 'Screenshots prüfen', '✓ zufrieden'];
  let feat = 0, pi = 0;
  const human = async (i, text, x, y, align, ms, col) => {
    const n = nodes[i];
    n.on(); n.beam.classList.add('on'); me.pulse();
    bub.show(text, x, y, align, col);
    await run.sleep(ms);
    bub.hide(); n.on(false); n.beam.classList.remove('on');
  };

  await run.sleep(400);
  await run.loop(async () => {
    const N = nodes;
    await human(0, prompts[pi++ % prompts.length], N[0].x + 70, N[0].y, 'l', 2200);
    await movePk(-30);
    N[1].on(); await dispatch(N[1], [0, 1]);
    bub.show('Plan · 7 Schritte', N[1].x, N[1].y - 85, 'c', C.cyan);
    await run.sleep(1300); bub.hide(); N[1].on(false); await recall();
    await movePk(30);
    await human(2, '„Passt. Komplett autonom umsetzen.“', N[2].x, N[2].y - 85, 'c', 2000);
    await movePk(90);
    N[3].on(); await dispatch(N[3], [0, 1, 2, 3]);
    for (const st of steps) { bub.show(st, N[3].x, N[3].y - 100, 'c', st.startsWith('✓') ? C.lime : C.cyan); await run.sleep(620); }
    bub.hide(); N[3].on(false); await recall();
    await movePk(150);
    await human(4, 'ausgewählte Features testen', N[4].x, N[4].y - 85, 'c', 1800);
    await movePk(210);
    feat += 1;
    counter.textContent = 'FEATURES ' + String(feat).padStart(3, '0');
    await human(5, pick(['approved ✓', 'KI approved selbst ✓']), N[5].x, N[5].y - 85, 'c', 1500, C.lime);
    await movePk(270); pa = -90;
  });
};
