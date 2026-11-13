// Fade between index / vendors / sponsors. See the "page transition" block in style.css.
(function () {
  var html = document.documentElement;
  var pages = /^(index|vendors|sponsors)\.html/;

  // arriving from another page: wait until the page is ready, then fade the cover out
  function reveal() {
    html.classList.add('warp-go');
    setTimeout(function () { html.classList.remove('warp-in', 'warp-go'); }, 700);
  }
  if (html.classList.contains('warp-in')) {
    if (!document.getElementById('intro')) reveal();
    else if (html.classList.contains('intro-done')) setTimeout(reveal, 120);
    else window.addEventListener('kgso:intro-complete', function () { setTimeout(reveal, 120); }, { once: true });
  }

  // leaving: cover the page, then go
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey) return;
    var href = a.getAttribute('href');
    var here = location.pathname.split('/').pop() || 'index.html';
    if (!pages.test(href) || href.split('#')[0] === here) return;

    e.preventDefault();
    sessionStorage.setItem('kgso_warp', '1');
    html.classList.add('warp-leave');
    setTimeout(function () { location.href = a.href; }, 400);
  });

  // back button restoring a cached page
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) html.classList.remove('warp-leave', 'warp-in', 'warp-go');
  });
})();
