/* Calm scroll reveals + accent-word lighting for the standard (non-ribbon)
   pages. Hidden state only applies with JS present, so no-JS shows everything. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var targets = Array.prototype.slice.call(document.querySelectorAll('.reveal-up'));
  function show(el) { el.classList.add('in'); }
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(show);
  } else {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    // anything already in (or near) view shows at once, so the top is never blank
    targets.forEach(function (el) {
      if (el.getBoundingClientRect().top < vh * 0.92) show(el);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { if (!el.classList.contains('in')) io.observe(el); });
    // safety net: never leave a block stuck hidden if the observer is throttled
    setTimeout(function () {
      var h = window.innerHeight || document.documentElement.clientHeight;
      targets.forEach(function (el) {
        if (!el.classList.contains('in') && el.getBoundingClientRect().top < h) show(el);
      });
    }, 700);
  }

  // accent word: warm to aubergine a beat after it settles into view
  var accents = Array.prototype.slice.call(document.querySelectorAll('.accent-word'));
  if (accents.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      accents.forEach(function (a) { a.classList.add('lit'); });
    } else {
      var ao = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { var el = e.target; setTimeout(function () { el.classList.add('lit'); }, 900); ao.unobserve(el); }
        });
      }, { threshold: 0.6 });
      accents.forEach(function (a) { ao.observe(a); });
    }
  }
})();
