/*
 * countdown.js
 * Counts down to 22 January 2027, 00:00 in the visitor's local time. Ticks on each
 * whole second; at zero the boxes are replaced by the "live" message.
 */
(function () {
  'use strict';

  var TARGET = new Date(2027, 0, 22).getTime();
  var box = document.getElementById('countdown');
  if (!box) return;

  var nums = {};
  box.querySelectorAll('.cd-num').forEach(function (el) { nums[el.dataset.unit] = el; });
  var boxes = box.querySelector('.cd-boxes');
  var live = box.querySelector('.cd-live');
  var title = box.querySelector('.cd-title');

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function set(unit, v) {
    var t = pad(v);
    if (nums[unit].textContent !== t) nums[unit].textContent = t;
  }

  function goLive() {
    box.classList.add('is-live');
    live.hidden = false;
    boxes.setAttribute('aria-hidden', 'true');
    title.textContent = 'The wait is over...';
  }

  function tick() {
    var ms = TARGET - Date.now();
    if (ms <= 0) { goLive(); return; }
    var s = Math.floor(ms / 1000);
    set('days', Math.floor(s / 86400));
    set('hours', Math.floor(s / 3600) % 24);
    set('minutes', Math.floor(s / 60) % 60);
    set('seconds', s % 60);
    // wake just after the next whole second elapses
    setTimeout(tick, (ms % 1000) + 20);
  }

  tick();
})();
