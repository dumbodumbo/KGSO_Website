/*
 * register.js
 * Registration popup. Any [data-register] element opens it (the countdown button, and later
 * a navbar item); each option opens its Google Form in a new tab.
 * Public: window.KGSORegister.open(trigger?) / .close()
 */

/* ====== REGISTRATION FORM LINKS: paste the Google Form URLs here ====== */
const REGISTER_LINKS = {
  internal: '#',   // KGS students
  external: '#'    // other schools
};
/* ===================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var modal = document.getElementById('register');
  if (!modal) return;
  var panel = modal.querySelector('.reg-panel');
  var backdrop = modal.querySelector('.reg-backdrop');
  var cards = [].slice.call(modal.querySelectorAll('.reg-card'));
  var toast = document.getElementById('reg-toast');
  var hasGsap = !!window.gsap;
  var FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

  var isOpen = false, locked = false, opener = null, scrollY0 = 0, anim = null, toastTimer = null;
  var inerted = [];

  function reduced() {
    return root.classList.contains('reduced-motion') ||
      (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* ---------- Links ---------- */
  function linkFor(card) { return REGISTER_LINKS[card.dataset.reg] || '#'; }
  function hasLink(url) { return !!url && url !== '#'; }

  cards.forEach(function (card) {
    var url = linkFor(card);
    if (hasLink(url)) card.href = url;
    card.addEventListener('click', function (e) {
      if (!hasLink(linkFor(card))) {
        e.preventDefault();
        showToast('Form link coming soon');
        return;
      }
      close();   // the default action still opens the form in a new tab
    });
  });

  function showToast(msg) {
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = msg;
    void toast.offsetWidth;   // let the :empty -> shown change apply before transitioning in
    toast.classList.add('is-on');
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 2200);
  }
  // Shared by schedule.js (and any other "coming soon" UI)
  window.KGSOToast = showToast;

  /* ---------- Scroll lock + inert background ---------- */
  // overflow:hidden keeps scrollY (and so the ScrollTrigger timelines) where they are, and the
  // stable scrollbar gutter means no layout shift / resize for ScrollTrigger to react to.
  function lock() {
    if (locked) return;
    locked = true;
    scrollY0 = window.scrollY;
    root.classList.add('reg-lock');
    inerted = [].filter.call(document.body.children, function (el) {
      return el !== modal && el !== toast && el.tagName !== 'SCRIPT' && !el.inert;
    });
    inerted.forEach(function (el) { el.inert = true; });
  }

  function unlock() {
    if (!locked) return;
    locked = false;
    inerted.forEach(function (el) { el.inert = false; });
    inerted = [];
    root.classList.remove('reg-lock');
    if (Math.abs(window.scrollY - scrollY0) > 1) window.scrollTo({ top: scrollY0, behavior: 'instant' });
  }

  /* ---------- Open / close ---------- */
  function open(trigger) {
    if (isOpen) return;
    isOpen = true;
    if (!opener) opener = trigger || document.activeElement;
    lock();
    modal.hidden = false;
    document.addEventListener('keydown', onKey);
    if (anim) anim.kill();

    if (hasGsap) {
      if (reduced()) {
        gsap.set([backdrop, panel, cards], { clearProps: 'opacity,transform' });
        anim = gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'none' });
      } else {
        gsap.set(modal, { opacity: 1 });
        anim = gsap.timeline()
          .fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0)
          .fromTo(panel, { opacity: 0, scale: 0.85, y: 24 },
            { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.6)' }, 0.05)
          .fromTo(cards, { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power3.out' }, 0.22);
      }
    }
    panel.focus({ preventScroll: true });
  }

  function finishClose() {
    modal.hidden = true;
    anim = null;
    if (hasGsap) gsap.set([modal, backdrop, panel, cards], { clearProps: 'opacity,transform' });
    unlock();
    var el = opener;
    opener = null;
    if (el && el.focus && document.contains(el)) el.focus({ preventScroll: true });
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    document.removeEventListener('keydown', onKey);
    if (anim) anim.kill();
    if (!hasGsap) { finishClose(); return; }
    if (reduced()) {
      anim = gsap.to(modal, { opacity: 0, duration: 0.2, ease: 'none', onComplete: finishClose });
    } else {
      anim = gsap.timeline({ onComplete: finishClose })
        .to(panel, { opacity: 0, scale: 0.92, y: 12, duration: 0.25, ease: 'power2.in' }, 0)
        .to(backdrop, { opacity: 0, duration: 0.3, ease: 'power1.in' }, 0.05);
    }
  }

  /* ---------- Keyboard: Esc closes, Tab cycles inside the panel ---------- */
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    var items = [].filter.call(panel.querySelectorAll(FOCUSABLE), function (el) {
      return el.offsetWidth || el.offsetHeight || el.getClientRects().length;
    });
    if (!items.length) { e.preventDefault(); return; }
    var first = items[0], last = items[items.length - 1], cur = document.activeElement;
    if (e.shiftKey && (cur === first || cur === panel || !panel.contains(cur))) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && (cur === last || !panel.contains(cur))) {
      e.preventDefault(); first.focus();
    }
  }

  /* ---------- Wiring ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-register]');
    if (!t) return;
    e.preventDefault();
    open(t);
  });
  modal.addEventListener('click', function (e) {
    if (e.target.closest('[data-register-close]')) close();
  });
  // iOS can still rubber-band the page behind an overflow:hidden root
  function blockScroll(e) { if (!e.target.closest('.reg-body')) e.preventDefault(); }
  modal.addEventListener('touchmove', blockScroll, { passive: false });
  modal.addEventListener('wheel', blockScroll, { passive: false });

  window.KGSORegister = { open: open, close: close, links: REGISTER_LINKS, toast: showToast };
})();
