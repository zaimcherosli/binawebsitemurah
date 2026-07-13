/* ==========================================================================
   AuraCraft Studio - Interactivity, PWA & Slider Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modules
  initNavbar();
  initBeforeAfterSlider();
  initPortfolioFilter();
  initPortfolioSlider();
  initFaqAccordion();
  initScrollReveal();
  initPwaInstall();
});

/* ==========================================
   NAVBAR & MOBILE MENU
   ========================================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile-menu');
  const mobileLinks = document.querySelectorAll('.nav-mobile-link');

  // Change navbar appearance on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Toggle mobile menu drawer
  hamburger.addEventListener('click', () => {
    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', !isExpanded);
    mobileMenu.classList.toggle('active');
    mobileMenu.setAttribute('aria-hidden', isExpanded);
    
    // Toggle class for hamburger lines animation
    hamburger.classList.toggle('open');
  });

  // Close menu when clicking mobile links
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('active');
      mobileMenu.setAttribute('aria-hidden', 'true');
      hamburger.classList.remove('open');
    });
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
        console.log('User installed the AuraCraft PWA');
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
  const message = `Hai AuraCraft Studio! 🌟
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

  // Redirect client to WhatsApp API
  window.open(waUrl, '_blank');
};

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

