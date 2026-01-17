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
  // Audio Toggle
  // ============================================

  function initAudioToggle() {
    if (!elements.audio || !elements.audioToggle) return;

    elements.audioToggle.addEventListener('click', toggleAudio);
  }

  function toggleAudio() {
    state.audioMuted = !state.audioMuted;
    elements.audio.muted = state.audioMuted;
    elements.audioToggle.classList.toggle('muted', state.audioMuted);
    elements.audioToggle.setAttribute('aria-label', state.audioMuted ? 'Unmute audio' : 'Mute audio');
  }

  // ============================================
  // Initialize
  // ============================================

  function init() {
    initHeaderScroll();
    initMobileNav();
    initScrollReveal();
    initSmoothScroll();
    initAudioToggle();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
