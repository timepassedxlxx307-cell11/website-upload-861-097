(function () {
    function initPlayer(root) {
        var video = root.querySelector('video');
        var button = root.querySelector('.player-start');
        var stream = video ? video.getAttribute('data-stream') : '';
        var hlsInstance = null;
        var loading = false;

        if (!video || !stream) {
            return;
        }

        function markPlaying() {
            root.classList.add('is-playing');
        }

        function playVideo() {
            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        function load() {
            markPlaying();

            if (loading) {
                playVideo();
                return;
            }

            loading = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                video.addEventListener('loadedmetadata', playVideo, { once: true });
                video.load();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                return;
            }

            video.src = stream;
            video.addEventListener('loadedmetadata', playVideo, { once: true });
            video.load();
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                load();
            });
        }

        video.addEventListener('click', function () {
            if (!loading) {
                load();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
    });
}());
