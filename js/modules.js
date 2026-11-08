/*
 * modules.js
 * Content sections below the video: Scale & Legacy stat count-ups and the Modules card carousel (GSAP slide + rotate, arrows, dots,
 * keyboard, swipe, wrap-around, pointer tilt).
 */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduced = root.classList.contains('reduced-motion');
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Module data + line-art icons (64 x 64, 2px strokes) ---------- */
  var MODULES = [
    { name: 'Astronomy',
      icon: '<circle cx="47" cy="15" r="6"/><ellipse cx="47" cy="15" rx="11" ry="3.5" transform="rotate(-20 47 15)"/>' +
        '<g transform="rotate(-28 26 34)"><rect x="9" y="29.5" width="30" height="9" rx="1.5"/><rect x="39" y="27.5" width="6" height="13" rx="1.5"/><rect x="4" y="31.5" width="5" height="5" rx="1"/></g>' +
        '<path d="M26 39 17 57M26 39l9 18M26 39v18"/><path d="M10 10v4M8 12h4M56 40v4M54 42h4"/>' },
    { name: 'Biology',
      icon: '<path d="M22 5c0 14 20 13 20 27S22 45 22 59"/><path d="M42 5c0 14-20 13-20 27s20 13 20 27"/>' +
        '<path d="M23 10h18M26 16h12M26 26h12M23 32h18M26 38h12M26 48h12M23 54h18"/>' },
    { name: 'Chemistry',
      icon: '<path d="M25 6h14M28 6v17L14 50a4.5 4.5 0 0 0 4 7h28a4.5 4.5 0 0 0 4-7L36 23V6"/>' +
        '<path d="M19.5 40c4-2 8 2 12.5 0s8.5-2 12.5 0"/><circle cx="27" cy="49" r="2.2"/><circle cx="37" cy="46" r="1.6"/><circle cx="32" cy="32" r="1.6"/><circle cx="34" cy="15" r="1.2"/>' },
    { name: 'Physics',
      icon: '<ellipse cx="32" cy="32" rx="27" ry="10"/><ellipse cx="32" cy="32" rx="27" ry="10" transform="rotate(60 32 32)"/>' +
        '<ellipse cx="32" cy="32" rx="27" ry="10" transform="rotate(120 32 32)"/><circle cx="32" cy="32" r="3.5" fill="#fff"/><circle cx="59" cy="32" r="2" fill="#fff"/>' },
    { name: 'Computer Science',
      icon: '<rect x="5" y="9" width="54" height="36" rx="3"/><path d="M5 38h54M24 57h16M32 45v12"/>' +
        '<path d="M24 18l-7 6 7 6M40 18l7 6-7 6M35 15l-6 18"/>' },
    { name: 'Math',
      icon: '<path d="M27 8H9l10 12L9 32h18"/><path d="M41 20h14M48 13v14"/><path d="M9 46h16M9 53h16"/>' +
        '<path d="M35 42h22M41 42v15M51 42v12c0 2.5 1.5 3.5 4 3"/>' },
    { name: 'Logic',
      icon: '<path d="M10 22h11a5.5 5.5 0 1 1 11 0h11v11a5.5 5.5 0 1 1 0 11v11H32a5.5 5.5 0 1 0-11 0H10V44a5.5 5.5 0 1 0 0-11z"/>' +
        '<path d="M51 8l1.6 3.4 3.4 1.6-3.4 1.6L51 18l-1.6-3.4L46 13l3.4-1.6z"/>' },
    { name: 'Crime',
      icon: '<circle cx="26" cy="26" r="18"/><path d="M39 39l5 5"/><rect x="45.5" y="39" width="8" height="22" rx="3" transform="rotate(-45 49.5 50)"/>' +
        '<path d="M17 30c0-7 4-12 9-12s9 4 9 10M21 33c0-6 2-10 5-10s5 3 5 7v6M26 29v9M35 32c0 3-.5 5-1.5 7M15 23c2-4 6-8 11-8"/>' },
    { name: 'Psychology',
      icon: '<path d="M22 59V47c-6-4-11-11-11-20C11 15 20 6 32 6c11 0 19 8 20 18 0 3 1 5 3 8l3 5h-5v7c0 3-2 5-5 5h-6v10"/>' +
        '<path d="M25 30c-2.5 0-4-2-4-4.5s2-4.5 4.5-4.5c.5-3 3-5 6-5 2.5 0 4.5 1.5 5.5 3.5 3 0 5.5 2.5 5.5 5.5s-2 5-5 5.5c-.5 2.5-2.5 4-5 4-1.5 0-3-.5-4-1.5-1 1-2 1.5-3.5 1.5z"/><path d="M31 25v8M27 26c1.5 0 4 1 4 3"/>' },
    { name: 'Gaming',
      icon: '<path d="M20 20h24c8 0 12 6 14 16l1.5 9c1 6.5-6 9.5-10 5l-6-7H20.5l-6 7c-4 4.5-11 1.5-10-5L6 36c2-10 6-16 14-16z"/>' +
        '<path d="M19 27v11M13.5 32.5h11"/><circle cx="43" cy="29" r="2.2"/><circle cx="49.5" cy="35" r="2.2"/><path d="M28 14c0-4 8-4 8-8"/>' },
    { name: 'Fandom',
      icon: '<path d="M32 25c-6-4-14-5-24-4v31c10-1 18 0 24 4 6-4 14-5 24-4V21c-10-1-18 0-24 4zM32 25v31"/>' +
        '<path d="M32 3l2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.7z"/><path d="M14 31c4-.5 8 0 12 2M14 38c4-.5 8 0 12 2M38 33c4-2 8-2.5 12-2M38 40c4-2 8-2.5 12-2"/>' },
    { name: 'Engineering & Innovation',
      icon: '<path d="M24 44c0-6-9-9-9-20a17 17 0 0 1 34 0c0 11-9 14-9 20z"/><path d="M25 50h14M27 56h10"/>' +
        '<circle cx="32" cy="24" r="5"/><path d="M32 14.5v3.5M32 30v3.5M22.5 24H26M38 24h3.5M25.3 17.3l2.5 2.5M36.2 28.2l2.5 2.5M25.3 30.7l2.5-2.5M36.2 19.8l2.5-2.5"/>' },
    { name: 'Robotics', badge: 'NEW EDITION',
      icon: '<path d="M8 57h30M13 57v-5h20v5"/><rect x="21" y="42" width="29" height="7" rx="3.5" transform="rotate(-67.8 24.5 45.5)"/>' +
        '<rect x="35" y="15" width="19" height="7" rx="3.5" transform="rotate(26.6 35 18.5)"/><circle cx="24.5" cy="45.5" r="4" fill="#160a36"/>' +
        '<circle cx="35" cy="18.5" r="4" fill="#160a36"/><circle cx="51" cy="26.5" r="3" fill="#160a36"/><path d="M51 29.5v4M45 33.5h12M45 33.5v5l2.5 3.5M57 33.5v5l-2.5 3.5"/>' }
  ];

  function gearPath(cx, cy, ro, ri, n) {
    var d = '', step = Math.PI * 2 / n;
    for (var k = 0; k < n; k++) {
      var a = k * step;
      [[a - step * .22, ri], [a - step * .14, ro], [a + step * .14, ro], [a + step * .22, ri]].forEach(function (p, j) {
        d += (k === 0 && j === 0 ? 'M' : 'L') + (cx + p[1] * Math.cos(p[0])).toFixed(1) + ' ' + (cy + p[1] * Math.sin(p[0])).toFixed(1);
      });
    }
    return d + 'Z';
  }
  var GEAR = '<path d="' + gearPath(50, 50, 46, 37, 12) + '"/><circle cx="50" cy="50" r="18"/><circle cx="50" cy="50" r="8"/>';
  var FRAME = '<span class="kx-bg" aria-hidden="true"><i></i><b></b><b></b></span>';

  /* ---------- Stat count-ups ---------- */
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+';
  function runStat(el) {
    var num = el.querySelector('[data-count]');
    if (num) {
      var to = +num.getAttribute('data-count'), o = { v: 0 };
      if (reduced || !hasGsap) { num.textContent = to; return; }
      gsap.to(o, { v: to, duration: to > 50 ? 2 : 1.6, ease: 'power2.out',
        onUpdate: function () { num.textContent = Math.round(o.v); } });
      return;
    }
    var word = el.querySelector('[data-scramble]');
    if (!word || reduced || !hasGsap) return;
    var text = word.getAttribute('data-scramble'), p = { v: 0 };
    gsap.to(p, { v: 1, duration: 1.4, ease: 'none', onUpdate: function () {
      var done = Math.floor(p.v * text.length), out = text.slice(0, done);
      for (var i = done; i < text.length; i++) out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      word.textContent = out;
    }, onComplete: function () { word.textContent = text; } });
  }

  function initStats() {
    var grid = document.querySelector('#scale .st-grid');
    if (!grid) return;
    var tiles = grid.querySelectorAll('.st-tile');
    tiles.forEach(function (t) {
      var n = t.querySelector('[data-count]');
      if (n && hasGsap && !reduced) n.textContent = '0';
    });
    if (!hasGsap || reduced) { tiles.forEach(runStat); return; }
    ScrollTrigger.create({
      trigger: grid, start: 'top 75%', once: true,
      onEnter: function () { tiles.forEach(function (t, i) { gsap.delayedCall(0.15 + i * 0.12, runStat, [t]); }); }
    });
  }

  /* ---------- Modules carousel ---------- */
  function cardHTML(m) {
    return '<div class="mc-tilt">' + FRAME +
      '<span class="mc-glow" aria-hidden="true"></span>' +
      '<span class="mc-deco" aria-hidden="true">' +
        '<svg class="mc-gear mc-gear--a" viewBox="0 0 100 100">' + GEAR + '</svg>' +
        '<svg class="mc-gear mc-gear--b" viewBox="0 0 100 100">' + GEAR + '</svg>' +
        '<svg class="mc-arc" viewBox="0 0 100 62" preserveAspectRatio="none"><path d="M-5 58C20 30 55 8 105 4" vector-effect="non-scaling-stroke"/><path d="M-5 64C30 40 65 22 105 20" vector-effect="non-scaling-stroke" opacity=".5"/></svg>' +
        '<span class="kx-spark" style="--x:18%;--y:24%;--s:.035;--d:.4s"></span>' +
        '<span class="kx-spark" style="--x:72%;--y:15%;--s:.025;--d:1.3s"></span>' +
        '<span class="kx-spark" style="--x:84%;--y:52%;--s:.03;--d:2s"></span>' +
      '</span>' +
      (m.badge ? '<span class="mc-badge">' + m.badge + '</span>' : '') +
      '<div class="mc-content">' +
        '<div class="mc-iconwrap"><svg class="mc-icon" viewBox="0 0 64 64" aria-hidden="true">' + m.icon + '</svg></div>' +
        '<span class="mc-sep" aria-hidden="true"></span>' +
        '<h3 class="mc-name' + (m.name.length > 12 ? ' is-long' : '') + '">' + m.name.replace('&', '&amp;') + '</h3>' +
      '</div></div>';
  }

  function initCarousel() {
    var mc = document.querySelector('#modules .mc');
    if (!mc) return;
    var stage = mc.querySelector('.mc-stage');
    var dotsEl = mc.querySelector('.mc-dots');
    var live = mc.querySelector('.mc-live');
    var n = MODULES.length, cur = 0, cards = [], dots = [];

    MODULES.forEach(function (m, i) {
      var c = document.createElement('div');
      c.className = 'mc-card';
      c.setAttribute('role', 'group');
      c.setAttribute('aria-roledescription', 'slide');
      c.setAttribute('aria-label', (i + 1) + ' of ' + n + ': ' + m.name);
      c.innerHTML = cardHTML(m);
      stage.appendChild(c);
      cards.push(c);
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'mc-dot';
      d.setAttribute('aria-label', 'Show ' + m.name);
      d.innerHTML = '<span></span>';
      d.addEventListener('click', function () { go(i); });
      dotsEl.appendChild(d);
      dots.push(d);
    });

    function rel(j) {
      var d = ((j - cur) % n + n) % n;
      return d > n / 2 ? d - n : d;
    }
    function mobile() { return root.clientWidth <= 700; }
    function state(d) {
      var mob = mobile(), a = Math.abs(d), s = Math.sign(d);
      var show = mob ? 1 : 2;
      var X = mob ? [0, 0.1, 0.16] : [0, 0.135, 0.24];
      var SC = mob ? [1, 0.88, 0.8] : [1, 0.885, 0.78];
      var hidden = a > show, k = Math.min(a, show + 1);
      var cw = cards[0].offsetWidth;
      return {
        x: s * cw * (hidden ? X[show] + 0.06 : X[k]),
        scale: hidden ? SC[show] - 0.06 : SC[k],
        rotationY: -s * Math.min(a, show) * (mob ? 10 : 14),
        transformPerspective: 1400,
        autoAlpha: hidden ? 0 : 1,
        filter: 'brightness(' + (a === 0 ? 1 : a === 1 ? 0.6 : 0.4) + ')',
        zIndex: 10 - Math.min(a, show + 1)
      };
    }

    function layout(animate) {
      var dur = animate && !reduced ? 0.65 : 0;
      cards.forEach(function (c, j) {
        var d = rel(j), prev = c._d;
        var show = mobile() ? 1 : 2;
        var vis = Math.abs(d) <= show, wasVis = prev != null && Math.abs(prev) <= show;
        var st = state(d), z = st.zIndex;
        delete st.zIndex;
        var content = c.querySelector('.mc-content'), badge = c.querySelector('.mc-badge');
        var fade = d === 0 ? 1 : 0;
        if (!dur || (!vis && !wasVis)) {
          gsap.set(c, st); gsap.set(c, { zIndex: z });
          gsap.set(content, { autoAlpha: fade });
          if (badge) gsap.set(badge, { autoAlpha: fade });
        } else {
          if (vis && !wasVis) gsap.set(c, state(d + Math.sign(d)));
          if (!vis && wasVis) st = Object.assign(state(prev + Math.sign(prev)), { zIndex: undefined });
          delete st.zIndex;
          gsap.to(c, Object.assign(st, { duration: dur, ease: 'power3.inOut', overwrite: 'auto' }));
          // swap stacking halfway, when the cards cross
          gsap.delayedCall(dur * 0.4, function () { c.style.zIndex = z; });
          gsap.to(content, { autoAlpha: fade, duration: d === 0 ? dur * 0.8 : dur * 0.35, delay: d === 0 ? dur * 0.35 : 0, overwrite: 'auto' });
          if (badge) gsap.to(badge, { autoAlpha: fade, duration: dur * 0.5, delay: d === 0 ? dur * 0.6 : 0, overwrite: 'auto' });
          if (d === 0) {
            gsap.fromTo(c.querySelector('.mc-iconwrap'), { scale: 0.6, rotation: -12 },
              { scale: 1, rotation: 0, duration: 0.8, delay: dur * 0.3, ease: 'back.out(2)', overwrite: 'auto' });
          }
        }
        c._d = d;
        c.classList.toggle('is-active', d === 0);
        c.setAttribute('aria-hidden', d === 0 ? 'false' : 'true');
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === cur);
        if (i === cur) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
      if (live) live.textContent = MODULES[cur].name + ', module ' + (cur + 1) + ' of ' + n;
    }

    function go(i) {
      i = ((i % n) + n) % n;
      if (i === cur) return;
      resetTilt();
      cur = i;
      layout(true);
    }
    function step(dir) {
      go(cur + dir);
      var btn = mc.querySelector(dir > 0 ? '.mc-next' : '.mc-prev');
      if (!reduced) gsap.fromTo(btn.querySelector('svg'), { x: dir * 6 }, { x: 0, duration: 0.4, ease: 'power2.out' });
    }
    mc.querySelector('.mc-prev').addEventListener('click', function () { step(-1); });
    mc.querySelector('.mc-next').addEventListener('click', function () { step(1); });
    cards.forEach(function (c, j) {
      c.addEventListener('click', function () { if (!dragged && c._d) go(j); });
    });

    // keyboard: when the carousel is focused, or when it fills the view and nothing else has focus
    var inView = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { inView = e[e.length - 1].intersectionRatio >= 0.6; },
        { threshold: [0, 0.6, 1] }).observe(stage);
    }
    function onKey(e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      step(e.key === 'ArrowRight' ? 1 : -1);
    }
    mc.addEventListener('keydown', onKey);
    document.addEventListener('keydown', function (e) {
      var a = document.activeElement;
      if (!inView || mc.contains(a)) return;
      if (a && a !== document.body && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) return;
      var modal = document.getElementById('register');
      if (modal && !modal.hidden) return;
      onKey(e);
    });

    // swipe / drag
    var sx = 0, sy = 0, down = false, dragged = false;
    stage.addEventListener('pointerdown', function (e) {
      down = true; dragged = false; sx = e.clientX; sy = e.clientY;
    });
    window.addEventListener('pointerup', function (e) {
      if (!down) return;
      down = false;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        dragged = true;
        step(dx < 0 ? 1 : -1);
        setTimeout(function () { dragged = false; }, 0);
      }
    });
    window.addEventListener('pointercancel', function () { down = false; });

    // hover tilt on the centre card
    var tiltX = null, tiltY = null, tiltEl = null;
    function resetTilt() {
      if (tiltEl) gsap.to(tiltEl, { rotationX: 0, rotationY: 0, duration: 0.5, ease: 'power2.out' });
      tiltEl = null;
    }
    if (!reduced && window.matchMedia('(hover: hover)').matches) {
      stage.addEventListener('pointermove', function (e) {
        var c = cards[cur], r = c.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        if (Math.abs(px) > 0.5 || Math.abs(py) > 0.5) { resetTilt(); return; }
        var el = c.querySelector('.mc-tilt');
        if (el !== tiltEl) {
          tiltEl = el;
          gsap.set(el, { transformPerspective: 900 });
          tiltX = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power2.out' });
          tiltY = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power2.out' });
        }
        tiltX(px * 12); tiltY(-py * 10);
      });
      stage.addEventListener('pointerleave', resetTilt);
    }

    var lastMobile = mobile();
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (mobile() !== lastMobile) { lastMobile = mobile(); cards.forEach(function (c) { c._d = null; }); }
        layout(false);
      }, 120);
    });
    layout(false);
  }

  if (!hasGsap) return;
  initStats();
  initCarousel();
})();
