/*
 * faq.js — accordion toggles for the FAQ ticket cards (#faq).
 */
(function () {
  'use strict';

  var sec = document.getElementById('faq');
  if (!sec) return;

  function setOpen(ticket, open) {
    var btn = ticket.querySelector('.fq-btn');
    var panel = ticket.querySelector('.fq-panel');
    if (!btn) return;
    ticket.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (panel) panel.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  [].forEach.call(sec.querySelectorAll('.fq-ticket'), function (ticket) {
    var btn = ticket.querySelector('.fq-btn');
    var panel = ticket.querySelector('.fq-panel');
    if (!btn) return;
    setOpen(ticket, false);
    btn.addEventListener('click', function () {
      setOpen(ticket, !ticket.classList.contains('is-open'));
    });
  });
})();
