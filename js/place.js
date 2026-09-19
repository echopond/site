/* Where and when the house is. Canton, Massachusetts, by date arithmetic only; nothing is fetched.
   Marks the pond photograph of the current season, and lights the icon's window and door after sunset. */
(function () {
  var q = new URLSearchParams(location.search), now = new Date();
  var day = Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - Date.UTC(now.getUTCFullYear(), 0, 0)) / 864e5);
  var season = day < 79 ? 'winter' : day < 172 ? 'spring' : day < 265 ? 'summer' : day < 355 ? 'autumn' : 'winter';
  var rad = Math.PI / 180, lat = 42.16, lon = -71.14;
  var decl = -23.44 * Math.cos(rad * (360 / 365) * (day + 10)), b = rad * (360 / 365) * (day - 81);
  var eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  var ha = Math.acos((Math.sin(-0.833 * rad) - Math.sin(lat * rad) * Math.sin(decl * rad)) / (Math.cos(lat * rad) * Math.cos(decl * rad))) / rad;
  var since = (now.getUTCHours() * 60 + now.getUTCMinutes() - (720 - 4 * lon - eot - 4 * ha) + 1440) % 1440;
  var light = since < 8 * ha ? 'day' : 'evening';
  if (['spring', 'summer', 'autumn', 'winter'].indexOf(q.get('season')) > -1) season = q.get('season');
  if (['day', 'evening'].indexOf(q.get('light')) > -1) light = q.get('light');
  document.documentElement.dataset.light = light;
  document.addEventListener('DOMContentLoaded', function () {
    var im = document.querySelector('.image-grid--four img[src*="pond-' + season + '"]');
    if (im) im.closest('figure').classList.add('is-now');
    var hero = document.querySelector('.hero-mark');
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        document.documentElement.classList.toggle('past-hero', !es[0].isIntersecting && es[0].boundingClientRect.top < 100);
      }, { rootMargin: '-92px 0px 0px 0px' }).observe(hero);
    }
  });
})();
