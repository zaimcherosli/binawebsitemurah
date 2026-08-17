/* ==========================================
   Kwikezee Studio - Interactivity, PWA & Slider Logic
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modules
  initNavbar();
  initBeforeAfterSlider();
  initPortfolioFilter();
  initPortfolioSlider();
  initFaqAccordion();
  initScrollReveal();
  initPwaInstall();
  initDraggableWaFab();
  initCountdownTimer();
  initScrollAccentSwitch();
  initConstellationCanvas();
  initTypewriterEffect();
  initSpotlightCards();
  initCircularPhoneCarousel();
  initAppSlideNavigation();
  initCreativeParallaxAnd3DTilt();
});

/* ==========================================
   SCROLL-DRIVEN DYNAMIC THEME ACCENT SWITCHER
   ========================================== */
function initScrollAccentSwitch() {
  const colors = {
    gold: { primary: '#B8860B', secondary: '#D4AF37' },
    emerald: { primary: '#059669', secondary: '#34D399' },
    sapphire: { primary: '#2563EB', secondary: '#60A5FA' },
    purple: { primary: '#9333EA', secondary: '#C084FC' },
    ruby: { primary: '#DC2626', secondary: '#F87171' }
  };

  const sectionColors = [
    { selector: '.hero-section', color: 'gold' },
    { selector: '#kelebihan', color: 'emerald' },
    { selector: '#portfolio', color: 'sapphire' },
    { selector: '#harga', color: 'purple' },
    { selector: '#kajian-kes', color: 'ruby' },
    { selector: '#faq', color: 'gold' },
    { selector: '#order-form', color: 'gold' }
  ];

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const match = sectionColors.find(s => entry.target.matches(s.selector));
          if (match && colors[match.color]) {
            const c = colors[match.color];
            document.documentElement.style.setProperty('--gold-primary', c.primary);
            document.documentElement.style.setProperty('--gold-secondary', c.secondary);
          }
        }
      });
    }, { threshold: 0.3 });

    sectionColors.forEach(s => {
      const el = document.querySelector(s.selector);
      if (el) observer.observe(el);
    });
  }
}

/* ==========================================
   NAVBAR & MOBILE MENU
   ========================================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('nav-hamburger');
  const floatingMenuFab = document.getElementById('floatingMenuFab');
  const mobileMenu = document.getElementById('nav-mobile-menu');
  const mobileLinks = document.querySelectorAll('.nav-mobile-link');
  const closeBtn = document.getElementById('nav-overlay-close');

  // Change navbar appearance on scroll
  window.addEventListener('scroll', () => {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('active');
    mobileMenu.setAttribute('aria-hidden', 'false');
    if (hamburger) {
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.classList.add('open');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('active');
    mobileMenu.setAttribute('aria-hidden', 'true');
    if (hamburger) {
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.classList.remove('open');
    }
    document.body.style.overflow = '';
  }

  // Floating Menu 4-State Cycle (0: Closed -> 1: Bottom -> 2: Left -> 3: Top -> 0: Closed)
  let menuCycleState = 0; // 0 = closed, 1 = bottom, 2 = left, 3 = top
  const dockSwitchBtn = document.getElementById('dockSwitchBtn');
  const dockCloseBtn = document.getElementById('dockCloseBtn');
  const dockNavLinks = document.querySelectorAll('.dock-link');

  function setMenuState(state) {
    menuCycleState = state % 4;
    if (!floatingMenuFab) return;

    floatingMenuFab.classList.remove('expanded', 'pos-bottom', 'pos-left', 'pos-top');

    if (menuCycleState === 1) {
      floatingMenuFab.classList.add('expanded', 'pos-bottom');
    } else if (menuCycleState === 2) {
      floatingMenuFab.classList.add('expanded', 'pos-left');
    } else if (menuCycleState === 3) {
      floatingMenuFab.classList.add('expanded', 'pos-top');
    }
  }

  if (floatingMenuFab) {
    floatingMenuFab.addEventListener('click', (e) => {
      // If clicking inside links or close button, let them handle it
      if (e.target.closest('.dock-close-btn')) {
        e.stopPropagation();
        setMenuState(0);
        return;
      }
      if (e.target.closest('.dock-switch-btn')) {
        e.stopPropagation();
        setMenuState(menuCycleState + 1);
        return;
      }
      if (e.target.closest('.dock-link') || e.target.closest('.dock-cta-wa') || e.target.closest('.dock-brand')) {
        return;
      }

      e.stopPropagation();
      setMenuState(menuCycleState + 1);
    });

    floatingMenuFab.addEventListener('touchstart', (e) => {
      e.stopPropagation();
    }, { passive: true });

    floatingMenuFab.addEventListener('touchmove', (e) => {
      e.stopPropagation();
    }, { passive: true });
  }

  // Position switcher button inside dock
  if (dockSwitchBtn) {
    dockSwitchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setMenuState(menuCycleState + 1);
    });
  }

  // Close desktop dock on close button
  if (dockCloseBtn) {
    dockCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setMenuState(0);
    });
  }

  // Close desktop dock when clicking outside
  document.addEventListener('click', (e) => {
    if (floatingMenuFab && floatingMenuFab.classList.contains('expanded')) {
      if (!floatingMenuFab.contains(e.target)) {
        setMenuState(0);
      }
    }
  });

  // Dock slide navigation links
  dockNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const slideNav = link.getAttribute('data-slide-nav');
      if (slideNav !== null && typeof window.goToAppSlide === 'function') {
        e.preventDefault();
        window.goToAppSlide(parseInt(slideNav, 10));
        setMenuState(0);
      }
    });
  });

  // Hamburger button
  if (hamburger) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  // Close button (✕)
  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  // Close menu when clicking mobile links
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // ESC key to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (mobileMenu && mobileMenu.classList.contains('active')) closeMenu();
      if (floatingMenuFab && floatingMenuFab.classList.contains('expanded')) floatingMenuFab.classList.remove('expanded');
    }
  });
}

/* ==========================================
   BEFORE/AFTER SLIDER (MOUSE & TOUCH DRAG)
   ========================================== */
function initBeforeAfterSlider() {
  const slider = document.getElementById('comparison-slider');
  const handle = document.getElementById('slider-handle');
  const afterPanel = document.querySelector('.after-panel');
  
  if (!slider || !handle || !afterPanel) return;

  // Recalculate content wrapper width to match actual slider container width dynamically
  function adjustWidths() {
    const sliderWidth = slider.offsetWidth;
    const contentWrappers = slider.querySelectorAll('.panel-content-wrapper');
    contentWrappers.forEach(wrapper => {
      wrapper.style.width = `${sliderWidth}px`;
    });
    
    const mocks = slider.querySelectorAll('.cheap-page-mock, .premium-page-mock');
    mocks.forEach(mock => {
      mock.style.width = `${sliderWidth}px`;
    });
  }

  adjustWidths();

  let isDragging = false;

  // Add event listeners for mouse
  handle.addEventListener('mousedown', startDragging);
  window.addEventListener('mousemove', drag);
  window.addEventListener('mouseup', stopDragging);

  // Add event listeners for touch devices (Mobile)
  handle.addEventListener('touchstart', startDragging, { passive: true });
  window.addEventListener('touchmove', drag, { passive: false });
  window.addEventListener('touchend', stopDragging);

  function startDragging() {
    isDragging = true;
    slider.classList.add('dragging');
  }

  function stopDragging() {
    isDragging = false;
    slider.classList.remove('dragging');
  }

  function drag(e) {
    if (!isDragging) return;

    // Prevent default scrolling on mobile when dragging slider
    if (e.type === 'touchmove') {
      e.preventDefault();
    }

    // Get horizontal coordinates
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const rect = slider.getBoundingClientRect();
    
    // Calculate percentage
    let x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;

    // Clamp value between 0% and 100%
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;

    // Update positions
    handle.style.left = `${percentage}%`;
    
    // Since after-panel is aligned right, width of premium side should be 100 - percentage
    afterPanel.style.width = `${100 - percentage}%`;
  }

  // Adjust on window resize to ensure alignment is correct
  window.addEventListener('resize', () => {
    // Force recalculation
    afterPanel.style.transition = 'none';
    handle.style.transition = 'none';
    adjustWidths();
  });
}

/* ==========================================
   PORTFOLIO FILTERING WITH TRANSITIONS
   ========================================== */
function initPortfolioFilter() {
  const tabs = document.querySelectorAll('.tab-btn');
  const items = document.querySelectorAll('.portfolio-item');

  if (tabs.length === 0 || items.length === 0) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Toggle active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterValue = tab.getAttribute('data-filter');

      items.forEach(item => {
        const category = item.getAttribute('data-category');
        
        if (filterValue === 'all' || category === filterValue) {
          // Fade in matching items
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 50);
        } else {
          // Fade out non-matching items
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300); // match css transition speed
        }
      });
    });
  });
}



/* ==========================================
   FAQ ACCORDION
   ========================================== */
function initFaqAccordion() {
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isActive = item.classList.contains('active');

      // Close all other items first for accordion behaviour
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.faq-question').forEach(q => q.setAttribute('aria-expanded', 'false'));

      if (!isActive) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ==========================================
   SCROLL REVEAL & STATS COUNTING UP
   ========================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  const statNumbers = document.querySelectorAll('.stat-num');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          
          // Trigger counting if it's the stats section
          if (entry.target.classList.contains('stats-section')) {
            statNumbers.forEach(num => startCounting(num));
          }
          
          observer.unobserve(entry.target); // Trigger once only
        }
      });
    }, {
      threshold: 0.12
    });

    revealElements.forEach(el => observer.observe(el));
    
    // Also observe stats container separately to trigger counting accurately
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) observer.observe(statsSection);
    
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach(el => el.classList.add('active'));
    statNumbers.forEach(num => {
      const target = num.getAttribute('data-target');
      const suffix = num.getAttribute('data-suffix') || '';
      num.innerText = target + suffix;
    });
  }

  function startCounting(el) {
    const target = parseFloat(el.getAttribute('data-target'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000; // 2 seconds animation
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.innerText = target + suffix;
        clearInterval(timer);
      } else {
        // Handle decimals for load speed millisecond counts (45mms etc)
        if (target % 1 !== 0) {
          el.innerText = current.toFixed(1) + suffix;
        } else {
          el.innerText = Math.floor(current) + suffix;
        }
      }
    }, stepTime);
  }
}

/* ==========================================
   PWA INSTALL PROMPT & SERVICE WORKER
   ========================================== */
let deferredPrompt;

function initPwaInstall() {
  const pwaSheet = document.getElementById('pwa-sheet');
  const pwaInstallBtn = document.getElementById('pwa-btn-install');
  const pwaIgnoreBtn = document.getElementById('pwa-btn-ignore');

  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
        .then(reg => console.log('Service Worker registered successfully:', reg.scope))
        .catch(err => console.log('Service Worker registration failed:', err));
    });
  }

  // Intercept the browser's install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default browser banner
    e.preventDefault();
    // Save event for triggering later
    deferredPrompt = e;

    // Show custom premium bottom sheet install dialog after 3 seconds of load
    setTimeout(() => {
      // Check if user has already ignored it in this session to prevent spamming
      if (sessionStorage.getItem('pwa_ignore') !== 'true') {
        pwaSheet.classList.add('show');
        pwaSheet.setAttribute('aria-hidden', 'false');
      }
    }, 4000);
  });

  // Handle Install Action Button
  pwaInstallBtn.addEventListener('click', () => {
    if (!deferredPrompt) return;
    
    // Hide bottom sheet
    pwaSheet.classList.remove('show');
    pwaSheet.setAttribute('aria-hidden', 'true');
    
    // Show native install dialog
    deferredPrompt.prompt();
    
    // Check outcome
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User installed the Kwikezee PWA');
      } else {
        console.log('User dismissed PWA installation');
      }
      deferredPrompt = null;
    });
  });

  // Handle Ignore Action Button
  pwaIgnoreBtn.addEventListener('click', () => {
    pwaSheet.classList.remove('show');
    pwaSheet.setAttribute('aria-hidden', 'true');
    // Store in session storage so it doesn't prompt again in this session
    sessionStorage.setItem('pwa_ignore', 'true');
  });

  // Detect if app is opened in standalone mode (already installed)
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
    pwaSheet.classList.remove('show');
  }
}

/* ==========================================
   FORM HANDLING & WHATSAPP Funnel Redirection
   ========================================== */
// Store selected package globally
window.selectedPackageValue = 'premium';

window.selectPricingPackage = function(packageName) {
  const detailsInput = document.getElementById('details');
  if (!detailsInput) return;
  
  let packageText = '';
  if (packageName === 'starter') {
    packageText = 'Saya berminat dengan Pakej Starter (RM150).';
    window.selectedPackageValue = 'starter';
  } else if (packageName === 'premium') {
    packageText = 'Saya berminat dengan Pakej Premium (RM350).';
    window.selectedPackageValue = 'premium';
  } else if (packageName === 'custom') {
    packageText = 'Saya berminat dengan Pakej Custom (RM890).';
    window.selectedPackageValue = 'custom';
  }
  
  detailsInput.value = packageText;
  
  // Smooth scroll to form
  const formSection = document.getElementById('order-form');
  if (formSection) {
    formSection.scrollIntoView({ behavior: 'smooth' });
  }
};

window.handleFormSubmit = function(event) {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const niche = document.getElementById('niche').value;
  const details = document.getElementById('details').value.trim();

  // Validate inputs
  if (!name || !phone) {
    alert('Sila isi maklumat Nama dan Nombor Telefon.');
    return;
  }

  // Format message for WhatsApp
  const message = `Hai Kwikezee Studio! 🌟
Saya ingin mendapatkan rundingan pembinaan website/landing page premium.

Butiran Permintaan:
──────────────────
👤 Nama: ${name}
📞 No. Tel: ${phone}
💼 Industri/Niche: ${niche}
📝 Perincian Projek: ${details || 'Tiada perincian tambahan'}

Sila maklum balas bila berkelapangan. Terima kasih!`;

  // WhatsApp Send Link format
  const encodedText = encodeURIComponent(message);
  const waUrl = `https://wa.me/60108118559?text=${encodedText}`;

  // Redirect client to WhatsApp API in new tab
  window.open(waUrl, '_blank');

  // Redirect current window to payment page matching their selected package
  const targetPackage = window.selectedPackageValue || 'premium';
  setTimeout(() => {
    window.location.href = `bayar?pakej=${targetPackage}`;
  }, 1000);
};

/* ==========================================
   PWA INSTALLATION MODAL & PROMPT LOGIC
   ========================================== */
async function initPwaInstall() {
  const modal = document.getElementById('pwa-install-modal');
  const closeBtn = document.getElementById('pwa-modal-close');
  const dismissBtn = document.getElementById('pwa-modal-dismiss');
  const directBtn = document.getElementById('pwa-direct-install-btn');

  let deferredPrompt = null;

  // 1. Detect if website is opened inside installed PWA / standalone mode (Mobile & Desktop)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       window.matchMedia('(display-mode: window-controls-overlay)').matches ||
                       window.matchMedia('(display-mode: fullscreen)').matches ||
                       window.matchMedia('(display-mode: minimal-ui)').matches ||
                       window.navigator.standalone === true;

  // 2. Check if marked as installed in localStorage
  const isMarkedInstalled = localStorage.getItem('kwikezee_pwa_installed') === 'true';

  // 3. Check browser getInstalledRelatedApps API (Chrome / Edge / Android)
  let isAppInstalledApi = false;
  if ('getInstalledRelatedApps' in navigator) {
    try {
      const relatedApps = await navigator.getInstalledRelatedApps();
      if (relatedApps && relatedApps.length > 0) {
        isAppInstalledApi = true;
        localStorage.setItem('kwikezee_pwa_installed', 'true');
      }
    } catch (err) {}
  }

  // If already installed or running as installed app, abort popup completely!
  if (isStandalone || isMarkedInstalled || isAppInstalledApi) {
    if (modal) modal.classList.remove('active');
    return;
  }

  // Listen for native appinstalled event when user completes install
  window.addEventListener('appinstalled', () => {
    localStorage.setItem('kwikezee_pwa_installed', 'true');
    if (modal) modal.classList.remove('active');
  });

  // Listen for Chrome / Android beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (directBtn) directBtn.style.display = 'inline-flex';
  });

  // Auto detect device type (iOS vs Android vs Desktop)
  const userAgent = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || window.innerWidth <= 768;

  const androidGuide = document.getElementById('pwa-android-guide');
  const appleGuide = document.getElementById('pwa-apple-guide');
  const desktopGuide = document.getElementById('pwa-desktop-guide');

  if (isIOS) {
    if (appleGuide) appleGuide.style.display = 'block';
    if (androidGuide) androidGuide.style.display = 'none';
    if (desktopGuide) desktopGuide.style.display = 'none';
  } else if (isMobile) {
    if (androidGuide) androidGuide.style.display = 'block';
    if (appleGuide) appleGuide.style.display = 'none';
    if (desktopGuide) desktopGuide.style.display = 'none';
  } else {
    if (desktopGuide) desktopGuide.style.display = 'block';
    if (androidGuide) androidGuide.style.display = 'none';
    if (appleGuide) appleGuide.style.display = 'none';
  }

  // Global window opener for testing or manual triggers
  window.openPwaInstallModal = function() {
    if (modal) modal.classList.add('active');
  };

  // Auto-show modal after 1.5 seconds if not running standalone
  setTimeout(() => {
    openPwaModal();
  }, 1500);

  function openPwaModal() {
    if (!modal) return;
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      return;
    }
    modal.classList.add('active');
  }

  function closePwaModal() {
    if (!modal) return;
    if (document.activeElement && modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    modal.classList.remove('active');
  }

  if (closeBtn) closeBtn.addEventListener('click', closePwaModal);
  if (dismissBtn) dismissBtn.addEventListener('click', closePwaModal);

  if (directBtn) {
    directBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('PWA Install choice:', outcome);
        if (outcome === 'accepted') {
          localStorage.setItem('kwikezee_pwa_installed', 'true');
        }
        deferredPrompt = null;
        closePwaModal();
      }
    });
  }
}

/* ==========================================
   PORTFOLIO HORIZONTAL CAROUSEL (MOBILE)
   ========================================== */
function initPortfolioSlider() {
  const grid = document.querySelector('.portfolio-grid');
  if (!grid) return;

  let autoSlideInterval = null;
  let isUserInteracting = false;
  let resetTimer = null;

  function getVisibleItems() {
    return Array.from(grid.querySelectorAll('.portfolio-item')).filter(
      item => item.style.display !== 'none'
    );
  }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlideInterval = setInterval(() => {
      if (isUserInteracting || window.innerWidth > 768) return;
      
      const visibleItems = getVisibleItems();
      if (visibleItems.length <= 1) return;

      // Find which item is currently closest to the start of viewport
      const gridLeft = grid.scrollLeft;
      let closestIndex = 0;
      let minDiff = Infinity;

      visibleItems.forEach((item, index) => {
        const itemLeft = item.offsetLeft - grid.offsetLeft;
        const diff = Math.abs(itemLeft - gridLeft);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = index;
        }
      });

      // Scroll to the next item (looping back to 0)
      const nextIndex = (closestIndex + 1) % visibleItems.length;
      const nextItem = visibleItems[nextIndex];
      const nextScrollLeft = nextItem.offsetLeft - grid.offsetLeft;
      
      grid.scrollTo({
        left: nextScrollLeft,
        behavior: 'smooth'
      });
    }, 4000);
  }

  function stopAutoSlide() {
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
      autoSlideInterval = null;
    }
  }

  // Detect user touch/swipe interaction to temporarily pause auto-slide
  grid.addEventListener('touchstart', () => {
    isUserInteracting = true;
    stopAutoSlide();
    if (resetTimer) clearTimeout(resetTimer);
  }, { passive: true });

  grid.addEventListener('touchend', () => {
    // Resume auto-slide after 5 seconds of inactivity
    resetTimer = setTimeout(() => {
      isUserInteracting = false;
      if (window.innerWidth <= 768) {
        startAutoSlide();
      }
    }, 5000);
  }, { passive: true });

  // Handle window resize to dynamically enable/disable auto-slide
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
      if (!autoSlideInterval) startAutoSlide();
    } else {
      stopAutoSlide();
    }
  });

  // Initial activation
  if (window.innerWidth <= 768) {
    startAutoSlide();
  }

  // Smooth scroll back to 0 when filters (tabs) are clicked
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      setTimeout(() => {
        grid.scrollTo({ left: 0, behavior: 'smooth' });
      }, 350);
    });
  });
}

/* ==========================================================================
   DRAGGABLE FLOATING MENU BUTTON (FAB)
   ========================================================================== */
function initDraggableWaFab() {
  const fab = document.querySelector('.floating-menu-fab') || document.querySelector('.wa-fab');
  if (!fab) return;

  let isDragging = false;
  let wasDragged = false;
  let offsetX = 0;
  let offsetY = 0;
  let startX = 0;
  let startY = 0;

  fab.addEventListener('mousedown', dragStart);
  fab.addEventListener('touchstart', dragStart, { passive: true });

  window.addEventListener('mousemove', drag);
  window.addEventListener('touchmove', drag, { passive: false });

  window.addEventListener('mouseup', dragEnd);
  window.addEventListener('touchend', dragEnd);

  // Click event listener to intercept navigation if dragged
  fab.addEventListener('click', (e) => {
    if (wasDragged) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }, true);

  function dragStart(e) {
    isDragging = true;
    wasDragged = false;
    
    // Disable CSS transition during dragging for lag-free movement
    fab.style.transition = 'none';

    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    
    const rect = fab.getBoundingClientRect();
    
    // Switch to absolute positioning with left/top instead of bottom/right
    fab.style.right = 'auto';
    fab.style.bottom = 'auto';
    fab.style.left = `${rect.left}px`;
    fab.style.top = `${rect.top}px`;
    fab.style.transform = 'none';

    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;
    
    startX = clientX;
    startY = clientY;
  }

  function drag(e) {
    if (!isDragging) return;

    // Prevent screen scrolling on mobile while dragging the FAB
    if (e.type === 'touchmove') {
      e.preventDefault();
    }

    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

    let newX = clientX - offsetX;
    let newY = clientY - offsetY;

    // Clamp coordinates inside the viewport boundaries
    const margin = 12;
    const rect = fab.getBoundingClientRect();
    const maxLeft = window.innerWidth - rect.width - margin;
    const maxTop = window.innerHeight - rect.height - margin;

    if (newX < margin) newX = margin;
    if (newX > maxLeft) newX = maxLeft;
    if (newY < margin) newY = margin;
    if (newY > maxTop) newY = maxTop;

    fab.style.left = `${newX}px`;
    fab.style.top = `${newY}px`;

    // Determine if drag distance is large enough to classify as dragging instead of clicking
    const dragDistance = Math.sqrt(Math.pow(clientX - startX, 2) + Math.pow(clientY - startY, 2));
    if (dragDistance > 6) {
      wasDragged = true;
    }
  }

  function dragEnd() {
    if (!isDragging) return;
    isDragging = false;
    
    // Re-enable smooth transition
    fab.style.transition = 'box-shadow 0.2s ease, border-color 0.2s ease';

    // Clear wasDragged flags shortly after touch/mouseup has bubbled to the click event
    setTimeout(() => {
      wasDragged = false;
    }, 150);
  }
}

/* ==========================================
   LIVE WEEKLY COUNTDOWN TIMER (ISNIN 12AM - AHAD 11:59PM)
   ========================================== */
function initCountdownTimer() {
  // Elements for Top Bar Timer
  const topDaysEl = document.getElementById('top-timer-days');
  const topHoursEl = document.getElementById('top-timer-hours');
  const topMinsEl = document.getElementById('top-timer-mins');
  const topSecsEl = document.getElementById('top-timer-secs');
  const topSlotEl = document.getElementById('top-slot-count');

  // Elements for Pricing Box Timer
  const boxDaysEl = document.getElementById('box-timer-days');
  const boxHoursEl = document.getElementById('box-timer-hours');
  const boxMinsEl = document.getElementById('box-timer-mins');
  const boxSecsEl = document.getElementById('box-timer-secs');
  const boxSlotEl = document.getElementById('box-slot-count');

  // Helper function: Calculate next Sunday 11:59:59 PM target timestamp
  function getSundayEndTimestamp() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, ... 6 is Saturday
    
    // Days until Sunday (if Sunday today, target is end of today 23:59:59)
    const daysUntilSunday = (7 - dayOfWeek) % 7;
    
    const sundayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59, 59, 999);
    return sundayEnd.getTime();
  }

  // 1. Dynamic Weekly Slot Counter (Total 10 slots per week)
  let currentSlots = localStorage.getItem('kwikezee_weekly_slots');
  if (!currentSlots) {
    currentSlots = 7; // Default 7 remaining slots out of 10
    localStorage.setItem('kwikezee_weekly_slots', currentSlots);
  } else {
    currentSlots = parseInt(currentSlots, 10);
  }

  // Update Slot Elements
  if (topSlotEl) topSlotEl.textContent = `${currentSlots} Slot`;
  if (boxSlotEl) boxSlotEl.textContent = `${currentSlots} Slot Reka Bentuk`;

  function updateTimer() {
    const now = new Date().getTime();
    const targetSunday = getSundayEndTimestamp();
    let diff = targetSunday - now;

    if (diff <= 0) {
      // New week started (Monday 12am) -> Reset weekly slots to 10!
      localStorage.setItem('kwikezee_weekly_slots', 10);
      currentSlots = 10;
      if (topSlotEl) topSlotEl.textContent = `10 Slot`;
      if (boxSlotEl) boxSlotEl.textContent = `10 Slot Reka Bentuk`;
      diff = 7 * 24 * 60 * 60 * 1000; // 7 days fallback
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const formattedD = days < 10 ? '0' + days : days;
    const formattedH = hours < 10 ? '0' + hours : hours;
    const formattedM = minutes < 10 ? '0' + minutes : minutes;
    const formattedS = seconds < 10 ? '0' + seconds : seconds;

    // Update Top Bar Digits
    if (topDaysEl) topDaysEl.textContent = formattedD;
    if (topHoursEl) topHoursEl.textContent = formattedH;
    if (topMinsEl) topMinsEl.textContent = formattedM;
    if (topSecsEl) topSecsEl.textContent = formattedS;

    // Update Pricing Box Digits (100% Synchronized!)
    if (boxDaysEl) boxDaysEl.textContent = formattedD;
    if (boxHoursEl) boxHoursEl.textContent = formattedH;
    if (boxMinsEl) boxMinsEl.textContent = formattedM;
    if (boxSecsEl) boxSecsEl.textContent = formattedS;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================
   INTERACTIVE CONSTELLATION MESH CANVAS (CURSOR PHYSICS)
   ========================================== */
function initConstellationCanvas() {
  const canvas = document.getElementById('hero-particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const maxDistance = 135;
  const mouse = { x: null, y: null, radius: 180 };

  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    width = canvas.width = parent.offsetWidth;
    height = canvas.height = parent.offsetHeight;
    createParticles();
  }

  function createParticles() {
    particles = [];
    const count = Math.min(Math.floor((width * height) / 14000), 75);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 2 + 1.2,
        color: Math.random() > 0.4 ? 'rgba(212, 175, 55,' : 'rgba(255, 255, 255,'
      });
    }
  }

  window.addEventListener('resize', resize);
  resize();

  const heroSection = canvas.closest('section') || window;
  heroSection.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  heroSection.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}0.85)`;
      ctx.fill();

      // Connect lines to mouse cursor
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const alpha = (1 - dist / mouse.radius) * 0.6;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }

      // Connect lines to neighboring particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const alpha = (1 - dist / maxDistance) * 0.25;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================
   DYNAMIC TYPEWRITER & ROLE SWITCHER (OPTION 1)
   ========================================== */
function initTypewriterEffect() {
  const textEl = document.getElementById('typewriter-text');
  if (!textEl) return;

  const roles = [
    'Untuk Bisnes Yang Nak Nampak Serius.',
    'Siap Pantas Dalam 5 Hari.',
    '100% Mobile-First & Laju.',
    'Tanpa Sebarang Yuran Bulanan.'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typingSpeed = 85;
  const deletingSpeed = 45;
  const pauseEnd = 2000;
  const pauseStart = 350;

  function type() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      charIndex--;
      textEl.textContent = currentRole.substring(0, charIndex);
    } else {
      charIndex++;
      textEl.textContent = currentRole.substring(0, charIndex);
    }

    let delay = isDeleting ? deletingSpeed : typingSpeed;

    if (!isDeleting && charIndex === currentRole.length) {
      delay = pauseEnd;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = pauseStart;
    }

    setTimeout(type, delay);
  }

  type();
}

/* ==========================================
   INTERACTIVE SPOTLIGHT CARDS (APPLE / LINEAR EFFECT)
   ========================================== */
function initSpotlightCards() {
  const cards = document.querySelectorAll('.spotlight-card, .advantage-card, .showcase-mini-card, .journey-step-card, .pricing-card, .audience-card, .benefit-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* ==========================================
   3D CIRCULAR ROTATING PHONE CAROUSEL (ORBITAL RING)
   ========================================== */
function initCircularPhoneCarousel() {
  const stage = document.getElementById('phone3dStage');
  const carousel = document.getElementById('phone3dCarousel');
  if (!stage || !carousel) return;

  const items = carousel.querySelectorAll('.circular-phone-item');
  const total = items.length;
  if (total === 0) return;

  let currentAngle = 0;
  let isDragging = false;
  let startX = 0;
  let startAngle = 0;
  const autoRotateSpeed = 0.12; // Ultra smooth continuous slow spin
  let isPaused = false;

  function getRadius() {
    return window.innerWidth < 768 ? 145 : 360;
  }

  function updatePositions() {
    const radius = getRadius();
    items.forEach((item, index) => {
      const itemAngle = (index * (360 / total)) + currentAngle;
      const rad = (itemAngle * Math.PI) / 180;
      
      const cosVal = Math.cos(rad);
      const zIndex = Math.round(100 + cosVal * 100);
      const scale = window.innerWidth < 768 ? (0.85 + cosVal * 0.15) : (0.82 + cosVal * 0.18);
      const opacity = 0.35 + Math.max(0, cosVal) * 0.65;
      
      item.style.transform = `rotateY(${itemAngle}deg) translateZ(${radius}px) scale(${scale})`;
      item.style.zIndex = zIndex;
      item.style.opacity = Math.max(0.25, opacity);

      if (cosVal > 0.8) {
        item.classList.add('is-front');
      } else {
        item.classList.remove('is-front');
      }
    });
  }

  function animate() {
    if (!isDragging && !isPaused) {
      currentAngle -= autoRotateSpeed;
      updatePositions();
    }
    requestAnimationFrame(animate);
  }

  // Hover pause on stage
  stage.addEventListener('mouseenter', () => { isPaused = true; });
  stage.addEventListener('mouseleave', () => { isPaused = false; isDragging = false; });

  // Mouse Drag
  stage.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startAngle = currentAngle;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    currentAngle = startAngle + (deltaX * 0.35);
    updatePositions();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch Drag for Mobile
  stage.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;
    startAngle = currentAngle;
  }, { passive: true });

  stage.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startX;
    currentAngle = startAngle + (deltaX * 0.45);
    updatePositions();
  }, { passive: true });

  stage.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Navigation button controls (Prev / Next)
  const prevBtn = document.getElementById('phone3dPrev');
  const nextBtn = document.getElementById('phone3dNext');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentAngle += (360 / total);
      updatePositions();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentAngle -= (360 / total);
      updatePositions();
    });
  }

  // Clicking a phone item snaps it to front
  items.forEach((item, index) => {
    item.addEventListener('click', (e) => {
      if (item.classList.contains('is-front')) {
        // If user clicks the live link inside front phone, let it open
        return;
      }
      e.preventDefault();
      currentAngle = -(index * (360 / total));
      updatePositions();
    });
  });

  window.addEventListener('resize', updatePositions);
  updatePositions();
  animate();
}

/* ==========================================================================
   MOBILE APP STORY / SWIPE SLIDE NAVIGATION MODULE
   ========================================================================== */
function initAppSlideNavigation() {
  const stage = document.getElementById('appSliderStage');
  const track = document.getElementById('appSlidesTrack');
  const slides = document.querySelectorAll('.app-slide-item');
  const pills = document.querySelectorAll('.story-pill');
  const prevBtn = document.getElementById('slidePrevBtn');
  const nextBtn = document.getElementById('slideNextBtn');

  if (!stage || !track || slides.length === 0) return;

  // Add class to body to lock viewport
  document.body.classList.add('app-slider-mode');

  let currentSlide = 0;
  const totalSlides = slides.length;
  let isSwiping = false;
  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let deltaY = 0;
  let isHorizontalSwipe = null;

  function goToSlide(index) {
    if (index < 0) index = 0;
    if (index >= totalSlides) index = totalSlides - 1;

    currentSlide = index;
    const offset = -(currentSlide * 100);
    track.style.transform = `translateX(${offset}vw)`;

    // Update Progress Pills
    pills.forEach((pill, i) => {
      pill.classList.remove('active', 'completed');
      const fill = pill.querySelector('.story-pill-fill');
      if (fill) {
        fill.style.animation = 'none';
        void fill.offsetWidth; // Trigger reflow
        fill.style.animation = '';
      }
      if (i < currentSlide) {
        pill.classList.add('completed');
      } else if (i === currentSlide) {
        pill.classList.add('active');
      }
    });

    // Update Slide Items Active State
    slides.forEach((slide, i) => {
      if (i === currentSlide) {
        slide.classList.add('active');
        // Trigger reveal animations inside the active slide
        slide.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
      } else {
        slide.classList.remove('active');
      }
    });

    // Toggle Arrow States
    if (prevBtn) prevBtn.style.opacity = currentSlide === 0 ? '0.3' : '1';
    if (nextBtn) nextBtn.style.opacity = currentSlide === totalSlides - 1 ? '0.3' : '1';

    resetAutoSlideTimer();
  }

  // Smart Auto-Slide Timer (Auto-advance every 8s with background tab pause protection)
  let autoSlideTimer = null;
  const autoSlideDelay = 8000;
  const progressContainer = document.getElementById('storyProgressContainer');

  function startAutoSlideTimer() {
    stopAutoSlideTimer();
    if (progressContainer) progressContainer.classList.remove('is-paused');
    if (document.hidden) return;
    autoSlideTimer = setInterval(() => {
      let nextIndex = currentSlide + 1;
      if (nextIndex >= totalSlides) nextIndex = 0;
      goToSlide(nextIndex);
    }, autoSlideDelay);
  }

  function stopAutoSlideTimer() {
    if (progressContainer) progressContainer.classList.add('is-paused');
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
      autoSlideTimer = null;
    }
  }

  function resetAutoSlideTimer() {
    startAutoSlideTimer();
  }

  // Start auto-slide on load
  startAutoSlideTimer();

  // Pause on user mouse hover (desktop)
  if (stage) {
    stage.addEventListener('mouseenter', stopAutoSlideTimer);
    stage.addEventListener('mouseleave', startAutoSlideTimer);
  }

  // Handle tab switch, focus, or window resize cleanly
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoSlideTimer();
    } else {
      goToSlide(currentSlide);
      startAutoSlideTimer();
    }
  });

  window.addEventListener('resize', () => {
    goToSlide(currentSlide);
  });

  window.addEventListener('pageshow', () => {
    goToSlide(currentSlide);
    startAutoSlideTimer();
  });

  // Pill Click Navigation
  pills.forEach((pill, idx) => {
    pill.addEventListener('click', () => {
      goToSlide(idx);
    });
  });

  // Next / Prev Button Controls
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentSlide - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(currentSlide + 1);
    });
  }

  // Keyboard Left / Right Navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      goToSlide(currentSlide + 1);
    } else if (e.key === 'ArrowLeft') {
      goToSlide(currentSlide - 1);
    }
  });

  // Touch Swipe & Instagram Story Tap Gestures
  let touchStartTime = 0;

  stage.addEventListener('touchstart', (e) => {
    touchStartTime = Date.now();
    stopAutoSlideTimer();
    // If touching inside interactive 3D carousel or draggable FAB, let their handlers run
    if (e.target.closest('#phone3dStage') || e.target.closest('.floating-menu-fab') || e.target.closest('.nav-overlay')) {
      return;
    }

    isSwiping = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    deltaX = 0;
    deltaY = 0;
    isHorizontalSwipe = null;
  }, { passive: true });

  stage.addEventListener('touchmove', (e) => {
    if (e.target.closest('.floating-menu-fab') || e.target.closest('#phone3dStage')) {
      return;
    }
    if (!isSwiping) return;

    deltaX = e.touches[0].clientX - startX;
    deltaY = e.touches[0].clientY - startY;

    // Detect direction intent
    if (isHorizontalSwipe === null) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (isHorizontalSwipe) {
      // Prevent default page scroll if swiping horizontally
      if (e.cancelable) e.preventDefault();
    }
  }, { passive: false });

  stage.addEventListener('touchend', (e) => {
    const touchDuration = Date.now() - touchStartTime;
    const isQuickTap = touchDuration < 300 && Math.abs(deltaX) < 12 && Math.abs(deltaY) < 12;

    if (!isSwiping) {
      startAutoSlideTimer();
      return;
    }
    isSwiping = false;

    // 1. Horizontal Swipe Gesture
    if (isHorizontalSwipe) {
      const threshold = 45; // min px to trigger slide
      if (deltaX < -threshold) {
        // Swiped Left -> Next Slide
        goToSlide(currentSlide + 1);
      } else if (deltaX > threshold) {
        // Swiped Right -> Prev Slide
        goToSlide(currentSlide - 1);
      }
    }
    // 2. Instagram Story Tap Gesture (Tap Right = Next, Tap Left = Prev)
    else if (isQuickTap) {
      const target = e.target;
      const isInteractive = target.closest('a, button, input, textarea, select, .btn, #phone3dStage, .floating-menu-fab, .nav-overlay, .story-progress-container, .pwa-install-modal-backdrop, .pwa-install-sheet, .dock-cta-wa, .phone-nav-btn');
      
      if (!isInteractive) {
        const clientX = startX;
        const screenWidth = window.innerWidth;
        if (clientX < screenWidth * 0.35) {
          // Tap Left 35% -> Previous Slide
          goToSlide(currentSlide - 1);
        } else {
          // Tap Right 65% -> Next Slide
          goToSlide(currentSlide + 1);
        }
      }
    }

    isHorizontalSwipe = null;
    startAutoSlideTimer();
  });

  // Desktop Click Navigation (Instagram Story style on background tap)
  stage.addEventListener('click', (e) => {
    const target = e.target;
    if (target.closest('a, button, input, textarea, select, .btn, #phone3dStage, .floating-menu-fab, .nav-overlay, .story-progress-container, .pwa-install-modal-backdrop, .pwa-install-sheet, .audience-card, .benefit-card, .journey-step-card, .dock-cta-wa, .phone-nav-btn')) {
      return;
    }
    const clientX = e.clientX;
    const screenWidth = window.innerWidth;
    if (clientX < screenWidth * 0.35) {
      goToSlide(currentSlide - 1);
    } else {
      goToSlide(currentSlide + 1);
    }
  });

  // Global Helper for Menu Links
  window.goToAppSlide = function(slideIndex) {
    goToSlide(slideIndex);
  };

  // Connect drawer menu links to slide index if clicked on homepage
  const drawerLinks = document.querySelectorAll('.nav-overlay-inner a');
  drawerLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === './' || href === '#') {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(0);
      });
    } else if (href === 'portfolio') {
      link.addEventListener('click', (e) => {
        if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || !window.location.pathname.includes('.')) {
          e.preventDefault();
          goToSlide(1);
        }
      });
    }
  });

  // Initialize first slide
  goToSlide(0);
}

/* ==========================================================================
   CREATIVE AGENCY ANIMATION ENGINE (DSN PARALLAX & 3D MAGNETIC PHYSICS)
   ========================================================================== */
function initCreativeParallaxAnd3DTilt() {
  // 1. Watermark Typography Parallax on Scroll
  const watermarkEls = document.querySelectorAll('.watermark-bg-text');
  if (watermarkEls.length > 0) {
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateWatermarkParallax() {
      const scrollY = window.scrollY;
      watermarkEls.forEach((el, index) => {
        const speed = index % 2 === 0 ? 0.08 : -0.06;
        const offset = Math.max(-40, Math.min(40, scrollY * speed));
        el.style.transform = `translateY(-50%) translateX(${offset}px)`;
      });
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      lastScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(updateWatermarkParallax);
        ticking = true;
      }
    }, { passive: true });
    
    // Initial trigger
    updateWatermarkParallax();
  }

  // 2. Interactive 3D Card Tilt on Hover (Desktop Only)
  if (window.matchMedia('(hover: hover) and (min-width: 992px)').matches) {
    const tiltCards = document.querySelectorAll('.portfolio-card-inner, .advantage-card, .casestudy-card');
    
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -7;
        const rotateY = ((x - centerX) / centerX) * 7;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  // 3. Magnetic Hover Pull on Primary Buttons
  if (window.matchMedia('(hover: hover) and (min-width: 992px)').matches) {
    const magneticBtns = document.querySelectorAll('.dock-cta-wa, .slide-nav-arrow, .phone-nav-btn, .dock-switch-btn');
    
    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px) scale(1.05)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px) scale(1)';
      });
    });
  }
}




