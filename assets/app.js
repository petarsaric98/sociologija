/* Društvo u fokusu — zajedničko ponašanje stranica.
   Tema, ljepljiva navigacija, praćenje odjeljaka, traka napretka, animacije. */
(function () {
  'use strict';

  /* --- Tema (svijetla / tamna) ---------------------------------------- */
  var THEME_KEY = 'df-theme';
  var root = document.documentElement;

  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* privatni način rada */ }
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });

  /* --- Sjena / rub navigacije pri skrolanju ---------------------------- */
  var nav = document.querySelector('.nav');
  var rail = document.querySelector('.progress-rail__bar');
  var sectionLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link[data-spy]'));
  var spied = sectionLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (nav) nav.classList.toggle('is-stuck', y > 8);

    if (rail) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      rail.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + '%';
    }

    if (spied.length) {
      var line = y + window.innerHeight * 0.28;
      var active = spied[0];
      for (var i = 0; i < spied.length; i++) {
        if (spied[i].offsetTop <= line) active = spied[i];
      }
      sectionLinks.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + active.id);
      });
    }

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* --- Postupno otkrivanje sadržaja ------------------------------------ */
  var revealables = document.querySelectorAll('.reveal');
  if (!revealables.length) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  revealables.forEach(function (el) { io.observe(el); });
})();
