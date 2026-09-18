/* Google Analytics 4, loaded only when a Measurement ID is set below.
   Skipped when the visitor sends Global Privacy Control or Do Not Track, and on localhost.
   Custom events: video_open (Build page video dialog), photo_open (any photo lightbox). */
(function () {
  'use strict';
  var GA_ID = 'G-GYYXVHXKZX'; // e.g. 'G-XXXXXXXXXX' from Google Analytics > Admin > Data streams

  if (!GA_ID) return;
  if (navigator.globalPrivacyControl || navigator.doNotTrack === '1') return;
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID, { anonymize_ip: true });

  document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('a.build-video, a.gallery-item, .yt') : null;
    if (!t) return;
    if (t.matches('a.build-video')) {
      gtag('event', 'video_open', { video_id: t.dataset.yt, video_title: t.dataset.title });
    } else if (t.matches('.yt')) {
      gtag('event', 'video_open', { video_id: t.dataset.yt });
    } else {
      gtag('event', 'photo_open', { photo: (t.getAttribute('href') || '').split('/').pop() });
    }
  }, true);
})();
