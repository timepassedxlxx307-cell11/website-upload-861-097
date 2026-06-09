(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('[data-menu-button]');
    var nav = qs('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var next = qs('[data-hero-next]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (slides.length > 1) {
      start();
    }
  }

  function initImageState() {
    qsa('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-hidden');
      });
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function initLocalFilter() {
    var input = qs('[data-local-filter]');
    var list = qs('[data-card-list]');
    var empty = qs('[data-empty-state]');
    if (!input || !list) {
      return;
    }
    var url = new URL(window.location.href);
    var query = url.searchParams.get('q') || '';
    if (input.hasAttribute('data-query-input') && query) {
      input.value = query;
    }
    function apply() {
      var value = normalize(input.value);
      var visible = 0;
      qsa('[data-search-card]', list).forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.textContent
        ].join(' '));
        var matched = !value || haystack.indexOf(value) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }
    input.addEventListener('input', apply);
    apply();
  }

  function initSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          window.location.href = './search.html';
        }
      });
    });
  }

  function initPlayer() {
    var container = qs('[data-player]');
    var video = qs('#movie-video');
    var button = qs('[data-play-button]');
    if (!container || !video || !button) {
      return;
    }
    var shell = video.closest('.video-shell');
    var source = video.getAttribute('data-src');
    var initialized = false;
    var hlsInstance = null;

    function attachSource() {
      if (initialized || !source) {
        return;
      }
      initialized = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      attachSource();
      var promise = video.play();
      if (promise && typeof promise.then === 'function') {
        promise.then(function () {
          if (shell) {
            shell.classList.add('is-playing');
          }
        }).catch(function () {
          if (shell) {
            shell.classList.remove('is-playing');
          }
        });
      } else if (shell) {
        shell.classList.add('is-playing');
      }
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('is-playing');
      }
    });
    video.addEventListener('pause', function () {
      if (shell && video.currentTime === 0) {
        shell.classList.remove('is-playing');
      }
    });
    qsa('[data-scroll-play]').forEach(function (link) {
      link.addEventListener('click', function () {
        window.setTimeout(playVideo, 300);
      });
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initImageState();
    initSearchForms();
    initLocalFilter();
    initPlayer();
  });
})();
