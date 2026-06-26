/**
 * Baari Sports Center — script.js
 * Ultra-lean interaction layer. Zero frameworks. Zero state overhead.
 * Responsibilities:
 *   1. WhatsApp intent encoder for all consult CTAs and order buttons
 *   2. Floating consult widget show/hide
 *   3. Mobile nav drawer toggle
 *   4. Header scroll shadow
 */

(function () {
  'use strict';

  /* ─── CONFIG ──────────────────────────────────────────────── */
  var WA_NUMBER  = '254702453813';
  var WA_BASE    = 'https://wa.me/' + WA_NUMBER;
  var WA_CATALOG = 'https://wa.me/c/' + WA_NUMBER;

  /* ─── WHATSAPP INTENT ENCODER ─────────────────────────────── */

  /**
   * Build a WhatsApp order/enquiry link with a pre-filled message.
   * "Order via WhatsApp" buttons use the specific order template.
   * "Chat with Expert" buttons use the consultation template.
   * General enquiry (panel, callout) uses the fallback template.
   *
   * @param {string} productLabel  - Product name or context string
   * @param {string} [intent]      - 'order' | 'consult' | undefined (general)
   * @returns {string} Full WhatsApp URL with encoded text param
   */
  function buildWALink(productLabel, intent) {
    var message;

    if (!productLabel || productLabel === 'general enquiry') {
      message = 'Hi Baari Sports Center! I need some help with sizing, kit printing, or a group order. Could we chat?';
    } else if (intent === 'order') {
      // Primary CTA — specific order intent message
      message = 'Hello Baari Sports, I\u2019m interested in the ' + productLabel + ' from your website. Can you share the price and availability?';
    } else {
      // Expert consult — friendly sizing / advice framing
      message = 'Hi Baari Sports Center! I\u2019m interested in the *' + productLabel + '*. Could you help me with sizing, availability, and pricing?';
    }

    return WA_BASE + '?text=' + encodeURIComponent(message);
  }

  /* ─── DELEGATED CLICK HANDLER FOR ALL PRODUCT BUTTONS ─────── */
  // Single listener on document handles all current and future cards.
  // Differentiates "order" vs "consult" by the btn class on the element.
  document.addEventListener('click', function (e) {
    // Walk up from click target to find a [data-product] ancestor
    var target = e.target.closest('[data-product]');
    if (!target) return;

    // Only intercept elements that don't already navigate elsewhere
    var href = target.getAttribute('href');
    if (href && href !== '#' && !href.startsWith('javascript')) return;

    e.preventDefault();

    var productLabel = target.getAttribute('data-product');

    // Determine intent: "Order via WhatsApp" vs "Chat with Expert"
    var intent = 'consult'; // default
    if (
      target.classList.contains('card-btn--catalog') ||
      target.classList.contains('callout-cta')
    ) {
      intent = 'order';
    }

    var link = buildWALink(productLabel, intent);
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
    if (panelOpen) { closePanel(); } else { openPanel(); }
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

  // Wire the panel's chat button to the general enquiry encoder
  if (panelChat) {
    panelChat.addEventListener('click', function (e) {
      e.preventDefault();
      var link = buildWALink('general enquiry');
      closePanel();
      window.open(link, '_blank', 'noopener,noreferrer');
    });
  }

  // Close panel when clicking outside
  document.addEventListener('click', function (e) {
    if (!panelOpen) return;
    var widget = document.getElementById('consultWidget');
    if (widget && !widget.contains(e.target)) { closePanel(); }
  });

  // Close panel on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panelOpen) {
      closePanel();
      if (trigger) trigger.focus();
    }
  });

  /* ─── AUTO-REVEAL WIDGET ON SCROLL ───────────────────────── */
  var hasScrolled = false;

  window.addEventListener('scroll', function () {
    if (hasScrolled) return;
    if (window.scrollY > 300) {
      hasScrolled = true;
      // openPanel(); — disabled by default; uncomment to auto-expand
    }
  }, { passive: true });

  /* ─── MOBILE NAV DRAWER ───────────────────────────────────── */
  var navToggle    = document.getElementById('navToggle');
  var mobileDrawer = document.getElementById('mobileDrawer');
  var drawerOpen   = false;

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
      link.addEventListener('click', function () { closeDrawer(); });
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
