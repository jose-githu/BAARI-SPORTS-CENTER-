/* ═══════════════════════════════════════════════════════
   BAARI SPORTS CENTER — Digital Shelves
   script.js  ·  Shared Cart Logic + localStorage Persistence
   Kaelen Flynn Technologies
═══════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────── */
const WHATSAPP_NUMBER  = '254702453813';
const STORAGE_KEY      = 'bsc_cart';


/* ─────────────────────────────────────────────────────
   CART STATE  —  rehydrated from localStorage on boot
───────────────────────────────────────────────────── */
let cart     = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let cartOpen = false;


/* ─────────────────────────────────────────────────────
   PERSISTENCE SYNC
   Call after every mutation so state survives page nav.
───────────────────────────────────────────────────── */
function persistCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}


/* ─────────────────────────────────────────────────────
   DOM REFS  (may be null on pages without those elements)
───────────────────────────────────────────────────── */
const cartDrawer       = document.getElementById('cartDrawer');
const cartOverlay      = document.getElementById('cartOverlay');
const cartBadge        = document.getElementById('cartBadge');
const mobileFloatBadge = document.getElementById('mobileFloatBadge');
const cartItemCount    = document.getElementById('cartItemCount');
const cartEmpty        = document.getElementById('cartEmpty');
const cartItemsList    = document.getElementById('cartItemsList');
const cartSubtotal     = document.getElementById('cartSubtotal');
const toast            = document.getElementById('toast');


/* ═══════════════════════════════════════════════════════
   CART OPEN / CLOSE
═══════════════════════════════════════════════════════ */
function openCart() {
  if (!cartDrawer) return;
  cartOpen = true;
  cartDrawer.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  if (cartOverlay) {
    cartOverlay.classList.add('open');
    cartOverlay.setAttribute('aria-hidden', 'false');
  }
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  if (!cartDrawer) return;
  cartOpen = false;
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  if (cartOverlay) {
    cartOverlay.classList.remove('open');
    cartOverlay.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
}

function initCartToggle() {
  const cartTrigger     = document.getElementById('cartTrigger');
  const mobileFloatCart = document.getElementById('mobileFloatCart');
  const cartCloseBtn    = document.getElementById('cartCloseBtn');

  if (cartTrigger)     cartTrigger.addEventListener('click', openCart);
  if (mobileFloatCart) mobileFloatCart.addEventListener('click', openCart);
  if (cartCloseBtn)    cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay)     cartOverlay.addEventListener('click', closeCart);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartOpen) closeCart();
  });
}


/* ═══════════════════════════════════════════════════════
   SIZE SELECTOR LOGIC
   Only runs if product cards are present on this page.
═══════════════════════════════════════════════════════ */
function initSizeButtons() {
  document.querySelectorAll('.product-card').forEach(card => {
    const sizeButtons = card.querySelectorAll('.size-btn');
    sizeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        sizeButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  });
}


/* ═══════════════════════════════════════════════════════
   ADD TO CART
═══════════════════════════════════════════════════════ */
function initAddToCartButtons() {
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      addToCart(card, btn);
    });
  });
}

function addToCart(card, btn) {
  const id       = card.dataset.id;
  const name     = card.dataset.name;
  const price    = parseInt(card.dataset.price, 10);
  const category = card.dataset.category;

  // Validate size selection
  const selectedSizeBtn = card.querySelector('.size-btn.selected');
  if (!selectedSizeBtn) {
    showToast('⚠️ Please select a size first', 'error');
    const sizeRow = card.querySelector('.sizes');
    if (sizeRow) {
      sizeRow.style.animation = 'none';
      sizeRow.offsetHeight;
      sizeRow.style.animation = 'shakeX 0.4s ease';
    }
    return;
  }

  const size = selectedSizeBtn.dataset.size;

  // Gather jersey custom values
  let customName   = '';
  let customNumber = '';
  if (category === 'jersey') {
    const nameInput   = card.querySelector('.custom-name-input');
    const numberInput = card.querySelector('.custom-number-input');
    customName   = nameInput   ? nameInput.value.trim().toUpperCase()  : '';
    customNumber = numberInput ? numberInput.value.trim()               : '';
  }

  const cartKey = `${id}__${size}__${customName}__${customNumber}`;

  const existing = cart.find(item => item.cartKey === cartKey);
  if (existing) {
    existing.qty += 1;
    showToast(`✓ ${name} qty updated`, 'success');
  } else {
    cart.push({ cartKey, id, name, price, category, size, customName, customNumber, qty: 1 });
    showToast(`✓ Added ${name} to kit bag`, 'success');
  }

  // Button feedback
  const originalText = btn.textContent;
  btn.textContent = '✓ Added!';
  btn.classList.add('added');
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = originalText;
    btn.classList.remove('added');
    btn.disabled = false;
  }, 1400);

  // Badge bump
  if (cartBadge) {
    cartBadge.classList.add('bump');
    setTimeout(() => cartBadge.classList.remove('bump'), 300);
  }

  persistCart();
  updateCartUI();
}


/* ═══════════════════════════════════════════════════════
   UPDATE QUANTITY
═══════════════════════════════════════════════════════ */
function updateQty(cartKey, delta) {
  const item = cart.find(i => i.cartKey === cartKey);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(cartKey);
    return;
  }
  persistCart();
  updateCartUI();
}


/* ═══════════════════════════════════════════════════════
   REMOVE FROM CART
═══════════════════════════════════════════════════════ */
function removeFromCart(cartKey) {
  const idx = cart.findIndex(i => i.cartKey === cartKey);
  if (idx === -1) return;

  const li = cartItemsList
    ? cartItemsList.querySelector(`[data-cart-key="${CSS.escape(cartKey)}"]`)
    : null;

  if (li) {
    li.style.transition = 'all 0.25s ease';
    li.style.opacity    = '0';
    li.style.transform  = 'translateX(30px)';
    setTimeout(() => {
      cart.splice(idx, 1);
      persistCart();
      updateCartUI();
    }, 250);
  } else {
    cart.splice(idx, 1);
    persistCart();
    updateCartUI();
  }
}


/* ═══════════════════════════════════════════════════════
   UPDATE CART UI
═══════════════════════════════════════════════════════ */
function updateCartUI() {
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  const subtotal   = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  if (cartBadge)        cartBadge.textContent        = totalItems;
  if (mobileFloatBadge) mobileFloatBadge.textContent = totalItems;
  if (cartItemCount)    cartItemCount.textContent     = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
  if (cartSubtotal)     cartSubtotal.textContent      = `Ksh ${subtotal.toLocaleString('en-KE')}`;

  const checkoutBtn = document.getElementById('checkoutBtn');

  if (cart.length === 0) {
    if (cartEmpty)     cartEmpty.classList.remove('hidden');
    if (cartItemsList) cartItemsList.innerHTML = '';
    if (checkoutBtn)   checkoutBtn.disabled = true;
  } else {
    if (cartEmpty) cartEmpty.classList.add('hidden');
    if (checkoutBtn) checkoutBtn.disabled = false;
    renderCartItems();
  }
}

function renderCartItems() {
  if (!cartItemsList) return;
  cartItemsList.innerHTML = '';

  cart.forEach(item => {
    const li = document.createElement('li');
    li.className       = 'cart-item';
    li.dataset.cartKey = item.cartKey;

    let customHtml = '';
    if (item.category === 'jersey' && (item.customName || item.customNumber)) {
      const parts = [];
      if (item.customName)   parts.push(item.customName);
      if (item.customNumber) parts.push(`#${item.customNumber}`);
      customHtml = `<div class="cart-item-custom">🖊️ Custom: ${parts.join(' ')}</div>`;
    }

    li.innerHTML = `
      <div class="cart-item-main">
        <div class="cart-item-name">${escapeHTML(item.name)}</div>
        <div class="cart-item-size">Size: ${escapeHTML(item.size)}</div>
        ${customHtml}
        <div class="cart-item-price">Ksh ${(item.price * item.qty).toLocaleString('en-KE')}</div>
      </div>
      <div class="cart-item-controls">
        <div class="qty-controls">
          <button class="qty-btn" data-key="${escapeHTML(item.cartKey)}" data-delta="-1" aria-label="Decrease quantity">−</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" data-key="${escapeHTML(item.cartKey)}" data-delta="1" aria-label="Increase quantity">+</button>
        </div>
        <button class="remove-item-btn" data-key="${escapeHTML(item.cartKey)}">Remove</button>
      </div>
    `;
    cartItemsList.appendChild(li);
  });

  cartItemsList.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      updateQty(btn.dataset.key, parseInt(btn.dataset.delta, 10));
    });
  });

  cartItemsList.querySelectorAll('.remove-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromCart(btn.dataset.key);
    });
  });
}


/* ═══════════════════════════════════════════════════════
   WHATSAPP CHECKOUT LINK
═══════════════════════════════════════════════════════ */
function generateWhatsAppLink() {
  if (cart.length === 0) {
    showToast('Your kit bag is empty!', 'error');
    return;
  }

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const lines    = [];

  lines.push("Hello! I'd like to place an order from *BAARI SPORTS CENTER Digital Shelves*:\n");

  cart.forEach(item => {
    let line = `• ${item.qty}x ${item.name} (Size: ${item.size})`;
    if (item.category === 'jersey' && (item.customName || item.customNumber)) {
      const parts = [];
      if (item.customName)   parts.push(item.customName);
      if (item.customNumber) parts.push(`#${item.customNumber}`);
      line += ` [Custom: ${parts.join(' ')}]`;
    }
    line += ` — Ksh ${(item.price * item.qty).toLocaleString('en-KE')}`;
    lines.push(line);
  });

  lines.push('');
  lines.push(`*Total: Ksh ${subtotal.toLocaleString('en-KE')}*`);
  lines.push('');
  lines.push('Please confirm my order and share delivery details. Thank you! 🙏');

  const waURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
  window.open(waURL, '_blank', 'noopener,noreferrer');
}


/* ═══════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
═══════════════════════════════════════════════════════ */
let toastTimer = null;

function showToast(message, type = 'success') {
  if (!toast) return;
  toast.textContent = message;
  toast.className   = `toast ${type} show`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = 'toast'; }, 2600);
}


/* ═══════════════════════════════════════════════════════
   NAV SCROLL EFFECT
═══════════════════════════════════════════════════════ */
function initNavScroll() {
  const header = document.getElementById('navHeader');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}


/* ═══════════════════════════════════════════════════════
   ACTIVE NAV LINK INDICATOR
   Highlights the correct nav link based on current page.
═══════════════════════════════════════════════════════ */
function initActiveNavLink() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    if (link.dataset.page === page || (page === '' && link.dataset.page === 'index.html')) {
      link.classList.add('active');
    }
  });
}


/* ═══════════════════════════════════════════════════════
   HAMBURGER MENU
═══════════════════════════════════════════════════════ */
function initHamburger() {
  const hamburger        = document.getElementById('hamburger');
  const mobileNavOverlay = document.getElementById('mobileNavOverlay');
  const mobileNavClose   = document.getElementById('mobileNavClose');

  if (!hamburger || !mobileNavOverlay) return;

  hamburger.addEventListener('click', () => {
    mobileNavOverlay.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  });

  function closeMobileNav() {
    mobileNavOverlay.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileNav);

  // Close on link click within mobile nav
  mobileNavOverlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });
}


/* ═══════════════════════════════════════════════════════
   SCROLL-TRIGGERED SECTION REVEAL
═══════════════════════════════════════════════════════ */
function initScrollReveal() {
  const cards = document.querySelectorAll('.product-card, .about-block');
  if (!cards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  cards.forEach((card, i) => {
    card.style.opacity    = '0';
    card.style.transform  = 'translateY(28px)';
    card.style.transition = `opacity 0.5s ease ${(i % 4) * 0.08}s, transform 0.5s ease ${(i % 4) * 0.08}s`;
    observer.observe(card);
  });
}


/* ═══════════════════════════════════════════════════════
   SHAKE KEYFRAME  (injected once at runtime)
═══════════════════════════════════════════════════════ */
function injectShakeKeyframe() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shakeX {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-6px); }
      40%       { transform: translateX(6px); }
      60%       { transform: translateX(-4px); }
      80%       { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
}


/* ═══════════════════════════════════════════════════════
   HERO SCROLL CUE  (index.html only)
═══════════════════════════════════════════════════════ */
function initHeroScrollCue() {
  const scrollCue  = document.getElementById('heroScrollCue');
  const howItWorks = document.getElementById('heroHowItWorks');
  const about      = document.getElementById('about');

  if (scrollCue && about) {
    scrollCue.addEventListener('click', () => about.scrollIntoView({ behavior: 'smooth' }));
  }
  if (howItWorks && about) {
    howItWorks.addEventListener('click', () => about.scrollIntoView({ behavior: 'smooth' }));
  }
}


/* ═══════════════════════════════════════════════════════
   UTILITY: Escape HTML  (prevents XSS in innerHTML)
═══════════════════════════════════════════════════════ */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


/* ═══════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  injectShakeKeyframe();
  initNavScroll();
  initActiveNavLink();
  initHamburger();
  initCartToggle();
  initScrollReveal();
  updateCartUI();

  // Product-grid-specific inits — gracefully skip if not on catalogue page
  initSizeButtons();
  initAddToCartButtons();

  // Hero scroll cue — gracefully skip if not on landing page
  initHeroScrollCue();

  // Wire checkout button
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', generateWhatsAppLink);
  }
});
