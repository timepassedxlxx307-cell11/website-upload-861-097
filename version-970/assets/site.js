(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initNavigation();
    initHeroSlider();
    initFilters();
    initPlayer();
  });

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var links = document.querySelector("[data-nav-links]");

    if (!toggle || !links) {
      return;
    }

    toggle.addEventListener("click", function () {
      links.classList.toggle("is-open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function show(nextIndex) {
      index = nextIndex;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show((index + 1) % slides.length);
      }, 5200);
    }
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));

    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var cards = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-card]"));
      var empty = panel.querySelector("[data-filter-empty]");

      if (!input || cards.length === 0) {
        return;
      }

      input.addEventListener("input", function () {
        var value = input.value.trim().toLowerCase();
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-year") || ""
          ].join(" ").toLowerCase();
          var matched = value === "" || haystack.indexOf(value) !== -1;
          card.style.display = matched ? "" : "none";

          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible === 0 ? "block" : "none";
        }
      });
    });
  }

  function initPlayer() {
    var video = document.querySelector("video[data-m3u8]");

    if (!video) {
      return;
    }

    var playButton = document.querySelector("[data-play-button]");
    var source = video.getAttribute("data-m3u8");
    var initialized = false;
    var hls = null;

    function attachSource() {
      if (initialized || !source) {
        return;
      }

      initialized = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      attachSource();

      if (playButton) {
        playButton.classList.add("is-hidden");
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (playButton) {
            playButton.classList.remove("is-hidden");
          }
        });
      }
    }

    if (playButton) {
      playButton.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      if (playButton) {
        playButton.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (playButton && video.currentTime === 0) {
        playButton.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }
})();
