document.addEventListener('DOMContentLoaded', () => {
  // --- Header Scroll Effect ---
  const header = document.querySelector('.header');
  const handleScrollHeader = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScrollHeader);
  handleScrollHeader(); // Initial check on load

  // --- Smooth Scroll for Anchor Links ---
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Calculate offset for sticky header
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- FAQ Accordion ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      
      // Close all other FAQ items (accordion mode)
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
          otherItem.querySelector('.faq-content').style.maxHeight = null;
        }
      });
      
      // Toggle current FAQ item
      if (isOpen) {
        item.classList.remove('active');
        trigger.setAttribute('aria-expanded', 'false');
        content.style.maxHeight = null;
      } else {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  // --- Sticky Mobile CTA Visibility ---
  const stickyCta = document.getElementById('sticky-cta');
  const heroSection = document.getElementById('hero');
  
  const handleStickyCtaVisibility = () => {
    if (!stickyCta || !heroSection) return;
    
    // Show sticky mobile CTA only on mobile viewports (< 768px)
    if (window.innerWidth < 768) {
      const heroHeight = heroSection.offsetHeight;
      const scrollPosition = window.scrollY;
      
      // Reveal sticky CTA after scrolling past 60% of hero section
      if (scrollPosition > heroHeight * 0.6) {
        stickyCta.classList.add('visible');
      } else {
        stickyCta.classList.remove('visible');
      }
    } else {
      stickyCta.classList.remove('visible');
    }
  };
  
  window.addEventListener('scroll', handleStickyCtaVisibility);
  window.addEventListener('resize', handleStickyCtaVisibility);
  handleStickyCtaVisibility(); // Initial check

  // --- Scroll-triggered Reveal Animations ---
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserverOptions = {
    root: null, // viewport
    rootMargin: '0px',
    threshold: 0.15 // trigger when 15% of the element is visible
  };
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Once revealed, no need to track it anymore
        observer.unobserve(entry.target);
      }
    });
  }, revealObserverOptions);
  
  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

  // --- Mobile Hamburger Menu ---
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking navigation links
    const menuLinks = navMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
      });
    });
  }
});
