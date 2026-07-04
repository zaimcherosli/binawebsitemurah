/* ============================================================
   KWIKEZEE DESIGN SOLUTION — script.js
   Premium SaaS PWA | All business logic preserved
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────────────────
   0. SERVICE WORKER REGISTRATION (PWA)
   ────────────────────────────────────────────────────────── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('[SW] Registered:', reg.scope))
      .catch(err => console.warn('[SW] Registration failed:', err));
  });
}

/* ──────────────────────────────────────────────────────────
   1. DOM READY
   ────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* ── NAVBAR SCROLL EFFECT ─────────────────────────────── */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 30) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── HAMBURGER MENU ───────────────────────────────────── */
  const hamburger   = document.getElementById('nav-hamburger');
  const mobileMenu  = document.getElementById('nav-mobile-menu');

  hamburger?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu on link click
  document.querySelectorAll('.nav-mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });

  /* ── SCROLL REVEAL ANIMATION ──────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach(el => revealObserver.observe(el));

  /* ── ANIMATE COUNTERS ─────────────────────────────────── */
  const counterEls = document.querySelectorAll('.animate-count');
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counterEls.forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ── TIMELINE PROGRESS FILL ───────────────────────────── */
  const timelineFill = document.getElementById('timeline-progress-fill');
  const timelineWrapper = document.querySelector('.timeline-wrapper');

  if (timelineFill && timelineWrapper) {
    const tlObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timelineFill.style.height = '100%';
        }
      },
      { threshold: 0.2 }
    );
    tlObserver.observe(timelineWrapper);
  }

  /* ── NICHE FILTER TABS (Portfolio) ───────────────────── */
  const nicheBtns     = document.querySelectorAll('.niche-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card[data-niche]');

  nicheBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const niche = btn.dataset.niche;

      // Update button states
      nicheBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Show/hide cards
      portfolioCards.forEach(card => {
        if (card.dataset.niche === niche) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  /* ── PORTFOLIO DEMO BOTTOM SHEET ─────────────────────── */
  const demoOverlay  = document.getElementById('demo-sheet-overlay');
  const demoSheet    = document.getElementById('demo-sheet');
  const demoClose    = document.getElementById('demo-sheet-close');
  const demoIframe   = document.getElementById('mockup-iframe');
  const demoTitle    = document.getElementById('demo-sheet-title');
  const demoUrl      = document.getElementById('mock-browser-url');

  const nicheUrlMap = {
    'kek-pisang': 'sample-niche-preview.html#kek-pisang',
    'renovation':  'sample-niche-preview.html#renovation',
    'homestay':    'sample-niche-preview.html#homestay',
    'hartanah':    'sample-niche-preview.html#hartanah',
  };

  document.querySelectorAll('.open-demo-sheet').forEach(btn => {
    btn.addEventListener('click', () => {
      const niche = btn.dataset.niche;
      const title = btn.dataset.title || 'Portfolio Demo';
      const urlDisplay = btn.dataset.url || 'kwikezeedemo.com';

      demoTitle.textContent = title;
      demoUrl.textContent   = 'https://' + urlDisplay;

      // Load iframe
      const iframeSrc = nicheUrlMap[niche] || 'sample-niche-preview.html';
      if (demoIframe.src !== location.origin + '/' + iframeSrc &&
          demoIframe.getAttribute('src') !== iframeSrc) {
        demoIframe.src = iframeSrc;
      }

      openDemoSheet();

      // Pixel event
      try { fbq('track', 'ViewContent', { content_name: title }); } catch(e) {}
    });
  });

  function openDemoSheet() {
    demoOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDemoSheet() {
    demoOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  demoClose?.addEventListener('click', closeDemoSheet);
  demoOverlay?.addEventListener('click', (e) => {
    if (e.target === demoOverlay) closeDemoSheet();
  });

  // Swipe down to close (touch)
  let demoStartY = 0;
  demoSheet?.addEventListener('touchstart', e => {
    demoStartY = e.touches[0].clientY;
  }, { passive: true });

  demoSheet?.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientY - demoStartY;
    if (delta > 80) closeDemoSheet();
  }, { passive: true });

  /* ── FAQ ACCORDION ────────────────────────────────────── */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.parentElement;
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(el => {
        el.classList.remove('open');
        el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Toggle clicked
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── QUICK ORDER MODAL ────────────────────────────────── */
  const quickModal = document.getElementById('quick-order-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  function openQuickModal() {
    quickModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    quickModal.querySelector('input')?.focus();
  }

  function closeQuickModal() {
    quickModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // All triggers for quick order modal
  document.querySelectorAll('.open-quick-order').forEach(trigger => {
    trigger.addEventListener('click', () => {
      openQuickModal();
      try { fbq('track', 'InitiateCheckout'); } catch(e) {}
    });
  });

  modalCloseBtn?.addEventListener('click', closeQuickModal);

  // Close on overlay click
  quickModal?.addEventListener('click', (e) => {
    if (e.target === quickModal) closeQuickModal();
  });

  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeQuickModal();
      closeDemoSheet();
      if (document.getElementById('nav-mobile-menu')?.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    }
  });

  /* ── QUICK ORDER FORM SUBMIT ──────────────────────────── */
  const quickOrderForm = document.getElementById('quick-order-form');

  quickOrderForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name  = document.getElementById('quick-name')?.value.trim() || '';
    const phone = document.getElementById('quick-phone')?.value.trim() || '';
    const niche = document.getElementById('quick-niche')?.value || '';

    if (!name) {
      showToast('Sila masukkan nama anda.');
      return;
    }
    if (!phone) {
      showToast('Sila masukkan nombor WhatsApp anda.');
      return;
    }
    if (!niche) {
      showToast('Sila pilih niche bisnes anda.');
      return;
    }

    const msg = encodeURIComponent(
      `Assalamualaikum, saya ingin menempah website RM99.\n\n` +
      `*Nama:* ${name}\n` +
      `*Nombor WhatsApp:* ${phone}\n` +
      `*Niche Bisnes:* ${niche}\n\n` +
      `Sila hubungi saya untuk proses seterusnya. Terima kasih!`
    );

    // Fire Meta Pixel BEFORE redirect
    try { fbq('track', 'Lead'); } catch(e) {}
    try { fbq('track', 'WhatsAppClick'); } catch(e) {}

    setTimeout(() => {
      const waUrl = `https://wa.me/60108118559?text=${msg}`;
      const newWin = window.open(waUrl, '_blank');
      if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
        window.location.href = waUrl;
      }
      closeQuickModal();
      quickOrderForm.reset();
    }, 300);
  });

  /* ── MAIN ORDER FORM SUBMIT ───────────────────────────── */
  const landingOrderForm = document.getElementById('landing-order-form');

  landingOrderForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name  = document.getElementById('client-name')?.value.trim() || '';
    const phone = document.getElementById('client-phone')?.value.trim() || '';
    const email = document.getElementById('client-email')?.value.trim() || '';
    const niche = document.getElementById('client-niche')?.value || '';
    const notes = document.getElementById('client-notes')?.value.trim() || '';
    const terms = document.getElementById('accept-terms')?.checked;

    if (!name) { showToast('Sila masukkan nama anda.'); return; }
    if (!phone) { showToast('Sila masukkan nombor WhatsApp anda.'); return; }
    if (!niche) { showToast('Sila pilih niche bisnes anda.'); return; }
    if (!terms) { showToast('Sila bersetuju dengan terma sebelum menghantar.'); return; }

    // Gather checked integrations
    const integrations = Array.from(
      landingOrderForm.querySelectorAll('input[name="integrations"]:checked')
    ).map(cb => cb.value).join(', ');

    const msg = encodeURIComponent(
      `Assalamualaikum, saya ingin menempah website RM99.\n\n` +
      `*Nama Penuh:* ${name}\n` +
      `*Nombor WhatsApp:* ${phone}\n` +
      `*Emel:* ${email || '(tiada)'}\n` +
      `*Niche Bisnes:* ${niche}\n` +
      `*Integrasi:* ${integrations || '(tiada pilihan tambahan)'}\n` +
      `*Nota:* ${notes || '(tiada)'}\n\n` +
      `Saya bersetuju dengan terma. Sila proses tempahan saya. Terima kasih!`
    );

    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Menghantar...';
    }

    // Fire Meta Pixel events BEFORE redirect
    try { fbq('track', 'Lead'); } catch(e) {}
    try { fbq('track', 'CompleteRegistration'); } catch(e) {}
    try { fbq('track', 'WhatsAppClick'); } catch(e) {}

    setTimeout(() => {
      const waUrl = `https://wa.me/60108118559?text=${msg}`;
      const newWin = window.open(waUrl, '_blank');
      if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
        window.location.href = waUrl;
      }

      // Reset form
      landingOrderForm.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Hantar Borang Tempahan & WhatsApp';
      }
    }, 300);
  });

  /* ── MAGNETIC BUTTONS ─────────────────────────────────── */
  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect   = btn.getBoundingClientRect();
      const cx     = rect.left + rect.width / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) * 0.25;
      const dy     = (e.clientY - cy) * 0.25;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  /* ── PARALLAX ON HERO MOCKUP (desktop only) ───────────── */
  const heroWrapper = document.getElementById('hero-mockup-wrapper');
  if (heroWrapper && window.innerWidth > 900) {
    document.addEventListener('mousemove', (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth  - 0.5) * 12;
      const y = (e.clientY / innerHeight - 0.5) * 8;
      heroWrapper.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
    });
    document.addEventListener('mouseleave', () => {
      heroWrapper.style.transform = '';
    });
  }

  /* ── ACTIVE BOTTOM NAV ITEM (based on scroll position) ── */
  const bnavItems  = document.querySelectorAll('.bnav-item');
  const sections   = document.querySelectorAll('section[id]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          bnavItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href && href === '#' + id) {
              bnavItems.forEach(i => i.classList.remove('active'));
              item.classList.add('active');
            }
          });
        }
      });
    },
    { threshold: 0.4 }
  );
  sections.forEach(s => sectionObserver.observe(s));

  /* ── PWA INSTALL PROMPT ───────────────────────────────── */
  let deferredPrompt = null;
  const pwaBanner   = document.getElementById('pwa-install-banner');
  const pwaInstall  = document.getElementById('pwa-install-btn');
  const pwaClose    = document.getElementById('pwa-close-btn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    setTimeout(() => {
      pwaBanner?.classList.add('visible');
    }, 5000);
  });

  pwaInstall?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] Install outcome:', outcome);
    deferredPrompt = null;
    pwaBanner?.classList.remove('visible');
  });

  pwaClose?.addEventListener('click', () => {
    pwaBanner?.classList.remove('visible');
  });

  window.addEventListener('appinstalled', () => {
    pwaBanner?.classList.remove('visible');
    console.log('[PWA] App installed!');
  });

  /* ── TOAST UTILITY ────────────────────────────────────── */
  function showToast(message, duration = 3000) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }

  /* ── SMOOTH SCROLL FOR ANCHOR LINKS ──────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = navbar?.offsetHeight || 66;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── WHATSAPP CLICK PIXEL EVENTS ─────────────────────── */
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', () => {
      try { fbq('track', 'WhatsAppClick'); } catch(e) {}
    });
  });

  /* ── AUTO SCROLL PORTFOLIO TABS ON MOBILE ─────────────── */
  const portfolioTabs = document.querySelector('.portfolio-tabs');
  const activeTab = portfolioTabs?.querySelector('.niche-btn.active');
  if (activeTab && portfolioTabs) {
    const tabRect  = activeTab.getBoundingClientRect();
    const wrapRect = portfolioTabs.getBoundingClientRect();
    if (tabRect.right > wrapRect.right || tabRect.left < wrapRect.left) {
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  /* ── ADD RIPPLE EFFECT TO PRIMARY BUTTONS ─────────────── */
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect   = this.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 2;
      ripple.style.cssText = `
        position:absolute;
        width:${size}px;height:${size}px;
        left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top - size/2}px;
        background:rgba(255,255,255,0.2);
        border-radius:50%;
        transform:scale(0);
        animation:rippleEffect 0.6s linear;
        pointer-events:none;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  // Ripple keyframe
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes rippleEffect {
        to { transform: scale(1); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ── SEO PROSE COLLAPSIBLE TOGGLE ─────────────────────── */
  const seoToggleBtn = document.getElementById('seo-toggle-btn');
  const seoProseContent = document.getElementById('seo-prose-content');
  if (seoToggleBtn && seoProseContent) {
    seoToggleBtn.addEventListener('click', () => {
      const isExpanded = seoToggleBtn.getAttribute('aria-expanded') === 'true';
      seoToggleBtn.setAttribute('aria-expanded', !isExpanded);
      seoProseContent.classList.toggle('expanded', !isExpanded);
      
      const btnText = seoToggleBtn.querySelector('span');
      if (btnText) {
        btnText.textContent = isExpanded ? 'Baca Selanjutnya' : 'Tutup';
      }
    });
  }

  console.log('[Kwikezee] Script loaded successfully.');
});
