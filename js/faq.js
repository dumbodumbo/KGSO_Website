// FAQ: pick a question and the answer "decodes" on the screen beside it.
// On small screens the screen moves under the selected question.
(function () {
  'use strict';

  var sec = document.getElementById('faq');
  if (!sec) return;
  var wrap = sec.querySelector('.dq');
  var screen = sec.querySelector('.dq-screen');
  if (!wrap || !screen) return;

  var root = document.documentElement;
  var reduced = root.classList.contains('reduced-motion') ||
    (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var hasGsap = !!window.gsap;

  var btns = [].slice.call(wrap.querySelectorAll('.dq-q'));
  var items = btns.map(function (b) { return b.closest('.dq-item'); });
  var answers = items.map(function (li) { return li.querySelector('.dq-a').textContent.trim(); });
  var questions = btns.map(function (b) { return b.querySelector('.dq-text').textContent.trim(); });

  var elCh = screen.querySelector('.dq-ch');
  var elStatus = screen.querySelector('.dq-status');
  var elQ = screen.querySelector('.dq-qline');
  var elTxt = screen.querySelector('.dq-txt');
  var elLive = screen.querySelector('.dq-live');
  var bars = [].slice.call(screen.querySelectorAll('.dq-sig i'));
  var canvas = screen.querySelector('.dq-wave');
  var ctx = canvas.getContext('2d');

  wrap.classList.add('dq--js');
  screen.hidden = false;

  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+<>/\\=';
  var cur = -1, decodeRaf = 0, runId = 0;
  var amp = 0.12, ampTarget = 0.12;

  function narrow() { return root.clientWidth <= 900; }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function setBars(n) { bars.forEach(function (b, i) { b.classList.toggle('on', i < n); }); }
  function setState(s) {
    screen.classList.remove('is-decoding', 'is-done');
    if (s) screen.classList.add(s);
  }

  /* place the screen: beside the list on wide screens, under the chosen question on narrow ones */
  function placeScreen() {
    if (narrow() && cur >= 0) {
      if (screen.parentNode !== items[cur]) items[cur].appendChild(screen);
    } else if (screen.parentNode !== wrap) {
      wrap.appendChild(screen);
    }
  }

  /* ---------- decode: reveal front sweeps left to right, a band of glyphs runs ahead of it ---------- */
  function decode(text, id, done) {
    if (reduced) { elTxt.textContent = text; done(); return; }
    var dur = Math.min(1500, 450 + text.length * 5);
    var band = 14, t0 = performance.now();
    (function frame(now) {
      if (id !== runId) return;
      var p = Math.min(1, (now - t0) / dur);
      var shown = Math.floor(p * text.length);
      var out = esc(text.slice(0, shown)), g = '';
      for (var i = shown; i < Math.min(text.length, shown + band); i++) {
        var ch = text[i];
        g += ch === ' ' ? ' ' : esc(GLYPHS[(Math.random() * GLYPHS.length) | 0]);
      }
      elTxt.innerHTML = out + (g ? '<span class="g">' + g + '</span>' : '');
      setBars(1 + Math.round(p * 4));
      if (p < 1) decodeRaf = requestAnimationFrame(frame);
      else { elTxt.textContent = text; done(); }
    })(t0);
  }

  /* ---------- pulse from the question's LED to the screen ---------- */
  function pulse(btn, cb) {
    if (reduced || !hasGsap || narrow()) { cb(); return; }
    var a = btn.querySelector('.dq-led').getBoundingClientRect();
    var b = screen.getBoundingClientRect();
    var w = wrap.getBoundingClientRect();
    var dot = document.createElement('span');
    dot.className = 'dq-pulse';
    wrap.appendChild(dot);
    var x0 = a.left + a.width / 2 - w.left, y0 = a.top + a.height / 2 - w.top;
    var x1 = b.left + 18 - w.left, y1 = b.top + b.height * 0.35 - w.top;
    var o = { t: 0 };
    gsap.to(o, {
      t: 1, duration: 0.38, ease: 'power2.in',
      onUpdate: function () {
        // slight arc, snapped to a 4px grid so it moves like a pixel sprite
        var x = x0 + (x1 - x0) * o.t, y = y0 + (y1 - y0) * o.t - Math.sin(o.t * Math.PI) * 40;
        dot.style.transform = 'translate(' + (Math.round(x / 4) * 4) + 'px,' + (Math.round(y / 4) * 4) + 'px)';
      },
      onComplete: function () { dot.remove(); cb(); }
    });
  }

  function select(i, opts) {
    opts = opts || {};
    if (i === cur && !opts.force) return;
    var id = ++runId;
    cancelAnimationFrame(decodeRaf);
    btns.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); b.classList.remove('is-sending'); });
    cur = i;
    placeScreen();
    sizeCanvas();
    var btn = btns[i];
    btn.classList.add('is-sending');
    setState('is-decoding');
    elStatus.textContent = 'Receiving...';
    elCh.textContent = 'CH ' + ('0' + (i + 1)).slice(-2);
    setBars(0);
    ampTarget = 1;
    pulse(btn, function () {
      if (id !== runId) return;
      screen.classList.remove('is-tuning'); void screen.offsetWidth; screen.classList.add('is-tuning');
      elQ.textContent = questions[i];
      elStatus.textContent = 'Decoding...';
      decode(answers[i], id, function () {
        if (id !== runId) return;
        btn.classList.remove('is-sending');
        setState('is-done');
        elStatus.textContent = 'Received';
        setBars(5);
        ampTarget = 0.25;
        elLive.textContent = questions[i] + ' ' + answers[i];
      });
    });
    if (narrow() && opts.user && screen.scrollIntoView) {
      setTimeout(function () {
        var r = btn.getBoundingClientRect();
        if (r.top < 70 || r.bottom > window.innerHeight * 0.5) {
          window.scrollBy({ top: r.top - 90, behavior: reduced ? 'auto' : 'smooth' });
        }
      }, 30);
    }
  }

  btns.forEach(function (b, i) {
    b.addEventListener('click', function () { select(i, { user: true }); });
    b.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      var n = (i + (e.key === 'ArrowDown' ? 1 : -1) + btns.length) % btns.length;
      btns[n].focus();
    });
  });

  /* ---------- waveform: a pixel sine stack whose amplitude follows the signal ---------- */
  var visible = false, waveRaf = 0, W = 0, H = 0, PX = 3;
  function sizeCanvas() {
    var r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width / PX));
    H = Math.max(1, Math.round(r.height / PX));
    canvas.width = W; canvas.height = H;
  }
  function draw(t) {
    amp += (ampTarget - amp) * 0.06;
    if (Math.abs(ampTarget - amp) < 0.01 && ampTarget > 0.5) ampTarget = 0.6;
    ctx.clearRect(0, 0, W, H);
    var mid = H / 2;
    for (var x = 0; x < W; x++) {
      var k = x / W;
      var v = Math.sin(k * 18 + t * 0.004) * 0.55 +
              Math.sin(k * 47 - t * 0.007) * 0.3 * amp +
              (amp > 0.5 ? (Math.random() - 0.5) * 0.5 * amp : 0);
      var y = Math.round(mid + v * (H * 0.42) * Math.max(amp, 0.15));
      ctx.fillStyle = '#8fe9ff';
      ctx.fillRect(x, y, 1, 1);
      if (x % 2 === 0) { ctx.fillStyle = '#8fe9ff33'; ctx.fillRect(x, y + 1, 1, 1); }
    }
    ctx.fillStyle = '#b48cff22';
    for (var gx = 0; gx < W; gx += 8) ctx.fillRect(gx, Math.round(mid), 1, 1);
  }
  function loop(t) {
    draw(t);
    if (visible && !reduced) waveRaf = requestAnimationFrame(loop);
  }
  function startWave() {
    cancelAnimationFrame(waveRaf);
    if (reduced) { draw(0); return; }
    waveRaf = requestAnimationFrame(loop);
  }
  sizeCanvas(); draw(0);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      var en = e[e.length - 1];
      visible = en.isIntersecting;
      if (visible) startWave(); else cancelAnimationFrame(waveRaf);
      // first time the FAQ comes into view, tune in to transmission 01
      if (visible && cur < 0 && en.intersectionRatio >= 0.35) select(0);
    }, { threshold: [0, 0.35] }).observe(wrap);
  } else {
    visible = true; startWave(); select(0);
  }

  var rt = null;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { placeScreen(); sizeCanvas(); draw(performance.now()); }, 120);
  });
})();
