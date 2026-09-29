/* Google Analytics 4, loaded only when a Measurement ID is set below.
   Skipped when the visitor sends Global Privacy Control or Do Not Track, and on localhost.
   Custom events: video_open (video started from a click), photo_open (any photo lightbox),
   video_progress (item_name = YouTube id, percent 25/50/75), audio_play and audio_complete
   (Listen page player; item_name = chapter file, once per chapter per visit). */
(function () {
  'use strict';
  var GA_ID = 'G-GYYXVHXKZX'; // e.g. 'G-XXXXXXXXXX' from Google Analytics > Admin > Data streams

  if (!GA_ID) return;
  if (navigator.globalPrivacyControl || navigator.doNotTrack === '1') return;
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;

  // Owner opt-out: visit any page with ?ep_exclude=1 to stop GA on this browser,
  // ?ep_exclude=0 to turn it back on. Stored in localStorage; nothing is sent.
  try {
    var flag = new URLSearchParams(location.search).get('ep_exclude');
    if (flag === '1') localStorage.setItem('ep_exclude', '1');
    else if (flag === '0') localStorage.removeItem('ep_exclude');
    if (localStorage.getItem('ep_exclude') === '1') return;
  } catch (e) {}

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID, { anonymize_ip: true });

  // Listen page: first play and completion of each chapter. Media events do not bubble, so listen in capture.
  var audioSeen = {};
  function audioEvent(name, ev) {
    var a = ev.target;
    if (!a || a.id !== 'player-audio') return;
    var file = (a.currentSrc || a.src || '').split('?')[0].split('/').pop();
    if (!file || audioSeen[name + file]) return;
    audioSeen[name + file] = 1;
    gtag('event', name, { item_name: file });
  }
  document.addEventListener('play', function (ev) { audioEvent('audio_play', ev); }, true);
  document.addEventListener('ended', function (ev) { audioEvent('audio_complete', ev); }, true);

  // YouTube progress: the click-to-load iframes are created with enablejsapi=1. Ask the player to post
  // its state to this page (no extra script is loaded) and report 25, 50 and 75 percent once per video.
  var YT = 'https://www.youtube-nocookie.com';
  var ytState = {};
  document.addEventListener('load', function (ev) {
    var f = ev.target;
    if (!f || f.tagName !== 'IFRAME' || (f.src || '').indexOf(YT) !== 0) return;
    try { f.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), YT); } catch (e) {}
  }, true);
  window.addEventListener('message', function (ev) {
    if (ev.origin !== YT) return;
    var d;
    try { d = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data; } catch (e) { return; }
    if (!d || d.event !== 'infoDelivery' || !d.info) return;
    var frames = document.getElementsByTagName('iframe'), id = null, i;
    for (i = 0; i < frames.length; i++) {
      if (frames[i].contentWindow === ev.source) {
        var m = /\/embed\/([^?/]+)/.exec(frames[i].src);
        id = m && m[1];
        break;
      }
    }
    if (!id) return;
    var st = ytState[id] || (ytState[id] = { done: {} });
    if (d.info.duration) st.duration = d.info.duration;
    var t = d.info.currentTime;
    if (!st.duration || typeof t !== 'number') return;
    var pct = t / st.duration * 100;
    [25, 50, 75].forEach(function (mark) {
      if (pct < mark || st.done[mark]) return;
      st.done[mark] = 1;
      if (pct - mark < 5) gtag('event', 'video_progress', { item_name: id, percent: mark }); // a seek past the mark is not watching
    });
  });

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
