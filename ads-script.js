/* ==========================================================================
   ADS.KWIKEZEE.MY — Interactive Performance & ROI Engine Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initQuantumParticles();
  initRoiCalculator();
  initFaqAccordion();
});

/* ==========================================
   1. QUANTUM PARTICLE UNIVERSE CANVAS
   ========================================== */
function initQuantumParticles() {
  const canvas = document.getElementById('quantumCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const isMobile = window.innerWidth <= 768;
  const particleCount = isMobile ? 45 : 90;
  const connectionRadius = isMobile ? 80 : 120;

  const palette = [
    { color: '#D4AF37', glow: 'rgba(212, 175, 55, 0.8)' },
    { color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.8)' },
    { color: '#0084FF', glow: 'rgba(0, 132, 255, 0.8)' },
    { color: '#00F0FF', glow: 'rgba(0, 240, 255, 0.8)' },
    { color: '#FFFFFF', glow: 'rgba(255, 255, 255, 0.9)' }
  ];

  const mouse = { x: null, y: null, radius: 150 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.9;
      this.vy = (Math.random() - 0.5) * 0.9;
      this.radius = Math.random() * 2 + 1;
      const p = palette[Math.floor(Math.random() * palette.length)];
      this.color = p.color;
      this.glow = p.glow;
      this.baseAlpha = Math.random() * 0.5 + 0.3;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 1) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 2;
          this.y -= Math.sin(angle) * force * 2;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.baseAlpha;
      ctx.shadowBlur = 6;
      ctx.shadowColor = this.glow;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionRadius) {
          const opacity = (1 - dist / connectionRadius) * 0.22;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.strokeStyle = (a % 2 === 0) 
            ? `rgba(212, 175, 55, ${opacity})` 
            : `rgba(0, 240, 255, ${opacity * 0.9})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================
   2. INTERACTIVE ROI CALCULATOR
   ========================================== */
function initRoiCalculator() {
  const budgetSlider = document.getElementById('budgetSlider');
  const budgetValText = document.getElementById('budgetValText');
  const industryBtns = document.querySelectorAll('.industry-btn');
  
  const resLeads = document.getElementById('resLeads');
  const resCpl = document.getElementById('resCpl');
  const resPipeline = document.getElementById('resPipeline');

  if (!budgetSlider || !budgetValText) return;

  // Benchmark Data per Industry: { avgCpl, closeRate, avgTicket }
  const benchmarks = {
    'hartanah': { cpl: 18, closeRate: 0.05, avgTicket: 12000 },
    'kontraktor': { cpl: 14, closeRate: 0.12, avgTicket: 4500 },
    'homestay': { cpl: 8, closeRate: 0.25, avgTicket: 750 },
    'ecommerce': { cpl: 6, closeRate: 0.30, avgTicket: 180 },
    'servis': { cpl: 12, closeRate: 0.15, avgTicket: 1500 },
    'fnb': { cpl: 5, closeRate: 0.35, avgTicket: 95 }
  };

  let currentIndustry = 'hartanah';

  industryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      industryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentIndustry = btn.getAttribute('data-industry');
      calculate();
    });
  });

  budgetSlider.addEventListener('input', () => {
    calculate();
  });

  function calculate() {
    const budget = parseInt(budgetSlider.value, 10);
    budgetValText.textContent = `RM ${budget.toLocaleString()}`;

    const data = benchmarks[currentIndustry] || benchmarks['hartanah'];
    const estLeads = Math.floor(budget / data.cpl);
    const estClosing = Math.max(1, Math.floor(estLeads * data.closeRate));
    const estPipeline = estClosing * data.avgTicket;

    if (resLeads) resLeads.textContent = `${estLeads} Prospek WhatsApp`;
    if (resCpl) resCpl.textContent = `RM ${data.cpl.toFixed(2)}`;
    if (resPipeline) resPipeline.textContent = `RM ${estPipeline.toLocaleString()}`;
  }

  calculate();
}

/* ==========================================
   3. FAQ ACCORDION
   ========================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
}
