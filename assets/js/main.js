(function () {
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Sticky header shrink */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
    checkCounters();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  var toggle = document.querySelector('.menu-toggle');
  var bar = document.querySelector('.bar');
  if (toggle && bar) {
    toggle.addEventListener('click', function () {
      var open = bar.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  /* Hero slider */
  var slides = document.querySelectorAll('.slides img');
  var dots = document.querySelectorAll('.dots button');
  if (slides.length) {
    var current = 0, timer;
    var show = function (i) {
      slides[current].classList.remove('active');
      if (dots[current]) { dots[current].classList.remove('active'); dots[current].removeAttribute('aria-current'); }
      current = i;
      slides[current].classList.add('active');
      if (dots[current]) { dots[current].classList.add('active'); dots[current].setAttribute('aria-current', 'true'); }
    };
    var start = function () { timer = setInterval(function () { show((current + 1) % slides.length); }, 5000); };
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { clearInterval(timer); show(i); start(); });
    });
    start();
  }

  /* Card carousel */
  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    var track = root.querySelector('.track');
    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');
    if (!track) return;
    var step = function () {
      var card = track.querySelector('.photo-card');
      return card ? card.getBoundingClientRect().width + 16 : 300;
    };
    var update = function () {
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduced ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduced ? 'auto' : 'smooth' }); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* Counting stats */
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  function format(n) { return Math.round(n).toLocaleString('en-US'); }
  function run(el) {
    el.dataset.done = '1';
    var target = parseFloat(el.dataset.count), suffix = el.dataset.suffix || '';
    if (reduced) { el.textContent = format(target) + suffix; return; }
    var t0 = performance.now(), d = 1800;
    (function tick(now) {
      var p = Math.min(1, (now - t0) / d), e = 1 - Math.pow(1 - p, 3);
      el.textContent = format(target * e) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  function checkCounters() {
    var h = window.innerHeight || 800;
    counters.forEach(function (el) {
      if (el.dataset.done) return;
      var r = el.getBoundingClientRect();
      if (r.top < h - 10 && r.bottom > 0) {
        /* start the whole stat group together */
        var group = el.closest('.stat-panel, .stat-tiles') || el.parentNode;
        group.querySelectorAll('[data-count]').forEach(function (g) { if (!g.dataset.done) run(g); });
      }
    });
  }
  counters.forEach(function (el) { if (!reduced) el.textContent = '0' + (el.dataset.suffix || ''); });
  setTimeout(checkCounters, 300);
  onScroll();

  /* Forms are a preview only */
  document.querySelectorAll('form[data-preview]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var b = f.querySelector('[type=submit]');
      if (b) { b.textContent = 'Preview only'; setTimeout(function () { b.textContent = b.dataset.label; }, 1800); }
    });
  });
})();
