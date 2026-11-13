(function () {
  'use strict';

  var root = document.documentElement;
  var intro = document.getElementById('intro');
  var reduced = root.classList.contains('reduced-motion');
  var hasGsap = !!window.gsap;

  if (hasGsap) {
    gsap.registerPlugin(window.ScrollTrigger, window.MotionPathPlugin);
  }

  /* ---------- Fixed background + light parallax ---------- */
  function initParallax() {
    if (!hasGsap || !window.ScrollTrigger || reduced) return;
    // starts at 0 so the art lines up with the countdown at the top of the page
    gsap.fromTo('#bg .bg-img', { yPercent: 0 }, {
      yPercent: -2.75, ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.6 }
    });
  }

  /* ---------- Hand-off to the page ---------- */
  // reveal(): black lifts, page/navbar fade in under the logo (scroll still locked).
  // complete(): scroll unlocks; the logo stays and helmet-path.js takes over on scroll.
  var revealed = false, finished = false;
  var page = document.getElementById('page');

  // The background fades in once the intro has revealed AND the image is decoded; until then the
  // page stays on black. This tween is the only thing that touches the layer's opacity.
  // BG_FADE + BG_WAIT <= 3s, so even a slow image is fully faded in 3s after the reveal.
  var BG_FADE = 2.2, BG_WAIT = 800;
  var bgImg = document.querySelector('#bg .bg-img');
  var bgDecoded = false, bgShown = false;
  var bgReady = window.__kgsoBgReady || Promise.resolve();
  bgReady.then(function () { bgDecoded = true; if (revealed) showBg(); });
  function showBg() {
    if (bgShown || !bgImg) return;
    bgShown = true;
    if (hasGsap) {
      gsap.to(bgImg, { opacity: 1, duration: BG_FADE, ease: 'power2.out', overwrite: 'auto' });
    } else {
      bgImg.style.transition = 'opacity ' + BG_FADE + 's ease-out';
      bgImg.style.opacity = '1';
    }
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    root.classList.remove('intro-hide');
    intro.classList.add('revealed');
    if (bgDecoded) showBg(); else setTimeout(showBg, BG_WAIT);
  }

  function syncHelmetPath() {
    if (window.ScrollTrigger) ScrollTrigger.refresh();
    // Instantly match logo/countdown opacity to scroll (skip scrub lag after hash jump)
    if (window.KGSOHelmetPath && typeof KGSOHelmetPath.rebuild === 'function') {
      KGSOHelmetPath.rebuild();
    }
  }

  function scrollAfterIntro(respectHash) {
    if (respectHash && location.hash && location.hash.length > 1) {
      var id = location.hash.slice(1);
      var el = document.getElementById(id);
      if (el) {
        // layout must settle after unlocking overflow / showing the page
        var moved = false;
        var mark = function () { moved = true; };
        ['wheel', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, mark, { once: true, passive: true }); });
        var land = function () {
          if (moved) return;
          el.scrollIntoView({ behavior: 'instant', block: 'start' });
        };
        requestAnimationFrame(function () {
          land();
          syncHelmetPath();
          // layout can still shift a little after this, so land again unless the user scrolled
          setTimeout(function () { land(); syncHelmetPath(); }, 250);
          setTimeout(land, 900);
        });
        return;
      }
    }
    window.scrollTo(0, 0);
    syncHelmetPath();
  }

  function complete(opts) {
    if (finished) return;
    reveal();
    finished = true;
    root.classList.remove('intro-lock');
    root.classList.add('intro-done');
    if (hasGsap) gsap.set([page, '#navbar'], { clearProps: 'opacity,transform' });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
    // Init helmet-path BEFORE scroll/rebuild so rebuild never runs on an uninited companion.
    window.dispatchEvent(new CustomEvent('kgso:intro-complete'));
    scrollAfterIntro(opts && opts.respectHash);
  }

  /* ---------- Intro staging: logo big and centred on black, then glides home ---------- */
  var wrap = document.getElementById('logo-wrap');
  var staged = false;

  // transform on #logo-wrap mapping the logo's home box to a big centred box
  function stageLogo() {
    gsap.set(wrap, { clearProps: 'transform' });
    var l = document.getElementById('logo').getBoundingClientRect();
    var w = wrap.getBoundingClientRect();
    var vw = window.innerWidth, vh = window.innerHeight;
    var target = Math.min(vw * (vw < 600 ? 0.92 : 0.75), vh * 0.7 * 913 / 238);
    var cx = l.left + l.width / 2, cy = l.top + l.height / 2;
    gsap.set(wrap, {
      transformOrigin: (cx - w.left) + 'px ' + (cy - w.top) + 'px',
      x: vw / 2 - cx, y: vh / 2 - cy, scale: target / l.width
    });
    staged = true;
  }

  function unstage(tl, t, dur) {
    var v = { x: 0, y: 0, scale: 1, duration: dur, ease: 'power3.inOut' };
    if (tl) tl.to(wrap, v, t); else gsap.to(wrap, v);
  }

  // Shared tail: black fades away with the page in behind the logo; the logo stays.
  function addHandoff(tl, t) {
    var fade = 1.4;
    tl.add(reveal, t);
    if (staged) unstage(tl, t, fade);
    tl.to('#intro-black', { opacity: 0, duration: fade, ease: 'power2.inOut' }, t);
    tl.to('#skip', { opacity: 0, duration: 0.4 }, t);
    tl.fromTo(page, { opacity: 0 }, { opacity: 1, duration: fade, ease: 'power2.out', immediateRender: false }, t + 0.2);
    tl.fromTo('#navbar', { y: -30 }, { y: 0, duration: 1, ease: 'power3.out', immediateRender: false }, t + 0.2);
    tl.fromTo('#countdown', { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 1.2, ease: 'power2.out', immediateRender: false }, t + 0.4);
    tl.add(function () { complete({ respectHash: true }); }, t + fade + 0.2);
  }

  // Skip: jump to the end-of-intro state (full logo), then a short fade to the page.
  function quickHandoff() {
    reveal();
    if (staged) { gsap.killTweensOf(wrap); gsap.to(wrap, { x: 0, y: 0, scale: 1, duration: 0.5, ease: 'power2.inOut' }); }
    gsap.set('#navbar', { y: 0 });
    gsap.to('#skip', { opacity: 0, duration: 0.3 });
    gsap.to('#intro-black', { opacity: 0, duration: 0.5, ease: 'power2.out' });
    gsap.fromTo('#countdown', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    gsap.fromTo(page, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out', onComplete: function () { complete({ respectHash: true }); } });
  }

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  initParallax();

  if (!hasGsap) { root.classList.remove('intro-pre'); complete({ respectHash: true }); return; }

  // coming back from vendors/sponsors: no intro
  if (window.__kgsoNoIntro) {
    root.classList.remove('intro-pre');
    var sk = document.getElementById('skip');
    if (sk) sk.hidden = true;
    complete({ respectHash: true });
    return;
  }

  /* ---------- Reduced motion: short fade, no flight ---------- */
  if (reduced) {
    gsap.set('#helmet', { clearProps: 'all' });
    var rtl = gsap.timeline({ paused: true });
    rtl.from('#logo', { opacity: 0, duration: 0.8 }); root.classList.remove('intro-pre');
    addHandoff(rtl, 1.8);
    var playR = function () { if (!revealed) rtl.play(); };
    Promise.all([loaded(document.getElementById('helmet')), loaded(document.querySelector('#logo .letters'))]).then(playR);
    setTimeout(playR, 2500);
    document.getElementById('skip').addEventListener('click', function () {
      if (finished) return;
      rtl.kill(); gsap.killTweensOf([page, '#navbar', '#intro-black', '#logo', '#countdown']);
      gsap.set('#logo', { opacity: 1 }); quickHandoff();
    });
    window.__kgsoIntro = { tl: rtl };
    return;
  }

  /* ---------- Booster flame particles (pixel squares on canvas) ---------- */
  var canvas = document.getElementById('fx');
  var ctx = canvas.getContext('2d');
  var helmet = document.getElementById('helmet');
  var particles = [];
  var emitting = false;
  var lastX = null, lastY = null;
  var PALETTE = ['#ffffff', '#fff3a8', '#ffd24a', '#ff9b2f', '#ff5a2a', '#c23fd0', '#7d5bd0'];

  function sizeCanvas() {
    canvas.width = intro.clientWidth;
    canvas.height = intro.clientHeight;
  }
  sizeCanvas();

  function px() { return Math.max(4, Math.round(Math.min(canvas.width, canvas.height) / 90)); }

  function emit() {
    var r = helmet.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    // helmet faces left, so the boosters sit at its back (right side)
    var bx = r.left + r.width * 0.92, by = cy + r.height * 0.05;
    var s = px();
    var dx = lastX === null ? 0 : cx - lastX, dy = lastY === null ? 0 : cy - lastY;
    lastX = cx; lastY = cy;
    var speed = Math.min(1, Math.hypot(dx, dy) / 40);
    var n = Math.round(8 + speed * 30);
    for (var i = 0; i < n; i++) {
      var spread = (Math.random() - 0.5) * r.height * 0.6;
      particles.push({
        x: bx - dx * Math.random() + Math.random() * s,
        y: by + spread - dy * Math.random(),
        vx: -dx * 0.12 + (Math.random() - 0.2) * 3 * (1 + speed),
        vy: -dy * 0.12 + (Math.random() - 0.5) * 2,
        life: 0, max: 26 + Math.random() * 34,
        s: s * (Math.random() < 0.3 ? 2 : 1)
      });
    }
  }

  function drawFx() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // additive blend: overlapping pixels bloom toward white on the black stage
    ctx.globalCompositeOperation = 'lighter';
    if (emitting) emit();
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.life++;
      if (p.life > p.max) { particles.splice(i, 1); continue; }
      p.x += p.vx; p.y += p.vy; p.vx *= 0.97;
      var t = p.life / p.max;
      var c = PALETTE[Math.min(PALETTE.length - 1, Math.floor(t * PALETTE.length))];
      ctx.globalAlpha = 1 - t * t;
      ctx.fillStyle = c;
      var s = p.s;
      ctx.fillRect(Math.round(p.x / s) * s, Math.round(p.y / s) * s, s, s);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ---------- Timeline ---------- */
  var tl;
  var logo = document.getElementById('logo');
  var letters = gsap.utils.toArray('#logo .letters');
  var vw = function () { return window.innerWidth; };

  gsap.set(letters, { opacity: 0, filter: 'blur(18px) brightness(2.2)', scale: 1.08 });
  gsap.set(helmet, { opacity: 0 });
  stageLogo(); root.classList.remove('intro-pre'); // GSAP now owns letters/helmet opacity

  function build() {
    tl = gsap.timeline();

    // 1-2. KGS letters on black: glow/blur -> sharp, all together
    var tl0 = 0.6, letterDur = 2.0;
    tl.to(letters, {
      opacity: 1, scale: 1, filter: 'blur(0px) brightness(1)',
      duration: letterDur, ease: 'power2.out'
    }, tl0);

    // 3. helmet blast in from the right, angled, large (once letters are fully in)
    var t0 = tl0 + letterDur;
    tl.set(helmet, { opacity: 1, x: function () { return vw() * 0.9; }, y: function () { return -window.innerHeight * 0.25; },
      scale: 2.6, rotation: 28 }, t0);
    tl.add(function () { emitting = true; lastX = lastY = null; }, t0);
    tl.to(helmet, {
      x: 0, y: 0, scale: 1,
      duration: 1.45, ease: 'power3.out'
    }, t0);
    // slight spin that settles to 0 (overshoot then correct)
    tl.to(helmet, { rotation: -14, duration: 0.7, ease: 'power1.in' }, t0);
    tl.to(helmet, { rotation: 0, duration: 0.75, ease: 'back.out(2.2)' }, t0 + 0.7);
    tl.add(function () { emitting = false; }, t0 + 1.35);

    // 4. dock: impact pulse
    var td = t0 + 1.45;
    tl.fromTo('#pulse', { opacity: 0.9, scale: 0.7 }, { opacity: 0, scale: 2.4, duration: 0.8, ease: 'power2.out', immediateRender: false }, td);
    tl.fromTo(helmet, { filter: 'drop-shadow(0 0 0.02em #fff) brightness(1.8)' },
      { filter: 'drop-shadow(0 0 0.02em #fff) brightness(1)', duration: 0.6, immediateRender: false }, td);
    tl.to(logo, { scale: 1.04, duration: 0.1, yoyo: true, repeat: 1, ease: 'power1.inOut', transformOrigin: '50% 50%' }, td);

    // 5. short hold on black, then reveal the home screen behind the logo
    addHandoff(tl, td + 1.0);
  }

  var ro = null;
  window.addEventListener('resize', function () {
    sizeCanvas();
    if (!revealed) stageLogo();
  });
  gsap.ticker.add(drawFx);

  function start() { build(); }
  function loaded(img) {
    if (img.decode) return img.decode().catch(function () {});
    return new Promise(function (res) { if (img.complete) res(); else img.onload = img.onerror = res; });
  }
  // wait for fonts + decoded logo images before the letters fade in (2.5s cap below)
  var ready = Promise.all([
    document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve(),
    loaded(helmet), loaded(letters[0])
  ]);
  var started = false;
  function go() { if (started || revealed) return; started = true; start(); }
  ready.then(go);
  setTimeout(go, 2500);

  /* ---------- Skip ---------- */
  document.getElementById('skip').addEventListener('click', function () {
    if (finished) return;
    started = true;
    emitting = false; particles.length = 0;
    gsap.ticker.remove(drawFx);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (tl) tl.kill();
    gsap.killTweensOf([letters, helmet, logo, '#pulse', page, '#navbar', '#intro-black', '#skip', '#countdown']);
    gsap.set(letters, { opacity: 1, scale: 1, filter: 'blur(0px) brightness(1)' });
    gsap.set(helmet, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, filter: 'drop-shadow(0 0 0.02em #fff) brightness(1)' });
    gsap.set(logo, { scale: 1 });
    gsap.set('#pulse', { opacity: 0 });
    quickHandoff();
  });

  // complete() hides the overlay; clean up the ticker afterwards
  window.addEventListener('kgso:intro-complete', function () { gsap.ticker.remove(drawFx); });

  // debug hook for testing: window.__kgsoIntro.tl.seek(t)
  window.__kgsoIntro = { get tl() { return tl; } };
})();
