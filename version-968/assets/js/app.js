(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector('.nav-toggle');
        var mobileNav = document.querySelector('.mobile-nav');
        if (toggle && mobileNav) {
            toggle.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
            });
        }

        var hero = document.querySelector('.js-hero');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
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
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    window.clearInterval(timer);
                    show(index);
                    start();
                });
            });

            show(0);
            start();
        }

        var input = document.querySelector('.js-filter-input');
        var yearFilter = document.querySelector('.js-year-filter');
        var regionFilter = document.querySelector('.js-region-filter');
        var typeFilter = document.querySelector('.js-type-filter');
        var list = document.querySelector('.js-filter-list');
        var empty = document.querySelector('.js-empty-state');

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function yearMatch(cardYear, selected) {
            if (!selected || selected === '全部年份') {
                return true;
            }
            if (selected === '经典年代') {
                return Number(cardYear) < 2000;
            }
            if (selected === '2010-2019') {
                return Number(cardYear) >= 2010 && Number(cardYear) <= 2019;
            }
            if (selected === '2000-2009') {
                return Number(cardYear) >= 2000 && Number(cardYear) <= 2009;
            }
            return String(cardYear) === selected;
        }

        function optionMatch(value, selected, allText) {
            if (!selected || selected.indexOf('全部') === 0) {
                return true;
            }
            return String(value || '').indexOf(selected) !== -1 || String(allText || '').indexOf(selected) !== -1;
        }

        function runFilter() {
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
            var keyword = normalize(input ? input.value : '');
            var selectedYear = yearFilter ? yearFilter.value : '';
            var selectedRegion = regionFilter ? regionFilter.value : '';
            var selectedType = typeFilter ? typeFilter.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var cardYear = card.getAttribute('data-year') || '';
                var cardRegion = card.getAttribute('data-region') || '';
                var cardType = card.getAttribute('data-type') || '';
                var matches = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matches = false;
                }
                if (!yearMatch(cardYear, selectedYear)) {
                    matches = false;
                }
                if (!optionMatch(cardRegion, selectedRegion, text)) {
                    matches = false;
                }
                if (!optionMatch(cardType, selectedType, text)) {
                    matches = false;
                }

                card.style.display = matches ? '' : 'none';
                if (matches) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, yearFilter, regionFilter, typeFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', runFilter);
                control.addEventListener('change', runFilter);
            }
        });

        runFilter();

        var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.play-cover');
            var url = player.getAttribute('data-video-url');
            var hlsInstance = null;
            var initialized = false;

            function attach() {
                if (!video || !url || initialized) {
                    return;
                }
                initialized = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        maxBufferLength: 60,
                        enableWorker: true
                    });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = url;
                }
            }

            function startPlayback() {
                attach();
                if (button) {
                    button.classList.add('is-hidden');
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (button && video) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    startPlayback();
                });
            }

            if (video) {
                video.addEventListener('play', function () {
                    if (button) {
                        button.classList.add('is-hidden');
                    }
                });
                video.addEventListener('click', function () {
                    if (!initialized) {
                        startPlayback();
                    }
                });
            }

            window.addEventListener('beforeunload', function () {
                if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                    hlsInstance.destroy();
                }
            });
        });
    });
}());
