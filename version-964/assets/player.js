import { H as Hls } from "./hls-dru42stk.js";

export function setupPlayer(videoId, buttonId, layerId, streamUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var layer = document.getElementById(layerId);
  var hls = null;
  var initialized = false;

  if (!video || !button || !layer || !streamUrl) {
    return;
  }

  function playVideo() {
    var request = video.play();

    if (request && typeof request.catch === "function") {
      request.catch(function () {});
    }
  }

  function initialize() {
    if (initialized) {
      return;
    }

    initialized = true;
    video.controls = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", playVideo, { once: true });
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
    } else {
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", playVideo, { once: true });
    }
  }

  function start() {
    layer.classList.add("is-hidden");
    initialize();
    playVideo();
  }

  button.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    start();
  });

  layer.addEventListener("click", start);

  video.addEventListener("click", function () {
    if (!initialized || video.paused) {
      start();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
