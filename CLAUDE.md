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
