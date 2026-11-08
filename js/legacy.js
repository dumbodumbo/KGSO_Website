/*
 * legacy.js — expandable year banners for #legacy (one open at a time).
 * GSAP animates spill height + gallery shot opacity/y.
 */
(function () {
  'use strict';

  var sec = document.getElementById('legacy');
  if (!sec || !window.gsap) return;

  var editions = [].slice.call(sec.querySelectorAll('.lg-edition'));
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var openEdition = null;
  var tween = null;

  function spillOf(ed) {
    return ed.querySelector('.lg-spill');
  }

  function shotsOf(ed) {
    return ed.querySelectorAll('.lg-shot');
  }

  function setExpanded(ed, open) {
    var btn = ed.querySelector('.lg-banner');
    var spill = spillOf(ed);
    ed.classList.toggle('is-open', open);
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (spill) spill.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  function collapseInstant(ed) {
    var spill = spillOf(ed);
    var shots = shotsOf(ed);
    setExpanded(ed, false);
    if (spill) gsap.set(spill, { height: 0 });
    if (shots.length) gsap.set(shots, { opacity: 0, y: 18, scale: 0.96 });
  }

  function open(ed) {
    if (openEdition === ed) {
      close(ed);
      return;
    }
    if (openEdition) close(openEdition, true);
    openEdition = ed;
    setExpanded(ed, true);

    var spill = spillOf(ed);
    var shots = shotsOf(ed);
    var inner = ed.querySelector('.lg-spill-inner');
    if (!spill || !inner) return;

    if (tween) tween.kill();

    if (reduce) {
      gsap.set(spill, { height: 'auto' });
      gsap.set(shots, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    gsap.set(spill, { height: 0 });
    gsap.set(shots, { opacity: 0, y: 22, scale: 0.94 });
    tween = gsap.timeline({ defaults: { ease: 'power2.out' } })
      .to(spill, { height: inner.offsetHeight, duration: 0.48 })
      .to(shots, {
        opacity: 1, y: 0, scale: 1,
        duration: 0.4,
        stagger: 0.07,
        ease: 'power2.out'
      }, '-=0.22')
      .add(function () {
        gsap.set(spill, { height: 'auto' });
      });
  }

  function close(ed, soft) {
    if (!ed) return;
    var spill = spillOf(ed);
    var shots = shotsOf(ed);
    var wasOpen = openEdition === ed;
    if (wasOpen) openEdition = null;
    setExpanded(ed, false);

    if (tween) tween.kill();

    if (reduce) {
      if (spill) gsap.set(spill, { height: 0 });
      if (shots.length) gsap.set(shots, { opacity: 0, y: 18, scale: 0.96 });
      return;
    }

    var h = spill ? spill.offsetHeight : 0;
    if (spill) gsap.set(spill, { height: h });

    tween = gsap.timeline({
      defaults: { ease: 'power2.inOut' }
    });
    if (shots.length) {
      tween.to(shots, {
        opacity: 0, y: 12, scale: 0.96,
        duration: soft ? 0.22 : 0.28,
        stagger: soft ? 0.02 : 0.04
      }, 0);
    }
    if (spill) {
      tween.to(spill, { height: 0, duration: soft ? 0.32 : 0.4 }, soft ? 0.05 : 0.08);
    }
  }

  editions.forEach(function (ed) {
    collapseInstant(ed);
    var btn = ed.querySelector('.lg-banner');
    var closer = ed.querySelector('.lg-close');
    if (btn) {
      btn.addEventListener('click', function () {
        open(ed);
      });
    }
    if (closer) {
      closer.addEventListener('click', function (e) {
        e.stopPropagation();
        close(ed);
      });
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openEdition) close(openEdition);
  });
})();
