/* =========================================
   MALKIT PORTFOLIO — main.js
   Theme · Cursor · Nav · Menu · Scroll · Form
   ========================================= */

'use strict';

/* ─── HELPERS ─────────────────────────────── */
const $ = id => document.getElementById(id);
const isMobile = () => window.innerWidth <= 576;

/* ─── 1. THEME (Dark / Light) ──────────────── */
const themeToggle = $('themeToggle');
const themeIcon   = $('themeIcon');
const THEME_KEY   = 'mk_theme';

function applyTheme(mode) {
  if (mode === 'light') {
    document.body.classList.add('light-mode');
    themeIcon.textContent = '🌙';
  } else {
    document.body.classList.remove('light-mode');
    themeIcon.textContent = '☀️';
  }
  localStorage.setItem(THEME_KEY, mode);
}

// Load saved preference (default: dark)
applyTheme(localStorage.getItem(THEME_KEY) || 'dark');

themeToggle.addEventListener('click', () => {
  const current = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

/* ─── 2. CUSTOM CURSOR (desktop only) ──────── */
const cursorDot  = $('cursor');
const cursorRing = $('cursorRing');

if (!isMobile() && window.matchMedia('(pointer:fine)').matches) {
  let mx = 0, my = 0, rx = 0, ry = 0, rafId;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
  });

  function tickRing() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
    rafId = requestAnimationFrame(tickRing);
  }
  tickRing();

  const hoverTargets = 'a, button, .skill-card, .project-card, .cert-card, .channel-item, .tag';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
} else {
  // Hide on touch/mobile
  if (cursorDot)  cursorDot.style.display  = 'none';
  if (cursorRing) cursorRing.style.display = 'none';
}

/* ─── 3. NAVBAR SCROLL EFFECT ──────────────── */
const navbar = $('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 60);

  // Hide navbar on fast scroll down, show on scroll up
  if (y > 200) {
    navbar.style.transform = y > lastScroll ? 'translateY(-100%)' : 'translateY(0)';
  } else {
    navbar.style.transform = 'translateY(0)';
  }
  lastScroll = y;
}, { passive: true });

/* ─── 4. ACTIVE NAV LINK ────────────────────── */
const navLinks = document.querySelectorAll('.nav-links a');
const mobileNavLinks = document.querySelectorAll('.mobile-menu nav a');
const allNavLinks = document.querySelectorAll('.nav-links a, .mobile-menu nav a');
const sections = document.querySelectorAll('section[id], header[id]');

function getPageName(url) {
  const path = url.split('#')[0].split('?')[0];
  const page = path.substring(path.lastIndexOf('/') + 1);
  return page || 'index.html';
}

function setActiveNavLink(targetHref) {
  allNavLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === targetHref);
  });
}

function setActivePageNav() {
  const currentPage = getPageName(window.location.pathname);
  const currentHash = window.location.hash || (currentPage === 'index.html' ? '#home' : '');
  if (currentHash && [...allNavLinks].some(a => a.getAttribute('href') === currentHash)) {
    setActiveNavLink(currentHash);
    return;
  }

  allNavLinks.forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#')) return;
    a.classList.toggle('active', getPageName(href) === currentPage);
  });
}

setActivePageNav();

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const sectionHref = '#' + entry.target.id;
      const hasSectionLink = [...navLinks, ...mobileNavLinks].some(a => a.getAttribute('href') === sectionHref);
      if (hasSectionLink) setActiveNavLink(sectionHref);
    }
  });
}, { threshold: 0.35 });

sections.forEach(s => sectionObserver.observe(s));

/* ─── 5. MOBILE MENU ────────────────────────── */
const hamburger   = $('hamburger');
const mobileMenu  = $('mobileMenu');
const menuOverlay = $('menuOverlay');
const mobileClose = $('mobileClose');

function toggleMenu() {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  menuOverlay.style.display = isOpen ? 'block' : 'none';
  setTimeout(() => {
    if (isOpen) menuOverlay.classList.add('open');
  }, 10);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeMobile() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('active');
  menuOverlay.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  setTimeout(() => { menuOverlay.style.display = 'none'; }, 350);
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', toggleMenu);
mobileClose.addEventListener('click', closeMobile);

// ESC key closes menu
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMobile();
});

/* ─── 6. SCROLL REVEAL ──────────────────────── */
const reveals = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger cards within a grid
      const siblings = entry.target.parentElement.querySelectorAll('.reveal');
      let delay = 0;
      siblings.forEach((sib, idx) => { if (sib === entry.target) delay = idx; });
      delay = Math.min(delay, 5); // cap stagger at 5 items

      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay * 70);

      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

reveals.forEach(el => revealObserver.observe(el));

/* ─── 7. COUNTER ANIMATION ──────────────────── */
function animateCounter(el, target) {
  const start    = 0;
  const duration = 1400; // ms
  const startTime = performance.now();

  function tick(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * eased) + '+';
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const statsWrap = document.querySelector('.hero-stats');
if (statsWrap) {
  let counted = false;
  const counterObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !counted) {
      counted = true;
      document.querySelectorAll('[data-count]').forEach(el => {
        animateCounter(el, parseInt(el.dataset.count, 10));
      });
    }
  }, { threshold: 0.6 });
  counterObserver.observe(statsWrap);
}

/* ─── 8. CONTACT FORM ───────────────────────── */
const form         = $('contactForm') || document.querySelector('.contact-form');
const submitBtn    = $('submitBtn');
const submitText   = $('submitText');
const submitSpinner = $('submitSpinner');
const formSuccess  = $('formSuccess');

function getVal(id) { return $(id)?.value?.trim() || ''; }
function showError(fieldId, errorId, msg) {
  const field = $(fieldId);
  const err   = $(errorId);
  if (field) field.classList.add('error');
  if (err)   err.textContent = msg;
}
function clearError(fieldId, errorId) {
  const field = $(fieldId);
  const err   = $(errorId);
  if (field) field.classList.remove('error');
  if (err)   err.textContent = '';
}

function validateForm() {
  let valid = true;
  clearError('name',    'nameError');
  clearError('email',   'emailError');
  clearError('message', 'messageError');

  if (!getVal('name') || getVal('name').length < 2) {
    showError('name', 'nameError', 'Please enter your name (min 2 characters).');
    valid = false;
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(getVal('email'))) {
    showError('email', 'emailError', 'Please enter a valid email address.');
    valid = false;
  }

  if (!getVal('message') || getVal('message').length < 10) {
    showError('message', 'messageError', 'Message must be at least 10 characters.');
    valid = false;
  }

  return valid;
}

if (form) {
  // Live validation
  ['name', 'email', 'message'].forEach(id => {
    $(id)?.addEventListener('input', () => {
      clearError(id, id + 'Error');
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (!validateForm()) return;

    submitText?.classList.add('hidden');
    submitSpinner?.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = true;
    if (formSuccess) {
      formSuccess.classList.add('hidden');
      formSuccess.textContent = '';
    }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) throw new Error('Message could not be sent.');

      form.reset();
      if (formSuccess) {
        formSuccess.textContent = 'Thank you! Your message has been sent successfully.';
        formSuccess.classList.remove('hidden');
      }
    } catch (err) {
      if (formSuccess) {
        formSuccess.textContent = 'Sorry, message could not be sent. Please try again.';
        formSuccess.classList.remove('hidden');
      }
    } finally {
      submitText?.classList.remove('hidden');
      submitSpinner?.classList.add('hidden');
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm()) return;

    // Show spinner
    submitText.classList.add('hidden');
    submitSpinner.classList.remove('hidden');
    submitBtn.disabled = true;

    // Simulate send (replace with EmailJS or backend call)
    await new Promise(resolve => setTimeout(resolve, 1400));

    /* ── EmailJS integration (uncomment + configure):
    try {
      await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
        from_name:    getVal('name'),
        from_email:   getVal('email'),
        message:      getVal('message'),
        to_name:      'Malkit',
      }, 'YOUR_PUBLIC_KEY');
    } catch(err) { console.error('EmailJS error:', err); }
    */

    // Show success
    submitText.classList.remove('hidden');
    submitSpinner.classList.add('hidden');
    submitBtn.disabled = false;
    formSuccess.classList.remove('hidden');
    form.reset();

    setTimeout(() => formSuccess.classList.add('hidden'), 6000);
  });
}

/* ─── 9. SMOOTH ANCHOR SCROLL ───────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = navbar?.offsetHeight || 70;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ─── 10. SKILL CARD TILT (subtle) ─────────── */
if (!isMobile()) {
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = (e.clientX - rect.left) / rect.width  - 0.5;
      const cy   = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-7px) rotateY(${cx * 8}deg) rotateX(${-cy * 8}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ─── 11. PERFORMANCE: PAUSE ORBS OFF-SCREEN ── */
const orbs = document.querySelectorAll('.orb');
if ('IntersectionObserver' in window) {
  const orbObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      e.target.style.animationPlayState = e.isIntersecting ? 'running' : 'paused';
    });
  });
  orbs.forEach(o => orbObserver.observe(o));
}

/* ─── 12. BACK-TO-TOP on Logo click ─────────── */
document.querySelector('.logo')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
