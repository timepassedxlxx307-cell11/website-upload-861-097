(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showHero(nextIndex) {
      index = nextIndex;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showHero((index + 1) % slides.length);
      }, 5200);
    }
  }

  function applyFiltering(scope) {
    var panel = scope.querySelector('[data-filter-panel]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.js-filter-card'));
    if (!panel || !cards.length) {
      return;
    }

    var state = {
      type: 'all',
      year: 'all',
      region: 'all'
    };

    function refresh() {
      cards.forEach(function (card) {
        var typeMatch = state.type === 'all' || card.getAttribute('data-type') === state.type;
        var yearMatch = state.year === 'all' || card.getAttribute('data-year') === state.year;
        var regionMatch = state.region === 'all' || card.getAttribute('data-region') === state.region;
        card.classList.toggle('hidden-card', !(typeMatch && yearMatch && regionMatch));
      });
      applySearch();
    }

    panel.querySelectorAll('[data-filter-value]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.type = button.getAttribute('data-filter-value');
        panel.querySelectorAll('[data-filter-value]').forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        refresh();
      });
    });

    panel.querySelectorAll('[data-filter-year]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.year = button.getAttribute('data-filter-year');
        panel.querySelectorAll('[data-filter-year]').forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        refresh();
      });
    });

    panel.querySelectorAll('[data-filter-region]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.region = button.getAttribute('data-filter-region');
        panel.querySelectorAll('[data-filter-region]').forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        refresh();
      });
    });
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim().toLowerCase();
  }

  function applySearch() {
    var grid = document.querySelector('[data-search-grid]');
    var status = document.querySelector('[data-search-status]');
    var input = document.querySelector('[data-search-input]');
    if (!grid) {
      return;
    }
    var q = getQuery();
    if (input && q) {
      input.value = q;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.js-filter-card'));
    var visible = 0;
    cards.forEach(function (card) {
      var text = (card.getAttribute('data-keywords') || '').toLowerCase();
      var previous = card.classList.contains('hidden-card');
      var searchMatch = !q || text.indexOf(q) !== -1;
      card.classList.toggle('hidden-card', previous || !searchMatch);
      if (!card.classList.contains('hidden-card')) {
        visible += 1;
      }
    });
    if (status) {
      status.textContent = q ? '搜索结果：' + visible + ' 项' : '';
    }
  }

  document.querySelectorAll('main').forEach(function (scope) {
    applyFiltering(scope);
  });

  applySearch();

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-layer');
    if (!video) {
      return;
    }

    function loadVideo() {
      if (shell.getAttribute('data-ready') === '1') {
        return Promise.resolve();
      }
      var stream = video.getAttribute('data-stream');
      shell.setAttribute('data-ready', '1');
      shell.classList.add('ready');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        return Promise.resolve();
      }
      video.src = stream;
      return Promise.resolve();
    }

    function start() {
      loadVideo().then(function () {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      });
    }

    if (button) {
      button.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (shell.getAttribute('data-ready') !== '1') {
        start();
      }
    });
  });
})();
