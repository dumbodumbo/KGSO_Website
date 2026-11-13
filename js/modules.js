/*
 * modules.js
 * Content sections below the video: Scale & Legacy stat count-ups and the Modules card carousel (GSAP slide + rotate, arrows, dots,
 * keyboard, swipe, wrap-around, pointer tilt).
 */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduced = root.classList.contains('reduced-motion');
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Module data: 12 x 12 pixel icons (from the KGSO XIII invite), alphabetical ---------- */
  var MODULES = [
    { name: 'Astronomy', color: '#B79CFF',
      icon: '<path fill="#F0C987" d="M4 2h1v1h-1zM5 2h1v1h-1zM6 2h1v1h-1zM7 2h1v1h-1zM4 3h1v1h-1zM5 3h1v1h-1zM6 3h1v1h-1zM7 3h1v1h-1zM8 3h1v1h-1zM3 4h1v1h-1zM4 4h1v1h-1zM5 4h1v1h-1zM6 4h1v1h-1zM7 4h1v1h-1zM8 4h1v1h-1zM2 5h1v1h-1zM2 6h1v1h-1zM3 6h1v1h-1zM4 6h1v1h-1zM5 6h1v1h-1zM6 6h1v1h-1zM7 6h1v1h-1zM8 6h1v1h-1zM2 8h1v1h-1zM3 9h1v1h-1zM4 9h1v1h-1zM5 9h1v1h-1zM6 9h1v1h-1zM7 9h1v1h-1zM4 10h1v1h-1zM5 10h1v1h-1z"/><path fill="#FFF2C8" d="M3 3h1v1h-1zM2 4h1v1h-1z"/><path fill="#B07A3A" d="M9 4h1v1h-1zM9 5h1v1h-1zM9 6h1v1h-1zM9 8h1v1h-1zM8 9h1v1h-1zM6 10h1v1h-1zM7 10h1v1h-1z"/><path fill="#B79CFF" d="M0 5h1v1h-1zM1 5h1v1h-1zM10 5h1v1h-1zM11 5h1v1h-1zM0 6h1v1h-1zM11 6h1v1h-1zM1 7h1v1h-1zM2 7h1v1h-1zM3 7h1v1h-1zM4 7h1v1h-1zM5 7h1v1h-1zM6 7h1v1h-1zM7 7h1v1h-1zM8 7h1v1h-1zM9 7h1v1h-1zM10 7h1v1h-1z"/><path fill="#D9A066" d="M3 5h1v1h-1zM4 5h1v1h-1zM5 5h1v1h-1zM6 5h1v1h-1zM7 5h1v1h-1zM8 5h1v1h-1zM3 8h1v1h-1zM4 8h1v1h-1zM5 8h1v1h-1zM6 8h1v1h-1zM7 8h1v1h-1zM8 8h1v1h-1z"/>' },
    { name: 'Biology', color: '#6EE7A8',
      icon: '<path fill="#6EE7A8" d="M2 0h1v1h-1zM9 0h1v1h-1zM3 1h1v1h-1zM8 1h1v1h-1zM4 2h1v1h-1zM7 2h1v1h-1zM5 3h1v1h-1zM6 3h1v1h-1zM4 4h1v1h-1zM7 4h1v1h-1zM3 5h1v1h-1zM8 5h1v1h-1zM2 6h1v1h-1zM9 6h1v1h-1zM2 7h1v1h-1zM9 7h1v1h-1zM3 8h1v1h-1zM8 8h1v1h-1zM4 9h1v1h-1zM7 9h1v1h-1zM5 10h1v1h-1zM6 10h1v1h-1zM4 11h1v1h-1zM7 11h1v1h-1z"/><path fill="#FFFFFF" fill-opacity="0.85" d="M5 2h1v1h-1zM6 2h1v1h-1zM5 4h1v1h-1zM6 4h1v1h-1zM5 9h1v1h-1zM6 9h1v1h-1zM5 11h1v1h-1zM6 11h1v1h-1z"/>' },
    { name: 'Chemistry', color: '#FF9F5A',
      icon: '<path fill="#FF9F5A" d="M3 0h1v1h-1zM4 0h1v1h-1zM5 0h1v1h-1zM6 0h1v1h-1zM7 0h1v1h-1zM8 0h1v1h-1zM4 1h1v1h-1zM7 1h1v1h-1zM4 2h1v1h-1zM7 2h1v1h-1zM4 3h1v1h-1zM7 3h1v1h-1zM4 4h1v1h-1zM7 4h1v1h-1zM3 5h1v1h-1zM8 5h1v1h-1zM2 6h1v1h-1zM9 6h1v1h-1zM1 7h1v1h-1zM10 7h1v1h-1zM0 8h1v1h-1zM11 8h1v1h-1zM0 9h1v1h-1zM11 9h1v1h-1zM1 10h1v1h-1zM2 10h1v1h-1zM3 10h1v1h-1zM4 10h1v1h-1zM5 10h1v1h-1zM6 10h1v1h-1zM7 10h1v1h-1zM8 10h1v1h-1zM9 10h1v1h-1zM10 10h1v1h-1z"/><path fill="#FFFFFF" fill-opacity="0.85" d="M2 7h1v1h-1zM3 7h1v1h-1zM4 7h1v1h-1zM5 7h1v1h-1zM6 7h1v1h-1zM7 7h1v1h-1zM8 7h1v1h-1zM9 7h1v1h-1zM1 8h1v1h-1zM2 8h1v1h-1zM3 8h1v1h-1zM4 8h1v1h-1zM5 8h1v1h-1zM6 8h1v1h-1zM7 8h1v1h-1zM8 8h1v1h-1zM9 8h1v1h-1zM10 8h1v1h-1zM1 9h1v1h-1zM2 9h1v1h-1zM3 9h1v1h-1zM4 9h1v1h-1zM5 9h1v1h-1zM6 9h1v1h-1zM7 9h1v1h-1zM8 9h1v1h-1zM9 9h1v1h-1zM10 9h1v1h-1z"/>' },
    { name: 'Computer Science', color: '#5CD6FF',
      icon: '<path fill="#5CD6FF" d="M0 0h1v1h-1zM1 0h1v1h-1zM2 0h1v1h-1zM3 0h1v1h-1zM4 0h1v1h-1zM5 0h1v1h-1zM6 0h1v1h-1zM7 0h1v1h-1zM8 0h1v1h-1zM9 0h1v1h-1zM10 0h1v1h-1zM11 0h1v1h-1zM0 1h1v1h-1zM11 1h1v1h-1zM0 2h1v1h-1zM2 2h1v1h-1zM11 2h1v1h-1zM0 3h1v1h-1zM3 3h1v1h-1zM11 3h1v1h-1zM0 4h1v1h-1zM2 4h1v1h-1zM5 4h1v1h-1zM6 4h1v1h-1zM7 4h1v1h-1zM8 4h1v1h-1zM11 4h1v1h-1zM0 5h1v1h-1zM11 5h1v1h-1zM0 6h1v1h-1zM11 6h1v1h-1zM0 7h1v1h-1zM1 7h1v1h-1zM2 7h1v1h-1zM3 7h1v1h-1zM4 7h1v1h-1zM5 7h1v1h-1zM6 7h1v1h-1zM7 7h1v1h-1zM8 7h1v1h-1zM9 7h1v1h-1zM10 7h1v1h-1zM11 7h1v1h-1zM5 8h1v1h-1zM6 8h1v1h-1zM4 9h1v1h-1zM5 9h1v1h-1zM6 9h1v1h-1zM7 9h1v1h-1zM2 10h1v1h-1zM3 10h1v1h-1zM4 10h1v1h-1zM5 10h1v1h-1zM6 10h1v1h-1zM7 10h1v1h-1zM8 10h1v1h-1zM9 10h1v1h-1z"/>' },
    { name: 'Crime', color: '#FF7A7A',
      icon: '<path fill="#FF7A7A" d="M1 0h1v1h-1zM2 0h1v1h-1zM3 0h1v1h-1zM4 0h1v1h-1zM0 1h1v1h-1zM5 1h1v1h-1zM0 2h1v1h-1zM5 2h1v1h-1zM0 3h1v1h-1zM5 3h1v1h-1zM0 4h1v1h-1zM5 4h1v1h-1zM1 5h1v1h-1zM2 5h1v1h-1zM3 5h1v1h-1zM4 5h1v1h-1zM5 6h1v1h-1zM6 6h1v1h-1zM6 7h1v1h-1zM7 7h1v1h-1zM7 8h1v1h-1zM8 8h1v1h-1zM8 9h1v1h-1zM9 9h1v1h-1zM9 10h1v1h-1zM10 10h1v1h-1z"/><path fill="#FFFFFF" fill-opacity="0.85" d="M1 1h1v1h-1zM2 1h1v1h-1zM3 1h1v1h-1zM4 1h1v1h-1zM1 2h1v1h-1z"/>' },
    { name: 'Engineering', color: '#9BD67A',
      icon: '<path fill="#9BD67A" d="M9 5h1v1h-1zM7 6h1v1h-1zM8 6h1v1h-1zM9 6h1v1h-1zM10 6h1v1h-1zM6 7h1v1h-1zM10 7h1v1h-1zM11 7h1v1h-1zM6 8h1v1h-1zM10 8h1v1h-1zM5 9h1v1h-1zM6 9h1v1h-1zM10 9h1v1h-1zM11 9h1v1h-1zM6 10h1v1h-1zM7 10h1v1h-1zM8 10h1v1h-1zM9 10h1v1h-1zM10 10h1v1h-1zM7 11h1v1h-1zM9 11h1v1h-1z"/><path fill="#FFFFFF" fill-opacity="0.85" d="M8 0h1v1h-1zM11 0h1v1h-1zM8 1h1v1h-1zM9 1h1v1h-1zM10 1h1v1h-1zM11 1h1v1h-1zM9 2h1v1h-1zM10 2h1v1h-1zM8 3h1v1h-1zM9 3h1v1h-1zM7 4h1v1h-1zM8 4h1v1h-1zM6 5h1v1h-1zM7 5h1v1h-1zM5 6h1v1h-1zM6 6h1v1h-1zM4 7h1v1h-1zM5 7h1v1h-1zM3 8h1v1h-1zM4 8h1v1h-1zM2 9h1v1h-1zM3 9h1v1h-1zM1 10h1v1h-1zM2 10h1v1h-1zM1 11h1v1h-1z"/>' },
    { name: 'Fandom', color: '#FF85EE',
      icon: '<path fill="#FF85EE" d="M5 0h1v1h-1zM6 0h1v1h-1zM5 1h1v1h-1zM6 1h1v1h-1zM4 2h1v1h-1zM5 2h1v1h-1zM6 2h1v1h-1zM7 2h1v1h-1zM0 3h1v1h-1zM1 3h1v1h-1zM2 3h1v1h-1zM3 3h1v1h-1zM4 3h1v1h-1zM5 3h1v1h-1zM6 3h1v1h-1zM7 3h1v1h-1zM8 3h1v1h-1zM9 3h1v1h-1zM10 3h1v1h-1zM11 3h1v1h-1zM1 4h1v1h-1zM2 4h1v1h-1zM3 4h1v1h-1zM4 4h1v1h-1zM5 4h1v1h-1zM6 4h1v1h-1zM7 4h1v1h-1zM8 4h1v1h-1zM9 4h1v1h-1zM10 4h1v1h-1zM2 5h1v1h-1zM3 5h1v1h-1zM4 5h1v1h-1zM5 5h1v1h-1zM6 5h1v1h-1zM7 5h1v1h-1zM8 5h1v1h-1zM9 5h1v1h-1zM2 6h1v1h-1zM3 6h1v1h-1zM4 6h1v1h-1zM5 6h1v1h-1zM6 6h1v1h-1zM7 6h1v1h-1zM8 6h1v1h-1zM9 6h1v1h-1zM1 7h1v1h-1zM2 7h1v1h-1zM3 7h1v1h-1zM4 7h1v1h-1zM7 7h1v1h-1zM8 7h1v1h-1zM9 7h1v1h-1zM10 7h1v1h-1zM1 8h1v1h-1zM2 8h1v1h-1zM3 8h1v1h-1zM8 8h1v1h-1zM9 8h1v1h-1zM10 8h1v1h-1zM1 9h1v1h-1zM10 9h1v1h-1z"/>' },
    { name: 'Gaming', color: '#C9F06B',
      icon: '<path fill="#C9F06B" d="M1 1h1v1h-1zM2 1h1v1h-1zM3 1h1v1h-1zM4 1h1v1h-1zM5 1h1v1h-1zM6 1h1v1h-1zM7 1h1v1h-1zM8 1h1v1h-1zM9 1h1v1h-1zM10 1h1v1h-1zM0 2h1v1h-1zM11 2h1v1h-1zM0 3h1v1h-1zM2 3h1v1h-1zM11 3h1v1h-1zM0 4h1v1h-1zM1 4h1v1h-1zM2 4h1v1h-1zM11 4h1v1h-1zM0 5h1v1h-1zM2 5h1v1h-1zM11 5h1v1h-1zM0 6h1v1h-1zM11 6h1v1h-1zM0 7h1v1h-1zM4 7h1v1h-1zM5 7h1v1h-1zM6 7h1v1h-1zM7 7h1v1h-1zM11 7h1v1h-1zM1 8h1v1h-1zM2 8h1v1h-1zM3 8h1v1h-1zM8 8h1v1h-1zM9 8h1v1h-1zM10 8h1v1h-1z"/><path fill="#FFFFFF" fill-opacity="0.85" d="M8 3h1v1h-1zM7 4h1v1h-1zM9 4h1v1h-1zM8 5h1v1h-1z"/>' },
    { name: 'Logic', color: '#F4E4BA',
      icon: '<path fill="#F4E4BA" d="M3 0h1v1h-1zM4 0h1v1h-1zM5 0h1v1h-1zM6 0h1v1h-1zM7 0h1v1h-1zM8 0h1v1h-1zM2 1h1v1h-1zM9 1h1v1h-1zM1 2h1v1h-1zM10 2h1v1h-1zM1 3h1v1h-1zM10 3h1v1h-1zM1 4h1v1h-1zM10 4h1v1h-1zM2 5h1v1h-1zM9 5h1v1h-1zM3 6h1v1h-1zM8 6h1v1h-1zM3 7h1v1h-1zM4 7h1v1h-1zM5 7h1v1h-1zM6 7h1v1h-1zM7 7h1v1h-1zM8 7h1v1h-1zM3 8h1v1h-1zM4 8h1v1h-1zM5 8h1v1h-1zM6 8h1v1h-1zM7 8h1v1h-1zM8 8h1v1h-1zM4 9h1v1h-1zM5 9h1v1h-1zM6 9h1v1h-1zM7 9h1v1h-1z"/><path fill="#FFFFFF" fill-opacity="0.85" d="M4 2h1v1h-1zM7 2h1v1h-1zM5 3h1v1h-1zM6 3h1v1h-1zM5 4h1v1h-1zM5 5h1v1h-1zM5 6h1v1h-1z"/>' },
    { name: 'Maths', color: '#FFD166',
      icon: '<path fill="#FFD166" d="M0 0h1v1h-1zM1 0h1v1h-1zM2 0h1v1h-1zM3 0h1v1h-1zM4 0h1v1h-1zM5 0h1v1h-1zM6 0h1v1h-1zM7 0h1v1h-1zM8 0h1v1h-1zM9 0h1v1h-1zM10 0h1v1h-1zM11 0h1v1h-1zM0 1h1v1h-1zM1 1h1v1h-1zM2 1h1v1h-1zM3 1h1v1h-1zM4 1h1v1h-1zM5 1h1v1h-1zM6 1h1v1h-1zM7 1h1v1h-1zM8 1h1v1h-1zM9 1h1v1h-1zM10 1h1v1h-1zM11 1h1v1h-1zM2 2h1v1h-1zM3 2h1v1h-1zM8 2h1v1h-1zM9 2h1v1h-1zM2 3h1v1h-1zM3 3h1v1h-1zM8 3h1v1h-1zM9 3h1v1h-1zM2 4h1v1h-1zM3 4h1v1h-1zM8 4h1v1h-1zM9 4h1v1h-1zM2 5h1v1h-1zM3 5h1v1h-1zM8 5h1v1h-1zM9 5h1v1h-1zM2 6h1v1h-1zM3 6h1v1h-1zM8 6h1v1h-1zM9 6h1v1h-1zM2 7h1v1h-1zM3 7h1v1h-1zM8 7h1v1h-1zM9 7h1v1h-1zM1 8h1v1h-1zM2 8h1v1h-1zM8 8h1v1h-1zM9 8h1v1h-1zM0 9h1v1h-1zM1 9h1v1h-1zM8 9h1v1h-1zM9 9h1v1h-1zM10 9h1v1h-1z"/>' },
    { name: 'Physics', color: '#8FB0FF',
      icon: '<path fill="#8FB0FF" d="M4 0h1v1h-1zM5 0h1v1h-1zM6 0h1v1h-1zM7 0h1v1h-1zM2 1h1v1h-1zM3 1h1v1h-1zM8 1h1v1h-1zM9 1h1v1h-1zM1 2h1v1h-1zM10 2h1v1h-1zM0 3h1v1h-1zM11 3h1v1h-1zM0 4h1v1h-1zM11 4h1v1h-1zM0 5h1v1h-1zM11 5h1v1h-1zM0 6h1v1h-1zM11 6h1v1h-1zM1 7h1v1h-1zM10 7h1v1h-1zM2 8h1v1h-1zM3 8h1v1h-1zM8 8h1v1h-1zM9 8h1v1h-1zM4 9h1v1h-1zM5 9h1v1h-1zM6 9h1v1h-1zM7 9h1v1h-1z"/><path fill="#FFFFFF" fill-opacity="0.85" d="M5 3h1v1h-1zM6 3h1v1h-1zM4 4h1v1h-1zM5 4h1v1h-1zM6 4h1v1h-1zM7 4h1v1h-1zM4 5h1v1h-1zM5 5h1v1h-1zM6 5h1v1h-1zM7 5h1v1h-1zM5 6h1v1h-1zM6 6h1v1h-1z"/>' },
    { name: 'Psychology', color: '#FF8FD1',
      icon: '<path fill="#FF8FD1" d="M2 0h1v1h-1zM3 0h1v1h-1zM4 0h1v1h-1zM5 0h1v1h-1zM6 0h1v1h-1zM7 0h1v1h-1zM8 0h1v1h-1zM9 0h1v1h-1zM1 1h1v1h-1zM10 1h1v1h-1zM0 2h1v1h-1zM4 2h1v1h-1zM5 2h1v1h-1zM6 2h1v1h-1zM7 2h1v1h-1zM11 2h1v1h-1zM0 3h1v1h-1zM3 3h1v1h-1zM8 3h1v1h-1zM11 3h1v1h-1zM0 4h1v1h-1zM7 4h1v1h-1zM11 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM11 5h1v1h-1zM0 6h1v1h-1zM6 6h1v1h-1zM11 6h1v1h-1zM1 7h1v1h-1zM10 7h1v1h-1zM2 8h1v1h-1zM3 8h1v1h-1zM4 8h1v1h-1zM5 8h1v1h-1zM7 8h1v1h-1zM8 8h1v1h-1zM9 8h1v1h-1zM6 9h1v1h-1zM5 10h1v1h-1z"/>' },
    { name: 'Robotics', color: '#4FE3C1', badge: 'NEW',
      icon: '<path fill="#4FE3C1" d="M5 0h1v1h-1zM6 0h1v1h-1zM5 1h1v1h-1zM6 1h1v1h-1zM1 2h1v1h-1zM2 2h1v1h-1zM3 2h1v1h-1zM4 2h1v1h-1zM5 2h1v1h-1zM6 2h1v1h-1zM7 2h1v1h-1zM8 2h1v1h-1zM9 2h1v1h-1zM10 2h1v1h-1zM1 3h1v1h-1zM10 3h1v1h-1zM1 4h1v1h-1zM10 4h1v1h-1zM1 5h1v1h-1zM10 5h1v1h-1zM1 6h1v1h-1zM10 6h1v1h-1zM1 7h1v1h-1zM4 7h1v1h-1zM5 7h1v1h-1zM6 7h1v1h-1zM7 7h1v1h-1zM10 7h1v1h-1zM1 8h1v1h-1zM2 8h1v1h-1zM3 8h1v1h-1zM4 8h1v1h-1zM5 8h1v1h-1zM6 8h1v1h-1zM7 8h1v1h-1zM8 8h1v1h-1zM9 8h1v1h-1zM10 8h1v1h-1zM3 9h1v1h-1zM8 9h1v1h-1zM2 10h1v1h-1zM3 10h1v1h-1zM8 10h1v1h-1zM9 10h1v1h-1z"/><path fill="#FFFFFF" fill-opacity="0.85" d="M3 4h1v1h-1zM4 4h1v1h-1zM7 4h1v1h-1zM8 4h1v1h-1zM3 5h1v1h-1zM4 5h1v1h-1zM7 5h1v1h-1zM8 5h1v1h-1z"/>' }
  ];

  function gearPath(cx, cy, ro, ri, n) {
    var d = '', step = Math.PI * 2 / n;
    for (var k = 0; k < n; k++) {
      var a = k * step;
      [[a - step * .22, ri], [a - step * .14, ro], [a + step * .14, ro], [a + step * .22, ri]].forEach(function (p, j) {
        d += (k === 0 && j === 0 ? 'M' : 'L') + (cx + p[1] * Math.cos(p[0])).toFixed(1) + ' ' + (cy + p[1] * Math.sin(p[0])).toFixed(1);
      });
    }
    return d + 'Z';
  }
  var GEAR = '<path d="' + gearPath(50, 50, 46, 37, 12) + '"/><circle cx="50" cy="50" r="18"/><circle cx="50" cy="50" r="8"/>';
  var FRAME = '<span class="kx-bg" aria-hidden="true"><i></i><b></b><b></b></span>';

  /* ---------- Stat count-ups ---------- */
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+';
  function runStat(el) {
    var num = el.querySelector('[data-count]');
    if (num) {
      var to = +num.getAttribute('data-count'), o = { v: 0 };
      if (reduced || !hasGsap) { num.textContent = to; return; }
      gsap.to(o, { v: to, duration: to > 50 ? 2 : 1.6, ease: 'power2.out',
        onUpdate: function () { num.textContent = Math.round(o.v); } });
      return;
    }
    var word = el.querySelector('[data-scramble]');
    if (!word || reduced || !hasGsap) return;
    var text = word.getAttribute('data-scramble'), p = { v: 0 };
    gsap.to(p, { v: 1, duration: 1.4, ease: 'none', onUpdate: function () {
      var done = Math.floor(p.v * text.length), out = text.slice(0, done);
      for (var i = done; i < text.length; i++) out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      word.textContent = out;
    }, onComplete: function () { word.textContent = text; } });
  }

  function initStats() {
    var grid = document.querySelector('#scale .st-grid');
    if (!grid) return;
    var tiles = grid.querySelectorAll('.st-tile');
    tiles.forEach(function (t) {
      var n = t.querySelector('[data-count]');
      if (n && hasGsap && !reduced) n.textContent = '0';
    });
    if (!hasGsap || reduced) { tiles.forEach(runStat); return; }
    ScrollTrigger.create({
      trigger: grid, start: 'top 75%', once: true,
      onEnter: function () { tiles.forEach(function (t, i) { gsap.delayedCall(0.15 + i * 0.12, runStat, [t]); }); }
    });
  }

  /* ---------- Modules carousel ---------- */
  function cardHTML(m) {
    return '<div class="mc-tilt">' + FRAME +
      '<span class="mc-glow" aria-hidden="true"></span>' +
      '<span class="mc-deco" aria-hidden="true">' +
        '<svg class="mc-gear mc-gear--a" viewBox="0 0 100 100">' + GEAR + '</svg>' +
        '<svg class="mc-gear mc-gear--b" viewBox="0 0 100 100">' + GEAR + '</svg>' +
        '<svg class="mc-arc" viewBox="0 0 100 62" preserveAspectRatio="none"><path d="M-5 58C20 30 55 8 105 4" vector-effect="non-scaling-stroke"/><path d="M-5 64C30 40 65 22 105 20" vector-effect="non-scaling-stroke" opacity=".5"/></svg>' +
        '<span class="kx-spark" style="--x:18%;--y:24%;--s:.035;--d:.4s"></span>' +
        '<span class="kx-spark" style="--x:72%;--y:15%;--s:.025;--d:1.3s"></span>' +
        '<span class="kx-spark" style="--x:84%;--y:52%;--s:.03;--d:2s"></span>' +
      '</span>' +
      (m.badge ? '<span class="mc-badge">' + m.badge + '</span>' : '') +
      '<div class="mc-content">' +
        '<div class="mc-iconwrap"><svg class="mc-icon mc-icon--px" viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">' + m.icon + '</svg></div>' +
        '<span class="mc-sep" aria-hidden="true"></span>' +
        '<h3 class="mc-name' + (m.name.length > 12 ? ' is-long' : '') + '">' + m.name.replace('&', '&amp;') + '</h3>' +
      '</div></div>';
  }

  function initCarousel() {
    var mc = document.querySelector('#modules .mc');
    if (!mc) return;
    var stage = mc.querySelector('.mc-stage');
    var dotsEl = mc.querySelector('.mc-dots');
    var live = mc.querySelector('.mc-live');
    var n = MODULES.length, cur = 0, cards = [], dots = [];

    MODULES.forEach(function (m, i) {
      var c = document.createElement('div');
      c.className = 'mc-card';
      c.style.setProperty('--mc-accent', m.color);
      c.setAttribute('role', 'group');
      c.setAttribute('aria-roledescription', 'slide');
      c.setAttribute('aria-label', (i + 1) + ' of ' + n + ': ' + m.name);
      c.innerHTML = cardHTML(m);
      stage.appendChild(c);
      cards.push(c);
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'mc-dot';
      d.setAttribute('aria-label', 'Show ' + m.name);
      d.innerHTML = '<span></span>';
      d.addEventListener('click', function () { go(i); });
      dotsEl.appendChild(d);
      dots.push(d);
    });

    function rel(j) {
      var d = ((j - cur) % n + n) % n;
      return d > n / 2 ? d - n : d;
    }
    function mobile() { return root.clientWidth <= 700; }
    function state(d) {
      var mob = mobile(), a = Math.abs(d), s = Math.sign(d);
      var show = mob ? 1 : 2;
      var X = mob ? [0, 0.1, 0.16] : [0, 0.135, 0.24];
      var SC = mob ? [1, 0.88, 0.8] : [1, 0.885, 0.78];
      var hidden = a > show, k = Math.min(a, show + 1);
      var cw = cards[0].offsetWidth;
      return {
        x: s * cw * (hidden ? X[show] + 0.06 : X[k]),
        scale: hidden ? SC[show] - 0.06 : SC[k],
        rotationY: -s * Math.min(a, show) * (mob ? 10 : 14),
        transformPerspective: 1400,
        autoAlpha: hidden ? 0 : 1,
        filter: 'brightness(' + (a === 0 ? 1 : a === 1 ? 0.6 : 0.4) + ')',
        zIndex: 10 - Math.min(a, show + 1)
      };
    }

    function layout(animate) {
      var dur = animate && !reduced ? 0.65 : 0;
      cards.forEach(function (c, j) {
        var d = rel(j), prev = c._d;
        var show = mobile() ? 1 : 2;
        var vis = Math.abs(d) <= show, wasVis = prev != null && Math.abs(prev) <= show;
        var st = state(d), z = st.zIndex;
        delete st.zIndex;
        var content = c.querySelector('.mc-content'), badge = c.querySelector('.mc-badge');
        var fade = d === 0 ? 1 : 0;
        if (!dur || (!vis && !wasVis)) {
          gsap.set(c, st); gsap.set(c, { zIndex: z });
          gsap.set(content, { autoAlpha: fade });
          if (badge) gsap.set(badge, { autoAlpha: fade });
        } else {
          if (vis && !wasVis) gsap.set(c, state(d + Math.sign(d)));
          if (!vis && wasVis) st = Object.assign(state(prev + Math.sign(prev)), { zIndex: undefined });
          delete st.zIndex;
          gsap.to(c, Object.assign(st, { duration: dur, ease: 'power3.inOut', overwrite: 'auto' }));
          // swap stacking halfway, when the cards cross
          gsap.delayedCall(dur * 0.4, function () { c.style.zIndex = z; });
          gsap.to(content, { autoAlpha: fade, duration: d === 0 ? dur * 0.8 : dur * 0.35, delay: d === 0 ? dur * 0.35 : 0, overwrite: 'auto' });
          if (badge) gsap.to(badge, { autoAlpha: fade, duration: dur * 0.5, delay: d === 0 ? dur * 0.6 : 0, overwrite: 'auto' });
          if (d === 0) {
            gsap.fromTo(c.querySelector('.mc-iconwrap'), { scale: 0.6, rotation: -12 },
              { scale: 1, rotation: 0, duration: 0.8, delay: dur * 0.3, ease: 'back.out(2)', overwrite: 'auto' });
          }
        }
        c._d = d;
        c.classList.toggle('is-active', d === 0);
        c.setAttribute('aria-hidden', d === 0 ? 'false' : 'true');
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === cur);
        if (i === cur) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
      if (live) live.textContent = MODULES[cur].name + ', module ' + (cur + 1) + ' of ' + n;
    }

    function go(i) {
      i = ((i % n) + n) % n;
      if (i === cur) return;
      resetTilt();
      cur = i;
      layout(true);
    }
    function step(dir) {
      go(cur + dir);
      var btn = mc.querySelector(dir > 0 ? '.mc-next' : '.mc-prev');
      if (!reduced) gsap.fromTo(btn.querySelector('svg'), { x: dir * 6 }, { x: 0, duration: 0.4, ease: 'power2.out' });
    }
    mc.querySelector('.mc-prev').addEventListener('click', function () { step(-1); });
    mc.querySelector('.mc-next').addEventListener('click', function () { step(1); });
    cards.forEach(function (c, j) {
      c.addEventListener('click', function () { if (!dragged && c._d) go(j); });
    });

    // keyboard: when the carousel is focused, or when it fills the view and nothing else has focus
    var inView = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { inView = e[e.length - 1].intersectionRatio >= 0.6; },
        { threshold: [0, 0.6, 1] }).observe(stage);
    }
    function onKey(e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      step(e.key === 'ArrowRight' ? 1 : -1);
    }
    mc.addEventListener('keydown', onKey);
    document.addEventListener('keydown', function (e) {
      var a = document.activeElement;
      if (!inView || mc.contains(a)) return;
      if (a && a !== document.body && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) return;
      var modal = document.getElementById('register');
      if (modal && !modal.hidden) return;
      onKey(e);
    });

    // swipe / drag
    var sx = 0, sy = 0, down = false, dragged = false;
    stage.addEventListener('pointerdown', function (e) {
      down = true; dragged = false; sx = e.clientX; sy = e.clientY;
    });
    window.addEventListener('pointerup', function (e) {
      if (!down) return;
      down = false;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        dragged = true;
        step(dx < 0 ? 1 : -1);
        setTimeout(function () { dragged = false; }, 0);
      }
    });
    window.addEventListener('pointercancel', function () { down = false; });

    // hover tilt on the centre card
    var tiltX = null, tiltY = null, tiltEl = null;
    function resetTilt() {
      if (tiltEl) gsap.to(tiltEl, { rotationX: 0, rotationY: 0, duration: 0.5, ease: 'power2.out' });
      tiltEl = null;
    }
    if (!reduced && window.matchMedia('(hover: hover)').matches) {
      stage.addEventListener('pointermove', function (e) {
        var c = cards[cur], r = c.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        if (Math.abs(px) > 0.5 || Math.abs(py) > 0.5) { resetTilt(); return; }
        var el = c.querySelector('.mc-tilt');
        if (el !== tiltEl) {
          tiltEl = el;
          gsap.set(el, { transformPerspective: 900 });
          tiltX = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power2.out' });
          tiltY = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power2.out' });
        }
        tiltX(px * 12); tiltY(-py * 10);
      });
      stage.addEventListener('pointerleave', resetTilt);
    }

    var lastMobile = mobile();
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (mobile() !== lastMobile) { lastMobile = mobile(); cards.forEach(function (c) { c._d = null; }); }
        layout(false);
      }, 120);
    });
    layout(false);
  }

  if (!hasGsap) return;
  initStats();
  initCarousel();
})();
