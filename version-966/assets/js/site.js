function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

ready(function () {
  document.querySelectorAll('.site-menu-button').forEach(function (button) {
    button.addEventListener('click', function () {
      var menu = document.querySelector('.site-mobile-menu');
      if (menu) {
        menu.classList.toggle('hidden');
      }
    });
  });

  document.querySelectorAll('.site-search-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        return;
      }
      event.preventDefault();
      window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
    });
  });

  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    var previous = carousel.querySelector('.hero-prev');
    var next = carousel.querySelector('.hero-next');
    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide') || '0'));
        start();
      });
    });
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('.filter-area').forEach(function (area) {
    var root = area.parentElement || document;
    var input = area.querySelector('.filter-input');
    var chips = Array.prototype.slice.call(area.querySelectorAll('.filter-chip'));
    var sortButtons = Array.prototype.slice.call(area.querySelectorAll('.sort-button'));
    var grid = root.querySelector('.sortable-grid');
    var currentFilter = '全部';

    function cards() {
      return grid ? Array.prototype.slice.call(grid.querySelectorAll('.movie-card')) : [];
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      cards().forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        var filterHit = currentFilter === '全部' || haystack.indexOf(currentFilter.toLowerCase()) !== -1;
        var queryHit = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle('is-hidden', !(filterHit && queryHit));
      });
    }

    function sortCards(mode) {
      if (!grid) {
        return;
      }
      var sorted = cards().sort(function (a, b) {
        if (mode === 'year') {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        }
        if (mode === 'rating') {
          return Number(b.getAttribute('data-rating') || 0) - Number(a.getAttribute('data-rating') || 0);
        }
        if (mode === 'views') {
          return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
        }
        return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-CN');
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      applyFilter();
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q');
      if (initial) {
        input.value = initial;
      }
      input.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        currentFilter = chip.getAttribute('data-filter') || '全部';
        applyFilter();
      });
    });

    sortButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        sortButtons.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        sortCards(button.getAttribute('data-sort') || 'default');
      });
    });

    applyFilter();
  });

  document.querySelectorAll('.player-shell').forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.player-start');
    var stream = box.getAttribute('data-stream');
    var prepared = false;
    var hlsInstance = null;

    function prepare() {
      if (prepared || !video || !stream) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      prepare();
      box.classList.add('is-playing');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          box.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          box.classList.remove('is-playing');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
});
