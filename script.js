document.getElementById('year').textContent = new Date().getFullYear();
/* Done trail */
(() => {
  // One entry per section (About, Services, Process, Reviews), plus one for the end.
  const STOPS = [
    { icon: 'i-laptop',  label: 'Tools set up' },
    { icon: 'i-mail',    label: 'Inbox at zero' },
    { icon: 'i-cal',     label: 'Week scheduled' },
    { icon: 'i-headset', label: 'Clients supported' },
    { icon: 'i-check',   label: 'All done' }
  ];
  const field = document.querySelector('.field');
  const trail = field && field.querySelector('.trail');
  if (!trail) return;
  const secs = [...field.querySelectorAll(':scope > section')];
  const NS = 'http://www.w3.org/2000/svg';
  let pts = [], els = [], samples = [], prog = null, total = 0, H = 0;

  function build() {
    trail.innerHTML = '';
    els = []; samples = []; prog = null;
    if (innerWidth < 1180) return;

    const f = field.getBoundingClientRect();
    const W = f.width;
    H = f.height;
    const wrap = secs[0].querySelector('.wrap').getBoundingClientRect();
    const xL = (wrap.left - f.left + 24) / 2;
    const xR = W - xL;

    let d = `M${xL} 0`;
    let x = xL;
    pts = [];
    secs.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      const top = r.top - f.top;
      const sx = i % 2 ? xR : xL;
      if (sx !== x) {
        d += ` L${x} ${top - 40} C${x} ${top} ${sx} ${top} ${sx} ${top + 40}`;
        x = sx;
      }
      const y = top + r.height / 2;
      d += ` L${x} ${y}`;
      pts.push({ x, y, side: i % 2 ? 'r' : 'l' });
    });
    d += ` L${x} ${H - 64} C${x} ${H - 30} ${W / 2} ${H - 30} ${W / 2} ${H}`;
    pts.push({ x: W / 2, y: H, side: 'l' });

    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'line');
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    ['base', 'prog'].forEach(c => {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d);
      p.setAttribute('class', c);
      svg.appendChild(p);
      if (c === 'prog') prog = p;
    });
    trail.appendChild(svg);

    total = prog.getTotalLength();
    prog.style.strokeDasharray = total;
    for (let i = 0; i <= 240; i++) samples.push(prog.getPointAtLength(total * i / 240).y);

    pts.forEach((p, i) => {
      const s = STOPS[i] || STOPS[STOPS.length - 1];
      const el = document.createElement('span');
      el.className = 'stop ' + p.side;
      el.dataset.label = s.label;
      el.style.left = p.x + 'px';
      el.style.top = p.y + 'px';
      el.innerHTML = `<svg><use href="#${s.icon}"/></svg><i class="tick"><svg><use href="#i-tick"/></svg></i>`;
      trail.appendChild(el);
      els.push(el);
    });
  }

  function update() {
    if (!prog) return;
    const f = field.getBoundingClientRect();
    const y = innerHeight * 0.6 - f.top; // the "reading line" at 60% down the screen
    const yc = Math.min(Math.max(y, 0), H);
    let i = 0;
    while (i < samples.length - 1 && samples[i] < yc) i++;
    prog.style.strokeDashoffset = total - (total * i) / (samples.length - 1);
    let found = false;
    els.forEach((el, k) => {
      const done = pts[k].y <= y;
      const now = !done && !found;
      if (now) found = true;
      el.classList.toggle('done', done);
      el.classList.toggle('now', now);
    });
  }

  let queued = false;
  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  }, { passive: true });
  const redo = () => { build(); update(); };
  addEventListener('resize', redo);
  addEventListener('load', redo);
  if (document.fonts) document.fonts.ready.then(redo);
})();