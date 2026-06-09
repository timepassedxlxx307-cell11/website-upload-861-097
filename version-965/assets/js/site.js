(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var navigation = document.querySelector('.site-nav');

    if (menuButton && navigation) {
        menuButton.addEventListener('click', function () {
            var open = navigation.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            start();
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        start();
    }

    var searchInput = document.querySelector('[data-search-input]');
    var searchResults = document.querySelector('[data-search-results]');

    if (searchInput && searchResults && window.MOVIE_INDEX) {
        function buildCard(movie) {
            var tags = movie.tags.slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return '<article class="movie-card">' +
                '<a href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">' +
                '<div class="poster-frame">' +
                '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.remove()">' +
                '<span class="year-badge">' + escapeHtml(String(movie.year)) + '</span>' +
                '<span class="play-chip">▶</span>' +
                '</div>' +
                '<div class="movie-card-body">' +
                '<div class="movie-meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
                '<h2>' + escapeHtml(movie.title) + '</h2>' +
                '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
                '</a>' +
                '</article>';
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function render() {
            var query = searchInput.value.trim().toLowerCase();
            var source = window.MOVIE_INDEX;
            var list = query ? source.filter(function (movie) {
                return movie.searchText.indexOf(query) !== -1;
            }) : source.slice(0, 24);

            searchResults.innerHTML = list.slice(0, 96).map(buildCard).join('');
        }

        searchInput.addEventListener('input', render);
    }
}());
