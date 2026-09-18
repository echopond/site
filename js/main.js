/**
 * Echo Pond V5 - The Local Project Style
 * Minimal, elegant interactions
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    scrollThreshold: 50,
    headerHideThreshold: 300,
    observerThreshold: 0.1,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  // DOM Elements
  const elements = {
    header: document.querySelector('.site-header'),
    navToggle: document.querySelector('.nav-toggle'),
    mobileMenu: document.querySelector('.mobile-menu'),
    fadeElements: document.querySelectorAll('.article-body, .full-image, .image-grid, .article-credits, .related'),
    audio: document.getElementById('bg-audio'),
    audioToggle: document.getElementById('audio-toggle')
  };

  // State
  let state = {
    lastScrollY: 0,
    headerVisible: true,
    menuOpen: false,
    ticking: false,
    audioMuted: false
  };

  // ============================================
  // Header Scroll Behavior
  // ============================================

  function initHeaderScroll() {
    if (!elements.header) return;

    window.addEventListener('scroll', () => {
      if (!state.ticking) {
        requestAnimationFrame(updateHeader);
        state.ticking = true;
      }
    }, { passive: true });
  }

  function updateHeader() {
    const currentScrollY = window.scrollY;

    // Add scrolled class
    if (currentScrollY > CONFIG.scrollThreshold) {
      elements.header.classList.add('scrolled');
    } else {
      elements.header.classList.remove('scrolled');
    }

    // Hide/show on scroll direction
    if (currentScrollY > CONFIG.headerHideThreshold) {
      if (currentScrollY > state.lastScrollY + 5 && state.headerVisible) {
        elements.header.classList.add('hidden');
        state.headerVisible = false;
      } else if (currentScrollY < state.lastScrollY - 5 && !state.headerVisible) {
        elements.header.classList.remove('hidden');
        state.headerVisible = true;
      }
    } else {
      elements.header.classList.remove('hidden');
      state.headerVisible = true;
    }

    state.lastScrollY = currentScrollY;
    state.ticking = false;
  }

  // ============================================
  // Mobile Navigation
  // ============================================

  function initMobileNav() {
    if (!elements.navToggle || !elements.mobileMenu) return;

    elements.navToggle.addEventListener('click', toggleMenu);

    // Close on link click
    elements.mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on clicking overlay (outside the nav)
    elements.mobileMenu.addEventListener('click', (e) => {
      if (e.target === elements.mobileMenu) {
        closeMenu();
      }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.menuOpen) {
        closeMenu();
        elements.navToggle.focus();
      }
    });
  }

  function toggleMenu() {
    state.menuOpen ? closeMenu() : openMenu();
  }

  function openMenu() {
    state.menuOpen = true;
    elements.navToggle.setAttribute('aria-expanded', 'true');
    elements.mobileMenu.classList.add('is-open');
    elements.mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    state.menuOpen = false;
    elements.navToggle.setAttribute('aria-expanded', 'false');
    elements.mobileMenu.classList.remove('is-open');
    elements.mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // ============================================
  // Scroll Reveal
  // ============================================

  function initScrollReveal() {
    if (CONFIG.reducedMotion) {
      elements.fadeElements.forEach(el => {
        el.classList.add('visible');
      });
      return;
    }

    // Add fade-in class to elements
    elements.fadeElements.forEach(el => {
      el.classList.add('fade-in');
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: CONFIG.observerThreshold
    });

    elements.fadeElements.forEach(el => {
      observer.observe(el);
    });
  }

  // ============================================
  // Lazy Load Videos
  // ============================================

  function initLazyVideos() {
    const lazyVideos = document.querySelectorAll('.lazy-video');
    if (!lazyVideos.length) return;

    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const video = entry.target;
          const source = video.querySelector('source[data-src]');
          // With reduced motion, keep the poster and let the viewer press play
          if (CONFIG.reducedMotion && video.hasAttribute('poster')) {
            video.removeAttribute('autoplay');
            video.setAttribute('controls', '');
          }
          if (source) {
            source.src = source.dataset.src;
            video.load();
          }
          videoObserver.unobserve(video);
        }
      });
    }, {
      rootMargin: '200px 0px'
    });

    lazyVideos.forEach(video => {
      videoObserver.observe(video);
    });
  }

  // ============================================
  // Smooth Scroll for Internal Links
  // ============================================

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        const headerOffset = elements.header ? elements.header.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;

        window.scrollTo({
          top: targetPosition,
          behavior: CONFIG.reducedMotion ? 'auto' : 'smooth'
        });
      });
    });
  }

  // ============================================
  // Section row: mark the section being read
  // ============================================

  function initSectionSpy() {
    const subnav = document.querySelector('.site-subnav');
    if (!subnav || !('IntersectionObserver' in window)) return;

    const links = Array.from(subnav.querySelectorAll('a[href^="#"]'));
    const byId = {};
    links.forEach(link => {
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (target) byId[target.id] = link;
    });

    function activate(id) {
      links.forEach(link => {
        const on = link === byId[id];
        link.classList.toggle('is-active', on);
        if (on) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      // Keep the active link in view when the row is swipeable
      const link = byId[id];
      if (link && subnav.scrollWidth > subnav.clientWidth) {
        subnav.scrollTo({
          left: link.offsetLeft - (subnav.clientWidth - link.offsetWidth) / 2,
          behavior: CONFIG.reducedMotion ? 'auto' : 'smooth'
        });
      }
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) activate(entry.target.id);
      });
    }, { rootMargin: '-25% 0px -70% 0px' });

    Object.keys(byId).forEach(id => observer.observe(document.getElementById(id)));
  }

  // ============================================
  // Click-to-load YouTube
  // ============================================

  // Nothing is requested from YouTube until the viewer presses play
  function initGallery() {
    document.querySelectorAll('[data-gallery]').forEach(setupGallery);
  }

  function setupGallery(gallery) {
    const credit = gallery.dataset.credit || 'Photo by Motif Media.';
    const items = Array.from(gallery.querySelectorAll('.gallery-item'));
    let index = 0;
    let lastFocus = null;

    const box = document.createElement('div');
    box.className = 'lightbox';
    box.hidden = true;
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Photograph');
    box.innerHTML =
      '<button class="lightbox-close" type="button" aria-label="Close">&times;</button>' +
      '<button class="lightbox-prev" type="button" aria-label="Previous photograph">&lsaquo;</button>' +
      '<img alt="">' +
      '<p class="lightbox-caption"></p>' +
      '<button class="lightbox-next" type="button" aria-label="Next photograph">&rsaquo;</button>';
    document.body.appendChild(box);
    const img = box.querySelector('img');
    const caption = box.querySelector('.lightbox-caption');

    function show(i) {
      index = (i + items.length) % items.length;
      const item = items[index];
      img.src = item.href;
      img.alt = item.querySelector('img').alt;
      caption.textContent = item.dataset.caption + ' ' + credit + ' ' + (index + 1) + ' / ' + items.length;
    }

    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      box.querySelector('.lightbox-close').focus();
    }

    function close() {
      box.hidden = true;
      img.removeAttribute('src');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }

    items.forEach((item, i) => {
      item.addEventListener('click', e => {
        e.preventDefault();
        open(i);
      });
    });
    box.querySelector('.lightbox-close').addEventListener('click', close);
    box.querySelector('.lightbox-prev').addEventListener('click', () => show(index - 1));
    box.querySelector('.lightbox-next').addEventListener('click', () => show(index + 1));
    box.addEventListener('click', e => {
      if (e.target === box) close();
    });
    document.addEventListener('keydown', e => {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(index - 1);
      else if (e.key === 'ArrowRight') show(index + 1);
    });
  }

  function initYouTubeEmbeds() {
    document.querySelectorAll('.yt[data-yt]').forEach(wrapper => {
      const button = wrapper.querySelector('.yt-button');
      if (!button) return;

      button.addEventListener('click', () => {
        const iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube-nocookie.com/embed/' + wrapper.dataset.yt + '?autoplay=1&rel=0';
        iframe.title = button.getAttribute('aria-label') || 'Video';
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        iframe.allowFullscreen = true;
        wrapper.replaceChildren(iframe);
      });
    });
  }

  // ============================================
  // Audio Toggle
  // ============================================

  function initAudioToggle() {
    if (!elements.audio || !elements.audioToggle) return;

    // Start with audio paused
    state.audioPlaying = false;
    elements.audioToggle.addEventListener('click', toggleAudio);
  }

  function toggleAudio() {
    if (state.audioPlaying) {
      elements.audio.pause();
      state.audioPlaying = false;
      elements.audioToggle.classList.add('muted');
      elements.audioToggle.setAttribute('aria-label', 'Play audio');
    } else {
      elements.audio.play();
      state.audioPlaying = true;
      elements.audioToggle.classList.remove('muted');
      elements.audioToggle.setAttribute('aria-label', 'Pause audio');
    }
  }

  // ============================================
  // Initialize
  // ============================================

  function init() {
    initHeaderScroll();
    initMobileNav();
    initScrollReveal();
    initLazyVideos();
    initSmoothScroll();
    initSectionSpy();
    initYouTubeEmbeds();
    initGallery();
    initAudioToggle();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
