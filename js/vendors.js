// Vendors page: the crashed snack rocket (canvas) and the cargo crates below it.
// Edit the list below. snack is one of: cookie, donut, soda, juice, fries, pizza, samosa, chai, burger, popsicle
var VENDORS = [
  { name: 'Vendor to be announced', serves: 'Baked goods and cookies', stall: 'Stall 01', snack: 'cookie' },
  { name: 'Vendor to be announced', serves: 'Cold drinks and juices', stall: 'Stall 02', snack: 'soda' },
  { name: 'Vendor to be announced', serves: 'Burgers and fries', stall: 'Stall 03', snack: 'burger' },
  { name: 'Vendor to be announced', serves: 'Pizza by the slice', stall: 'Stall 04', snack: 'pizza' },
  { name: 'Vendor to be announced', serves: 'Samosas and chaat', stall: 'Stall 05', snack: 'samosa' },
  { name: 'Vendor to be announced', serves: 'Chai and coffee', stall: 'Stall 06', snack: 'chai' },
  { name: 'Vendor to be announced', serves: 'Desserts and donuts', stall: 'Stall 07', snack: 'donut' },
  { name: 'Vendor to be announced', serves: 'Ice lollies and slushies', stall: 'Stall 08', snack: 'popsicle' }
];

(function () {
  'use strict';
  if (!window.PX) return;
  var reduced = PX.reduced();

  /* =========================================================================
   * 1. Crash site
   * ======================================================================= */
  var canvas = document.querySelector('.vx-canvas');
  if (canvas) crashSite();

  function crashSite() {
    var fx = document.querySelector('.vx-fx');
    var gaugeFill = document.querySelector('.vx-gauge-fill');
    var gaugeEl = document.querySelector('.vx-gauge');
    var elEaten = document.querySelector('[data-stat="eaten"]');
    var elStolen = document.querySelector('[data-stat="stolen"]');
    var TYPES = Object.keys(PX.SNACKS);

    var H = 124, W = 240;
    var snacks = [], smoke = [], sparks = [], crumbs = [];
    var eaten = 0, stolen = 0, pressure = 0, shake = 0, burstFlash = 0;
    var nextDrip = 40, alien = null, nextAlien = 420, time = 0;

    // rocket geometry (set in layout)
    var R = { nx: 0, ny: 0, L: 66, rad: 11, slope: 0.3 };

    function seeded(n) { var x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); }
    function groundY(x) {
      return Math.round(H - 30 + Math.sin(x * 0.045) * 3 + Math.sin(x * 0.13 + 1) * 1.5);
    }
    function layout(st) {
      W = st.W; H = st.H;
      R.nx = Math.round(W * 0.5 - R.L * 0.42);
      R.ny = groundY(R.nx) + 3;
    }
    function centerY(i) { return R.ny - i * R.slope; }
    function halfH(i) {
      if (i < 18) return R.rad * Math.sqrt(Math.max(0.05, i / 18));
      if (i > 58) return R.rad - (i - 58) * 0.45;
      return R.rad;
    }
    var breach = { i0: 37, i1: 46 };
    function breachPoint() {
      var i = (breach.i0 + breach.i1) / 2;
      return { x: R.nx + i, y: centerY(i) - halfH(i) + 2 };
    }

    /* ---------- drawing helpers ---------- */
    function px(ctx, x, y, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), 1, 1); }
    function disc(ctx, cx, cy, r, c) {
      ctx.fillStyle = c;
      for (var dy = -r; dy <= r; dy++) {
        var w = Math.round(Math.sqrt(r * r - dy * dy));
        ctx.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2 + 1, 1);
      }
    }

    function drawGround(ctx) {
      for (var x = 0; x < W; x++) {
        var g = groundY(x);
        ctx.fillStyle = '#2a1066'; ctx.fillRect(x, g, 1, H - g);
        ctx.fillStyle = '#4a2499'; ctx.fillRect(x, g + 1, 1, 2);
        ctx.fillStyle = '#9d73ff'; ctx.fillRect(x, g, 1, 1);
        if (seeded(x) > 0.82) px(ctx, x, g + 4 + seeded(x + 9) * 20, '#1d0b4a');
        if (seeded(x + 3) > 0.93) px(ctx, x, g + 6 + seeded(x + 5) * 18, '#5b34b8');
      }
      // a couple of craters
      [[0.14, 9], [0.86, 12], [0.7, 6]].forEach(function (c) {
        var cx = Math.round(W * c[0]), r = c[1], g = groundY(cx);
        for (var dx = -r; dx <= r; dx++) {
          var d = Math.round(Math.sqrt(r * r - dx * dx) * 0.35);
          ctx.fillStyle = '#1d0b4a'; ctx.fillRect(cx + dx, g + 2, 1, d);
          if (Math.abs(dx) === r - 1 || Math.abs(dx) === r) px(ctx, cx + dx, g - 1, '#9d73ff');
        }
      });
      // skid trench leading to the nose
      for (var x2 = R.nx - 2; x2 < R.nx + 90 && x2 < W; x2++) {
        var g2 = groundY(x2);
        px(ctx, x2, g2 + 1, '#160838');
        if (x2 % 3 === 0) px(ctx, x2, g2 + 2, '#160838');
      }
    }

    function drawRocket(ctx, t) {
      var sx = shake ? Math.round((Math.random() - 0.5) * 2 * Math.min(2, shake)) : 0;
      var sy = shake ? Math.round((Math.random() - 0.5) * 2 * Math.min(2, shake)) : 0;
      ctx.save(); ctx.translate(sx, sy);
      var L = R.L;
      // top fin (behind the body)
      for (var i = 50; i <= L; i++) {
        var top = centerY(i) - halfH(i);
        var f = Math.round((i - 50) * 0.75);
        for (var k = 0; k < f; k++) px(ctx, R.nx + i, top - k - 1, k === f - 1 ? '#c9a8ff' : '#7a4fe0');
        if (f) px(ctx, R.nx + i, top - f - 1, PX.K);
      }
      // body, column by column (sheared = tilted while staying on the pixel grid)
      for (var c = 0; c <= L; c++) {
        var cy = centerY(c), h = Math.round(halfH(c)), x = R.nx + c;
        for (var dy = -h; dy <= h; dy++) {
          var col;
          if (dy === -h || dy === h) col = PX.K;
          else if (dy < -h + 3) col = '#f4ecff';
          else if (dy > h - 3) col = '#6b4aa8';
          else if (dy > 2) col = '#a892d6';
          else col = '#d9c9f0';
          if ((c >= 22 && c <= 24) || (c >= 48 && c <= 50)) col = (dy === -h || dy === h) ? PX.K : (dy > 2 ? '#5b34b8' : '#8d5cff');
          // scorch marks
          if (col !== PX.K && seeded(c * 31 + dy * 7) > 0.965) col = '#3a2a66';
          px(ctx, x, cy + dy, col);
        }
      }
      // porthole (cracked)
      var pi = 31, pcy = centerY(pi) - 1;
      disc(ctx, R.nx + pi, pcy, 5, PX.K);
      disc(ctx, R.nx + pi, pcy, 4, '#5cd6ff');
      disc(ctx, R.nx + pi - 1, pcy - 1, 1, '#c9f4ff');
      [[1, 0], [2, 1], [2, 2], [0, -1], [-1, -2], [-2, 2], [-3, 3]].forEach(function (p) { px(ctx, R.nx + pi + p[0], pcy + p[1], '#ffffff'); });
      // the breach: jagged hole with petals of torn metal
      for (var b = breach.i0; b <= breach.i1; b++) {
        var bt = centerY(b) - halfH(b);
        var depth = 3 + Math.round(seeded(b) * 3);
        for (var d = 0; d < depth; d++) px(ctx, R.nx + b, bt + d, d === 0 ? PX.K : '#0b0520');
      }
      [[breach.i0 - 1, -1], [breach.i0 - 2, -2], [breach.i0 + 2, -1], [breach.i1, -1], [breach.i1 + 1, -2], [breach.i1 + 2, -3], [breach.i0 + 5, -1]].forEach(function (p) {
        px(ctx, R.nx + p[0], centerY(p[0]) - halfH(p[0]) + p[1], '#d9c9f0');
      });
      // a glowing interior when pressure is high
      if (pressure > 0.6) {
        var gl = Math.floor((t / 80) % 2) ? '#ff9f5a' : '#ffd166';
        px(ctx, R.nx + breach.i0 + 4, centerY(breach.i0 + 4) - halfH(breach.i0 + 4) + 3, gl);
        px(ctx, R.nx + breach.i0 + 2, centerY(breach.i0 + 2) - halfH(breach.i0 + 2) + 2, gl);
      }
      // warning beacon
      var bi = 26, by = centerY(bi) - halfH(bi) - 2;
      ctx.fillStyle = PX.K; ctx.fillRect(R.nx + bi - 1, by, 4, 2);
      ctx.fillStyle = (Math.floor(t / 300) % 2) ? '#ff5a6e' : '#5a1a2a';
      ctx.fillRect(R.nx + bi, by - 1, 2, 2);
      // nozzle with dying embers
      for (var n = 0; n < 5; n++) {
        var nx = R.nx + L + 1 + n, ncy = centerY(L) , nh = 6 + Math.round(n * 0.6);
        for (var ny = -nh; ny <= nh; ny++) px(ctx, nx, ncy + ny, Math.abs(ny) === nh ? PX.K : (n > 2 ? '#3a2a66' : '#4a3a7a'));
      }
      if (!reduced) {
        var ember = ['#ff9f5a', '#ffd166', '#ff5a6e'][Math.floor(t / 120) % 3];
        px(ctx, R.nx + L + 5, centerY(L) + 1, ember);
        if (Math.random() > 0.5) px(ctx, R.nx + L + 5, centerY(L) - 2, '#ff9f5a');
      }
      // loose hull panel swinging from a hinge under the body
      var hi = 55, hx = R.nx + hi, hy = centerY(hi) + halfH(hi);
      var ang = reduced ? 0.3 : Math.sin(t / 420) * 0.6 + 0.2;
      for (var s = 0; s < 7; s++) {
        px(ctx, hx + Math.sin(ang) * s, hy + Math.cos(ang) * s, '#a892d6');
        px(ctx, hx + 1 + Math.sin(ang) * s, hy + Math.cos(ang) * s, '#6b4aa8');
      }
      ctx.restore();
    }

    // dirt piled over the buried nose, drawn on top of the rocket
    function drawMound(ctx) {
      var x0 = R.nx - 9, x1 = R.nx + 12;
      for (var x = x0; x <= x1; x++) {
        var t = (x - x0) / (x1 - x0);
        var hgt = Math.round(Math.sin(t * Math.PI) * 9);
        var g = groundY(x);
        for (var y = 0; y < hgt; y++) px(ctx, x, g - y, y === hgt - 1 ? '#9d73ff' : (y > hgt - 3 ? '#4a2499' : '#2a1066'));
      }
      [[-12, 0], [-14, -1], [15, 0], [17, -1], [-5, -10]].forEach(function (p, i) {
        if (i === 4) return;
        ctx.fillStyle = '#5b34b8'; ctx.fillRect(R.nx + p[0], groundY(R.nx + p[0]) - 2 + p[1], 2, 2);
      });
    }

    /* ---------- particles ---------- */
    function puff(x, y, big) {
      smoke.push({ x: x, y: y, vx: -0.15 - Math.random() * 0.2, vy: -0.25 - Math.random() * 0.25,
        r: big ? 3 : 1.5, life: 0, max: 120 + Math.random() * 80, dark: Math.random() > 0.5 });
    }
    function spark(x, y) {
      sparks.push({ x: x, y: y, vx: (Math.random() - 0.3) * 1.6, vy: -Math.random() * 1.8, life: 0, max: 18 + Math.random() * 14 });
    }
    function launchSnack(power) {
      var p = breachPoint(), type = TYPES[(Math.random() * TYPES.length) | 0], S = PX.SNACKS[type];
      snacks.push({ type: type, x: p.x - S.w / 2, y: p.y - S.h, w: S.w, h: S.h,
        vx: (Math.random() * 2.4 - 1.1) * power, vy: -(1.6 + Math.random() * 1.6) * power,
        rot: (Math.random() * 4) | 0, spin: 0, rest: false, age: 0, held: false });
      if (snacks.length > 46) {
        var idx = snacks.findIndex(function (s) { return !s.held; });
        if (idx >= 0) snacks[idx].fade = 1;
      }
    }
    function burst(n) {
      for (var i = 0; i < n; i++) launchSnack(1.15 + Math.random() * 0.5);
      var p = breachPoint();
      for (var j = 0; j < 6; j++) puff(p.x + (Math.random() - 0.5) * 6, p.y, true);
      for (var k = 0; k < 10; k++) spark(p.x, p.y);
      shake = 14; burstFlash = 6; pressure = 0;
      pop(p.x, p.y - 14, ['BLORP!', 'KA-SNACK!', 'PFFT!', 'SPLORT!', 'BURP!'][(Math.random() * 5) | 0], 'big');
      if (gaugeEl) { gaugeEl.classList.remove('is-burst'); void gaugeEl.offsetWidth; gaugeEl.classList.add('is-burst'); }
    }
    function eat(s) {
      var S = PX.SNACKS[s.type].img.getContext('2d').getImageData(0, 0, s.w, s.h).data;
      for (var i = 0; i < 10; i++) {
        var ix = (Math.random() * s.w) | 0, iy = (Math.random() * s.h) | 0, o = (iy * s.w + ix) * 4;
        if (!S[o + 3]) continue;
        crumbs.push({ x: s.x + ix, y: s.y + iy, vx: (Math.random() - 0.5) * 1.6, vy: -Math.random() * 1.8,
          c: 'rgb(' + S[o] + ',' + S[o + 1] + ',' + S[o + 2] + ')', life: 0 });
      }
      snacks.splice(snacks.indexOf(s), 1);
      eaten++; if (elEaten) elEaten.textContent = eaten;
      pop(s.x + s.w / 2, s.y - 4, ['NOM', 'CRUNCH', 'YUM', '+1 SNACK', 'MMM', 'CHOMP'][(Math.random() * 6) | 0]);
    }
    function pop(x, y, text, cls) {
      if (!fx) return;
      var el = document.createElement('span');
      el.className = 'vx-pop' + (cls ? ' vx-pop--' + cls : '');
      el.textContent = text;
      el.style.left = (x / W * 100) + '%';
      el.style.top = (y / H * 100) + '%';
      fx.appendChild(el);
      setTimeout(function () { el.remove(); }, 1100);
    }

    /* ---------- the snack thief ---------- */
    var ALIEN = [PX.sprite([
      '.g.....g.',
      '..g...g..',
      '.ggggggg.',
      'ggwkgwkgg',
      'ggwkgwkgg',
      '.ggggggg.',
      '..gmmmg..',
      '.g.g.g.g.',
      'g..g.g..g'
    ], { g: '#6ee7a8', w: '#ffffff', k: PX.K, m: '#2c8a5a' }), PX.sprite([
      '.g.....g.',
      '..g...g..',
      '.ggggggg.',
      'ggwkgwkgg',
      'ggwkgwkgg',
      '.ggggggg.',
      '..gmmmg..',
      '..g.g.g..',
      '.g..g..g.'
    ], { g: '#6ee7a8', w: '#ffffff', k: PX.K, m: '#2c8a5a' })];

    function spawnAlien() {
      var resting = snacks.filter(function (s) { return s.rest && !s.held && !s.fade; });
      if (!resting.length) return;
      var target = resting[(Math.random() * resting.length) | 0];
      var fromLeft = target.x < W / 2;
      alien = { x: fromLeft ? -10 : W + 2, dir: fromLeft ? 1 : -1, state: 'in', target: target, carry: null, step: 0 };
      pop(fromLeft ? 8 : W - 8, groundY(fromLeft ? 8 : W - 8) - 20, '?');
    }
    function updateAlien(dt) {
      if (!alien) return;
      var a = alien;
      a.step += dt;
      var speed = a.state === 'flee' ? 2.6 : a.state === 'out' ? 1.4 : 0.9;
      if (a.state === 'in') {
        if (snacks.indexOf(a.target) < 0 || a.target.held) { a.state = 'out'; a.dir = a.x < W / 2 ? -1 : 1; }
        else {
          var tx = a.target.x + a.target.w / 2 - 4.5;
          a.dir = tx > a.x ? 1 : -1;
          a.x += a.dir * speed * dt;
          if (Math.abs(tx - a.x) < 1.5) {
            a.carry = a.target; a.carry.held = true; a.state = 'out';
            a.dir = a.x < W / 2 ? -1 : 1;
            pop(a.x + 4, groundY(a.x) - 22, 'MINE!');
          }
        }
      } else {
        a.x += a.dir * speed * dt;
        if (a.x < -14 || a.x > W + 14) {
          if (a.carry) {
            snacks.splice(snacks.indexOf(a.carry), 1);
            stolen++; if (elStolen) elStolen.textContent = stolen;
          }
          alien = null; nextAlien = 600 + Math.random() * 480;
          return;
        }
      }
      a.y = groundY(a.x + 4) - 9;
      if (a.carry) { a.carry.x = a.x + 4.5 - a.carry.w / 2; a.carry.y = a.y - a.carry.h - 1 + (Math.floor(a.step / 6) % 2); }
    }
    function scareAlien() {
      var a = alien;
      if (a.carry) {
        a.carry.held = false; a.carry.rest = false; a.carry.vy = -2.2; a.carry.vx = -a.dir * 0.8;
        a.carry = null;
      }
      a.state = 'flee'; a.dir = a.x < W / 2 ? -1 : 1;
      pop(a.x + 4, a.y - 8, ['HEY!', 'EEP!', 'RUDE!', 'SORRY!'][(Math.random() * 4) | 0], 'alien');
    }

    /* ---------- update + draw ---------- */
    function update(dt) {
      time += dt;
      if (shake > 0) shake = Math.max(0, shake - dt);
      if (burstFlash > 0) burstFlash = Math.max(0, burstFlash - dt);
      pressure = Math.min(1, pressure + 0.0024 * dt);
      if (gaugeFill) gaugeFill.style.transform = 'scaleX(' + pressure.toFixed(3) + ')';
      if (gaugeEl) gaugeEl.classList.toggle('is-high', pressure > 0.8);
      if (pressure >= 1) burst(9 + ((Math.random() * 5) | 0));
      nextDrip -= dt;
      if (nextDrip <= 0) { launchSnack(0.75); nextDrip = 70 + Math.random() * 90; }
      // smoke from the breach and the nozzle, sparks from a torn cable
      if (Math.random() < 0.09 * dt) { var p = breachPoint(); puff(p.x + (Math.random() - 0.5) * 6, p.y - 1, false); }
      if (Math.random() < 0.05 * dt) puff(R.nx + R.L + 5, centerY(R.L) - 2, false);
      if (Math.random() < 0.025 * dt) for (var s = 0; s < 4; s++) spark(R.nx + 58, centerY(58) + halfH(58));
      nextAlien -= dt;
      if (!alien && nextAlien <= 0) { spawnAlien(); nextAlien = 300; }
      updateAlien(dt);

      snacks.forEach(function (s) {
        if (s.fade) s.fade -= 0.04 * dt;
        if (s.held) return;
        s.age += dt;
        if (s.rest) return;
        s.vy += 0.11 * dt;
        s.x += s.vx * dt; s.y += s.vy * dt;
        if (s.x < 0) { s.x = 0; s.vx = Math.abs(s.vx) * 0.6; }
        if (s.x > W - s.w) { s.x = W - s.w; s.vx = -Math.abs(s.vx) * 0.6; }
        s.spin += dt;
        if (s.spin > 6) { s.spin = 0; s.rot = (s.rot + (s.vx >= 0 ? 1 : 3)) % 4; }
        var g = groundY(s.x + s.w / 2) - s.h + 1;
        if (s.y >= g) {
          s.y = g;
          if (Math.abs(s.vy) > 0.7) { s.vy *= -0.42; s.vx *= 0.7; }
          else { s.vy = 0; s.vx = 0; s.rest = true; s.rot = 0; }
        }
      });
      snacks = snacks.filter(function (s) { return !(s.fade !== undefined && s.fade <= 0); });
      smoke.forEach(function (m) { m.life += dt; m.x += m.vx * dt; m.y += m.vy * dt; m.r += 0.03 * dt; });
      smoke = smoke.filter(function (m) { return m.life < m.max; });
      sparks.forEach(function (k) { k.life += dt; k.vy += 0.12 * dt; k.x += k.vx * dt; k.y += k.vy * dt; });
      sparks = sparks.filter(function (k) { return k.life < k.max; });
      crumbs.forEach(function (c) { c.life += dt; c.vy += 0.14 * dt; c.x += c.vx * dt; c.y += c.vy * dt; if (c.y > groundY(c.x)) { c.y = groundY(c.x); c.vx = 0; c.vy = 0; } });
      crumbs = crumbs.filter(function (c) { return c.life < 90; });
    }

    function drawSnack(ctx, s) {
      var S = PX.SNACKS[s.type], img = S.rot[s.rot];
      if (s.fade !== undefined) ctx.globalAlpha = Math.max(0, s.fade);
      var ox = (s.w - img.width) / 2, oy = (s.h - img.height) / 2;
      ctx.drawImage(img, Math.round(s.x + ox), Math.round(s.y + oy));
      ctx.globalAlpha = 1;
    }

    function draw(ctx, t, dt) {
      if (!reduced) update(dt);
      ctx.clearRect(0, 0, W, H);
      // smoke behind everything
      smoke.forEach(function (m) {
        var a = 1 - m.life / m.max;
        disc(ctx, m.x, m.y, Math.round(m.r), m.dark ? 'rgba(74,58,122,' + (a * 0.7).toFixed(2) + ')' : 'rgba(185,166,224,' + (a * 0.55).toFixed(2) + ')');
      });
      drawGround(ctx);
      drawRocket(ctx, t);
      drawMound(ctx);
      snacks.forEach(function (s) { if (s.rest) drawSnack(ctx, s); });
      snacks.forEach(function (s) { if (!s.rest) drawSnack(ctx, s); });
      crumbs.forEach(function (c) { px(ctx, c.x, c.y, c.c); });
      sparks.forEach(function (k) { px(ctx, k.x, k.y, k.life < 6 ? '#ffffff' : (k.life < 14 ? '#ffd166' : '#ff9f5a')); });
      if (alien) {
        var fr = ALIEN[Math.floor(alien.step / 7) % 2];
        ctx.save();
        if (alien.dir < 0) { ctx.translate(Math.round(alien.x) * 2 + 9, 0); ctx.scale(-1, 1); }
        ctx.drawImage(fr, Math.round(alien.x), Math.round(alien.y) - (alien.state === 'flee' ? (Math.floor(alien.step / 3) % 2) * 2 : 0));
        ctx.restore();
      }
      if (burstFlash > 0) { ctx.fillStyle = 'rgba(255,240,200,' + (burstFlash / 30).toFixed(2) + ')'; ctx.fillRect(0, 0, W, H); }
    }

    var st = PX.stage(canvas, { height: H, minW: 150, maxW: 340, draw: draw, still: reduced, onResize: layout });
    layout(st);

    // starter snacks lying around so the scene never looks empty
    for (var i = 0; i < 7; i++) {
      var type = TYPES[i % TYPES.length], S = PX.SNACKS[type];
      var x = (i < 3 ? W * (0.08 + i * 0.1) : W * (0.62 + (i - 3) * 0.09));
      snacks.push({ type: type, x: x, y: groundY(x + S.w / 2) - S.h + 1, w: S.w, h: S.h, vx: 0, vy: 0, rot: 0, spin: 0, rest: true, age: 0 });
    }
    if (reduced) st.once();

    /* ---------- pointer ---------- */
    function hitRocket(p) {
      var i = p.x - R.nx;
      if (i < 0 || i > R.L + 6) return false;
      return Math.abs(p.y - centerY(Math.min(i, R.L))) <= halfH(Math.min(i, R.L)) + 3;
    }
    function hitSnack(p) {
      for (var i = snacks.length - 1; i >= 0; i--) {
        var s = snacks[i];
        if (s.fade !== undefined) continue;
        if (p.x >= s.x - 2 && p.x <= s.x + s.w + 2 && p.y >= s.y - 2 && p.y <= s.y + s.h + 2) return s;
      }
      return null;
    }
    function hitAlien(p) {
      return alien && alien.state !== 'flee' && p.x >= alien.x - 3 && p.x <= alien.x + 12 && p.y >= alien.y - 4 && p.y <= alien.y + 12;
    }
    canvas.addEventListener('pointerdown', function (e) {
      var p = st.toLocal(e);
      if (hitAlien(p)) { scareAlien(); }
      else {
        var s = hitSnack(p);
        if (s) { if (s.held && alien) scareAlien(); else eat(s); }
        else if (hitRocket(p)) burst(10 + ((Math.random() * 6) | 0));
      }
      if (reduced) {
        // settle the scene instantly, then draw one frame
        for (var k = 0; k < 240; k++) update(1);
        st.once();
      }
    });
    canvas.addEventListener('pointermove', function (e) {
      var p = st.toLocal(e);
      canvas.style.cursor = (hitAlien(p) || hitSnack(p) || hitRocket(p)) ? 'pointer' : 'default';
    });
    // keyboard: the canvas is focusable; Enter/Space vents the rocket
    canvas.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      burst(10);
      if (reduced) { for (var k = 0; k < 240; k++) update(1); st.once(); }
    });
  }

  /* =========================================================================
   * 2. Cargo manifest
   * ======================================================================= */
  var grid = document.querySelector('.vc-grid');
  if (grid) {
    VENDORS.forEach(function (v, i) {
      var n = ('0' + (i + 1)).slice(-2);
      var li = document.createElement('li');
      li.className = 'vc-crate';
      li.tabIndex = 0;
      li.style.setProperty('--tilt', (((i * 37) % 7) - 3) * 0.6 + 'deg');
      li.innerHTML =
        '<span class="vc-peek" aria-hidden="true"><img src="' + PX.dataURL(PX.SNACKS[v.snack] ? v.snack : 'cookie', 6) + '" alt=""></span>' +
        '<span class="vc-lid" aria-hidden="true"><i></i></span>' +
        '<div class="vc-box">' +
          '<span class="vc-hazard" aria-hidden="true"></span>' +
          '<span class="vc-tag">Cargo ' + n + ' &bull; ' + esc(v.stall) + '</span>' +
          '<h3 class="vc-name">' + esc(v.name) + '</h3>' +
          '<p class="vc-serves">' + esc(v.serves) + '</p>' +
          '<span class="vc-stamp" aria-hidden="true">Fragile: edible</span>' +
        '</div>';
      grid.appendChild(li);
    });
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
})();
