/*
 * video.js
 * Highlights video section: pixel play/pause + mute controls, pause while scrolled
 * off-screen (resume on return unless the user paused), pixel orbit rings.
 * Full reel: https://www.instagram.com/reel/DQrR_pjDDw3/ (linked, not embedded).
 * MP4 src is attached only when the section nears the viewport (preload=none).
 */
(function () {
  'use strict';
  var sec = document.getElementById('video');
  if (!sec) return;

  /* ---------- Playback ---------- */
  var video = sec.querySelector('video');
  var playBtn = sec.querySelector('.vid-play');
  var muteBtn = sec.querySelector('.vid-mute');
  var userPaused = false;
  var srcAttached = false;
  video.muted = true;

  function attachSrc() {
    if (srcAttached) return;
    var src = video.getAttribute('data-src');
    if (!src) return;
    srcAttached = true;
    video.src = src;
    video.load();
  }

  function sync() {
    playBtn.classList.toggle('is-paused', video.paused);
    playBtn.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
    muteBtn.classList.toggle('is-muted', video.muted);
    muteBtn.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
  }
  function play() {
    attachSrc();
    var p = video.play();
    if (p && p.catch) p.catch(sync);
  }

  playBtn.addEventListener('click', function () {
    if (video.paused) { userPaused = false; play(); }
    else { userPaused = true; video.pause(); }
  });
  muteBtn.addEventListener('click', function () { video.muted = !video.muted; });
  ['play', 'pause', 'volumechange'].forEach(function (e) { video.addEventListener(e, sync); });
  sync();

  if ('IntersectionObserver' in window) {
    var visible = false;
    // autoplay can start after the first "not visible" callback, so also catch it here
    video.addEventListener('play', function () { if (!visible) video.pause(); });
    new IntersectionObserver(function (entries) {
      visible = entries[entries.length - 1].isIntersecting;
      if (!visible) { if (!video.paused) video.pause(); }
      else if (!userPaused) play();
    }, { threshold: 0.2, rootMargin: '200px 0px' }).observe(video);
  } else {
    // No IO: attach immediately so autoplay still works
    play();
  }

  /* ---------- Pixel orbit rings ---------- */
  // canvas grid in frame art pixels: the 192 x 106 frame sits at (OX, OY) inside CW x CH
  var FW = 192, FH = 106, OX = 58, OY = 42, CW = 308, CH = 190;
  var RINGS = [
    { cx: 4, cy: 70, rx: 40, ry: 9, rot: -6 },
    { cx: 188, cy: 36, rx: 36, ry: 8, rot: -10 }
  ];

  function drawRings(canvas, front) {
    canvas.width = CW; canvas.height = CH;
    var s = canvas.style;
    s.left = (-OX / FW * 100) + '%'; s.top = (-OY / FH * 100) + '%';
    s.width = (CW / FW * 100) + '%'; s.height = (CH / FH * 100) + '%';
    var ctx = canvas.getContext('2d');
    RINGS.forEach(function (r) {
      var a = r.rot * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
      var step = 1 / (Math.max(r.rx, r.ry) * 3);
      for (var th = 0; th < Math.PI * 2; th += step) {
        var lx = r.rx * Math.cos(th), ly = r.ry * Math.sin(th);
        var x = Math.round(r.cx + lx * ca - ly * sa), y = Math.round(r.cy + lx * sa + ly * ca);
        var near = Math.sin(th) > 0;   // lower half of the ring is the side facing us
        // front layer: only where the near half crosses the left/right sprocket bands
        if (front && !(near && y >= 0 && y < FH && (x < 16 || x >= 176))) continue;
        if (near) {
          ctx.fillStyle = '#c9a8ff'; ctx.fillRect(x + OX, y + OY, 1, 1);
          ctx.fillStyle = '#8457ff'; ctx.fillRect(x + OX, y + OY + 1, 1, 1);
          ctx.fillStyle = '#5a2fc0'; ctx.fillRect(x + OX, y + OY + 2, 1, 1);
        } else {
          ctx.fillStyle = '#7c4dff'; ctx.fillRect(x + OX, y + OY, 1, 1);
          ctx.fillStyle = '#4a22a6'; ctx.fillRect(x + OX, y + OY + 1, 1, 1);
        }
      }
    });
  }
  drawRings(sec.querySelector('.vid-rings--back'), false);
  drawRings(sec.querySelector('.vid-rings--front'), true);
})();
