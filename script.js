/**
 * Baari Sports Center — script.js
 * Ultra-lean interaction layer. Zero frameworks. Zero state overhead.
 * Responsibilities:
 *   1. WhatsApp intent encoder for all consult CTAs
 *   2. Floating consult widget show/hide
 *   3. Mobile nav drawer toggle
 *   4. Header scroll shadow
 */

(function () {
  'use strict';

  /* ─── CONFIG ──────────────────────────────────────────────── */
  var WA_NUMBER = '254702453813';
  var WA_BASE   = 'https://wa.me/' + WA_NUMBER;
  var WA_CATALOG = 'https://wa.me/c/' + WA_NUMBER;

  /* ─── WHATSAPP INTENT ENCODER ─────────────────────────────── */

  /**
   * Build a WhatsApp deep-link with a pre-filled message.
   * @param {string} productLabel - Product name / context string
   * @returns {string} Full WhatsApp URL with encoded text param
   */
  function buildConsultLink(productLabel) {
    var message = productLabel && productLabel !== 'general enquiry'
      ? 'Hi Baari Sports Center! I\u2019m interested in the *' + productLabel + '*. Could you help me with sizing, availability, and pricing?'
      : 'Hi Baari Sports Center! I need some help with sizing, kit printing, or a group order. Could we chat?';
    return WA_BASE + '?text=' + encodeURIComponent(message);
  }

  /**
   * Resolve the correct WhatsApp link for a given trigger element.
   * Elements with [data-product] get a personalized consult link.
   * Elements without it fall back to the catalog URL.
   * @param {HTMLElement} el
   * @returns {string}
   */
  function resolveLink(el) {
    var product = el.getAttribute('data-product');
    if (product !== null) {
      return buildConsultLink(product);
    }
    return WA_CATALOG;
  }

  /* ─── CONSULT CTA DELEGATION ──────────────────────────────── */
  // Single delegated listener on document — handles all current and
  // dynamically-added consult buttons without looping over them.
  document.addEventListener('click', function (e) {
    var target = e.target.closest('[data-product]');
    if (!target) return;

    // Only intercept anchor tags and buttons; let native links through
    // if they already point somewhere other than '#'
    var href = target.getAttribute('href');
    if (href && href !== '#' && !href.startsWith('javascript')) return;

    e.preventDefault();
    var link = buildConsultLink(target.getAttribute('data-product'));
    window.open(link, '_blank', 'noopener,noreferrer');
  });

  /* ─── FLOATING CONSULT WIDGET ─────────────────────────────── */
  var trigger   = document.getElementById('consultTrigger');
  var panel     = document.getElementById('consultPanel');
  var closeBtn  = document.getElementById('panelClose');
  var panelChat = document.getElementById('panelChatBtn');

  var panelOpen = false;

  function openPanel() {
    panel.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    panelOpen = true;
  }

  function closePanel() {
    panel.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    panelOpen = false;
  }

  function togglePanel() {
    if (panelOpen) {
      closePanel();
    } else {
      openPanel();
    }
  }

  if (trigger) {
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      togglePanel();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closePanel();
    });
  }

  // Wire the panel's chat button to the general consult encoder
  if (panelChat) {
    panelChat.addEventListener('click', function (e) {
      e.preventDefault();
      var link = buildConsultLink('general enquiry');
      closePanel();
      window.open(link, '_blank', 'noopener,noreferrer');
    });
  }

  // Close panel when clicking outside
  document.addEventListener('click', function (e) {
    if (!panelOpen) return;
    var widget = document.getElementById('consultWidget');
    if (widget && !widget.contains(e.target)) {
      closePanel();
    }
  });

  // Close panel on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panelOpen) {
      closePanel();
      if (trigger) trigger.focus();
    }
  });

  /* ─── AUTO-REVEAL WIDGET ON SCROLL ───────────────────────── */
  // Widget starts visible; this logic can add a reveal-on-scroll
  // behaviour if desired — currently kept as passive scroll tracking.
  var hasScrolled = false;

  window.addEventListener('scroll', function () {
    if (hasScrolled) return;
    if (window.scrollY > 300) {
      hasScrolled = true;
      // Optionally auto-expand panel after first significant scroll
      // openPanel(); — disabled by default; uncomment if desired
    }
  }, { passive: true });

  /* ─── MOBILE NAV DRAWER ───────────────────────────────────── */
  var navToggle      = document.getElementById('navToggle');
  var mobileDrawer   = document.getElementById('mobileDrawer');
  var drawerOpen     = false;

  function openDrawer() {
    mobileDrawer.setAttribute('aria-hidden', 'false');
    navToggle.setAttribute('aria-expanded', 'true');
    drawerOpen = true;
  }

  function closeDrawer() {
    mobileDrawer.setAttribute('aria-hidden', 'true');
    navToggle.setAttribute('aria-expanded', 'false');
    drawerOpen = false;
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      if (drawerOpen) {
        closeDrawer();
      } else {
        openDrawer();
        closePanel(); // always close consult panel when nav opens
      }
    });
  }

  // Close drawer when a drawer link is tapped
  if (mobileDrawer) {
    mobileDrawer.querySelectorAll('.drawer-link').forEach(function (link) {
      link.addEventListener('click', function () {
        closeDrawer();
      });
    });
  }

  /* ─── HEADER SCROLL SHADOW ────────────────────────────────── */
  var header = document.querySelector('.site-header');

  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 8) {
        header.style.boxShadow = '0 2px 24px rgba(0,0,0,0.6)';
      } else {
        header.style.boxShadow = 'none';
      }
    }, { passive: true });
  }

  /* ─── SMOOTH ANCHOR CLOSE ─────────────────────────────────── */
  // When any in-page anchor is clicked, close the mobile drawer
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function () {
      if (drawerOpen) closeDrawer();
    });
  });

})();
