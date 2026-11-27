# CLAUDE.md

Project-specific instructions for Claude Code.

## Project Overview

The public site for Echo Pond, a residential architecture project in Canton, Massachusetts by Of Possible architects and NS Builders. Live at https://echopond.org/. It is a small static site with three public pages and one hidden page (top section rewritten 2026-11-27; it had described a single-page site).

| Page | File | What it is |
|---|---|---|
| Read | `index.html` | The article, with the hero video and background audio |
| Watch | `watch/index.html` | Films and photographs of the build |
| Build | `build/index.html` | How the house is made; generated, never hand-edited |
| Listen | `listen/index.html` | The audiobook-documentary player; hidden until launch |

`podcast/index.html` is only a redirect to Listen, and `404.html` is the not-found page. Each page has its own section below.

## Tech Stack

- **HTML, CSS, JavaScript**, all vanilla. No frameworks, preprocessors or bundlers, and no build step inside this repo.
- **Fonts**: Google Fonts. Schibsted Grotesk for names, navigation and captions; Source Serif 4 for prose; IBM Plex Mono; and a subset of Jost on the Read page.
- **Deployment**: GitHub Pages via GitHub Actions (`.github/workflows/static.yml`), served at the custom domain echopond.org.
- **Generators**: several pages or blocks are written by Python scripts in the Echo Pond workspace (`../scratch/build-page/` and `../scratch/site-next/`), not in this repo. The page sections below say which.

## Project Structure

```
/
├── index.html            # Read: the article
├── watch/index.html      # Watch
├── build/index.html      # Build (generated)
├── listen/               # Listen page and feed.xml (hidden until launch)
├── podcast/              # redirect and old feed address
├── 404.html
├── css/
│   ├── main.css          # shared layout and components
│   ├── tar.css           # the pine-tar design system, laid over main.css on every page
│   ├── watch.css         # Watch, also reused by Build
│   ├── build.css         # Build
│   └── podcast.css       # Listen
├── js/
│   ├── main.js           # header, section spy, lazy video, gallery lightbox, YouTube click-to-load, video dialog, audio toggle
│   ├── place.js          # season and after-sunset states by date arithmetic; nothing is fetched
│   ├── analytics.js      # Google Analytics 4, only when GA_ID is set
│   └── podcast.js        # the Listen player
├── media/                # home/, images/, video/, watch/, build/, podcast/, share images, glass.mp3
├── assets/images/        # logos and the house mark
├── sitemap.xml, robots.txt, llms.txt, site.webmanifest, icons
├── googleb1442ca4b34b9f16.html, 7b8fb50f948f6458e3c01561519238f8.txt   # search-engine verification; do not delete
└── .github/workflows/    # GitHub Pages deployment
```

## Development Workflow

1. Edit the file, or for generated pages edit the generator and re-run it (see the page's section).
2. If CSS or JS changed, bump the `?v=` stamp on its links.
3. Preview locally: `python3 -m http.server 8765` in this folder.
4. Commit and push to `main`. GitHub Actions deploys to GitHub Pages.

**No linting and no tests.**

Deploy workflow (2026-11-27): `.github/workflows/static.yml` has a 45-second `Wait for artifact listing` step before the deploy. Without it the deploy step finds no `github-pages` artifact right after upload (`actions/deploy-pages#451`). Remove the step once that issue is fixed. After a push, confirm the run succeeded (`gh run list --limit 1`) before saying a change is live.

## Key Patterns

- **CSS**: mobile-first, breakpoint at 768px, BEM-inspired class names. Colors come from the `tar.css` custom properties (`--tar`, `--tar-up`, `--ink`, `--line`, `--oak`).
- **JavaScript**: one IIFE per file, IntersectionObserver for lazy loading and scroll effects, passive listeners.
- **Accessibility**: semantic HTML, ARIA labels, visible focus, and `prefers-reduced-motion` respected.
- **Third parties**: nothing is requested from YouTube until a visitor clicks a video. Instagram posts are linked cards, not embeds.

## Podcast (added 2026-09-07)

`listen/index.html` (moved from `podcast/` on 2026-09-18 to match the menu word; `podcast/index.html` is now only a redirect that keeps the `#part-N` hash) is the audiobook-documentary player for *A House-Shaped House* (eight chapters, ~2 h 3 min). It reuses `css/main.css` and adds `css/podcast.css` and `js/podcast.js`. Audio lives in `media/podcast/` as 96 kbps mono MP3 (about 87 MB total; GitHub rejects files over 100 MB, so never commit WAV masters). `listen/feed.xml` is a hand-built RSS feed with iTunes tags; enclosure URLs and `length` (byte size) must be updated if an MP3 is replaced. The old feed address, `podcast/feed.xml`, is a generated copy of the feed with an `<itunes:new-feed-url>` tag pointing to `listen/feed.xml` (GitHub Pages cannot redirect a file, and this tag is how podcast apps follow a moved feed); after any change to `listen/feed.xml`, run `sh scratch/build-page/old_feed.sh` in the Echo Pond workspace. Deep links take the form `listen/#part-3&t=8m40s`. The player stores resume position and speed in `localStorage`.

## Watch page (added 2026-09-18)

`watch/index.html` is a curated companion to the article: NS Builders' YouTube episodes in build order, each paired with a Motif Media photograph, then Instagram moments and a few of the owners' own clips. It reuses `css/main.css` and `js/main.js` and adds `css/watch.css`. Media lives in `media/watch/` (photos at 2000 px, loops at 720p H.264 with poster JPGs).

- YouTube is click-to-load: `.yt[data-yt="<video id>"]` shows a local poster, and `initYouTubeEmbeds()` in `js/main.js` inserts a `youtube-nocookie.com` iframe only on click. Nothing is requested from YouTube before that.
- Instagram posts are linked cards with local stills, not embeds.
- Captions are written for this site; the YouTube title is secondary. No em dashes.
- Credits: "Motif Media" links to https://www.motifmedia.com/ wherever it appears, and the footer links Of Possible's project page (https://www.ofpossible.com/echo-pond-residence).
- The hero video has an H.264 source (`media/video/hero.mp4`) ahead of the original HEVC `.mov`.
- "From above" (`#moments`, 2026-09-18; replaced "Moments") is generated by `scratch/build-page/above_gallery.py`, between `ABOVE` markers: a 76-second silent film (`media/watch/from-above.mp4`, 1080p; cut by `scratch/from-above/make_film.py` from aerial scene-splits of NS Builders' films plus Motif Media stills). It runs the full width of the window (`.above-film`, 100vw; `body` clips the scrollbar's few pixels), muted and looping, with no heading, controls, caption or intro line, at Chris's request (the section carries `aria-label="From above"`; the menu word is "Drone"). The video is `.lazy-video` with `data-play-in-view`: `initLazyVideos()` in `js/main.js` loads it near the viewport, plays it muted when half is on screen, pauses it when it leaves, and never overrides a viewer's own pause. The 24-still drone gallery is off (`SHOW_GALLERY = False`; Chris chose the film alone) and its files are not in the repo. The Instagram cards below are hand-written.
- "House-Shaped House" (`#gable`, heading centered, 2026-09-18; menu word "Gable") is generated by `scratch/build-page/gable_sequence.py`, between `GABLE` markers: five square-on Motif Media photographs of the gable, June 2025 to January 2026, cropped from measured points (peak and base of wall) so the composition matches, always on one line (`.gallery--gable`). Two workers' faces are softened in the export (`FACES` in the script); keep that if the crops change.
- "Also from NS Builders" (end of `#build`) is four small click-to-load cards in a 2x2 grid from 600 px up (`.also-grid`, posters `also-NN.jpg` are Motif Media photographs, not YouTube thumbnails, which show faces).
- "Start to Finish" (`#start-to-finish`, added 2026-11-27) sits between the drone film and the intro paragraph: NS Builders' 43:50 whole-build film (`Er6PTmUzUZE`) as the page's main video, on a lighter full-width band (`.watch-main`, same column math as `.watch-finished`). Poster `yt-start-to-finish.jpg` is the film's own YouTube cover image (1280x720), at Chris's request; it shows no face. This is the one exception to the no-YouTube-thumbnails rule. The caption is NS Builders' own YouTube description (first line plus the "No talking" paragraph), and the credit line reads "Cover image courtesy of NS Builders · Produced by Motif Media", both at Chris's request. Its `EPISODES` row in `seo_extras.py` has section `None` (no single Build section to link).
- `.watch-finished` is a full-width band; its side padding (`--gutter`) keeps its contents on the same 1000px column as the other sections. It has no visible heading (Chris's request); the section carries an `aria-label`.
- Navigation is two-level (2026-09-18): the primary menu is pages (Read = the article, Watch, and Listen on the podcast page only until the podcast is linked site-wide), with `.is-current` on the current page. The article's section links (Site, Material, Space, History, Landscape) are a second row, `.site-subnav`. Every page carries its own `.site-subnav` row for its own sections (header class `site-header--sub`); new pages should follow the pattern.
- "The finished house" (`#finished`, added 2026-09-18) sits between the build sequence and Moments: seven summer 2026 photographs from an @nsbuilders post, the same seven that close the photobook (`media/watch/finished-NN.jpg`, about 934 px, cropped from Story screenshots; replace with original exports if NS Builders supplies them). Credit reads "courtesy of NS Builders" because the photographer is not confirmed. `initGallery()` handles any number of `[data-gallery]` blocks; `data-credit` overrides the default Motif Media lightbox credit.
- Responsive header (2026-09-18): below 768 px the page row stays fixed and centered and only `.site-subnav` swipes sideways (44 px tap targets, edge fade); 768 to 1023 px tightens spacing. `initSectionSpy()` marks the section being read with `.is-active`. The hamburger drawer is unused.
- echopond.org points at GitHub Pages directly (since 2026-09-18; four apex A records and a `www` CNAME at GoDaddy, `CNAME` set in the repo's Pages settings). The earlier masked forward and its frame break-out script are gone. `echopond.github.io/site/` redirects to the domain.
- The footer on both pages carries the Motif Media logo (`assets/images/motif-media-white.svg`).

## Listen page is hidden until launch (2026-09-18)

The podcast page and feed still work at their direct URLs, but nothing links to them, the article no longer advertises the RSS feed, and the page carries `noindex`. Every hidden piece is marked `LISTEN-HIDDEN`. To launch: `grep -rn LISTEN-HIDDEN .`, then uncomment the Listen links in the Read and Watch menus (desktop and mobile), restore the RSS `<link>` in `index.html`, delete the robots meta line in `listen/index.html`, and remove `Disallow: /listen/` from `robots.txt`.

## Build page (added 2026-09-18)

`build/index.html` explains how the house is made, ground up, for architects, builders and general readers. It is generated: edit `scratch/build-page/make_page.py` (copy and structure) and `export_photos.py` (Motif Media crops and captions, written to `photos.json`) in the Echo Pond workspace, then re-run both, and then `python3 scratch/site-next/build_v3.py --publish`, which reapplies the tar design (fonts, icon, `tar.css`, `place.js`) to any page the generators rewrote; without it the regenerated page reverts to the old head. Do not hand-edit the HTML. It adds `css/build.css` and reuses `main.css`, `watch.css` and the `[data-gallery]` lightbox. Media lives in `media/build/` (2000 px plus `-thumb` at 900 px).

- Every figure on the page has a Publish row with two independent sources in `scratch/build-page/03_claims.md`. Held items stay off the page until settled. No costs, no street address, no floor or site plans. The envelope is described as "Passive House-level"; no test figure is stated.
- The Drawings section (sections and elevations from the June 2024 permit set) is switched off with `SHOW_DRAWINGS = False` until Vincent Appel approves; the exported sheets are held in `scratch/build-page/drawings-held/`, not in this repo. Only the wall section from A-401 is published, in "The wall". No image may include the permit set's title block.
- Below 1024 px the section row (`.site-subnav`) is start-aligned so a long row can scroll to its first link; auto margins center a row that fits.
- Build page video cards (`a.build-video[data-yt]`) play in a dialog on the same page (`initVideoModal()` in `js/main.js`, styles in `build.css`): click-to-load from `youtube-nocookie.com`, Escape, click outside or the close button dismisses and stops playback, focus returns to the card. The `href` is the YouTube URL, used only without JavaScript or on a modified click.
- Stylesheet and script links carry a `?v=` stamp (set in each page and in `make_page.py`). Bump it whenever CSS or JS changes, or returning visitors see a cached copy.
- The photographs at the top of the Build page are section links (`.build-tiles`, generated from `TILES` in `export_photos.py`): one tile per section, the menu word shown on hover or focus and always shown on touch screens. The Wall tile is double width so eleven tiles fill a 2, 4 or 6 column grid. The section row and the tiles list the same eleven sections; Brief and Team are not in either. The Furnishings tile is the owner's own photograph, credited as such.
- Company names on the Build page link to the company homepage (never a product page). `LINKS` in `make_page.py` maps name to verified URL, and `linked()` links the first mention in each spec value and in the Team and product lists. Add a URL only after fetching it and confirming the company; unconfirmed names stay plain text.

## Search, sharing and analytics (added 2026-09-18)

- Canonical URL, Open Graph / Twitter tags and JSON-LD for every page come from `scratch/build-page/seo_head.py` in the Echo Pond workspace (block between `<!-- SEO -->` markers). Run it to refresh `index.html` and `watch/index.html`; `make_page.py` imports it for Build. The podcast page stays `noindex` until launch. Structured data gives the place as Canton, Massachusetts only: no street address, no coordinates.
- `BASE` in `seo_head.py` is `https://echopond.org/`. The same address appears in `sitemap.xml`, `robots.txt`, `llms.txt` and `listen/feed.xml`; change them together if the address ever changes.
- `js/analytics.js` loads Google Analytics 4 only when `GA_ID` is set in that file. It skips visitors who send Global Privacy Control or Do Not Track, and sends `video_open` and `photo_open` events.
- `llms.txt` is a plain summary of the site for AI assistants; keep its facts in step with the Build page.
- `scratch/build-page/seo_extras.py` writes the `VideoObject` data on Watch (between `<!-- VIDEOS -->` markers), the Watch-to-Build links on each episode's meta line, and `sitemap.xml` with its image entries. Run order: `export_photos.py` (if photos changed), `seo_head.py`, `make_page.py`, `seo_extras.py`. Do not hand-edit `sitemap.xml`. A new episode needs a row in `EPISODES` (upload date and length from its YouTube page).
- Search engines (2026-09-18): echopond.org is verified in Google Search Console (`googleb1442ca4b34b9f16.html` at the root; do not delete) and imported into Bing Webmaster Tools, with `sitemap.xml` submitted to both. IndexNow is set up: the 32-character `.txt` key file at the root must stay, and after a publish has deployed, run `sh scratch/build-page/indexnow.sh` (Echo Pond workspace) to tell Bing and the other IndexNow engines which pages changed. Google does not use IndexNow.

## Iteration loop (added 2026-09-25)

The Sep 18 redesign ran as one session of about 2,100 turns, 12 compactions, and roughly 40 one-line copy tweaks, on Fable. Work this way instead:

- **One feature per session.** Finish it, commit, then `/rename` and `/clear` before the next one.
- **Batch the edits.** After a change, show the page (a local screenshot, or a private Artifact preview of a public page) and ask Chris for all his edits at once, as a list or as Artifact comments. Apply the whole batch in one pass, then show it again. Never publish correspondence, private drawings, or anything under a privacy gate as an Artifact, even a private one.
- **Model.** Build and layout work runs on Opus 5.5, which is better at code and reads screenshots accurately. Keep Fable for judging prose on the site.
- **Facts.** Check claims about the house against `../house-facts.md` before writing them into copy.
