'use strict';
// Agent loop, trust chain, team workflow, dev team, systems, moats.

ANIMS.agentloop = async (run) => {
  const s = svgIn('v-loop', 860, 660);
  const cx = 430, cy = 330, R = 230;
  el('circle', { cx, cy, r: R, class: 'ring-path' }, s);
  const ln = el('g', {}, s), lt = el('g', {}, s);
  const ST = [['Code', '{ }', C.cyan], ['Tests', '✓', C.lime], ['CI', '▶', C.lime], ['PR', '⇄', C.cyan],
    ['Self-Review', '◎', C.violet], ['Refactor', '⟲', C.violet], ['Durchklicken', '➚', C.mag], ['Screenshot', '▣', C.mag]];
  const nodes = ST.map(([label, ic, c], i) => {
    const a = -90 + i * 45;
    const [x, y] = ept(cx, cy, R, R, a);
    return node(ln, x, y, { r: 34, c, icon: ic, label, side: sideFor(a) });
  });
  const dia = el('polygon', { points: `${cx},${cy - 78} ${cx + 78},${cy} ${cx},${cy + 78} ${cx - 78},${cy}`, fill: '#050a14', stroke: C.violet, 'stroke-width': 2.5, filter: 'url(#glow)' }, lt);
  el('text', { x: cx, y: cy - 6, 'font-size': 20, 'font-weight': 600, style: 'text-anchor:middle', text: 'zufrieden?' }, lt);
  const verdict = el('text', { x: cx, y: cy + 26, class: 'mono', 'font-size': 20, fill: C.dim, style: 'text-anchor:middle;letter-spacing:.15em', text: '…' }, lt);
  const roundT = el('text', { x: cx, y: cy + 118, class: 'mono', 'font-size': 15, fill: C.dim, style: 'text-anchor:middle;letter-spacing:.3em', text: 'RUNDE 1' }, lt);
  const burst = el('circle', { cx, cy, r: 80, fill: 'none', stroke: C.lime, 'stroke-width': 4, opacity: 0, filter: 'url(#glow2)' }, lt);
  const pk = packet(lt, C.amber, 9);
  let a = -90;
  pk.at(...ept(cx, cy, R, R, a));
  const go = to => { const from = a; return run.tween(550, p => { a = lerp(from, to, p); pk.at(...ept(cx, cy, R, R, a)); }); };

  const term = document.getElementById('term');
  const log = (cls, txt) => {
    const d = document.createElement('div');
    d.className = cls; d.textContent = txt;
    term.appendChild(d);
    while (term.children.length > 9) term.firstChild.remove();
  };
  const body = document.querySelector('#appwin .body');
  const btn = document.getElementById('appbtn'), bad = document.getElementById('badbox');
  const cur = document.getElementById('cursor');
  const layout = isBad => { btn.style.top = (isBad ? 150 : 194) + 'px'; bad.style.top = (isBad ? 142 : 186) + 'px'; bad.classList.remove('on'); };
  const cursorTo = async (x, y) => { cur.style.left = x + 'px'; cur.style.top = y + 'px'; await run.sleep(750); };
  const click = (x, y) => {
    const r = document.createElement('div');
    r.className = 'ripple'; r.style.left = x + 'px'; r.style.top = y + 'px';
    body.appendChild(r);
    setTimeout(() => r.remove(), 700);
  };

  const round = async (n, isBad) => {
    roundT.textContent = 'RUNDE ' + n;
    verdict.textContent = '…'; verdict.setAttribute('fill', C.dim); dia.setAttribute('stroke', C.violet);
    log('mute', `── Runde ${n} ──────────────`);
    const step = async (i, cls, txt, wait = 750) => {
      if (i > 0) await go(-90 + i * 45);
      nodes[i].pulse(); log(cls, txt);
      await run.sleep(wait);
    };
    if (isBad) await step(0, 'info', '› schreibe Code · 4 Dateien');
    else { layout(false); await step(0, 'info', '› fix: Button-Abstand + Regressionstest'); }
    await step(1, 'ok', isBad ? '+ 23 Tests geschrieben' : '+ 1 Screenshot-Test');
    await step(2, isBad ? 'bad' : 'ok', isBad ? '✗ CI: 2 Tests rot' : '✓ CI: 412/412 grün');
    await step(3, 'info', isBad ? '› PR #128 eröffnet' : '› PR #128 aktualisiert');
    await step(4, isBad ? 'warn' : 'ok', isBad ? '! Self-Review: 3 Findings' : '✓ Self-Review: keine Findings');
    await step(5, isBad ? 'ok' : 'mute', isBad ? '✓ Refactor · Tests wieder grün' : '· Refactor: nichts mehr zu tun');
    await go(-90 + 6 * 45); nodes[6].pulse();
    log('info', '› starte App · klicke /einstellungen');
    await cursorTo(70, 60); click(80, 70);
    await cursorTo(isBad ? 355 : 355, isBad ? 160 : 204); click(360, isBad ? 167 : 211);
    await go(-90 + 7 * 45); nodes[7].pulse();
    restart(document.getElementById('flash'), 'on');
    restart(document.getElementById('scanline'), 'on');
    const eye = document.getElementById('eye');
    eye.classList.add('on');
    log('info', '› Screenshot · Agent schaut ihn an');
    await run.sleep(1300);
    eye.classList.remove('on');
    if (isBad) { restart(bad, 'on'); log('bad', '✗ Button überdeckt Tabelle'); }
    else log('ok', '✓ Layout sieht gut aus');
    await run.sleep(700);
    await go(270); a = -90;
    const col = isBad ? C.red : C.lime;
    verdict.textContent = isBad ? '✗ NEIN' : '✓ JA';
    verdict.setAttribute('fill', col); dia.setAttribute('stroke', col);
    log(isBad ? 'warn' : 'ok', isBad ? '↺ noch nicht zufrieden · nochmal' : '→ bereit für den Menschen');
    await run.sleep(1400);
  };

  term.innerHTML = '';
  layout(true);
  await cursorTo(520, 200);
  await run.loop(async () => {
    await round(1, true);
    await round(2, false);
    await run.tween(1100, p => { burst.setAttribute('r', 80 + p * 300); burst.setAttribute('opacity', 1 - p); }, ease.out);
    await run.sleep(1800);
    term.innerHTML = '';
    layout(true);
  });
};

ANIMS.trust = async (run, slide) => {
  const lks = [...slide.querySelectorAll('.chain .lk')], note = document.getElementById('trustnote');
  lks.forEach(l => l.classList.remove('on'));
  note.classList.remove('on');
  await run.sleep(400);
  for (const l of lks) { l.classList.add('on'); await run.sleep(750); }
  await run.sleep(400);
  note.classList.add('on');
};

ANIMS.team = async (run) => {
  const s = svgIn('v-team', 1600, 680);
  const lw = el('g', {}, s), lb = el('g', {}, s), ln = el('g', {}, s), la = el('g', {}, s), lt = el('g', {}, s);
  const wire = (x1, y1, x2, y2) => el('line', { x1, y1, x2, y2, class: 'wire' }, lw);
  const inputs = [['Community', 150], ['Redaktion', 330], ['Bugs', 510]].map(([l, y]) => node(ln, 90, y, { r: 30, c: C.amber, icon: '✉', label: l, side: 'bottom' }));
  const backlog = node(ln, 300, 330, { r: 38, c: C.amber, icon: '☰', label: 'Backlog', side: 'bottom' });
  inputs.forEach(n => wire(n.x, n.y, backlog.x, backlog.y));
  const DY = [150, 510];
  const devs = DY.map((y, i) => {
    const d = node(ln, 560, y, { r: 46, c: C.mag, icon: 'human' });
    el('text', { x: 470, y: y + 7, 'font-size': 22, 'font-weight': 600, style: 'text-anchor:end', text: i ? 'Dev B' : 'Dev A' }, lt);
    wire(backlog.x, backlog.y, 560, y);
    return d;
  });
  el('line', { x1: 560, y1: 240, x2: 560, y2: 420, stroke: C.violet, 'stroke-width': 2, 'stroke-dasharray': '6 8', opacity: .7 }, lw);
  el('text', { x: 578, y: 336, class: 'mono', 'font-size': 14, fill: C.violet, style: 'letter-spacing:.2em', text: 'ABSPRACHE' }, lt);
  const rings = DY.map((y, i) => {
    el('circle', { cx: 860, cy: y, r: 55, fill: 'none', stroke: C.cyan, 'stroke-width': 2, 'stroke-dasharray': '5 7', opacity: .8 }, lw);
    el('text', { x: 860, y: i ? y + 88 : y - 72, class: 'mono', 'font-size': 14, fill: C.cyan, style: 'text-anchor:middle;letter-spacing:.15em', text: 'AGENT-REVIEW ↺' }, lt);
    const cnt = el('text', { x: 860, y: y + 9, class: 'mono', 'font-size': 26, fill: C.dim, style: 'text-anchor:middle', text: '–' }, lt);
    wire(560 + 46, y, 860 - 55, y);
    return cnt;
  });
  const gate = node(ln, 1130, 330, { r: 46, c: C.mag, icon: '◎', label: 'Peer-Review', sub: 'MENSCH', side: 'bottom' });
  DY.forEach(y => wire(860 + 55, y, gate.x, gate.y));
  const beams = DY.map(y => line(lb, 560, y, gate.x, gate.y, 'beam', C.mag));
  const MX = 1420;
  el('line', { x1: MX, y1: 70, x2: MX, y2: 590, stroke: C.lime, 'stroke-width': 3, opacity: .6, filter: 'url(#glow)' }, lw);
  el('text', { x: MX + 18, y: 50, class: 'mono', 'font-size': 16, fill: C.lime, style: 'letter-spacing:.3em', text: 'MAIN' }, lt);
  wire(gate.x + 46, gate.y, MX, gate.y);
  const counter = el('text', { x: MX - 18, y: 50, class: 'mono', 'font-size': 16, fill: C.lime, style: 'text-anchor:end;letter-spacing:.25em', text: 'GEMERGED 000' }, lt);
  const commits = [];
  let merged = 0;
  const cy = k => 570 - k * 33;
  const addCommit = () => {
    commits.push(el('circle', { cx: MX, cy: cy(commits.length), r: 9, fill: C.lime, filter: 'url(#glow)' }, ln));
    if (commits.length > 15) commits.shift().remove();
    commits.forEach((c, k) => c.setAttribute('cy', cy(k)));
    merged += 1;
    counter.textContent = 'GEMERGED ' + String(merged).padStart(3, '0');
  };

  const speed = [1, 1], ang = [0, Math.PI];
  const ags = [0, 1].flatMap(d => [0, 1, 2].map(k => ({ d, k, a: agent(la, C.cyan, 13) })));
  let last = performance.now();
  run.frame(t => {
    const dt = t - last; last = t;
    ang[0] += dt * 0.0008 * speed[0]; ang[1] += dt * 0.0008 * speed[1];
    ags.forEach(g => { const a = ang[g.d] + g.k * 2.094; g.a.at(560 + 78 * Math.cos(a), DY[g.d] + 78 * Math.sin(a)); });
  });
  const bubs = [bubble(lt, C.mag), bubble(lt, C.mag)];
  const bubPos = [[290, DY[0]], [290, DY[1]]];
  const gbub = bubble(lt, C.mag);
  let gateQ = Promise.resolve();
  const lock = async () => { const prev = gateQ; let rel; gateQ = new Promise(r => { rel = r; }); await prev; return rel; };

  const pipe = async i => {
    const j = 1 - i, say = (t, col) => bubs[i].show(t, ...bubPos[i], 'c', col);
    while (run.alive) {
      const src = pick(inputs);
      const tk = packet(lt, C.amber, 10);
      tk.at(src.x, src.y); src.pulse();
      await moveTo(run, tk, backlog.x, backlog.y, 700); backlog.pulse();
      await run.sleep(300);
      await moveTo(run, tk, 560, DY[i], 800); devs[i].pulse();
      say('Prompt schreiben …'); await run.sleep(1200);
      speed[i] = 5; tk.color(C.cyan);
      for (const st of ['Tests', 'CI ✓', 'PR erstellt', 'Klicktest ✓']) { say(st, C.cyan); await run.sleep(550); }
      speed[i] = 1; bubs[i].hide();
      await moveTo(run, tk, 860 - 55, DY[i], 600);
      const findings = [5, 3, 1, 0];
      for (let r = 0; r < 4; r++) {
        rings[i].textContent = String(findings[r]); rings[i].setAttribute('fill', r === 3 ? C.lime : C.amber);
        await run.tween(700, p => { const a = Math.PI + p * 2 * Math.PI; tk.at(860 + 55 * Math.cos(a), DY[i] + 55 * Math.sin(a)); }, ease.lin);
      }
      rings[i].textContent = '✓';
      const rel = await lock();
      await moveTo(run, tk, gate.x, gate.y, 700); gate.on();
      if (Math.random() < .25) {
        gbub.show('Kleinigkeit · direkt gemerged', gate.x, 240, 'c', C.lime);
        await run.sleep(1300);
      } else {
        beams[j].classList.add('on'); devs[j].pulse();
        gbub.show(`Dev ${j ? 'B' : 'A'}: Zusammenfassung (DE)`, gate.x, 240, 'c', C.mag);
        await run.sleep(1500);
        gbub.show('Approve ✓', gate.x, 240, 'c', C.lime);
        await run.sleep(900);
        beams[j].classList.remove('on');
      }
      gbub.hide(); gate.on(false); tk.color(C.lime);
      rel();
      rings[i].textContent = '–'; rings[i].setAttribute('fill', C.dim);
      await moveTo(run, tk, MX, Math.min(gate.y, cy(Math.min(commits.length, 15))), 700);
      tk.remove(); addCommit();
      await run.sleep(rand(400, 1200));
    }
  };
  run.spawn(pipe(0));
  run.spawn(run.sleep(3800).then(() => pipe(1)));
  await run.loop(async () => {
    await run.sleep(rand(2500, 4500));
    const dot = packet(lb, C.violet, 6), down = Math.random() < .5;
    dot.at(560, down ? 240 : 420);
    await moveTo(run, dot, 560, down ? 420 : 240, 1200);
    dot.remove();
  });
};

ANIMS.devteam = async (run) => {
  const s = svgIn('v-devteam', 1600, 700);
  const cx = 800, cy = 340, rx = 520, ry = 250;
  const lw = el('g', {}, s), ln = el('g', {}, s), lt = el('g', {}, s);
  const ROLES = [['Architektur', '◇', C.violet], ['Backend', '⚙', C.cyan], ['Frontend', '▦', C.blue], ['Tests', '✓', C.lime],
    ['Review', '◎', C.violet], ['QA · Screenshots', '▣', C.mag], ['Doku', '✎', C.amber], ['CI / CD', '⟳', C.cyan]];
  const me = node(ln, cx, cy, { r: 72, c: C.mag, icon: 'human' });
  el('text', { x: cx, y: cy + 118, class: 'mono', 'font-size': 16, fill: C.mag, style: 'text-anchor:middle;letter-spacing:.3em', text: 'DU' }, lt);
  const count = el('text', { x: 1580, y: 24, class: 'mono', 'font-size': 18, fill: C.violet, style: 'text-anchor:end;letter-spacing:.25em', text: 'TEAM: 1' }, lt);
  const roles = ROLES.map(([label, ic, c], i) => {
    const a = -90 + i * 45;
    const [x, y] = ept(cx, cy, rx, ry, a);
    const w = el('line', { x1: cx, y1: cy, x2: x, y2: y, stroke: c, 'stroke-width': 1.5, opacity: .45 }, lw);
    const L = Math.hypot(x - cx, y - cy);
    w.setAttribute('stroke-dasharray', L); w.setAttribute('stroke-dashoffset', L);
    const n = node(ln, x, y, { r: 40, c, icon: ic, label, side: sideFor(a) });
    n.g.style.opacity = 0;
    n.place(x, y, .2);
    return Object.assign(n, { w, L, ox: x, oy: y });
  });
  await run.sleep(500);
  for (let i = 0; i < roles.length; i++) {
    const n = roles[i];
    await run.tween(480, p => {
      n.w.setAttribute('stroke-dashoffset', n.L * (1 - p));
      n.g.style.opacity = p; n.place(n.ox, n.oy, lerp(.2, 1, p));
    }, ease.out);
    n.pulse(); me.pulse();
    count.textContent = 'TEAM: ' + (i + 2);
    await run.sleep(220);
  }
  const pulse = async () => {
    const n = pick(roles), pk = packet(lt, C.mag, 7);
    pk.at(cx, cy);
    await moveTo(run, pk, n.ox, n.oy, 700);
    n.pulse(); pk.color(n.c);
    await run.sleep(rand(300, 900));
    await moveTo(run, pk, cx, cy, 700);
    pk.remove(); me.pulse();
  };
  await run.loop(async () => { run.spawn(pulse()); await run.sleep(rand(250, 650)); });
};

ANIMS.systems = async (run) => {
  const s = svgIn('v-systems', 1600, 690);
  const cx = 800, cy = 305, rx = 560, ry = 225;
  const lm = el('g', {}, s), lc = el('g', { opacity: 0 }, s), lp = el('g', {}, s), ln = el('g', {}, s), lt = el('g', {}, s);
  const SYS = [['Website', '⌂'], ['Newsletter', '✉'], ['Spenden', '€'], ['Mitglieder', '☺'], ['Faktenforum', '✓'], ['Beabee', '♥'], ['CMS', '✎'], ['Events', '◷'], ['Tabellen', '▦']];
  const sys = SYS.map(([label, ic], i) => {
    const a = -90 + i * 360 / SYS.length;
    const [x, y] = ept(cx, cy, rx, ry, a);
    return node(ln, x, y, { r: 36, c: i % 2 ? C.violet : C.blue, icon: ic, label, side: sideFor(a) });
  });
  const sf = node(ln, cx, cy, { r: 50, c: C.red, icon: '☁', label: 'Salesforce', side: 'bottom' });
  const hub = node(ln, cx, cy, { r: 56, c: C.cyan, icon: '⬢', label: 'Eigene Plattform', sub: 'APIs', side: 'bottom' });
  hub.place(cx, cy, .01); hub.g.style.opacity = 0;

  const curve = (x1, y1, x2, y2, c) => {
    const mx = (x1 + x2) / 2 + rand(-160, 160), my = (y1 + y2) / 2 + rand(-120, 120);
    return el('path', { d: `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`, fill: 'none', stroke: c, 'stroke-width': 2, 'stroke-dasharray': pick(['6 6', '2 5', '12 4 2 4']) }, lm);
  };
  const messy = sys.map((n, i) => curve(n.x, n.y, cx, cy, i % 3 ? C.amber : C.red));
  for (let k = 0; k < 7; k++) { const [a, b] = shuffle([...sys]); messy.push(curve(a.x, a.y, b.x, b.y, pick([C.amber, C.red]))); }
  ['CSV', 'Copy & Paste', 'manuell', 'E-Mail', 'Export', 'Excel'].forEach((t, i) => {
    const p = messy[i * 2 + 1], pt = p.getPointAtLength(p.getTotalLength() / 2);
    el('text', { x: pt.x, y: pt.y, class: 'mono', 'font-size': 14, fill: i % 2 ? C.red : C.amber, style: 'text-anchor:middle;letter-spacing:.1em', text: t }, lm);
  });
  run.frame(t => messy.forEach((p, i) => p.setAttribute('opacity', Math.random() < .015 ? .1 : .45 + .35 * Math.sin(t / 180 + i * 1.3))));

  sys.forEach(n => el('line', { x1: cx, y1: cy, x2: n.x, y2: n.y, stroke: C.cyan, 'stroke-width': 2, opacity: .6, filter: 'url(#glow)' }, lc));
  const pulses = sys.flatMap((n, i) => [0, .5].map(o => ({ n, o: o + i * .07, d: el('circle', { r: 5, fill: C.lime, filter: 'url(#glow2)', opacity: 0 }, lp) })));
  let flow = 0;
  run.frame(t => pulses.forEach((q, k) => {
    let p = (t / 2200 + q.o) % 1;
    if (k % 2) p = 1 - p;
    q.d.setAttribute('cx', lerp(cx, q.n.x, p)); q.d.setAttribute('cy', lerp(cy, q.n.y, p));
    q.d.setAttribute('opacity', flow);
  }));
  const cap = el('text', { x: cx, y: 648, class: 'mono', 'font-size': 20, style: 'text-anchor:middle;letter-spacing:.2em;transition:fill .6s', text: '' }, lt);

  const toFuture = () => run.tween(1400, p => {
    lm.setAttribute('opacity', 1 - p);
    sf.place(cx, cy, Math.max(.01, 1 - p * 1.6)); sf.g.style.opacity = 1 - p;
    const h = Math.max(0, p * 1.6 - .6);
    hub.place(cx, cy, Math.max(.01, h)); hub.g.style.opacity = h;
    lc.setAttribute('opacity', p); flow = p;
  });
  const toToday = () => run.tween(1200, p => {
    lm.setAttribute('opacity', p);
    sf.place(cx, cy, Math.max(.01, p)); sf.g.style.opacity = p;
    hub.place(cx, cy, Math.max(.01, 1 - p)); hub.g.style.opacity = 1 - p;
    lc.setAttribute('opacity', 1 - p); flow = 1 - p;
  });
  await run.loop(async () => {
    cap.textContent = 'HEUTE: Inseln · Exporte · Handarbeit'; cap.setAttribute('fill', C.red);
    await run.sleep(6500);
    await toFuture(); hub.pulse();
    cap.textContent = 'MÖGLICH: eigene Plattform, alles verbunden'; cap.setAttribute('fill', C.lime);
    sys.forEach((n, i) => setTimeout(() => run.alive && n.pulse(), i * 120));
    await run.sleep(7000);
    cap.textContent = 'HEUTE: Inseln · Exporte · Handarbeit'; cap.setAttribute('fill', C.red);
    await toToday();
  });
};

ANIMS.moats = async (run, slide) => {
  const s = svgIn('v-moats', 560, 500);
  const pillars = [...slide.querySelectorAll('#pillars .panel')], cta = document.getElementById('moatcta');
  pillars.forEach(p => p.classList.remove('on'));
  cta.classList.remove('on');
  const blocks = [];
  const blk = (x, y) => blocks.push({ x, y, e: el('rect', { x, y, width: 56, height: 40, fill: 'rgba(0,240,255,.08)', stroke: C.cyan, 'stroke-width': 1.5, opacity: 0, filter: 'url(#glow)' }, s) });
  for (const c of [0, 2, 4, 6]) blk(40 + c * 60, 76);
  for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) blk(40 + c * 60, 120 + r * 44);
  const label = el('text', { x: 280, y: 268, 'font-size': 54, 'font-weight': 800, fill: '#fff', filter: 'url(#glow2)', style: 'text-anchor:middle;letter-spacing:.06em', opacity: 0, text: 'SOFTWARE' }, s);
  await run.sleep(300);
  for (const b of blocks) { b.e.setAttribute('opacity', 1); await run.sleep(18); }
  label.setAttribute('opacity', 1);
  await run.sleep(1600);
  label.textContent = 'kopierbar';
  label.style.fill = C.red;
  const strike = el('line', { x1: 130, y1: 252, x2: 130, y2: 252, stroke: C.red, 'stroke-width': 5, filter: 'url(#glow)' }, s);
  await run.tween(400, p => strike.setAttribute('x2', lerp(130, 430, p)));
  await run.sleep(600);
  const fly = blocks.map(b => ({ b, dx: (b.x - 250) * rand(1.5, 3) + rand(-80, 80), dy: (b.y - 230) * rand(1.5, 3) + rand(-60, 120), rot: rand(-180, 180) }));
  run.spawn(run.tween(1600, p => fly.forEach(f => {
    f.b.e.setAttribute('transform', `translate(${f.dx * p},${f.dy * p}) rotate(${f.rot * p},${f.b.x + 28},${f.b.y + 20})`);
    f.b.e.setAttribute('opacity', 1 - p);
  }), ease.out));
  await run.sleep(900);
  for (const p of pillars) { p.classList.add('on'); await run.sleep(450); }
  await run.sleep(500);
  cta.classList.add('on');
};
