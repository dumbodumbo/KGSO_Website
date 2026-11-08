/*
 * helmet-path.js
 * After the intro, scrolling dissolves the KGS letters and countdown. A fixed
 * companion helmet undocks from the O, shrinks, and parks on the right side of
 * the viewport with a small pixel flame and a gentle idle bob. Scrolling back
 * to the top re-docks it exactly.
 */
(function () {
  'use strict';
  if (!(window.gsap && window.ScrollTrigger)) return;
  gsap.registerPlugin(ScrollTrigger);

  var root = document.documentElement;
  var reduced = root.classList.contains('reduced-motion');
  var SCRUB = 1.6;

  var slotHelmet, comp, mover, img, imgReady, trail, tctx;
  var tl = null, st = null;
  var D = 1, W = 1, H = 1, lastW = 0, lastH = 0;
  var parkX = 0, parkY = 0;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function createEls() {
    slotHelmet = document.getElementById('helmet');
    comp = document.createElement('div');
    comp.id = 'companion';
    comp.setAttribute('aria-hidden', 'true');
    mover = document.createElement('div');
    mover.className = 'c-move';
    img = document.createElement('img');
    img.src = slotHelmet.currentSrc || slotHelmet.src;
    img.alt = '';
    img.draggable = false;
    imgReady = img.decode ? img.decode().catch(function () {}) : Promise.resolve();
    mover.appendChild(img);
    comp.appendChild(mover);
    document.body.appendChild(comp);
    if (!reduced) {
      trail = document.createElement('canvas');
      trail.id = 'companion-trail';
      trail.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(trail, comp);
      tctx = trail.getContext('2d');
    }
  }

  function measure() {
    var slot = document.getElementById('o-slot').getBoundingClientRect();
    var vw = root.clientWidth, vh = window.innerHeight;
    var fs = parseFloat(getComputedStyle(document.getElementById('logo')).fontSize) || 100;
    // Very small phones: tuck smaller so the park pose stays off CTAs / FAQ stubs
    var S = vw < 420 ? clamp(vw * 0.11, 36, 48)
      : vw < 600 ? clamp(vw * 0.13, 42, 56)
      : clamp(vw * 0.07, 70, 110);
    return {
      vw: vw, vh: vh, slot: slot, fs: fs, S: S,
      nav: (document.getElementById('navbar') || { offsetHeight: 0 }).offsetHeight,
      max: ScrollTrigger.maxScroll(window)
    };
  }

  function parkPose(m) {
    // Right edge; on narrow screens park higher so Register / mid-page CTAs stay clear
    var sc = m.S / W;
    var margin = m.vw < 420 ? m.vw * 0.04 : m.vw * 0.06;
    var cx = m.vw - margin;
    var cy = m.vw < 420 ? m.vh * 0.34 : m.vh * 0.48;
    return {
      sc: sc,
      x: cx - W / 2,
      y: cy - H / 2,
      cx: cx,
      cy: cy
    };
  }

  function resetState(m) {
    W = m.slot.width; H = m.slot.height;
    mover.style.width = W + 'px';
    mover.style.height = H + 'px';
    gsap.set(mover, {
      x: m.slot.left, y: m.slot.top,
      scale: 1, rotation: 0, transformOrigin: '50% 50%', autoAlpha: 1
    });
    gsap.set(img, {
      scaleX: 1,
      filter: 'drop-shadow(0 0 ' + (m.fs * 0.02).toFixed(2) + 'px #fff)'
    });
    gsap.set(comp, { x: 0, y: 0 });
    gsap.set('.letters', { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px) brightness(1)' });
    gsap.set('#countdown', { autoAlpha: 1, y: 0, filter: 'blur(0px)' });
    gsap.set('#logo', { autoAlpha: 1 });
  }

  /* Undock → right park. No section paths. */
  function buildMotion(m) {
    var vh = m.vh, max = m.max;
    var park = parkPose(m);
    parkX = park.x;
    parkY = park.y;
    D = Math.min(vh * 0.38, max * 0.45);

    var tl = gsap.timeline({ paused: true, defaults: { ease: 'none', immediateRender: false } });

    tl.to('.letters', {
      autoAlpha: 0, y: -vh * 0.08, scale: 0.96, filter: 'blur(14px) brightness(1.8)',
      duration: D * 0.85, ease: 'power2.inOut'
    }, 0);
    tl.to('#countdown', {
      autoAlpha: 0, y: -vh * 0.05, filter: 'blur(8px)',
      duration: D * 0.85, ease: 'power2.inOut'
    }, 0);
    tl.to(mover, {
      x: park.x, y: park.y, scale: park.sc, rotation: -4,
      duration: D, ease: 'power2.inOut'
    }, 0);

    tl.set({}, {}, Math.max(max, D));
    return tl;
  }

  /* Reduced motion: fade logo/countdown; static right-side helmet, no flame. */
  function buildReduced(m) {
    var park = parkPose(m);
    parkX = park.x;
    parkY = park.y;
    D = Math.min(m.vh * 0.3, m.max * 0.5);
    gsap.set(mover, { x: park.x, y: park.y, scale: park.sc, rotation: 0, autoAlpha: 0 });
    var tl = gsap.timeline({ paused: true, defaults: { ease: 'none', immediateRender: false } });
    tl.to(['#logo', '#countdown'], { autoAlpha: 0, duration: D }, 0);
    tl.fromTo(mover, { autoAlpha: 0 }, { autoAlpha: 1, duration: D }, 0);
    tl.set({}, {}, Math.max(m.max, D));
    return tl;
  }

  function hideSlot() {
    imgReady.then(function () { if (!reduced) gsap.set(slotHelmet, { autoAlpha: 0 }); });
  }

  function build() {
    if (!inited || !comp) return;
    if (st) { st.kill(); st = null; }
    if (tl) { tl.kill(); tl = null; }
    var m = measure();
    lastW = m.vw; lastH = m.vh;
    resetState(m);
    if (m.max < 10) {
      if (reduced) gsap.set(slotHelmet, { autoAlpha: 1 });
      else hideSlot();
      return;
    }
    if (reduced) {
      gsap.set(slotHelmet, { autoAlpha: 1 });
      tl = buildReduced(m);
    } else {
      hideSlot();
      tl = buildMotion(m);
    }
    tl.progress(1).progress(clamp(window.scrollY / m.max, 0, 1));
    st = ScrollTrigger.create({
      animation: tl, start: 0, end: 'max', scrub: reduced ? true : SCRUB,
      onScrubComplete: snapTop, onLeaveBack: snapTop
    });
  }

  function snapTop() {
    if (!tl || window.scrollY > 2) return;
    var scrub = st && st.getTween && st.getTween();
    if (scrub && scrub.isActive()) return;
    if (tl.progress() > 0) {
      tl.progress(0);
      gsap.set(comp, { x: 0, y: 0 });
    }
  }

  /* ---------- Idle bob + small pixel hover flame ---------- */
  var PALETTE = ['#ffffff', '#fff3a8', '#ffd24a', '#ff9b2f', '#ff5a2a'];
  var particles = [];
  var lastScrollY = 0;
  var scrollBoost = 0;

  function sizeTrail() {
    if (!trail) return;
    trail.width = root.clientWidth;
    trail.height = window.innerHeight;
  }

  function emitFlame(r, intensity) {
    // Small idle thrust under the helmet (hover look); intensity 0–1
    var cx = r.left + r.width / 2;
    var by = r.top + r.height * 0.82;
    var ps = Math.max(2, Math.round(Math.min(r.width, 80) / 22));
    // Low density: ~1 pixel most frames at idle; a couple more while scrolling
    var n = 1 + (Math.random() < 0.35 + intensity * 0.45 ? 1 : 0)
      + (intensity > 0.4 && Math.random() < intensity ? 1 : 0);
    for (var i = 0; i < n; i++) {
      particles.push({
        x: cx + (Math.random() - 0.5) * r.width * 0.32,
        y: by + Math.random() * ps * 1.5,
        vx: (Math.random() - 0.5) * 0.45,
        vy: 0.55 + Math.random() * 0.9 + intensity * 0.6,
        life: 0,
        max: 12 + Math.random() * 14,
        s: ps * (Math.random() < 0.18 ? 2 : 1)
      });
    }
  }

  function tick() {
    if (!tl) return;
    var k = clamp(tl.time() / D, 0, 1);
    var now = gsap.ticker.time;

    // Gentle bob once free (≈2–5px); tiny tilt already on mover
    gsap.set(comp, {
      x: Math.cos(now * 0.9) * 1.5 * k,
      y: Math.sin(now * 1.55) * 3.2 * k
    });

    // Soft scroll boost for flame
    var sy = window.scrollY;
    var dy = Math.abs(sy - lastScrollY);
    lastScrollY = sy;
    scrollBoost = clamp(scrollBoost * 0.86 + dy * 0.08, 0, 1);

    if (k > 0.35 && tctx) {
      var r = mover.getBoundingClientRect();
      emitFlame(r, 0.25 + scrollBoost * 0.75);

      tctx.clearRect(0, 0, trail.width, trail.height);
      if (particles.length) {
        tctx.globalCompositeOperation = 'lighter';
        for (var j = particles.length - 1; j >= 0; j--) {
          var p = particles[j];
          if (++p.life > p.max) { particles.splice(j, 1); continue; }
          p.x += p.vx; p.y += p.vy; p.vx *= 0.96; p.vy *= 0.97;
          var u = p.life / p.max;
          tctx.globalAlpha = (1 - u * u) * 0.85;
          tctx.fillStyle = PALETTE[Math.min(PALETTE.length - 1, Math.floor(u * PALETTE.length))];
          tctx.fillRect(Math.round(p.x / p.s) * p.s, Math.round(p.y / p.s) * p.s, p.s, p.s);
        }
        tctx.globalAlpha = 1;
        tctx.globalCompositeOperation = 'source-over';
      }
    } else if (tctx) {
      particles.length = 0;
      tctx.clearRect(0, 0, trail.width, trail.height);
    }
  }

  /* ---------- Init ---------- */
  var inited = false, resizeTimer = null;

  function onResize() {
    sizeTrail();
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (root.clientWidth === lastW && Math.abs(window.innerHeight - lastH) < 120) return;
      build();
    }, 250);
  }

  function init() {
    if (inited) return;
    inited = true;
    createEls();
    sizeTrail();
    build();
    if (!reduced) gsap.ticker.add(tick);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', function () { requestAnimationFrame(snapTop); }, { passive: true });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); build(); });
  }

  window.KGSOHelmetPath = { init: init, rebuild: build, get timeline() { return tl; } };

  window.addEventListener('kgso:intro-complete', init);
  // Safety: if intro already finished before this script ran, init immediately.
  if (root.classList.contains('intro-done')) init();
})();
