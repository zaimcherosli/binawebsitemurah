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
  const mobileMenu = document.getElementById('nav-mobile-menu');
  const mobileLinks = document.querySelectorAll('.nav-mobile-link');
  const closeBtn = document.getElementById('nav-overlay-close');

  // Change navbar appearance on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  function openMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('active');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden'; // Freeze background scrolling
  }

  function closeMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('active');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburger.classList.remove('open');
    document.body.style.overflow = ''; // Restore background scrolling
  }

  // Toggle mobile menu drawer
  if (hamburger) {
    hamburger.addEventListener('click', () => {
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

  // Check if user has already dismissed modal in current session or localStorage
  const hasDismissed = sessionStorage.getItem('kwikezee_pwa_dismissed_v5') || localStorage.getItem('kwikezee_pwa_dismissed');

  // Auto-show modal after 2.0 seconds only if NOT dismissed and NOT installed
  if (!hasDismissed) {
    setTimeout(() => {
      openPwaModal();
    }, 2000);
  }

  function openPwaModal() {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true || localStorage.getItem('kwikezee_pwa_installed') === 'true') {
      return;
    }
    if (modal) modal.classList.add('active');
  }

  function closePwaModal() {
    if (modal) modal.classList.remove('active');
    sessionStorage.setItem('kwikezee_pwa_dismissed_v5', 'true');
    localStorage.setItem('kwikezee_pwa_dismissed', 'true');
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
   DRAGGABLE FLOATING WHATSAPP BUTTON (FAB)
   ========================================================================== */
function initDraggableWaFab() {
  const fab = document.querySelector('.wa-fab');
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
    }
  });

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
    const margin = 16;
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
    if (dragDistance > 5) {
      wasDragged = true;
    }
  }

  function dragEnd() {
    if (!isDragging) return;
    isDragging = false;
    
    // Re-enable smooth hover scale transition
    fab.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';

    // Clear wasDragged flags shortly after touch/mouseup has bubbled to the click event
    setTimeout(() => {
      wasDragged = false;
    }, 50);
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
    'Web Designer & Developer.',
    'Landing Page Specialist.',
    'PWA Mobile App Builder.',
    'Pakar Siap Dalam 5 Hari.'
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
  const cards = document.querySelectorAll('.spotlight-card, .advantage-card, .showcase-mini-card, .journey-step-card, .pricing-card');
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
    return window.innerWidth < 768 ? 210 : 360;
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


