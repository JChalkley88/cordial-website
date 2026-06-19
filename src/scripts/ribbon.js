/* Cordial homepage ribbon engine: native scroll eased into a transform,
   intro, headline line-reveals, per-corner theme switching. Ported from the
   design reference; the React tweaks panel and prototype shims are dropped. */
(function () {
  /* Always open on the hero. Stop the browser from restoring the previous
     scroll position on reload (which made the site reopen at the booking
     section), and pin to the top unless a deep-link hash asks otherwise. */
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  if (location.hash !== '#book' && location.hash !== '#wwd') {
    window.scrollTo(0, 0);
    window.addEventListener('load', function () { window.scrollTo(0, 0); });
  }

  var track = document.getElementById('track');
  var secs = Array.prototype.slice.call(track.querySelectorAll('.sec'));
  var n = secs.length;

  var mqMobile = window.matchMedia('(max-width: 760px)');
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var isMobile = function () { return mqMobile.matches; };
  var reduce = function () { return mqReduce.matches; };

  var vw = window.innerWidth, vh = window.innerHeight;
  var maxY = 0, totalH = 0;
  var curY = 0, targetY = 0;
  var running = false;

  var srStatus = document.getElementById('sr-status');
  var lastNearest = -1;

  function measure() {
    vw = window.innerWidth; vh = window.innerHeight;
    secs.forEach(function (s) { s._top = s.offsetTop; s._h = s.offsetHeight; });
    totalH = track.offsetHeight;
    maxY = Math.max(0, totalH - vh);
    // the body carries a spacer height so the native scrollbar drives the
    // fixed track (desktop only); mobile scrolls the track natively
    document.body.style.height = isMobile() ? '' : (totalH + 'px');
    fitSections();
  }

  /* Vertical auto-fit: each section is one viewport tall, so scale its content
     down just enough to fit when it would otherwise overflow — keeps a section
     to a single screen ("fits the tab") without clipping. Light sections are
     untouched; disabled on mobile, where sections flow and scroll naturally. */
  function fitSections() {
    if (isMobile()) { secs.forEach(function (s) { var m = s.querySelector('.measure'); if (m) m.style.transform = ''; }); return; }
    secs.forEach(function (s) {
      var inner = s.querySelector('.sec-inner');
      var m = s.querySelector('.measure');
      if (!inner || !m) return;
      m.style.transform = '';
      var cs = getComputedStyle(inner);
      var avail = inner.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      var ch = m.offsetHeight;
      var scale = ch > avail ? Math.max(0.6, avail / ch) : 1;
      m.style.transformOrigin = 'center center';
      m.style.transform = scale < 1 ? 'scale(' + scale.toFixed(3) + ')' : '';
    });
  }

  function nearestIndex() {
    var c = curY + vh / 2, best = 0, bd = Infinity;
    for (var i = 0; i < n; i++) {
      var ctr = secs[i]._top + secs[i]._h / 2;
      var d = Math.abs(c - ctr);
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }

  function updateProgress() {
    var ni = nearestIndex();
    if (ni !== lastNearest) {
      lastNearest = ni;
      secs[ni].classList.add('is-active');
      srStatus.textContent = secs[ni].getAttribute('data-name') + '. ' + (ni + 1) + ' of ' + n + '.';
    }
  }

  /* ===== Gentle motion tunables (texture, not spectacle) ===============
     Section-entrance settle — how far each card eases in as its panel
     arrives (small px; varied per item in the loop below). Continuous
     per-element drift amounts live in DRIFT, applied by setupDrift().
     Everything is eased and capped so nothing ever travels far. */
  var ENTRANCE_X = 12;   // px a card settles in from the right as it arrives
  var ENTRANCE_Y = 16;   // px a card rises as it arrives
  var SETTLE   = 0.9;    // arrival overshoot strength — a whisper, never a bounce
  var IMG_SCALE = 0.03;  // image scale-through: ± this fraction across the viewport
  var DRIFT_MUL = 0.34;  // global damper on vertical parallax — keep the page calm/still
  function backOut(t) {  // ease-out with a tiny overshoot near the end (SETTLE)
    var u = t - 1;
    return 1 + (SETTLE + 1) * u * u * u + SETTLE * u * u;
  }
  var DRIFT = {
    eyebrow:  -0.12,   // section eyebrows — small, a touch faster
    jLabel:   -0.13,   // journal type labels — fast, small
    jDate:    -0.10,   // journal dates
    label:    -0.11,   // small meta labels (prices, roles)
    hiwNum:   -0.08,   // step numbers
    portrait:  0.035,  // portraits — slow
    study:     0.03,   // case-study images — slow
    image:     0.04    // section images — slow drift
  };

  /* ===== Per-section entrance composition ==============================
     One shared movement palette; each section ARRANGES it differently so
     no two adjacent sections enter the same way. Tune a section here
     without touching the engine below.
       lineStagger : ms between headline lines (the line-reveal rhythm)
       headDelay   : ms before the headline starts — 0 = headline leads,
                     larger = it follows the image / labels into place
       cardStart   : how far into arrival the first card begins (0–1)
       cardStagger : beat between cards — small ≈ together, large = one-by-one
       ex, ey      : settle distances (px) — bias horizontal vs vertical
       dir         : 'right' | 'up' | 'converge'  (entrance direction)
     Only p1/p2/p5 contain entrance "cards"; card keys are ignored elsewhere. */
  var SECTION_FX = {
    p0: { lineStagger: 150, headDelay: 120 },                                                              // Cover — most generous, slowest assembly
    p1: { lineStagger: 90,  headDelay: 0,   cardStart: 0.40, cardStagger: 0.05, ex: 16, ey: 10, dir: 'right' },    // What we do — headline leads, cards follow briskly, horizontal
    p2: { lineStagger: 115, headDelay: 40,  cardStart: 0.34, cardStagger: 0.13, ex: 6,  ey: 20, dir: 'up' },       // How it works — steps rise one after another, slow sequence
    p3: { lineStagger: 130, headDelay: 0 },                                                                // Craft break — quiet: image moves, text barely
    p4: { lineStagger: 95,  headDelay: 180 },                                                              // About — image present, text rises over it (text follows)
    p5: { lineStagger: 80,  headDelay: 0,   cardStart: 0.30, cardStagger: 0.12, ex: 18, ey: 8,  dir: 'right' },    // Journal — headline leads, posts cascade in
    p6: { lineStagger: 85,  headDelay: 60,  cardStart: 0.34, cardStagger: 0.05, ex: 14, ey: 8,  dir: 'right' },    // Reach — quiet, mostly horizontal drift
    p7: { lineStagger: 105, headDelay: 120 },                                                              // FAQ — eyebrow/heading leads, then items
    p8: { lineStagger: 110, headDelay: 0 }                                                                 // Book — calm, headline leads
  };
  var FX_DEFAULT = { lineStagger: 100, headDelay: 0, cardStart: 0.3, cardStagger: 0.07, ex: ENTRANCE_X, ey: ENTRANCE_Y, dir: 'right' };
  function fxFor(sec) {
    var f = (sec && SECTION_FX[sec.id]) || null;
    if (!f) return FX_DEFAULT;
    return {
      lineStagger: f.lineStagger != null ? f.lineStagger : FX_DEFAULT.lineStagger,
      headDelay:   f.headDelay   != null ? f.headDelay   : FX_DEFAULT.headDelay,
      cardStart:   f.cardStart   != null ? f.cardStart   : FX_DEFAULT.cardStart,
      cardStagger: f.cardStagger != null ? f.cardStagger : FX_DEFAULT.cardStagger,
      ex:          f.ex          != null ? f.ex          : FX_DEFAULT.ex,
      ey:          f.ey          != null ? f.ey          : FX_DEFAULT.ey,
      dir:         f.dir         || FX_DEFAULT.dir
    };
  }

  function applyParallax() {
    for (var i = 0; i < n; i++) {
      var s = secs[i];
      var rel = (curY + vh / 2) - (s._top + s._h / 2);   // 0 when section centred in view
      var dist = Math.abs(rel) / vh;
      // photo-break headline: fade in early as the dark panel slides in, so the
      // line is readable well before the panel settles (and fades as it leaves)
      var bl = s._bl !== undefined ? s._bl : (s._bl = s.querySelector('.break-line'));
      if (bl && !reduce()) {
        var prog = 1 - Math.min(1, Math.abs(rel) / vh);
        var o = (prog - 0.3) / 0.35; o = o < 0 ? 0 : o > 1 ? 1 : o;
        bl.style.opacity = o.toFixed(3);
      }
      // panels are solid and never fade: the colour change IS the moving seam
      if (reduce()) continue;
      // headline line-reveal: fire once as this panel arrives. Driven here (not
      // via IntersectionObserver) because the ribbon moves by transform, which
      // IO does not track reliably; the per-frame scroll position does.
      if (s._rlh === undefined) s._rlh = s.querySelector('.sec-h2') || null;
      if (s._rlh && !s._rlh._rl && dist < 0.62) rlReveal(s._rlh);
      // mark the section arrived once, so hairlines/dividers can wipe in (CSS)
      if (!s._in && dist < 0.62) {
        s._in = 1; s.classList.add('sec-in');
        // the accent word warms in a beat AFTER the section has settled
        (function (sec) { setTimeout(function () { sec.classList.add('sec-settled'); }, 1500); })(s);
      }
      // scroll-linked reveals: items rise + fade in as their section slides to
      // centre, and ease back as it leaves. Driven every frame from scroll
      // position, so nothing can get stuck hidden the way class toggles could.
      var rev = s._rev || (s._rev = s.querySelectorAll('.hiw-step, .wwd-item, .journal-entry'));
      if (rev.length) {
        var fx = s._fx || (s._fx = fxFor(s));
        var prg = 1 - Math.min(1, Math.abs(rel) / vh);
        for (var k = 0; k < rev.length; k++) {
          var stt = fx.cardStart + k * fx.cardStagger;   // per-section start + beat
          var ov = (prg - stt) / 0.26; ov = ov < 0 ? 0 : ov > 1 ? 1 : ov;
          var es = ov * ov * (3 - 2 * ov);   // opacity: smooth, no overshoot
          var eb = backOut(ov);              // position: a whisper of settle on land
          rev[k].style.opacity = es.toFixed(3);
          // per-section entrance direction — vertical rise dominant (we scroll
          // vertically now), with a small horizontal accent that varies
          var bx, by;
          if (fx.dir === 'up') { bx = 0; by = fx.ey + 6; }                                   // pure rise
          else if (fx.dir === 'converge') { bx = (k % 2 ? -fx.ex : fx.ex) * 0.6; by = fx.ey + 8; } // alternate sideways + rise
          else { bx = fx.ex * 0.45 + (k % 3) * 3; by = fx.ey + 10; }                          // rise with a small rightward accent
          var ex = (1 - eb) * bx;
          var ey = (1 - eb) * by;
          rev[k].style.transform = 'translate3d(' + ex.toFixed(1) + 'px,' + ey.toFixed(1) + 'px,0)';
        }
      }
      // gentle content drift: the inner content lags the panel a touch
      // vertically as it scrolls past, for depth. Small and capped.
      var inr = s._inner || (s._inner = s.querySelector('.sec-inner'));
      if (inr) {
        var fl = rel * 0.02, fcap = vh * 0.03;
        if (fl > fcap) fl = fcap; else if (fl < -fcap) fl = -fcap;
        inr.style.transform = 'translate3d(0,' + fl.toFixed(1) + 'px,0)';
      }
      var layers = s._layers || (s._layers = s.querySelectorAll('[data-mx],[data-my],[data-scale],[data-sx],[data-pin],[data-rise]'));
      var prgL = 1 - Math.min(1, Math.abs(rel) / vh);   // 0 off-screen → 1 centred
      for (var j = 0; j < layers.length; j++) {
        var el = layers[j];
        var tx = 0, ty = 0, sc = 1, op = -1;
        if (el.hasAttribute('data-pin')) {
          var L = vh * (parseFloat(el.getAttribute('data-pin')) || 0.45);
          ty += Math.max(-L, Math.min(L, rel));
        }
        // vertical parallax: kept to a whisper (DRIFT_MUL) so the page reads
        // calm and still — only a faint sense of depth, never scattered motion
        var dv = el.hasAttribute('data-my') ? (parseFloat(el.getAttribute('data-my')) || 0) : (parseFloat(el.getAttribute('data-mx')) || 0);
        ty += dv * rel * DRIFT_MUL;
        var scf = parseFloat(el.getAttribute('data-scale')) || 0;
        if (scf) sc *= 1 + scf * Math.min(1, dist);
        // image scale-through: a hair smaller arriving → a hair larger leaving
        var sx = parseFloat(el.getAttribute('data-sx')) || 0;
        if (sx) { var sp = rel / vh; if (sp > 1) sp = 1; else if (sp < -1) sp = -1; sc *= 1 + sx * sp; }
        // small-detail entrance: fade + rise, with a whisper of settle as it lands
        var rise = parseFloat(el.getAttribute('data-rise'));
        if (!isNaN(rise)) {
          ty += (1 - backOut(prgL)) * rise;
          op = prgL < 0.5 ? prgL / 0.5 : 1;
        }
        tx *= motionMul; ty *= motionMul;
        // guard: keep every element within a small readable range so a headline
        // can never travel far enough to clip at the edge or overlap a neighbour
        if (tx > 66) tx = 66; else if (tx < -66) tx = -66;
        if (ty > 66) ty = 66; else if (ty < -66) ty = -66;
        el.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0)' + (sc !== 1 ? ' scale(' + sc.toFixed(4) + ')' : '');
        if (op >= 0) el.style.opacity = op.toFixed(3);
      }
    }
  }

  /* clean colour: every panel is a solid block. Only the floating chrome
     (wordmark, marquee, progress, book button) recolours, per corner, the
     instant the moving seam passes beneath it — a crisp swap, never a blend. */
  var bgField = document.getElementById('bgField');
  var motionMul = 1, fgSoft = false;

  var EASE  = 0.09;   // catch-up fraction per frame (lower = heavier/glassier)
  var WHEEL_CAP = 100; // (unused now native scroll drives the page; kept for tweaks)

  function navTo(i) {
    i = Math.max(0, Math.min(n - 1, i));
    var y = Math.min(maxY, secs[i]._top);
    if (isMobile()) { window.scrollTo({ top: y, behavior: reduce() ? 'auto' : 'smooth' }); }
    else { window.scrollTo(0, y); }   // native scrollY jumps; the lerp eases the visual
  }
  secs.forEach(function (s) { s._dark = s.hasAttribute('data-dark') ? 1 : 0; });
  function toneAtY(y) {
    var w = curY + y;
    for (var i = 0; i < n; i++) { if (w >= secs[i]._top && w < secs[i]._top + secs[i]._h) return secs[i]._dark; }
    return secs[n - 1]._dark;
  }
  var rootStyle = document.documentElement.style;
  var lastTL = -1, lastBR = -1;
  function setField() {
    if (isMobile()) return;
    var top = toneAtY(60);          // top chrome: wordmark + book button
    var bot = toneAtY(vh - 40);     // bottom chrome: marquee + progress
    if (top !== lastTL) {
      lastTL = top;
      rootStyle.setProperty('--fg-tl', top ? 'var(--cream)' : 'var(--slate)');
      document.body.setAttribute('data-theme', top ? 'dark' : 'light');
    }
    if (bot !== lastBR) {
      lastBR = bot;
      rootStyle.setProperty('--fg-bl', bot ? 'var(--cream)' : 'var(--slate)');
      rootStyle.setProperty('--fg-br', bot ? 'var(--cream)' : 'var(--slate)');
    }
  }

  function frame() {
    if (reduce()) { curY = targetY; }
    else {
      curY += (targetY - curY) * EASE;
      if (Math.abs(targetY - curY) < 0.35) curY = targetY;   // settle to rest
    }
    track.style.transform = 'translate3d(0,' + (-curY) + 'px,0)';
    applyParallax();
    setField();
    updateProgress();
    if (Math.abs(targetY - curY) > 0.35 && !isMobile()) requestAnimationFrame(frame);
    else running = false;
  }
  function kick() { if (!running && !isMobile()) { running = true; requestAnimationFrame(frame); } }

  /* nav: wordmark → top, book → the booking section. Native scroll jumps the
     scrollbar; the lerp eases the visual glide. */
  document.querySelectorAll('[data-go]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      navTo(parseInt(el.getAttribute('data-go'), 10));
    });
  });

  /* wordmark → top of the page content, WITHOUT replaying the opening splash.
     The intro only ever plays once on first load; here we make sure it stays
     dismissed, then glide to the very top. */
  document.querySelectorAll('[data-home]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      introActive = false;
      if (intro) { intro.classList.add('open'); intro.classList.add('gone'); }
      document.body.classList.add('entered');
      navTo(0);
    });
  });

  /* (cover headline stays still — no cursor parallax, kept calm) */
  var coverSpans = [];
  function applyCoverMouse() {}
  window.addEventListener('mousemove', function (e) {
    /* cover cursor-parallax removed — headline holds still */
  }, { passive: true });

  /* NATIVE SCROLL → smoothed transform. The page scrolls natively (scrollbar,
     wheel, trackpad, keyboard, touch all work); we read window.scrollY into a
     target and the frame loop eases the rendered position toward it, which is
     what gives the Lenis-style weighted glide. */
  function onScroll() {
    if (isMobile()) return;
    targetY = window.scrollY || window.pageYOffset || 0;
    kick();
  }

  /* FAQ accordion */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    var panel = item.querySelector('.faq-a');
    btn.addEventListener('click', function () {
      var open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '0px';
      measure();   // section height changed — re-measure the scroll spacer
    });
  });

  /* mobile vertical: theme follows the section in view */
  var observer = null;
  function setupMobile() {
    track.style.transform = '';
    rootStyle.removeProperty('--fg-tl'); rootStyle.removeProperty('--fg-bl'); rootStyle.removeProperty('--fg-br');
    lastTL = lastBR = -1;
    secs.forEach(function (s) {
      s.style.opacity = '';
      s.querySelectorAll('[data-mx],[data-my],[data-scale],[data-sx],[data-pin],[data-rise]').forEach(function (el) { el.style.transform = ''; el.style.opacity = ''; });
      var inr2 = s.querySelector('.sec-inner'); if (inr2) inr2.style.transform = '';
    });
    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            document.body.setAttribute('data-theme', en.target.hasAttribute('data-dark') ? 'dark' : 'light');
            var sec = en.target;
            if (!sec._in) { sec._in = 1; sec.classList.add('sec-in'); setTimeout(function () { sec.classList.add('sec-settled'); }, 1500); }
          }
        });
      }, { threshold: 0.5 });
      secs.forEach(function (s) { observer.observe(s); });
    }
  }
  function teardownMobile() { if (observer) { observer.disconnect(); observer = null; } }

  function applyMode() {
    measure();
    if (isMobile()) {
      document.body.style.height = '';
      track.style.transform = '';
      setupMobile();
    } else {
      teardownMobile();
      lastTL = lastBR = -1;
      targetY = window.scrollY || window.pageYOffset || 0; curY = targetY;
      kick(); requestAnimationFrame(frame);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { measure(); if (!isMobile()) { targetY = window.scrollY || 0; curY = targetY; requestAnimationFrame(frame); } });
  (mqMobile.addEventListener ? mqMobile.addEventListener('change', applyMode) : mqMobile.addListener(applyMode));

  /* fonts can shift widths; re-measure when ready */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  window.addEventListener('load', measure);

  measure();
  applyMode();
  if (!reduce()) document.body.classList.add('motion-on');
  setupDrift();
  requestAnimationFrame(frame);
  applyParallax();
  setField();

  /* intro: holds on the wordmark + strapline, then the panels open out to
     reveal the cover. Skippable by any interaction. */
  var intro = document.getElementById('intro');
  /* The opening hero holds on the wordmark + strapline for ~2 seconds, then
     fades to reveal the cover. A click / scroll / key skips straight through. */
  var introActive = !!intro;
  // The opening intro plays once, on a visitor's first arrival only. After that
  // it never replays: not on refresh, not on return, not on navigating home.
  var INTRO_KEY = 'cordial_intro_seen_v1';
  var introSeen = false;
  try { introSeen = localStorage.getItem(INTRO_KEY) === '1'; } catch (e) {}
  function enterCover() {
    document.body.classList.add('entered');
    // the cover headline rises as the cover is exposed (split now if not yet)
    setTimeout(function () {
      var c = document.querySelector('.cover-title');
      if (c && !reduce()) rlSplitExisting(c);
      rlReveal(c);
    }, 140);
  }
  function openIntro() {
    if (!introActive) { enterCover(); return; }
    introActive = false;
    enterCover();
    if (intro) { intro.classList.add('open'); setTimeout(function () { intro.classList.add('gone'); }, 1100); }
  }
  if (!intro || introSeen) {
    // Returning visitor (or no intro element): skip straight to the cover, no splash.
    introActive = false;
    if (intro) { intro.classList.add('open'); intro.classList.add('gone'); }
    enterCover();
  } else {
    // First arrival: remember it now so a refresh mid-intro never replays it.
    try { localStorage.setItem(INTRO_KEY, '1'); } catch (e) {}
    ['wheel', 'pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
      var pv = (ev === 'wheel' || ev === 'touchstart');
      window.addEventListener(ev, function (e) {
        if (!introActive) return;
        e.stopPropagation();
        if (pv) { try { e.preventDefault(); } catch (x) {} }
        openIntro();
      }, { capture: true, passive: !pv });
    });
    setTimeout(openIntro, reduce() ? 500 : 2400);
  }

  /* arriving from another page via the menu's "What we do": skip the intro and
     glide straight to that section once measured */
  if (location.hash === '#wwd') {
    openIntro();
    setTimeout(function () { measure(); navTo(1); }, 260);
  }
  /* arriving from another page's "Book a consultation" / "Get in touch":
     skip the intro and glide straight to the booking section */
  if (location.hash === '#book') {
    openIntro();
    setTimeout(function () { measure(); navTo(4); }, 260);
  }

  /* ===== Headline line reveals ==========================================
     Effects 1 + 2: split each large headline into lines, wrap every line in
     an overflow-hidden mask, then rise the lines into place one after another
     (staggered, eased, once) as the headline enters the viewport.
     Effect 3 (independent drift) is already handled in applyParallax: the
     headlines carry data-mx so they float at a different pace from the body. */
  var RL_STAGGER = 100; // ms between lines — keep in feel with --rl-stagger
  document.documentElement.style.setProperty('--rl-stagger', RL_STAGGER + 'ms');

  function rlWrapLine(host, delayMs) {
    var mask = document.createElement('span'); mask.className = 'rl-mask';
    var line = document.createElement('span'); line.className = 'rl-line';
    line.style.transitionDelay = Math.max(0, delayMs) + 'ms';
    mask.appendChild(line);
    host.appendChild(mask);
    return line;
  }

  // cover title: its <span> children are already the lines (and carry the
  // per-line data-mx/data-my drift), so wrap each span as-is.
  function rlSplitExisting(el) {
    if (!el || el.querySelector('.rl-mask')) return;
    var spans = Array.prototype.slice.call(el.children);
    if (!spans.length) return;
    var fx = fxFor(el.closest('.sec'));
    el.textContent = '';
    spans.forEach(function (span, i) { rlWrapLine(el, fx.headDelay + i * fx.lineStagger).appendChild(span); });
  }

  // flowing heading: split into words (preserving <em>), measure which visual
  // line each falls on, then rebuild as masked lines matching that wrapping.
  function rlSplitFlowing(el) {
    if (!el || el.querySelector('.rl-mask')) return;
    var units = [];
    (function walk(node, em) {
      for (var c = node.firstChild; c; c = c.nextSibling) {
        if (c.nodeType === 3) {
          var parts = c.textContent.split(/(\s+)/);
          for (var p = 0; p < parts.length; p++) {
            if (parts[p] === '') continue;
            if (/^\s+$/.test(parts[p])) units.push(null);
            else units.push({ w: parts[p], em: em });
          }
        } else if (c.nodeType === 1) { walk(c, em || c.tagName === 'EM'); }
      }
    })(el, false);
    el.textContent = '';
    var words = [];
    units.forEach(function (u) {
      if (!u) { el.appendChild(document.createTextNode(' ')); return; }
      var s = document.createElement('span'); s.style.display = 'inline-block';
      if (u.em) { var e = document.createElement('em'); e.textContent = u.w; s.appendChild(e); }
      else s.textContent = u.w;
      el.appendChild(s); words.push(s);
    });
    var lines = [], cur = null, top = null;
    words.forEach(function (s) {
      var t = s.offsetTop;
      if (top === null || Math.abs(t - top) > 4) { cur = []; lines.push(cur); top = t; }
      cur.push(s);
    });
    var fx = fxFor(el.closest('.sec'));
    var accent = (el.getAttribute('data-accent') || '').toLowerCase();
    var accentDone = false;
    function rlNorm(w) { return w.toLowerCase().replace(/[^a-z0-9]/g, ''); }
    el.textContent = '';
    lines.forEach(function (lw, li) {
      var line = rlWrapLine(el, fx.headDelay + li * fx.lineStagger);
      lw.forEach(function (s, wi) {
        if (wi > 0) line.appendChild(document.createTextNode(' '));
        var isEm = s.firstChild && s.firstChild.nodeName === 'EM';
        var node = isEm ? s.firstChild : document.createTextNode(s.textContent);
        if (accent && !accentDone && rlNorm(s.textContent) === accent) {
          accentDone = true;
          var wrap = document.createElement('span'); wrap.className = 'accent-word';
          wrap.appendChild(node);
          line.appendChild(wrap);
        } else {
          line.appendChild(node);
        }
      });
    });
  }

  function rlReveal(el) {
    if (!el || el._rl) return;
    // safety: split now if it hasn't been (so reveal never precedes the masks)
    if (!reduce() && !el.querySelector('.rl-mask')) {
      if (el.classList.contains('cover-title')) rlSplitExisting(el);
      else rlSplitFlowing(el);
    }
    el._rl = 1;
    el.classList.add('is-revealed');
    var lines = el.querySelectorAll('.rl-line').length || 1;
    var fx = fxFor(el.closest('.sec'));
    // once the last line has settled, drop the masks so the drift (effect 3)
    // can float the lines freely without being clipped
    setTimeout(function () { el.classList.add('rl-done'); }, fx.headDelay + lines * fx.lineStagger + 1000);
  }

  var rlDone = false;
  function initHeadlineReveals() {
    if (rlDone) return; rlDone = true;
    if (reduce()) return;  // reduced motion: leave headlines static, in place
    // (the cover title is split + revealed by enterCover, with the intro)
    var flow = document.querySelectorAll('.sec-h2');
    for (var i = 0; i < flow.length; i++) rlSplitFlowing(flow[i]);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { rlReveal(e.target); io.unobserve(e.target); } });
      }, { threshold: 0.3, rootMargin: '0px -6% 0px -6%' });
      for (var j = 0; j < flow.length; j++) io.observe(flow[j]);  // cover is revealed with the intro
    } else {
      for (var k = 0; k < flow.length; k++) rlReveal(flow[k]);
    }
    measure();   // headline splitting changed content heights — refit
  }
  // run after fonts settle so visual-line grouping is correct
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(initHeadlineReveals);
  setTimeout(initHeadlineReveals, 700);

  /* ===== Gentle continuous drift (CALM) ================================
     On vertical scroll, scattered small-element drifting reads as cheap, so
     we keep the page mostly still: NO drift on labels, dates, eyebrows or
     numbers. Only images get a barely-there scale-through as they pass. The
     one expressive per-section touch is the accent word (see rlSplitFlowing).
     Body copy is never tagged, so it stays still and legible. */
  function setupDrift() {
    if (reduce()) return;
    function tagSx(sel, amt) {
      var els = document.querySelectorAll(sel);
      for (var i = 0; i < els.length; i++) if (!els[i].hasAttribute('data-sx')) els[i].setAttribute('data-sx', String(amt));
    }
    tagSx('.founder .portrait', IMG_SCALE);
    tagSx('.studies image-slot', IMG_SCALE);
    tagSx('.hiw-img', IMG_SCALE);
    tagSx('.sec-bg', IMG_SCALE);
    for (var s = 0; s < n; s++) secs[s]._layers = null; // re-query with new tags
  }

  window.__ribbon = {
    to: function (y) { window.scrollTo(0, Math.max(0, Math.min(maxY, y))); },
    toSection: function (i) { navTo(i); },
    set: function (y) {
      targetY = curY = Math.max(0, Math.min(maxY, y));
      if (!isMobile()) window.scrollTo(0, curY);
      track.style.transform = 'translate3d(0,' + (-curY) + 'px,0)';
      applyParallax(); setField(); updateProgress();
    },
    get max() { return maxY; },
    get cur() { return curY; },
    get target() { return targetY; }
  };
})();
