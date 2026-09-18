# CLAUDE.md

Project-specific instructions for Claude Code.

## Project Overview

Echo Pond is a static marketing website for a residential architecture project by Of Possible architects and NS Builders. It's a single-page presentation site showcasing a 2,600 sq ft home in Canton, Massachusetts.

## Tech Stack

- **HTML5** - Semantic markup, single `index.html` file
- **CSS3** - Vanilla CSS in `css/main.css` (no preprocessors)
- **JavaScript** - Vanilla ES6+ in `js/main.js` (no frameworks or bundlers)
- **Fonts** - Google Fonts (Inter, Lora, Cormorant Garamond)
- **Deployment** - GitHub Pages via GitHub Actions

## Project Structure

```
/
├── index.html          # Single-page application (main content)
├── css/main.css        # All styles (~950 lines)
├── js/main.js          # All interactivity (~265 lines)
├── media/              # Video and audio assets
│   ├── images/         # Photos
│   └── video/          # Hero and content videos
├── assets/images/      # UI assets and logos
└── .github/workflows/  # GitHub Pages deployment
```

## Development Workflow

This is a zero-configuration static site:

1. Edit HTML, CSS, or JS files directly
2. Commit changes with descriptive messages
3. Push to feature branch or main
4. GitHub Actions auto-deploys to GitHub Pages

**No build step, no linting, no tests required.**

## Key Patterns

### CSS Organization
- Mobile-first responsive design
- Breakpoint at 768px for mobile menu
- BEM-inspired class naming
- Sections organized by feature/component

### JavaScript Patterns
- IIFE pattern for encapsulation
- IntersectionObserver for lazy loading and scroll animations
- RequestAnimationFrame for scroll performance
- Passive event listeners

### Accessibility
- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`)
- ARIA labels and `aria-expanded` attributes
- Focus management for mobile menu
- Respects `prefers-reduced-motion`

## Key Features

- **Audio toggle**: Fixed button to play/pause background audio
- **Smart header**: Hides on scroll down, reappears on scroll up
- **Lazy video loading**: Videos load when entering viewport
- **Scroll animations**: Fade-in effects using IntersectionObserver
- **Mobile navigation**: Hamburger menu below 768px

## Important Files

| File | Purpose |
|------|---------|
| `index.html` | All page content and structure |
| `css/main.css` | Complete styling |
| `js/main.js` | All interactivity |
| `.github/workflows/static.yml` | Deployment configuration |

## Podcast (added 2026-09-07)

`podcast/index.html` is the audiobook-documentary player for *A House-Shaped House* (eight chapters, ~2 h 3 min). It reuses `css/main.css` and adds `css/podcast.css` and `js/podcast.js`. Audio lives in `media/podcast/` as 96 kbps mono MP3 (about 87 MB total; GitHub rejects files over 100 MB, so never commit WAV masters). `podcast/feed.xml` is a hand-built RSS feed with iTunes tags; enclosure URLs and `length` (byte size) must be updated if an MP3 is replaced. Deep links take the form `podcast/#part-3&t=8m40s`. The player stores resume position and speed in `localStorage`.

## Watch page (added 2026-09-18)

`watch/index.html` is a curated companion to the article: NS Builders' YouTube episodes in build order, each paired with a Motif Media photograph, then Instagram moments and a few of the owners' own clips. It reuses `css/main.css` and `js/main.js` and adds `css/watch.css`. Media lives in `media/watch/` (photos at 2000 px, loops at 720p H.264 with poster JPGs).

- YouTube is click-to-load: `.yt[data-yt="<video id>"]` shows a local poster, and `initYouTubeEmbeds()` in `js/main.js` inserts a `youtube-nocookie.com` iframe only on click. Nothing is requested from YouTube before that.
- Instagram posts are linked cards with local stills, not embeds.
- Captions are written for this site; the YouTube title is secondary. No em dashes.
- Credits: "Motif Media" links to https://www.motifmedia.com/ wherever it appears, and the footer links Of Possible's project page (https://www.ofpossible.com/echo-pond-residence).
- The hero video has an H.264 source (`media/video/hero.mp4`) ahead of the original HEVC `.mov`.
- "Moments" is a 24-photo Motif Media gallery (`.gallery[data-gallery]`, thumbnails `gallery-NN-thumb.jpg` linking to `gallery-NN.jpg`); `initGallery()` in `js/main.js` adds the lightbox. No identifiable faces in any photo. The Instagram cards sit below it.
- Navigation is two-level (2026-09-18): the primary menu is pages (Read = the article, Watch, and Listen on the podcast page only until the podcast is linked site-wide), with `.is-current` on the current page. The article's section links (Site, Material, Space, History, Landscape) are a second row, `.site-subnav`. Every page carries its own `.site-subnav` row for its own sections (header class `site-header--sub`); new pages should follow the pattern.
- "The finished house" (`#finished`, added 2026-09-18) sits between the build sequence and Moments: seven summer 2026 photographs from an @nsbuilders post, the same seven that close the photobook (`media/watch/finished-NN.jpg`, about 934 px, cropped from Story screenshots; replace with original exports if NS Builders supplies them). Credit reads "courtesy of NS Builders" because the photographer is not confirmed. `initGallery()` handles any number of `[data-gallery]` blocks; `data-credit` overrides the default Motif Media lightbox credit.
- Responsive header (2026-09-18): below 768 px the page row stays fixed and centered and only `.site-subnav` swipes sideways (44 px tap targets, edge fade); 768 to 1023 px tightens spacing. `initSectionSpy()` marks the section being read with `.is-active`. The hamburger drawer is unused.
- echopond.org is a GoDaddy masked forward: a frameset with no viewport tag, so phones would render the desktop layout shrunk. Every page carries a small break-out script in `<head>` (skipped with `?noframe`). New pages need it too, until the domain points at GitHub Pages directly.
- The footer on both pages carries the Motif Media logo (`assets/images/motif-media-white.svg`).

## Listen page is hidden until launch (2026-09-18)

The podcast page and feed still work at their direct URLs, but nothing links to them, the article no longer advertises the RSS feed, and the page carries `noindex`. Every hidden piece is marked `LISTEN-HIDDEN`. To launch: `grep -rn LISTEN-HIDDEN .`, then uncomment the Listen links in the Read and Watch menus (desktop and mobile), restore the RSS `<link>` in `index.html`, and delete the robots meta line in `podcast/index.html`.

## Build page (added 2026-09-18)

`build/index.html` explains how the house is made, ground up, for architects, builders and general readers. It is generated: edit `scratch/build-page/make_page.py` (copy and structure) and `export_photos.py` (Motif Media crops and captions, written to `photos.json`) in the Echo Pond workspace, then re-run both. Do not hand-edit the HTML. It adds `css/build.css` and reuses `main.css`, `watch.css` and the `[data-gallery]` lightbox. Media lives in `media/build/` (2000 px plus `-thumb` at 900 px).

- Every figure on the page has a Publish row with two independent sources in `scratch/build-page/03_claims.md`. Held items stay off the page until settled. No costs, no street address, no floor or site plans. The envelope is described as "Passive House-level"; no test figure is stated.
- The Drawings section (sections and elevations from the June 2024 permit set) is switched off with `SHOW_DRAWINGS = False` until Vincent Appel approves; the exported sheets are held in `scratch/build-page/drawings-held/`, not in this repo. Only the wall section from A-401 is published, in "The wall". No image may include the permit set's title block.
- Below 1024 px the section row (`.site-subnav`) is start-aligned so a long row can scroll to its first link; auto margins center a row that fits.
- Build page video cards (`a.build-video[data-yt]`) play in a dialog on the same page (`initVideoModal()` in `js/main.js`, styles in `build.css`): click-to-load from `youtube-nocookie.com`, Escape, click outside or the close button dismisses and stops playback, focus returns to the card. The `href` is the YouTube URL, used only without JavaScript or on a modified click.
- Stylesheet and script links carry a `?v=` stamp (set in each page and in `make_page.py`). Bump it whenever CSS or JS changes, or returning visitors see a cached copy.
- The photographs at the top of the Build page are section links (`.build-tiles`, generated from `TILES` in `export_photos.py`): one tile per section, the menu word shown on hover or focus and always shown on touch screens. The Wall tile is double width so eleven tiles fill a 2, 4 or 6 column grid. The section row and the tiles list the same eleven sections; Brief and Team are not in either. The Furnishings tile is the owner's own photograph, credited as such.
