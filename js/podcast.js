/**
 * Echo Pond - Podcast player
 * Single persistent <audio>, chapter list, resume, deep links, Media Session.
 */

(function () {
  'use strict';

  var BASE = '../media/podcast/';

  var EPISODES = [
    { id: 'prologue',  number: 'Prologue',  title: 'The House That Looks Inevitable', file: 'echo-pond_00-prologue.mp3', duration: 620,
      sections: 'A resolved surface compresses its history. This book begins inside that compression.' },
    { id: 'part-1',    number: 'Part I',    title: 'Before a House Could Be Drawn', file: 'echo-pond_01-part-1.mp3', duration: 1267,
      sections: 'A walk conducted by phone · "I love it" · What we agreed to carry · A deed is not an origin · All wrong · Five bedrooms before a plan · A handoff, not a beginning · The arrow' },
    { id: 'interlude', number: 'Interlude', title: 'What the Echo Returns', file: 'echo-pond_02-interlude.mp3', duration: 260,
      sections: 'Two tellings of the Echo myth: Ovid’s nymph, who can only repeat, and Longus’s, whose scattered voice returns through the earth changed by what received it.' },
    { id: 'part-2',    number: 'Part II',   title: 'Choosing the House-Shaped House', file: 'echo-pond_03-part-2.mp3', duration: 1048,
      sections: 'A brief written as life · 611 sq. ft. of work · Hardlined · L or pinwheel · The number · Five scenarios · Returning to the brief · A form that could become home' },
    { id: 'part-3',    number: 'Part III',  title: 'Paying for the Line on the Drawing', file: 'echo-pond_04-part-3.mp3', duration: 1238,
      sections: 'What a lender could see · Onward · Before every dollar was secured · Fourteen hundred feet · The crossing · What the surface could not say · Ground that could bear' },
    { id: 'part-4',    number: 'Part IV',   title: 'The Difficult Work of a Simple Form', file: 'echo-pond_05-part-4.mp3', duration: 1611,
      sections: 'Before the walls existed · A wire in open space · More glass than wall · The puzzle arrived in pieces · An opening found at full scale · One dark field · An eighth of an inch · A second look changed the direction · The key' },
    { id: 'part-5',    number: 'Part V',    title: 'After Completion Changes Tense', file: 'echo-pond_06-part-5.mp3', duration: 989,
      sections: 'Like we had been here forever · Complete, but not finished · The room with a door · The double sun · A philosophy we were sitting inside · Four verbs at the threshold' },
    { id: 'coda',      number: 'Coda',      title: 'What Returned Changed', file: 'echo-pond_07-coda.mp3', duration: 295,
      sections: 'Final thoughts on the work of building together' }
  ];

  var SPEEDS = [1, 1.25, 1.5, 1.75, 2, 0.75];
  var STORE_KEY = 'echopond.podcast.v1';

  var $ = function (id) { return document.getElementById(id); };
  var el = {
    list: $('episode-list'),
    player: $('player'),
    audio: $('player-audio'),
    progress: $('player-progress'),
    played: $('player-played'),
    buffered: $('player-buffered'),
    title: $('player-title'),
    play: $('btn-play'),
    prev: $('btn-prev'),
    next: $('btn-next'),
    back: $('btn-back'),
    fwd: $('btn-fwd'),
    speed: $('btn-speed'),
    share: $('btn-share'),
    cur: $('time-current'),
    tot: $('time-total'),
    playAll: $('play-all'),
    copyFeed: $('copy-feed'),
    feedUrl: $('feed-url'),
    toast: $('toast')
  };

  var state = { index: -1, speedIdx: 0, positions: {}, saveTimer: null };

  // ---------- storage ----------
  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        state.positions = s.positions || {};
        state.speedIdx = SPEEDS.indexOf(s.speed) >= 0 ? SPEEDS.indexOf(s.speed) : 0;
        state.lastId = s.lastId || null;
      }
    } catch (e) {}
  }
  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        positions: state.positions,
        speed: SPEEDS[state.speedIdx],
        lastId: state.index >= 0 ? EPISODES[state.index].id : state.lastId
      }));
    } catch (e) {}
  }

  // ---------- helpers ----------
  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
  }
  function fmtLong(sec) {
    var m = Math.round(sec / 60);
    return m >= 60 ? Math.floor(m / 60) + ' hr ' + (m % 60) + ' min' : m + ' min';
  }
  function parseTime(t) {
    if (!t) return 0;
    if (/^\d+$/.test(t)) return parseInt(t, 10);
    var m = /(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/.exec(t);
    if (!m) return 0;
    return (parseInt(m[1] || 0, 10) * 3600) + (parseInt(m[2] || 0, 10) * 60) + parseInt(m[3] || 0, 10);
  }
  function timeTag(sec) {
    sec = Math.floor(sec);
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + 'h' : '') + (m ? m + 'm' : '') + s + 's';
  }
  function findIndex(id) {
    for (var i = 0; i < EPISODES.length; i++) if (EPISODES[i].id === id) return i;
    return -1;
  }
  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add('is-visible');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.toast.classList.remove('is-visible'); }, 2200);
  }
  function copy(text, okMsg) {
    var done = function () { toast(okMsg || 'Copied'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { prompt('Copy this link:', text); });
    } else {
      prompt('Copy this link:', text);
    }
  }
  function linkFor(idx, sec) {
    var url = location.href.split('#')[0] + '#' + EPISODES[idx].id;
    if (sec && sec > 5) url += '&t=' + timeTag(sec);
    return url;
  }

  // ---------- render list ----------
  function renderList() {
    var total = 0;
    EPISODES.forEach(function (ep, i) {
      total += ep.duration;
      var li = document.createElement('li');
      li.className = 'episode';
      li.id = 'ep-' + ep.id;
      li.innerHTML =
        '<button class="episode-play" type="button" aria-label="Play ' + ep.number + '">▶</button>' +
        '<div class="episode-main">' +
          '<div class="episode-number">' + ep.number + '</div>' +
          '<div class="episode-title">' + ep.title + '</div>' +
          '<div class="episode-sections">' + ep.sections + '</div>' +
          '<div class="episode-progress" aria-hidden="true"><span></span></div>' +
        '</div>' +
        '<div class="episode-side">' +
          '<span class="episode-duration">' + fmtLong(ep.duration) + '</span>' +
          '<button class="episode-link" type="button">Copy link</button>' +
        '</div>';
      li.querySelector('.episode-play').addEventListener('click', function () {
        if (state.index === i) { togglePlay(); } else { loadEpisode(i, null, true); }
      });
      li.querySelector('.episode-link').addEventListener('click', function () {
        copy(linkFor(i, 0), 'Link copied');
      });
      el.list.appendChild(li);
      ep.el = li;
    });
    $('total-duration').textContent = fmtLong(total);
    updateListProgress();
  }

  function updateListProgress() {
    EPISODES.forEach(function (ep) {
      var p = state.positions[ep.id] || 0;
      var pct = ep.duration ? Math.min(100, (p / ep.duration) * 100) : 0;
      var bar = ep.el.querySelector('.episode-progress');
      bar.classList.toggle('has-progress', pct > 0);
      bar.querySelector('span').style.width = pct + '%';
    });
  }

  // ---------- playback ----------
  function loadEpisode(idx, startAt, autoplay) {
    if (idx < 0 || idx >= EPISODES.length) return;
    if (state.index >= 0) {
      EPISODES[state.index].el.classList.remove('is-active');
      EPISODES[state.index].el.querySelector('.episode-play').textContent = '▶';
    }
    state.index = idx;
    var ep = EPISODES[idx];
    ep.el.classList.add('is-active');
    el.player.hidden = false;
    el.title.textContent = ep.number + ' · ' + ep.title;
    el.tot.textContent = fmt(ep.duration);
    el.audio.src = BASE + ep.file;
    el.audio.playbackRate = SPEEDS[state.speedIdx];
    var resume = (startAt != null) ? startAt : (state.positions[ep.id] || 0);
    if (resume >= ep.duration - 5) resume = 0;
    var seekOnce = function () {
      el.audio.removeEventListener('loadedmetadata', seekOnce);
      if (resume > 0) el.audio.currentTime = resume;
      if (autoplay) el.audio.play().catch(function () {});
    };
    el.audio.addEventListener('loadedmetadata', seekOnce);
    el.audio.load();
    updateMediaSession();
    save();
  }

  function togglePlay() {
    if (state.index < 0) { loadEpisode(0, null, true); return; }
    if (el.audio.paused) el.audio.play().catch(function () {}); else el.audio.pause();
  }

  function skip(delta) {
    if (state.index < 0) return;
    el.audio.currentTime = Math.max(0, Math.min(el.audio.duration || Infinity, el.audio.currentTime + delta));
  }

  function step(dir) {
    var n = state.index + dir;
    if (n < 0 || n >= EPISODES.length) return;
    loadEpisode(n, 0, !el.audio.paused || dir > 0);
  }

  function setPlayingUI(playing) {
    el.play.textContent = playing ? '❚❚' : '▶';
    el.play.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    if (state.index >= 0) {
      EPISODES[state.index].el.querySelector('.episode-play').textContent = playing ? '❚❚' : '▶';
    }
  }

  function onTime() {
    var d = el.audio.duration || EPISODES[state.index].duration;
    var c = el.audio.currentTime;
    el.cur.textContent = fmt(c);
    el.played.style.width = d ? (c / d * 100) + '%' : '0%';
    el.progress.setAttribute('aria-valuenow', d ? Math.round(c / d * 100) : 0);
    if (state.index >= 0) state.positions[EPISODES[state.index].id] = c;
    if (!state.saveTimer) {
      state.saveTimer = setTimeout(function () { state.saveTimer = null; save(); updateListProgress(); }, 3000);
    }
  }

  function onProgress() {
    try {
      var b = el.audio.buffered, d = el.audio.duration;
      if (b.length && d) el.buffered.style.width = (b.end(b.length - 1) / d * 100) + '%';
    } catch (e) {}
  }

  function onEnded() {
    state.positions[EPISODES[state.index].id] = EPISODES[state.index].duration;
    save(); updateListProgress();
    if (state.index + 1 < EPISODES.length) loadEpisode(state.index + 1, 0, true);
    else setPlayingUI(false);
  }

  function seekFromEvent(e) {
    var r = el.progress.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    var pct = Math.max(0, Math.min(1, x / r.width));
    var d = el.audio.duration || EPISODES[state.index].duration;
    if (d) el.audio.currentTime = pct * d;
  }

  function cycleSpeed() {
    state.speedIdx = (state.speedIdx + 1) % SPEEDS.length;
    el.audio.playbackRate = SPEEDS[state.speedIdx];
    el.speed.textContent = SPEEDS[state.speedIdx] + '×';
    save();
  }

  // ---------- media session (lock screen) ----------
  function updateMediaSession() {
    if (!('mediaSession' in navigator) || state.index < 0) return;
    var ep = EPISODES[state.index];
    var cover = new URL('../media/podcast/cover-roof.jpg', location.href).href;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: ep.number + ' · ' + ep.title,
      artist: 'Chris R. Glass',
      album: 'A House-Shaped House',
      artwork: [{ src: cover, sizes: '1400x1400', type: 'image/jpeg' }]
    });
    var set = function (a, fn) { try { navigator.mediaSession.setActionHandler(a, fn); } catch (e) {} };
    set('play', function () { el.audio.play(); });
    set('pause', function () { el.audio.pause(); });
    set('seekbackward', function () { skip(-15); });
    set('seekforward', function () { skip(30); });
    set('previoustrack', function () { step(-1); });
    set('nexttrack', function () { step(1); });
    set('seekto', function (d) { if (d.seekTime != null) el.audio.currentTime = d.seekTime; });
  }

  // ---------- deep links ----------
  function applyHash(autoplay) {
    var h = location.hash.replace(/^#/, '');
    if (!h) return false;
    var parts = h.split('&'), id = parts[0], t = 0;
    parts.slice(1).forEach(function (p) { var kv = p.split('='); if (kv[0] === 't') t = parseTime(kv[1]); });
    var idx = findIndex(id);
    if (idx < 0) return false;
    loadEpisode(idx, t, autoplay);
    EPISODES[idx].el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    return true;
  }

  // ---------- init ----------
  function init() {
    if (!el.list || !el.audio) return;
    load();
    renderList();
    el.speed.textContent = SPEEDS[state.speedIdx] + '×';

    el.play.addEventListener('click', togglePlay);
    el.prev.addEventListener('click', function () { step(-1); });
    el.next.addEventListener('click', function () { step(1); });
    el.back.addEventListener('click', function () { skip(-15); });
    el.fwd.addEventListener('click', function () { skip(30); });
    el.speed.addEventListener('click', cycleSpeed);
    el.share.addEventListener('click', function () {
      if (state.index < 0) return;
      copy(linkFor(state.index, el.audio.currentTime), 'Link to this moment copied');
    });
    el.playAll.addEventListener('click', function () { loadEpisode(0, 0, true); });
    el.copyFeed.addEventListener('click', function () { copy(el.feedUrl.textContent.trim(), 'Feed address copied'); });

    el.progress.addEventListener('click', seekFromEvent);
    el.progress.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { skip(-5); e.preventDefault(); }
      if (e.key === 'ArrowRight') { skip(5); e.preventDefault(); }
    });

    el.audio.addEventListener('play', function () { setPlayingUI(true); });
    el.audio.addEventListener('pause', function () { setPlayingUI(false); save(); });
    el.audio.addEventListener('timeupdate', onTime);
    el.audio.addEventListener('progress', onProgress);
    el.audio.addEventListener('ended', onEnded);

    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'button') return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      if (e.key === 'ArrowLeft') skip(-15);
      if (e.key === 'ArrowRight') skip(30);
    });

    window.addEventListener('hashchange', function () { applyHash(true); });

    // Deep link wins; otherwise restore the last chapter, paused.
    if (!applyHash(false) && state.lastId) {
      var idx = findIndex(state.lastId);
      if (idx >= 0 && (state.positions[state.lastId] || 0) > 5) loadEpisode(idx, null, false);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
