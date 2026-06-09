(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var navLinks = document.querySelector(".nav-links");

    if (menuButton && navLinks) {
        menuButton.addEventListener("click", function () {
            navLinks.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var nextButton = document.querySelector("[data-hero-next]");
    var previousButton = document.querySelector("[data-hero-prev]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }

        window.clearInterval(timer);
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    if (slides.length) {
        showSlide(0);
        startHero();
    }

    if (nextButton) {
        nextButton.addEventListener("click", function () {
            showSlide(current + 1);
            startHero();
        });
    }

    if (previousButton) {
        previousButton.addEventListener("click", function () {
            showSlide(current - 1);
            startHero();
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
            startHero();
        });
    });

    var queryInput = document.querySelector("[data-filter-query]");
    var yearFilter = document.querySelector("[data-filter-year]");
    var typeFilter = document.querySelector("[data-filter-type]");
    var resetButton = document.querySelector("[data-filter-reset]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var emptyState = document.querySelector(".empty-state");

    function filterCards() {
        if (!cards.length) {
            return;
        }

        var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
        var year = yearFilter ? yearFilter.value : "";
        var type = typeFilter ? typeFilter.value : "";
        var visible = 0;

        cards.forEach(function (card) {
            var text = (card.getAttribute("data-search") || "").toLowerCase();
            var cardYear = card.getAttribute("data-year") || "";
            var cardType = card.getAttribute("data-type") || "";
            var matched = true;

            if (query && text.indexOf(query) === -1) {
                matched = false;
            }

            if (year && cardYear !== year) {
                matched = false;
            }

            if (type && cardType !== type) {
                matched = false;
            }

            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.style.display = visible ? "none" : "block";
        }
    }

    if (queryInput || yearFilter || typeFilter) {
        var urlParams = new URLSearchParams(window.location.search);
        var keyword = urlParams.get("q");

        if (keyword && queryInput) {
            queryInput.value = keyword;
        }

        [queryInput, yearFilter, typeFilter].forEach(function (control) {
            if (control) {
                control.addEventListener("input", filterCards);
                control.addEventListener("change", filterCards);
            }
        });

        if (resetButton) {
            resetButton.addEventListener("click", function () {
                if (queryInput) {
                    queryInput.value = "";
                }
                if (yearFilter) {
                    yearFilter.value = "";
                }
                if (typeFilter) {
                    typeFilter.value = "";
                }
                filterCards();
            });
        }

        filterCards();
    }
})();
