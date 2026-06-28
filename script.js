/**
 * Baari Sports Center — script.js
 * Zero frameworks. Zero state overhead.
 *
 * Updates applied:
 *   1. GPU-smooth horizontal scroll — handled entirely in CSS (will-change, -webkit-overflow-scrolling)
 *   2. Right-side slide-in nav drawer with dark overlay + close on overlay tap / Escape
 *   3. FAB → interactive directory card → intent-routed pre-filled WhatsApp links
 *
 * Original behaviours retained:
 *   - Delegated product card WA encoder
 *   - Header scroll shadow
 *   - Smooth anchor close
 */

(function () {
  'use strict';

  /* ─── CONFIG ──────────────────────────────────────────────── */
  var WA_NUMBER  = '254702453813';
  var WA_BASE    = 'https://wa.me/' + WA_NUMBER;
  var WA_CATALOG = 'https://wa.me/c/' + WA_NUMBER;

  /* ─── WHATSAPP INTENT ENCODER ─────────────────────────────── */
  /**
   * Build a WhatsApp link with a pre-filled message.
   * intent === 'directory'  →  directory routing template
   * intent === 'order'      →  specific order template
   * intent === 'consult'    →  sizing/advice template
   * no intent / 'general'   →  fallback template
   */
  function buildWALink(productLabel, intent) {
    var message;

    if (!productLabel || productLabel === 'general enquiry') {
      message = 'Hi Baari Sports Center! I need some help with sizing, kit printing, or a group order. Could we chat?';
    } else if (intent === 'directory') {
      // Directory card routing — professional, intent-specific phrasing
      message = 'Hi Baari Sports, I am visiting your storefront and I would like to make an inquiry regarding: ' + productLabel + '.';
    } else if (intent === 'order') {
      message = 'Hello Baari Sports, I\u2019m interested in the ' + productLabel + ' from your website. Can you share the price and availability?';
    } else {
      // consult / expert chat
      message = 'Hi Baari Sports Center! I\u2019m interested in the *' + productLabel + '*. Could you help me with sizing, availability, and pricing?';
    }

    return WA_BASE + '?text=' + encodeURIComponent(message);
  }

  /* ═══════════════════════════════════════════════════════════
     DELEGATED CLICK: PRODUCT CARDS & CALLOUT
  ═══════════════════════════════════════════════════════════ */
  document.addEventListener('click', function (e) {
    // Walk up from click target to find a [data-product] ancestor
    var target = e.target.closest('[data-product]');
    if (!target) return;

    // Directory buttons are handled by their own listener below
    if (target.classList.contains('directory-btn')) return;

    // Only intercept elements that don't already navigate elsewhere
    var href = target.getAttribute('href');
    if (href && href !== '#' && !href.startsWith('javascript')) return;

    e.preventDefault();

    var productLabel = target.getAttribute('data-product');

    // Determine intent by class
    var intent = 'consult';
    if (
      target.classList.contains('card-btn--catalog') ||
      target.classList.contains('callout-cta')
    ) {
      intent = 'order';
    }

    window.open(buildWALink(productLabel, intent), '_blank', 'noopener,noreferrer');
  });

  /* ═══════════════════════════════════════════════════════════
     UPDATE 2 — RIGHT-SIDE NAV DRAWER
  ═══════════════════════════════════════════════════════════ */
  var navToggle      = document.getElementById('navToggle');
  var mobileDrawer   = document.getElementById('mobileDrawer');
  var navOverlay     = document.getElementById('navOverlay');
  var drawerCloseBtn = document.getElementById('drawerCloseBtn');
  var drawerOpen     = false;

  function openDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('drawer-open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    if (navOverlay) {
      navOverlay.classList.add('is-visible');
      navOverlay.setAttribute('aria-hidden', 'false');
    }
    if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
    drawerOpen = true;
    // Prevent body scroll while drawer is open
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('drawer-open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    if (navOverlay) {
      navOverlay.classList.remove('is-visible');
      navOverlay.setAttribute('aria-hidden', 'true');
    }
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    drawerOpen = false;
    document.body.style.overflow = '';
  }

  // Hamburger toggle
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      if (drawerOpen) { closeDrawer(); } else { openDrawer(); }
    });
  }

  // Close via ✕ button inside drawer
  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeDrawer();
    });
  }

  // Close when overlay (dark backdrop) is tapped
  if (navOverlay) {
    navOverlay.addEventListener('click', function () {
      closeDrawer();
    });
  }

  // Close drawer links (anchor taps)
  if (mobileDrawer) {
    mobileDrawer.querySelectorAll('.drawer-link').forEach(function (link) {
      link.addEventListener('click', function () {
        closeDrawer();
      });
    });
  }

  // Escape key closes drawer
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (drawerOpen) {
        closeDrawer();
        if (navToggle) navToggle.focus();
      }
    }
  });

  /* ═══════════════════════════════════════════════════════════
     UPDATE 3 — FAB + INTERACTIVE DIRECTORY CARD
  ═══════════════════════════════════════════════════════════ */
  var consultTrigger  = document.getElementById('consultTrigger');
  var consultDir      = document.getElementById('consultDirectory');
  var directoryClose  = document.getElementById('directoryClose');
  var consultWidget   = document.getElementById('consultWidget');
  var directoryOpen   = false;

  function openDirectory() {
    if (!consultDir) return;
    consultDir.setAttribute('aria-hidden', 'false');
    if (consultTrigger) consultTrigger.setAttribute('aria-expanded', 'true');
    directoryOpen = true;
  }

  function closeDirectory() {
    if (!consultDir) return;
    consultDir.setAttribute('aria-hidden', 'true');
    if (consultTrigger) consultTrigger.setAttribute('aria-expanded', 'false');
    directoryOpen = false;
  }

  function toggleDirectory() {
    if (directoryOpen) { closeDirectory(); } else { openDirectory(); }
  }

  // FAB tap — toggle directory (does NOT open WA directly)
  if (consultTrigger) {
    consultTrigger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDirectory();
    });
  }

  // Close via ✕ inside directory card
  if (directoryClose) {
    directoryClose.addEventListener('click', function (e) {
      e.stopPropagation();
      closeDirectory();
    });
  }

  // Directory option buttons — route to WhatsApp with intent-specific message
  if (consultDir) {
    consultDir.querySelectorAll('.directory-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var intent = btn.getAttribute('data-wa-intent');
        if (!intent) return;

        // Decode HTML entities (e.g. &amp; → &) from data attribute
        var decoded = intent.replace(/&amp;/g, '&');

        var link = buildWALink(decoded, 'directory');
        closeDirectory();
        window.open(link, '_blank', 'noopener,noreferrer');
      });
    });
  }

  // Close directory when clicking outside the widget
  document.addEventListener('click', function (e) {
    if (!directoryOpen) return;
    if (consultWidget && !consultWidget.contains(e.target)) {
      closeDirectory();
    }
  });

  // Escape key also closes directory
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && directoryOpen) {
      closeDirectory();
      if (consultTrigger) consultTrigger.focus();
    }
  });

  /* ═══════════════════════════════════════════════════════════
     HEADER SCROLL SHADOW
  ═══════════════════════════════════════════════════════════ */
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

  /* ═══════════════════════════════════════════════════════════
     SMOOTH ANCHOR CLOSE
     Close both drawer and directory when in-page anchors are tapped
  ═══════════════════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function () {
      if (drawerOpen) closeDrawer();
      if (directoryOpen) closeDirectory();
    });
  });

})();
