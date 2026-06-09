(function () {
    const navToggle = document.querySelector(".nav-toggle");
    const mobilePanel = document.querySelector(".mobile-panel");

    if (navToggle && mobilePanel) {
        navToggle.addEventListener("click", function () {
            const opened = mobilePanel.classList.toggle("is-open");
            navToggle.setAttribute("aria-expanded", String(opened));
            mobilePanel.setAttribute("aria-hidden", String(!opened));
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    let slideIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        slideIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle("is-active", current === slideIndex);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle("is-active", current === slideIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(slideIndex + 1);
        }, 5200);
    }

    const heroInput = document.querySelector(".hero-search input");
    const heroButton = document.querySelector(".hero-search button");

    if (heroInput && heroButton) {
        heroButton.addEventListener("click", function () {
            const query = heroInput.value.trim();
            const url = new URL(heroButton.dataset.target || "./search.html", window.location.href);
            if (query) {
                url.searchParams.set("q", query);
            }
            window.location.href = url.toString();
        });
        heroInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                heroButton.click();
            }
        });
    }

    const filterPanel = document.querySelector(".filter-panel");

    if (filterPanel) {
        const input = filterPanel.querySelector(".filter-input");
        const region = filterPanel.querySelector(".filter-region");
        const type = filterPanel.querySelector(".filter-type");
        const year = filterPanel.querySelector(".filter-year");
        const cards = Array.from(document.querySelectorAll(".movie-card"));
        const empty = document.querySelector(".empty-state");
        const params = new URLSearchParams(window.location.search);
        const initial = params.get("q") || "";

        if (input && initial) {
            input.value = initial;
        }

        function filterCards() {
            const q = input ? input.value.trim().toLowerCase() : "";
            const r = region ? region.value : "";
            const t = type ? type.value : "";
            const y = year ? year.value : "";
            let visible = 0;

            cards.forEach(function (card) {
                const text = (card.dataset.search || "").toLowerCase();
                const cardRegion = card.dataset.region || "";
                const cardType = card.dataset.type || "";
                const cardYear = card.dataset.year || "";
                const match = (!q || text.indexOf(q) !== -1) && (!r || cardRegion === r) && (!t || cardType === t) && (!y || cardYear === y);
                card.style.display = match ? "" : "none";
                if (match) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }

        [input, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", filterCards);
                control.addEventListener("change", filterCards);
            }
        });

        filterCards();
    }
}());
