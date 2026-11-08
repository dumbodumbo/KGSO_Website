/*
 * schedule.js
 * Schedule section buttons. The registration links share REGISTER_LINKS in js/register.js
 * (exposed as window.KGSORegister.links); links still set to '#' show a "coming soon" toast
 * via the shared window.KGSOToast helper.
 */

/* ====== GUIDEBOOK LINK: paste the guidebook URL here ====== */
const GUIDEBOOK_URL = '#';
/* ========================================================== */

(function () {
  'use strict';

  var sec = document.getElementById('schedule');
  if (!sec) return;

  function hasLink(url) { return !!url && url !== '#'; }

  function urlFor(el) {
    if (el.hasAttribute('data-guidebook')) return GUIDEBOOK_URL;
    var links = (window.KGSORegister && window.KGSORegister.links) || {};
    return links[el.dataset.scReg] || '#';
  }

  function showToast(msg) {
    if (typeof window.KGSOToast === 'function') {
      window.KGSOToast(msg);
      return;
    }
    var toast = document.getElementById('reg-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-on');
    setTimeout(function () { toast.classList.remove('is-on'); }, 2200);
  }

  [].forEach.call(sec.querySelectorAll('[data-guidebook], [data-sc-reg]'), function (el) {
    var url = urlFor(el);
    if (hasLink(url)) el.href = url;
    el.addEventListener('click', function (e) {
      if (hasLink(urlFor(el))) return;
      e.preventDefault();
      showToast(el.hasAttribute('data-guidebook') ? 'Guidebook coming soon' : 'Form link coming soon');
    });
  });
})();
