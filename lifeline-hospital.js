/* ══════════════════════════════════════════════════════════════
   Life Line Multi Specialty Hospital — Premium Motion Engine
   GPU-Accelerated · 60 FPS · Mobile-First
   ══════════════════════════════════════════════════════════════ */

/* ── EMAILJS CONFIGURATION ─────────────────────────────────── */
const EMAILJS_PUBLIC_KEY  = 'r78yA1TYmix238w2D';
const EMAILJS_SERVICE_ID  = 'service_3vpi5b9';
const EMAILJS_TEMPLATE_ID = 'template_kbepssk';
const EMAILJS_CONFIGURED  = EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY';

/* ── UTILITIES ─────────────────────────────────────────────── */
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function lerp(a, b, t) { return a + (b - a) * t; }
const isMobile = () => window.innerWidth < 768;
const isTouch = () => matchMedia('(hover: none)').matches;
const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ══════════════════════════════════════════════════════════════
   1. PREMIUM LOADER — ECG + GLASS DOOR TRANSITION
   ══════════════════════════════════════════════════════════════ */
(function initLoader() {

  // Clear any stale session flags so loader always plays on every visit
  sessionStorage.removeItem('llh_loaded');

  /* ── ECG path (normalised 0-1) ─────────────────────────── */
  const ECG_PATH = [
    [0,0],[.04,0],[.07,-.04],[.09,.05],[.12,-.03],[.14,0],
    [.18,0],[.20,-.06],[.22,.5],[.24,1],[.26,.6],[.27,0],[.29,-.45],[.31,0],
    [.34,0],[.37,-.04],[.39,.06],[.41,-.03],[.43,0],
    [.47,0],[.49,-.06],[.51,.5],[.53,1],[.55,.6],[.56,0],[.58,-.45],[.60,0],
    [.63,0],[.66,-.04],[.68,.06],[.70,-.03],[.72,0],
    [.76,0],[.78,-.06],[.80,.5],[.82,1],[.84,.6],[.85,0],[.87,-.45],[.89,0],
    [.92,0],[.95,0],[1,0]
  ];

  const canvasL = document.getElementById('ecgCanvasLeft');
  const canvasR = document.getElementById('ecgCanvasRight');
  if (!canvasL || !canvasR) return;
  const ctxL = canvasL.getContext('2d');
  const ctxR = canvasR.getContext('2d');
  let cW, cH, midY, ampY;

  function resizeCanvas() {
    const rect = canvasL.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    cW = canvasL.width = canvasR.width = rect.width * dpr;
    cH = canvasL.height = canvasR.height = rect.height * dpr;
    ctxL.scale(dpr, dpr);
    ctxR.scale(dpr, dpr);
    midY = rect.height * 0.55;
    ampY = rect.height * 0.38;
  }

  function getPoint(progress, rectW) {
    const px = progress * rectW;
    for (let i = 1; i < ECG_PATH.length; i++) {
      const x0 = ECG_PATH[i-1][0] * rectW;
      const x1 = ECG_PATH[i  ][0] * rectW;
      if (px <= x1) {
        const t = (px - x0) / (x1 - x0 || 1);
        const y = lerp(ECG_PATH[i-1][1], ECG_PATH[i][1], t);
        return { x: px, y: midY - y * ampY };
      }
    }
    return { x: rectW, y: midY };
  }

  function drawECGOnCtx(ctx, progress, rectW, steps, step) {
    ctx.clearRect(0, 0, cW, cH);
    if (progress <= 0) return;

    // Glow trail
    ctx.save();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,59,59,.25)';
    ctx.shadowColor = '#FF3B3B'; ctx.shadowBlur = 18;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const pt = getPoint(i * step, rectW);
      i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke(); ctx.restore();

    // Bright line
    ctx.save();
    ctx.lineWidth = 2; ctx.strokeStyle = '#FF3B3B';
    ctx.shadowColor = '#FF3B3B'; ctx.shadowBlur = 10;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const pt = getPoint(i * step, rectW);
      i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke(); ctx.restore();

    // Tip dot
    const tip = getPoint(progress, rectW);
    ctx.save();
    ctx.beginPath(); ctx.arc(tip.x, tip.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.shadowColor = '#FF3B3B'; ctx.shadowBlur = 20;
    ctx.fill(); ctx.restore();

    // Bloom
    ctx.save();
    ctx.beginPath(); ctx.arc(tip.x, tip.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,59,59,.18)';
    ctx.shadowColor = '#FF3B3B'; ctx.shadowBlur = 30;
    ctx.fill(); ctx.restore();
  }

  function drawECG(progress) {
    const dpr = window.devicePixelRatio || 1;
    const rectW = cW / dpr;
    const steps = 400;
    const step  = progress / steps;

    drawECGOnCtx(ctxL, progress, rectW, steps, step);
    drawECGOnCtx(ctxR, progress, rectW, steps, step);
  }

  /* ── Glass door split ───────────────────────────────── */
  function openGlassDoors() {
    const loader = document.getElementById('loader');
    const doorL  = document.getElementById('doorLeft');
    const doorR  = document.getElementById('doorRight');
    const app    = document.getElementById('app-wrapper');

    // Make the homepage content fully visible underneath
    if (app) {
      app.style.transition = 'none';
      app.style.transform  = 'none';
      app.style.opacity    = '1';
    }

    // Add center-seam glow
    const glow = document.createElement('div');
    glow.className = 'door-seam-glow';
    document.body.appendChild(glow);

    // Slide doors open and activate the bloom seam animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (doorL) doorL.classList.add('open');
        if (doorR) doorR.classList.add('open');
        glow.classList.add('active');
      });
    });

    // Cleanup loader resources after transition finishes
    setTimeout(() => {
      if (doorL)  doorL.remove();
      if (doorR)  doorR.remove();
      if (loader) loader.remove();
      glow.remove();
      sessionStorage.setItem('llh_loaded', '1');
      triggerHeroSequence();
      initScrollObserver();
      initECGLoop();
    }, 960);
  }

  /* ── Full loader sequence ──────────────────────────────── */
  function runLoader() {
    const logos = document.querySelectorAll('.ldr-logo-wrap');
    const names = document.querySelectorAll('.ldr-name-wrap');

    // Fade in logo + name
    requestAnimationFrame(() => {
      logos.forEach(logo => logo.classList.add('visible'));
      names.forEach(name => name.classList.add('visible'));
    });

    // Reduced motion fallback
    if (prefersReducedMotion()) {
      setTimeout(openGlassDoors, 600);
      return;
    }

    // Start ECG heartbeat animation
    setTimeout(() => {
      resizeCanvas();
      canvasL.classList.add('visible');
      canvasR.classList.add('visible');

      const ECG_DURATION = 2500;
      let ecgStart = null;

      function ecgStep(ts) {
        if (!ecgStart) ecgStart = ts;
        const progress = Math.min((ts - ecgStart) / ECG_DURATION, 1);
        drawECG(progress);
        if (progress < 1) {
          requestAnimationFrame(ecgStep);
        } else {
          // Pause 300ms, then slide open
          setTimeout(openGlassDoors, 300);
        }
      }
      requestAnimationFrame(ecgStep);

    }, 400);
  }

  // Safety fallback
  setTimeout(() => {
    const app = document.getElementById('app-wrapper');
    if (app && app.style.opacity !== '1') {
      openGlassDoors();
    }
  }, 8000);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runLoader);
  } else {
    runLoader();
  }
})();


/* ══════════════════════════════════════════════════════════════
   2. HERO SEQUENCE — Word-by-Word Reveal + Staggered Elements
   ══════════════════════════════════════════════════════════════ */
function triggerHeroSequence() {
  const h1 = document.getElementById('heroH1');
  if (h1 && !h1.dataset.split) {
    h1.dataset.split = '1';
    // Split text nodes into words
    const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach(node => {
      const words = node.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      words.forEach(w => {
        if (/^\s+$/.test(w)) {
          frag.appendChild(document.createTextNode(w));
        } else if (w.length > 0) {
          const span = document.createElement('span');
          span.className = 'word';
          span.textContent = w;
          frag.appendChild(span);
        }
      });
      node.parentNode.replaceChild(frag, node);
    });

    // Stagger word reveals
    const wordEls = h1.querySelectorAll('.word');
    wordEls.forEach((w, i) => {
      setTimeout(() => w.classList.add('visible'), 200 + i * 120);
    });
  }

  // Staggered hero element reveals
  const delays = [
    ['heroEyebrow', 100],
    ['heroSub', 600],
    ['heroBtns', 800],
    ['heroStats', 1000],
    ['heroCard', 700],
    ['scrollHint', 1600],
  ];
  delays.forEach(([id, delay]) => {
    const el = document.getElementById(id);
    if (el) setTimeout(() => el.classList.add('visible'), delay);
  });

  // Trigger stat counters in hero
  setTimeout(() => {
    document.querySelectorAll('#heroStats [data-count]').forEach(el => animateCounter(el));
  }, 1200);
}


/* ══════════════════════════════════════════════════════════════
   3. SCROLL OBSERVER — One-time reveals with stagger
   ══════════════════════════════════════════════════════════════ */
function initScrollObserver() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        // Counter animation
        if (e.target.dataset.count) animateCounter(e.target);
        // Rating bars
        if (e.target.closest && e.target.closest('.overall-card')) animateRatingBars();
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll(
    '.reveal-up,.reveal-left,.reveal-right,.reveal-scale,[data-count]'
  ).forEach(el => io.observe(el));

  const oc = document.querySelector('.overall-card');
  if (oc) io.observe(oc);
}


/* ══════════════════════════════════════════════════════════════
   4. COUNTER ANIMATION — 2s, easeOutCubic
   ══════════════════════════════════════════════════════════════ */
function animateCounter(el) {
  if (el.dataset.animated) return;
  el.dataset.animated = '1';

  const target   = parseInt(el.dataset.count);
  const suffix   = target >= 1000 ? '+' : (target === 24 ? '/7' : '+');
  const duration = 2000;
  const start    = performance.now();

  function step(now) {
    const p    = Math.min((now - start) / duration, 1);
    const ease = easeOutCubic(p);
    el.textContent = Math.floor(ease * target) + (p >= 1 ? suffix : '');
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}


/* ══════════════════════════════════════════════════════════════
   5. RATING BAR ANIMATION
   ══════════════════════════════════════════════════════════════ */
function animateRatingBars() {
  document.querySelectorAll('.oc-fill').forEach(bar => {
    bar.classList.add('animated');
  });
}


/* ══════════════════════════════════════════════════════════════
   6. NAVBAR — Sticky scroll behavior
   ══════════════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();


/* ══════════════════════════════════════════════════════════════
   7. MOBILE MENU
   ══════════════════════════════════════════════════════════════ */
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    if (isOpen) {
      mobileMenu.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      // Let transition complete, then hide
      setTimeout(() => {
        if (!mobileMenu.classList.contains('open')) {
          mobileMenu.style.display = 'none';
        }
      }, 350);
    } else {
      mobileMenu.style.display = 'block';
      // Force reflow for transition
      mobileMenu.offsetHeight;
      mobileMenu.classList.add('open');
      menuBtn.setAttribute('aria-expanded', 'true');
    }
  });
}

function closeMob() {
  if (mobileMenu) {
    mobileMenu.classList.remove('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    setTimeout(() => { mobileMenu.style.display = 'none'; }, 350);
  }
}


/* ══════════════════════════════════════════════════════════════
   8. CONTINUOUSLY LOOPING ECG HEARTBEAT
   ══════════════════════════════════════════════════════════════ */
function initECGLoop() {
  const canvas = document.getElementById('ecgLoop');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Simplified ECG wave points
  const wave = [
    0,0,0,0,0,0,-.02,.03,-.02,0,0,0,
    -.04,.35,.8,.5,0,-.35,0,
    0,0,.08,.15,.1,0,0,0,0,0,0,0
  ];

  let running = true;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  // Visibility-based pause
  const ecgObserver = new IntersectionObserver(entries => {
    running = entries[0].isIntersecting;
  }, { threshold: 0 });
  ecgObserver.observe(canvas);

  const CYCLE = 3500; // ms per heartbeat cycle

  function draw(ts) {
    if (!running) { requestAnimationFrame(draw); return; }

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const midY = h * 0.5;
    const amp = h * 0.4;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const progress = (ts % CYCLE) / CYCLE; // 0→1 repeating
    const pulseX = progress * w * 1.3 - w * 0.15; // pulse travels left to right

    // Draw baseline
    ctx.save();
    ctx.strokeStyle = 'rgba(13,59,122,.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();
    ctx.restore();

    // Draw ECG wave
    const waveWidth = w * 0.3; // wave occupies 30% of canvas width
    const waveStart = pulseX - waveWidth;

    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Create gradient along the wave
    const grad = ctx.createLinearGradient(waveStart, 0, pulseX, 0);
    grad.addColorStop(0, 'rgba(229,57,53,0)');
    grad.addColorStop(0.3, 'rgba(229,57,53,.3)');
    grad.addColorStop(1, 'rgba(229,57,53,.6)');
    ctx.strokeStyle = grad;

    ctx.beginPath();
    for (let i = 0; i < wave.length; i++) {
      const x = waveStart + (i / (wave.length - 1)) * waveWidth;
      const y = midY - wave[i] * amp;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Glow dot at tip
    const tipIdx = wave.length - 1;
    const tipX = pulseX;
    const tipY = midY - wave[tipIdx] * amp;
    ctx.beginPath();
    ctx.arc(tipX, tipY, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(229,57,53,.5)';
    ctx.shadowColor = 'rgba(229,57,53,.4)';
    ctx.shadowBlur = 10;
    ctx.fill();

    ctx.restore();

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}


/* ══════════════════════════════════════════════════════════════
   9. TESTIMONIAL CAROUSEL — Auto-slide + Swipe
   ══════════════════════════════════════════════════════════════ */
(function initCarousel() {
  const track  = document.getElementById('reviewsTrack');
  const dotsEl = document.getElementById('carouselDots');
  if (!track || !dotsEl) return;

  const cards = track.querySelectorAll('.rev-card');
  const total = cards.length;
  let current = 0;
  let autoTimer = null;
  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;

  // Create dots
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Review ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  }

  function getSlideWidth() {
    // Account for different cards-per-view at different breakpoints
    const containerWidth = track.parentElement.offsetWidth;
    if (window.innerWidth >= 1024) return containerWidth / 3;
    if (window.innerWidth >= 768) return containerWidth / 2;
    return containerWidth;
  }

  function goTo(index) {
    current = ((index % total) + total) % total;
    const slideW = getSlideWidth();
    const gap = 20;
    currentTranslate = -(current * (slideW + gap));
    track.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;

    dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function next() { goTo(current + 1); }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, 5000);
  }
  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  // Hover pause
  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  // Touch/pointer swipe
  let pointerStartX = 0;
  let pointerStartTranslate = 0;

  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isDragging = true;
    pointerStartX = e.clientX;
    pointerStartTranslate = currentTranslate;
    track.style.transition = 'none';
    track.setPointerCapture(e.pointerId);
    stopAuto();
  });

  track.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const diff = e.clientX - pointerStartX;
    currentTranslate = pointerStartTranslate + diff;
    track.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;
  });

  track.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = 'transform .5s cubic-bezier(0.33,1,0.68,1)';
    const diff = e.clientX - pointerStartX;
    const threshold = getSlideWidth() * 0.2;
    if (diff < -threshold) next();
    else if (diff > threshold) goTo(current - 1);
    else goTo(current);
    startAuto();
  });

  track.addEventListener('pointercancel', () => {
    isDragging = false;
    track.style.transition = 'transform .5s cubic-bezier(0.33,1,0.68,1)';
    goTo(current);
    startAuto();
  });

  // Prevent default drag
  track.addEventListener('dragstart', e => e.preventDefault());

  // Resize handler
  window.addEventListener('resize', () => goTo(current));

  // Start
  startAuto();
})();


/* ══════════════════════════════════════════════════════════════
   10. FLOATING MEDICAL ELEMENTS — SVG Injection
   ══════════════════════════════════════════════════════════════ */
(function initFloatingElements() {
  if (prefersReducedMotion()) return;

  const svgs = {
    cross: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 5v14M5 12h14"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    capsule: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="8" y="2" width="8" height="20" rx="4"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
    stethoscope: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 15s1-1 2-1 3 2 5 2 4-2 5-2 2 1 2 1"/><circle cx="18" cy="18" r="2"/><path d="M18 16v-2a4 4 0 00-4-4H8"/><circle cx="6" cy="4" r="2"/><circle cx="10" cy="4" r="2"/><path d="M6 6v3M10 6v3"/></svg>',
    dna: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/></svg>',
  };

  const keys = Object.keys(svgs);

  function inject(containerId, count) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // On mobile reduce count by 80%
    const finalCount = isMobile() ? Math.max(1, Math.round(count * 0.2)) : count;

    for (let i = 0; i < finalCount; i++) {
      const el = document.createElement('div');
      el.className = 'float-el';
      el.style.color = ['#0d3b7a','#2196f3','#e53935','#2e9d58'][Math.floor(Math.random() * 4)];
      el.style.width = (18 + Math.random() * 18) + 'px';
      el.style.height = el.style.width;
      el.style.top = (Math.random() * 90) + '%';
      el.style.left = (Math.random() * 90) + '%';
      el.style.opacity = (0.03 + Math.random() * 0.04).toFixed(3);
      el.style.animationDelay = (Math.random() * 4) + 's';
      el.innerHTML = svgs[keys[Math.floor(Math.random() * keys.length)]];
      container.appendChild(el);
    }
  }

  inject('heroFloats', 8);
  inject('doctorFloats', 6);
})();


/* ══════════════════════════════════════════════════════════════
   11. BACKGROUND PARTICLES — Subtle floating circles + plus icons
   ══════════════════════════════════════════════════════════════ */
(function initParticles() {
  if (prefersReducedMotion()) return;

  function inject(containerId, count) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const finalCount = isMobile() ? Math.max(2, Math.round(count * 0.2)) : count;

    for (let i = 0; i < finalCount; i++) {
      const p = document.createElement('div');
      const isPlus = Math.random() > 0.6;
      p.className = 'bg-particle' + (isPlus ? ' plus' : '');

      if (!isPlus) {
        const size = 40 + Math.random() * 80;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.background = ['rgba(33,150,243,.06)','rgba(13,59,122,.05)','rgba(229,57,53,.04)'][Math.floor(Math.random()*3)];
        p.style.filter = 'blur(20px)';
      } else {
        p.style.color = ['rgba(13,59,122,.08)','rgba(33,150,243,.06)'][Math.floor(Math.random()*2)];
      }

      p.style.top = (Math.random() * 100) + '%';
      p.style.left = (Math.random() * 100) + '%';
      p.style.animationDelay = (Math.random() * 12) + 's';
      p.style.animationDuration = (10 + Math.random() * 10) + 's';
      container.appendChild(p);
    }
  }

  inject('servicesParticles', 10);
  inject('aboutParticles', 8);
})();


/* ══════════════════════════════════════════════════════════════
   12. MOUSE TILT EFFECT — Desktop only, max 3°
   ══════════════════════════════════════════════════════════════ */
(function initMouseTilt() {
  if (isTouch() || isMobile()) return;

  const cards = document.querySelectorAll('.tilt-card');
  if (!cards.length) return;

  let rafId = null;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rotateY = x * 3; // max 3°
        const rotateX = -y * 3;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0,-6px,0)`;
        rafId = null;
      });
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ══════════════════════════════════════════════════════════════
   13. CURSOR GLOW — Desktop only
   ══════════════════════════════════════════════════════════════ */
(function initCursorGlow() {
  if (isTouch() || isMobile()) return;
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;
  let visible = false;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!visible) {
      visible = true;
      glow.style.opacity = '1';
      tick();
    }
  });

  document.addEventListener('mouseleave', () => {
    visible = false;
    glow.style.opacity = '0';
  });

  function tick() {
    if (!visible) return;
    glowX += (mouseX - glowX) * 0.1;
    glowY += (mouseY - glowY) * 0.1;
    glow.style.transform = `translate3d(${glowX - 150}px, ${glowY - 150}px, 0)`;
    requestAnimationFrame(tick);
  }
})();


/* ══════════════════════════════════════════════════════════════
   14. APPOINTMENT FORM (EmailJS / WhatsApp)
   ══════════════════════════════════════════════════════════════ */
// Date input min
const dateInput = document.getElementById('f-date');
if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

function submitForm(e) {
  e.preventDefault();

  const name   = document.getElementById('f-name').value.trim();
  const phone  = document.getElementById('f-phone').value.trim();
  const doctor = document.getElementById('f-doctor').value;
  const dept   = document.getElementById('f-dept').value;
  const date   = document.getElementById('f-date').value;
  const time   = document.getElementById('f-time').value;
  const msg    = document.getElementById('f-msg').value.trim();

  const successEl = document.getElementById('form-success');
  const errorEl   = document.getElementById('form-error');
  const submitBtn = document.getElementById('submitBtn');

  successEl.style.display = 'none';
  errorEl.style.display   = 'none';

  if (!name) { showError('Please enter your full name.'); return; }
  if (!phone || phone.replace(/\D/g, '').length < 10) {
    showError('Please enter a valid 10-digit phone number.'); return;
  }
  if (!doctor) { showError('Please select a doctor.'); return; }
  if (!dept) { showError('Please select a department.'); return; }

  function showError(msg) {
    errorEl.textContent = '⚠️ ' + msg;
    errorEl.style.display = 'block';
    errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ Sending…';

  if (EMAILJS_CONFIGURED) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    const templateParams = {
      from_name: name, from_phone: phone, doctor_name: doctor,
      department: dept, preferred_date: date || 'Not specified',
      preferred_time: time || 'Any Time', message: msg || 'No additional notes.',
      reply_to: phone, hospital_name: 'Life Line Multi Specialty Hospital, Kadapa',
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
      .then(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg> Confirm Appointment Request';
        document.getElementById('apptForm').reset();
        if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
        successEl.style.display = 'block';
        successEl.textContent = '✅ Thank you! Your appointment request has been sent. Our team will call you shortly to confirm.';
        successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(() => { successEl.style.display = 'none'; }, 8000);
      })
      .catch(err => {
        console.error('EmailJS error:', err);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg> Confirm Appointment Request';
        const detail = err && err.text ? err.text : (err && err.message ? err.message : JSON.stringify(err));
        showError(`Could not send request: ${detail}. Please call us at +91 85568 55699 directly.`);
      });
  } else {
    const waText = encodeURIComponent(
      `*Appointment Request — Life Line Multi Specialty Hospital*\n\n` +
      `Name: ${name}\nPhone: ${phone}\n` +
      `Doctor: ${doctor}\nDepartment: ${dept}\n` +
      `Preferred Date: ${date || 'Flexible'}\n` +
      `Time Slot: ${time || 'Any Time'}\n` +
      `Notes: ${msg || 'None'}`
    );
    const waUrl = `https://wa.me/918556855699?text=${waText}`;

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg> Confirm Appointment Request';
    successEl.style.display = 'block';
    successEl.innerHTML = `✅ Request ready! <a href="${waUrl}" target="_blank" rel="noopener" style="color:var(--green);font-weight:700;">Click here to send via WhatsApp →</a><br><small style="font-weight:400;opacity:.8">A link has been prepared with your details for WhatsApp.</small>`;
    successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => { successEl.style.display = 'none'; }, 12000);
  }
}


/* ══════════════════════════════════════════════════════════════
   15. SELECT DOCTOR FROM CARD
   ══════════════════════════════════════════════════════════════ */
function selectDoctor(doctorName, departmentName) {
  const doctorSelect = document.getElementById('f-doctor');
  const deptSelect   = document.getElementById('f-dept');
  const nameInput    = document.getElementById('f-name');

  if (doctorSelect) doctorSelect.value = doctorName;
  if (deptSelect) deptSelect.value = departmentName;
  if (nameInput) setTimeout(() => nameInput.focus(), 100);
}


/* ══════════════════════════════════════════════════════════════
   16. SMOOTH SCROLL with section transitions
   ══════════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      closeMob();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
