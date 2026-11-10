#!/usr/bin/env node
/*
 * verify-refs.js: dependency-free repo sanity check (no build step needed).
 *   node scripts/verify-refs.js
 * 1. Every local href/src/srcset/url()/image-set/preload/data-src in index.html, css/*.css, js/*.js
 *    must resolve to an existing file.
 * 2. Lists assets/ files nothing references (orphans).
 * 3. Checks relative links in README.md and docs/**.md (files and #anchors-free paths only).
 * Exits 1 when a reference is broken. Orphans are reported but do not fail the run.
 */
'use strict';
var fs = require('fs');
var path = require('path');
var root = path.resolve(__dirname, '..');
var broken = [];
var used = {};

function rel(p) { return path.relative(root, p).split(path.sep).join('/'); }
function walk(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (e) {
    if (e.name === '.git' || e.name === 'node_modules' || e.name === '.vercel') return;
    var p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  });
  return out;
}
function isLocal(u) {
  return u && !/^(https?:|\/\/|data:|mailto:|tel:|#|javascript:|%23)/i.test(u);   // %23 = url(#id) fragment refs inside inline SVG data URIs
}
function check(from, baseDir, url) {
  if (!isLocal(url)) return;
  var clean = url.split('#')[0].split('?')[0];
  if (!clean) return;
  var target = path.resolve(baseDir, clean);
  if (fs.existsSync(target)) used[rel(target)] = true;
  else broken.push(rel(from) + ' -> ' + url);
}

function scanHtml(file) {
  var s = fs.readFileSync(file, 'utf8');
  var base = path.dirname(file);
  var m, re = /\b(?:href|src|data-src|poster)\s*=\s*"([^"]*)"/g;
  while ((m = re.exec(s))) check(file, base, m[1]);
  re = /\bsrcset\s*=\s*"([^"]*)"/g;
  while ((m = re.exec(s))) m[1].split(',').forEach(function (c) { check(file, base, c.trim().split(/\s+/)[0]); });
  scanUrls(file, s, base);
}
function scanUrls(file, s, base) {
  var m, re = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
  while ((m = re.exec(s))) check(file, base, m[2]);
}
function scanJs(file) {
  var s = fs.readFileSync(file, 'utf8');
  var m, re = /['"]([^'"\s]*assets\/[^'"\s]+)['"]/g;
  while ((m = re.exec(s))) check(file, root, m[1]);
}
function scanMd(file) {
  var s = fs.readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
  var m, re = /\]\(([^)\s]+)\)/g;
  while ((m = re.exec(s))) {
    var u = m[1];
    if (!isLocal(u)) continue;
    var clean = decodeURIComponent(u.split('#')[0]);
    if (!clean) continue;
    if (!fs.existsSync(path.resolve(path.dirname(file), clean))) broken.push(rel(file) + ' -> ' + u);
  }
}

var files = walk(root, []);
files.forEach(function (f) {
  var r = rel(f);
  if (r === 'index.html') scanHtml(f);
  else if (/^css\/.*\.css$/.test(r)) scanUrls(f, fs.readFileSync(f, 'utf8'), path.dirname(f));
  else if (/^js\/.*\.js$/.test(r)) scanJs(f);
  else if (/\.md$/.test(r) && (r === 'README.md' || /^docs\//.test(r))) scanMd(f);
});

var orphans = files.map(rel).filter(function (r) { return /^assets\//.test(r) && !used[r]; });

console.log('Broken references: ' + broken.length);
broken.forEach(function (b) { console.log('  BROKEN  ' + b); });
console.log('Unreferenced assets: ' + orphans.length);
orphans.forEach(function (o) { console.log('  ORPHAN  ' + o + '  (' + fs.statSync(path.join(root, o)).size + ' bytes)'); });
process.exit(broken.length ? 1 : 0);
