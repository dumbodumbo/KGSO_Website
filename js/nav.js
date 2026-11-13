/*
 * Mobile nav toggle. Desktop keeps the horizontal link bar (CSS).
 */
(function () {
  'use strict';

  // links back to index.html skip the intro there
  [].forEach.call(document.querySelectorAll('a[href^="index.html"]'), function (a) {
    a.addEventListener('click', function () {
      try { sessionStorage.setItem('kgso_return', '1'); } catch (e) {}
    });
  });

  var bar = document.getElementById('navbar');
  var btn = bar && bar.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (!bar || !btn || !nav) return;

  var mq = window.matchMedia('(max-width: 900px)');

  function setOpen(open) {
    bar.classList.toggle('is-nav-open', open);
    // Lift #page above floating #intro (sibling stacking) while the panel is open
    document.documentElement.classList.toggle('nav-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) nav.removeAttribute('inert');
    else if (mq.matches) nav.setAttribute('inert', '');
  }

  function syncMode() {
    if (mq.matches) setOpen(false);
    else {
      bar.classList.remove('is-nav-open');
      document.documentElement.classList.remove('nav-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
      nav.removeAttribute('inert');
    }
  }

  btn.addEventListener('click', function () {
    setOpen(!bar.classList.contains('is-nav-open'));
  });

  nav.addEventListener('click', function (e) {
    if (e.target.closest('a') && mq.matches) setOpen(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && bar.classList.contains('is-nav-open')) {
      setOpen(false);
      btn.focus();
    }
  });

  document.addEventListener('click', function (e) {
    if (!bar.classList.contains('is-nav-open')) return;
    if (!bar.contains(e.target)) setOpen(false);
  });

  if (mq.addEventListener) mq.addEventListener('change', syncMode);
  else if (mq.addListener) mq.addListener(syncMode);
  syncMode();
})();
