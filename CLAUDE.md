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
- The footer on both pages carries the Motif Media logo (`assets/images/motif-media-white.svg`).
