// Small pixel-art helper for vendors.js: sprites, snack images and a scaled-up canvas loop.
(function () {
  'use strict';

  var K = '#1a0a3e'; // outline

  function sprite(rows, pal) {
    var w = 0, h = rows.length;
    rows.forEach(function (r) { if (r.length > w) w = r.length; });
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var x = c.getContext('2d');
    rows.forEach(function (r, j) {
      for (var i = 0; i < r.length; i++) {
        var col = pal[r[i]];
        if (!col) continue;
        x.fillStyle = col;
        x.fillRect(i, j, 1, 1);
      }
    });
    return c;
  }

  function rotations(src) {
    var out = [src];
    for (var k = 1; k < 4; k++) {
      var prev = out[k - 1];
      var c = document.createElement('canvas');
      c.width = prev.height; c.height = prev.width;
      var x = c.getContext('2d');
      x.translate(c.width, 0);
      x.rotate(Math.PI / 2);
      x.drawImage(prev, 0, 0);
      out.push(c);
    }
    return out;
  }

  /* ---------- Snacks ---------- */
  var DEFS = {
    cookie: [[
      '..kkkk..',
      '.kbbbbk.',
      'kbdbbhbk',
      'kbbbbdbk',
      'kbhdbbbk',
      'kbbbbbdk',
      '.kbdbbk.',
      '..kkkk..'
    ], { k: K, b: '#d9a066', d: '#5a3218', h: '#f0c890' }],
    donut: [[
      '..kkkkk..',
      '.kpspcpk.',
      'kpcpkpspk',
      'kspk.kpck',
      'kppkkkpsk',
      'kbpscppbk',
      '.kbbbbbk.',
      '..kkkkk..'
    ], { k: K, p: '#ff85ee', s: '#ffffff', c: '#5cd6ff', b: '#d9a066' }],
    soda: [[
      '.kkkk.',
      'kggggk',
      'krrrrk',
      'kwrrrk',
      'kwwrrk',
      'krwwrk',
      'krrwwk',
      'krrrrk',
      'kggggk',
      '.kkkk.'
    ], { k: K, g: '#c9c9d9', r: '#ff5a6e', w: '#ffffff' }],
    juice: [[
      '.....y.',
      '....y..',
      '.kkkykk',
      '.kwwwwk',
      'kooooook',
      '.kohook',
      '.koohok',
      '.kooook',
      '..kook.',
      '..kkkk.'
    ], { k: K, y: '#ffd166', w: '#ffffff', o: '#ff9f5a', h: '#ffd0a8' }],
    fries: [[
      '.y.y.y.',
      '.yyyyy.',
      'yyyyyyy',
      'krrrrrk',
      'krwwwrk',
      'krwrwrk',
      'krrrrrk',
      '.krrrk.',
      '.kkkkk.'
    ], { k: K, y: '#ffd166', r: '#ff5a6e', w: '#ffffff' }],
    pizza: [[
      'kkkkkkkkk',
      'kccccccck',
      '.kyryyyk.',
      '.kyyyryk.',
      '..kryyk..',
      '..kyyyk..',
      '...kyk...',
      '...kk....'
    ], { k: K, c: '#c68a4a', y: '#ffd166', r: '#e8475a' }],
    samosa: [[
      '....k....',
      '...kbk...',
      '..kbhbk..',
      '..kbbbk..',
      '.kbhbbbk.',
      '.kbbbhbk.',
      'kbbbbbbbk',
      'kkkkkkkkk'
    ], { k: K, b: '#e0a040', h: '#f6cf7a' }],
    chai: [[
      'kkkkkk..',
      'kcccck..',
      'kwwwwkww',
      'kwppwk.w',
      'kwwwwkww',
      'kwwwwk..',
      '.kkkk...'
    ], { k: K, c: '#c68a4a', w: '#ffffff', p: '#b79cff' }],
    burger: [[
      '..kkkkk..',
      '.kbbsbbk.',
      'kbsbbbsbk',
      'kgggggggk',
      'kmmmmmmmk',
      'kyyyyyyyk',
      'kbbbbbbbk',
      '.kkkkkkk.'
    ], { k: K, b: '#d9a066', s: '#fff2c8', g: '#6ee7a8', m: '#7a3b1e', y: '#ffd166' }],
    popsicle: [[
      '.kkk.',
      'kpppk',
      'kpwpk',
      'kpppk',
      'kbbbk',
      'kbbbk',
      'kpppk',
      '..t..',
      '..t..'
    ], { k: K, p: '#5cd6ff', w: '#ffffff', b: '#b79cff', t: '#d9a066' }]
  };

  var SNACKS = {};
  Object.keys(DEFS).forEach(function (n) {
    var s = sprite(DEFS[n][0], DEFS[n][1]);
    SNACKS[n] = { img: s, rot: rotations(s), w: s.width, h: s.height };
  });

  function dataURL(name, scale) {
    var s = SNACKS[name].img, c = document.createElement('canvas');
    c.width = s.width * scale; c.height = s.height * scale;
    var x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.drawImage(s, 0, 0, c.width, c.height);
    return c.toDataURL();
  }

  /*
   * Stage: logical resolution with fixed height; width follows the element's aspect.
   * draw(ctx, t, dt) is called every frame while the canvas is on screen.
   */
  function stage(canvas, opts) {
    var ctx = canvas.getContext('2d');
    var st = { W: 0, H: opts.height, ctx: ctx, canvas: canvas, running: false };
    function size() {
      var r = canvas.getBoundingClientRect();
      var aspect = r.width / Math.max(1, r.height);
      // keep the requested height, unless the box is so narrow that the width would drop
      // below minW: then shrink the height instead, so the art never squashes
      st.H = opts.height;
      st.W = Math.min(opts.maxW || 640, Math.round(st.H * aspect));
      if (st.W < (opts.minW || 160)) { st.W = opts.minW || 160; st.H = Math.round(st.W / aspect); }
      canvas.width = st.W; canvas.height = st.H;
      ctx.imageSmoothingEnabled = false;
      if (opts.onResize) opts.onResize(st);
    }
    st.size = size;
    st.toLocal = function (e) {
      var r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width * st.W, y: (e.clientY - r.top) / r.height * st.H };
    };
    var last = 0, raf = 0, visible = true;
    function frame(t) {
      var dt = Math.min(50, last ? t - last : 16) / 16.667; // 1 = one 60fps frame
      last = t;
      opts.draw(ctx, t, dt);
      if (st.running) raf = requestAnimationFrame(frame);
    }
    st.start = function () {
      if (st.running || !visible) return;
      st.running = true; last = 0; raf = requestAnimationFrame(frame);
    };
    st.stop = function () { st.running = false; cancelAnimationFrame(raf); };
    st.once = function () { opts.draw(ctx, performance.now(), 1); };
    size();
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { size(); if (!st.running) st.once(); }, 120); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        visible = e[e.length - 1].isIntersecting;
        if (visible && !opts.still) st.start(); else st.stop();
      }).observe(canvas);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) st.stop(); else if (visible && !opts.still) st.start();
    });
    return st;
  }

  function reducedMotion() {
    return document.documentElement.classList.contains('reduced-motion') ||
      !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  window.PX = { sprite: sprite, rotations: rotations, SNACKS: SNACKS, dataURL: dataURL, stage: stage, K: K, reduced: reducedMotion };
})();
