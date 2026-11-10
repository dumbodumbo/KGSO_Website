/*
 * legacy.js — expandable year banners for #legacy (each opens/closes independently).
 * GSAP animates spill height + gallery shot opacity/y.
 */
(function () {
  'use strict';

  var sec = document.getElementById('legacy');
  if (!sec || !window.gsap) return;

  var editions = [].slice.call(sec.querySelectorAll('.lg-edition'));
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

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

  function isOpen(ed) {
    return ed.classList.contains('is-open');
  }

  function kill(ed) {
    if (ed._lgTween) { ed._lgTween.kill(); ed._lgTween = null; }
  }

  function open(ed) {
    if (isOpen(ed)) return;
    kill(ed);
    setExpanded(ed, true);

    var spill = spillOf(ed);
    var shots = shotsOf(ed);
    var inner = ed.querySelector('.lg-spill-inner');
    if (!spill || !inner) return;

    if (reduce) {
      gsap.set(spill, { height: 'auto' });
      gsap.set(shots, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    var from = spill.offsetHeight;
    var partial = from > 0;
    gsap.set(spill, { height: from });
    if (!partial) gsap.set(shots, { opacity: 0, y: 22, scale: 0.94 });
    ed._lgTween = gsap.timeline({ defaults: { ease: 'power2.out' } })
      .to(spill, { height: inner.offsetHeight, duration: 0.48 })
      .to(shots, {
        opacity: 1, y: 0, scale: 1,
        duration: 0.4,
        stagger: 0.07,
        ease: 'power2.out'
      }, '-=0.22')
      .add(function () {
        gsap.set(spill, { height: 'auto' });
        ed._lgTween = null;
      });
  }

  function close(ed) {
    if (!ed || !isOpen(ed)) return;
    kill(ed);
    var spill = spillOf(ed);
    var shots = shotsOf(ed);
    setExpanded(ed, false);

    if (reduce) {
      if (spill) gsap.set(spill, { height: 0 });
      if (shots.length) gsap.set(shots, { opacity: 0, y: 18, scale: 0.96 });
      return;
    }

    if (spill) gsap.set(spill, { height: spill.offsetHeight });

    var tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    if (shots.length) {
      tl.to(shots, { opacity: 0, y: 12, scale: 0.96, duration: 0.28, stagger: 0.04 }, 0);
    }
    if (spill) tl.to(spill, { height: 0, duration: 0.4 }, 0.08);
    ed._lgTween = tl;
  }

  function toggle(ed) {
    if (isOpen(ed)) close(ed); else open(ed);
  }
  editions.forEach(function (ed) {
    collapseInstant(ed);
    var btn = ed.querySelector('.lg-banner');
    var closer = ed.querySelector('.lg-close');
    if (btn) {
      btn.addEventListener('click', function () {
        toggle(ed);
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
    if (e.key === 'Escape') editions.forEach(close);
  });
})();
