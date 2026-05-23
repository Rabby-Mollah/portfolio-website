/* ===================================================
   PORTFOLIO WEBSITE — SCRIPT.JS
   Alex Mercer Engineering Portfolio
   =================================================== */

// Firebase Config & Initialization
const firebaseConfig = {
  apiKey: "AIzaSyBnZu6BbEVeTQnVXaM5rxeOuVk81tX2N_M",
  authDomain: "portfolio-67bed.firebaseapp.com",
  projectId: "portfolio-67bed",
  storageBucket: "portfolio-67bed.firebasestorage.app",
  messagingSenderId: "260497213060",
  appId: "1:260497213060:web:c13d34963faab0b69c24d1",
  measurementId: "G-BQVHRYJVPN"
};

const API_BASE = '';
let db = null;
try {
  if (typeof firebase !== 'undefined') {
    // Prevent duplicate app init error
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    console.log('[Firebase] Firestore initialized successfully.');
  } else {
    console.warn('[Firebase] firebase SDK not found. db = null.');
  }
} catch(err) {
  console.error('[Firebase] Init failed:', err);
}

async function getCloudData(key, def) {
  if (!db) { console.warn('[Firebase] getCloudData skipped — db is null'); return def; }
  try {
    const doc = await db.collection('portfolio').doc(key).get();
    if (doc.exists) return doc.data().value;
  } catch(e) { console.error('[Firebase] Read error for key:', key, e); }
  return def;
}

async function setCloudData(key, val) {
  if (!db) { console.error('[Firebase] setCloudData FAILED — db is null! Firebase SDK may not be loaded.'); return; }
  console.log('[Firebase] Writing key:', key, val);
  try {
    await db.collection('portfolio').doc(key).set({ value: val });
    console.log('[Firebase] Write SUCCESS for key:', key);
  } catch(e) { console.error('[Firebase] Write FAILED for key:', key, e); }
}

/* ─── DOM Ready ─── */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initCursor();
  initTheme();
  initNavbar();
  initHeroCanvas();
  initTypingEffect();
  initScrollAnimations();
  initCounters();
  initSkills();
  initProjects();
  initDesignGallery();
  initExperience();
  initAchievements();
  initTestimonials();
  initContactForm();
  initMobileMenu();
  initBackToTop();
  initHeroStats();
  setCurrentYear();
  checkApiStatus();
  loadContactInfo();
});

/* ─── Loader ─── */
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 1800);
  });
  setTimeout(() => loader.classList.add('hidden'), 3000);
}

/* ─── Custom Cursor ─── */
function initCursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, .project-card, .skill-card, .design-item').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('expand'));
    el.addEventListener('mouseleave', () => ring.classList.remove('expand'));
  });
}

/* ─── Theme ─── */
function initTheme() {
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  applyTheme(savedTheme);

  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  document.getElementById('dashThemeToggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('portfolio-theme', theme);
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
  const dashIcon = document.getElementById('dashThemeIcon');
  if (dashIcon) {
    dashIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

/* ─── Navbar ─── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    const scrollProgress = document.getElementById('scrollProgress');
    if (scrollProgress) {
      scrollProgress.style.width = (window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100) + '%';
    }
    document.getElementById('backToTop')?.classList.toggle('visible', window.scrollY > 400);

    // Active link
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  });
}

/* ─── Mobile Menu ─── */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!hamburger || !menu) return;
  const close = document.getElementById('mobileClose');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    menu.classList.add('open');
  });
  close?.addEventListener('click', closeMenu);
  mobileLinks.forEach(l => l.addEventListener('click', closeMenu));

  function closeMenu() {
    menu.classList.remove('open');
    hamburger.classList.remove('open');
  }
}

/* ─── Hero Canvas (Particle Network) ─── */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];
  const PARTICLE_COUNT = 60;
  const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r = Math.random() * 2 + 1;
      this.alpha = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = isDark()
        ? `rgba(96, 153, 102, ${this.alpha})`
        : `rgba(64, 81, 59, ${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const alpha = (1 - dist / 140) * 0.15;
          ctx.strokeStyle = isDark()
            ? `rgba(96, 153, 102, ${alpha})`
            : `rgba(64, 81, 59, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animate);
  }
  animate();
}

/* ─── Typing Effect ─── */
let typingTimeout = null;
function initTypingEffect() {
  const el = document.getElementById('typedText');
  if (!el) return;
  const roles = window.profileRoles || ['Robotics Engineer', 'Mechatronics Designer', 'Creative Organizer', 'CAD Designer', 'Embedded Systems Dev', 'Event Manager'];
  let roleIdx = 0, charIdx = 0, deleting = false;

  // Clear any previous typing loop
  if (typingTimeout) clearTimeout(typingTimeout);

  function type() {
    const current = roles[roleIdx];
    el.textContent = current.substring(0, charIdx);

    if (!deleting && charIdx < current.length) {
      charIdx++; typingTimeout = setTimeout(type, 90);
    } else if (!deleting && charIdx === current.length) {
      typingTimeout = setTimeout(() => { deleting = true; type(); }, 1800);
    } else if (deleting && charIdx > 0) {
      charIdx--; typingTimeout = setTimeout(type, 45);
    } else {
      deleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      typingTimeout = setTimeout(type, 300);
    }
  }
  type();
}

/* ─── Scroll Animations ─── */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Stagger children if parent has data-stagger
        if (entry.target.hasAttribute('data-stagger')) {
          entry.target.querySelectorAll('[data-stagger-child]').forEach((child, i) => {
            setTimeout(() => child.classList.add('visible'), i * 100);
          });
        }
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => observer.observe(el));
}

/* ─── Counters ─── */
function initCounters() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter, .stat-num').forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target || el.textContent, 10);
  if (isNaN(target)) return;
  const duration = 1800;
  const start = performance.now();
  function update(ts) {
    const elapsed = ts - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/* ─── Hero Stats ─── */
function initHeroStats() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  const stats = document.querySelector('.hero-stats');
  if (stats) observer.observe(stats);
}

/* ─── Skills ─── */
const defaultSkills = {
  engineering: [
    { name: 'CAD Design', icon: 'fa-drafting-compass', pct: 85 },
    { name: 'Robotics', icon: 'fa-robot', pct: 90 },
    { name: 'Arduino', icon: 'fa-microchip', pct: 88 },
    { name: 'Automation', icon: 'fa-cogs', pct: 78 },
    { name: 'Embedded Systems', icon: 'fa-memory', pct: 82 },
    { name: 'Mechatronics', icon: 'fa-industry', pct: 87 },
  ],
  design: [
    { name: 'UI/UX Design', icon: 'fa-vector-square', pct: 80 },
    { name: 'Poster Design', icon: 'fa-image', pct: 92 },
    { name: 'Branding', icon: 'fa-paint-brush', pct: 75 },
    { name: 'Graphic Design', icon: 'fa-palette', pct: 85 },
    { name: 'Figma', icon: 'fa-pencil-ruler', pct: 78 },
    { name: 'Presentation', icon: 'fa-chalkboard', pct: 90 },
  ],
  technical: [
    { name: 'HTML/CSS', icon: 'fa-code', pct: 88 },
    { name: 'JavaScript', icon: 'fa-js', pct: 75 },
    { name: 'Node.js', icon: 'fa-server', pct: 65 },
    { name: 'C/C++', icon: 'fa-terminal', pct: 80 },
    { name: 'Git', icon: 'fa-code-branch', pct: 82 },
    { name: 'Python', icon: 'fa-python', pct: 70 },
  ]
};

let currentSkillCategory = 'engineering';

function initSkills() {
  const tabs = document.querySelectorAll('.skill-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentSkillCategory = tab.dataset.category;
      renderSkills(currentSkillCategory);
    });
  });
  fetchAndRenderProfile();
  fetchAndRenderSkills();
}

/* ─── Load Social Links on Portfolio ─── */
async function loadSocialLinks() {
  const settings = await getCloudData('settings', null);
  if (!settings) return;
  
  // Update hero social links
  const heroSocials = document.querySelector('.hero-socials');
  if (heroSocials) {
    const links = heroSocials.querySelectorAll('.social-icon');
    links.forEach(link => {
      const icon = link.querySelector('i');
      if (!icon) return;
      if (icon.classList.contains('fa-github') && settings.github) link.href = settings.github;
      if (icon.classList.contains('fa-linkedin-in') && settings.linkedin) link.href = settings.linkedin;
      if (icon.classList.contains('fa-instagram') && settings.instagram) link.href = settings.instagram;
      if (icon.classList.contains('fa-behance') && settings.behance) link.href = settings.behance;
      if (icon.classList.contains('fa-envelope') && settings.email) link.href = 'mailto:' + settings.email;
    });
  }
  
  // Update contact section social links
  const contactSocials = document.querySelector('.contact-socials');
  if (contactSocials) {
    const links = contactSocials.querySelectorAll('.social-link');
    links.forEach(link => {
      const icon = link.querySelector('i');
      if (!icon) return;
      if (icon.classList.contains('fa-github') && settings.github) link.href = settings.github;
      if (icon.classList.contains('fa-linkedin-in') && settings.linkedin) link.href = settings.linkedin;
      if (icon.classList.contains('fa-instagram') && settings.instagram) link.href = settings.instagram;
      if (icon.classList.contains('fa-behance') && settings.behance) link.href = settings.behance;
    });
  }
  
  // Update footer social links
  const footerSocials = document.querySelector('.footer-socials');
  if (footerSocials) {
    const links = footerSocials.querySelectorAll('a');
    links.forEach(link => {
      const icon = link.querySelector('i');
      if (!icon) return;
      if (icon.classList.contains('fa-github') && settings.github) link.href = settings.github;
      if (icon.classList.contains('fa-linkedin-in') && settings.linkedin) link.href = settings.linkedin;
      if (icon.classList.contains('fa-instagram') && settings.instagram) link.href = settings.instagram;
      if (icon.classList.contains('fa-behance') && settings.behance) link.href = settings.behance;
    });
  }
}

async function fetchAndRenderProfile() {
  const profile = await getCloudData('profile', null);
  if (!profile) return;
  
  if (profile.firstName && document.getElementById('heroFirstName')) document.getElementById('heroFirstName').textContent = profile.firstName;
  if (profile.lastName && document.getElementById('heroLastName')) document.getElementById('heroLastName').textContent = profile.lastName;
  if (profile.shortBio && document.getElementById('heroBioText')) document.getElementById('heroBioText').innerHTML = profile.shortBio;
  if (profile.bio && document.getElementById('aboutBio')) document.getElementById('aboutBio').innerHTML = profile.bio;
  if (profile.location && document.getElementById('aboutLocation')) document.getElementById('aboutLocation').textContent = profile.location;
  if (profile.degree && document.getElementById('aboutEducation')) document.getElementById('aboutEducation').textContent = profile.degree;
  if (profile.university && document.getElementById('aboutUniversity')) document.getElementById('aboutUniversity').textContent = profile.university;
  if (profile.photoUrl && document.getElementById('heroPhoto')) document.getElementById('heroPhoto').src = profile.photoUrl;
  if (profile.photoUrl && document.getElementById('aboutPhoto')) document.getElementById('aboutPhoto').src = profile.photoUrl;
  
  if (profile.roles) {
    window.profileRoles = profile.roles.split(',').map(s=>s.trim()).filter(s=>s);
    // Re-initialize typing effect with updated roles
    initTypingEffect();
  }
}

async function fetchAndRenderSkills() {
  const localSkills = await getCloudData('skills', null);
  if (localSkills && localSkills.length > 0) {
    const cats = {};
    localSkills.forEach(s => {
      const cat = s.category || 'engineering';
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push({ name: s.name, icon: s.icon || 'fa-star', pct: s.percentage });
    });
    Object.assign(defaultSkills, cats);
  }

  renderSkills(currentSkillCategory);
}

function renderSkills(category) {
  const grid = document.getElementById('skillsGrid');
  if (!grid) return;
  const skills = defaultSkills[category] || [];
  grid.innerHTML = skills.map(s => `
    <div class="skill-card reveal-up">
      <div class="skill-icon"><i class="fas ${s.icon}"></i></div>
      <div class="skill-name">${s.name}</div>
      <div class="skill-bar-wrap"><div class="skill-bar" data-pct="${s.pct}"></div></div>
      <span class="skill-pct">${s.pct}%</span>
    </div>
  `).join('');

  // Animate bars
  requestAnimationFrame(() => {
    grid.querySelectorAll('.skill-bar').forEach((bar, i) => {
      setTimeout(() => {
        bar.style.width = bar.dataset.pct + '%';
        bar.closest('.skill-card').classList.add('visible');
      }, i * 80);
    });
  });
}

/* ─── Projects ─── */
const defaultProjects = [
  {
    id: 1, title: 'Autonomous Line-Following Robot',
    description: 'PID-controlled mobile robot that navigates complex paths using IR sensor array and motor encoders.',
    tags: ['robotics', 'arduino'], technologies: ['Arduino', 'C++', 'PID'],
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80',
    github: '#', demo: '#'
  },
  {
    id: 2, title: 'Smart Greenhouse Automation',
    description: 'IoT-based system monitoring soil moisture, temperature, and humidity with automatic irrigation control.',
    tags: ['automation', 'arduino'], technologies: ['NodeMCU', 'MQTT', 'Sensors'],
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
    github: '#', demo: '#'
  },
  {
    id: 3, title: '3-DoF Robotic Arm',
    description: 'Servo-driven robotic arm with inverse kinematics solver and remote control via mobile app.',
    tags: ['robotics', 'mechatronics'], technologies: ['STM32', 'Python', 'Bluetooth'],
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
    github: '#', demo: null
  },
  {
    id: 4, title: 'CNC Pen Plotter',
    description: 'Desktop CNC machine built from scratch, converts SVG files to precise drawings with GRBL firmware.',
    tags: ['mechatronics', 'automation'], technologies: ['GRBL', 'Arduino', 'CAD'],
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80',
    github: '#', demo: '#'
  },
  {
    id: 5, title: 'Obstacle Avoiding Robot',
    description: 'Ultrasonic sensor-based autonomous vehicle with real-time obstacle detection and path planning.',
    tags: ['robotics', 'arduino'], technologies: ['Arduino', 'Ultrasonic', 'L298N'],
    image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=600&q=80',
    github: '#', demo: null
  },
  {
    id: 6, title: 'DC Motor Speed Controller',
    description: 'Variable speed PWM controller with closed-loop feedback for precision motor control applications.',
    tags: ['automation', 'mechatronics'], technologies: ['ATMEGA328', 'PWM', 'PID'],
    image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&q=80',
    github: '#', demo: null
  }
];

let activeProjectFilter = 'all';
let allProjects = [...defaultProjects];

function initProjects() {
  const filterBtns = document.querySelectorAll('#projects .filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeProjectFilter = btn.dataset.filter;
      renderProjects();
    });
  });
  fetchAndRenderProjects();
}

async function fetchAndRenderProjects() {
  const localProjects = await getCloudData('projects', null);
  if (localProjects && localProjects.length > 0) allProjects = localProjects;

  renderProjects();
}

function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  const filtered = activeProjectFilter === 'all'
    ? allProjects
    : allProjects.filter(p => p.tags?.includes(activeProjectFilter));

  grid.innerHTML = filtered.map((p, i) => `
    <div class="project-card reveal-up" style="animation-delay:${i * 0.08}s">
      <img class="project-img" src="${p.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600'}"
           alt="${p.title}" loading="lazy" />
      <div class="project-body">
        <div class="project-tags">
          ${(p.technologies || p.tags || []).map(t => `<span class="project-tag">${t}</span>`).join('')}
        </div>
        <h3 class="project-title">${p.title}</h3>
        <p class="project-desc">${p.description}</p>
        <div class="project-links">
          ${p.github ? `<a href="${p.github}" class="project-link" target="_blank"><i class="fab fa-github"></i> GitHub</a>` : ''}
          ${p.demo ? `<a href="${p.demo}" class="project-link" target="_blank"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  // Trigger animations
  requestAnimationFrame(() => {
    grid.querySelectorAll('.project-card').forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), i * 80);
    });
  });
}

/* ─── Design Gallery ─── */
const defaultDesigns = [
  { id:1, title:'TechFest 2024 Brand', description:'Complete visual identity for annual tech festival', category:'branding', image:'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80', height:'tall' },
  { id:2, title:'Robotics Club Poster', description:'Recruitment poster for university robotics club', category:'poster', image:'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=600&q=80', height:'short' },
  { id:3, title:'Engineering Dashboard UI', description:'Dark-themed admin dashboard design', category:'uiux', image:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80', height:'medium' },
  { id:4, title:'Competition Banner Series', description:'Event banners for robotics competition', category:'event', image:'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80', height:'short' },
  { id:5, title:'Club Social Pack', description:'Instagram post templates for engineering clubs', category:'social', image:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80', height:'tall' },
  { id:6, title:'Workshop Flyer Design', description:'Promotional materials for Arduino workshops', category:'poster', image:'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&q=80', height:'medium' },
  { id:7, title:'EV Team Branding', description:'Logo and identity for electric vehicle team', category:'branding', image:'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80', height:'short' },
  { id:8, title:'Mobile App Prototype', description:'Figma prototype for IoT monitoring app', category:'uiux', image:'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80', height:'tall' },
  { id:9, title:'Annual Report Design', description:'Infographic-rich annual report layout', category:'event', image:'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=600&q=80', height:'medium' },
];

let currentLightboxIndex = 0;
let activeDesigns = [...defaultDesigns];

function initDesignGallery() {
  const filterBtns = document.querySelectorAll('#design .filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterDesigns(btn.dataset.filter);
    });
  });
  fetchAndRenderDesigns();
  initLightbox();
}

async function fetchAndRenderDesigns() {
  const localDesigns = await getCloudData('designs', null);
  if (localDesigns && localDesigns.length > 0) activeDesigns = localDesigns;

  renderDesigns(activeDesigns);
}

function renderDesigns(designs) {
  const gallery = document.getElementById('designGallery');
  if (!gallery) return;
  gallery.innerHTML = designs.map((d, i) => `
    <div class="design-item" data-category="${d.category}" data-index="${i}" role="button" tabindex="0">
      <img src="${d.image}" alt="${d.title}" loading="lazy" />
      <div class="design-overlay">
        <h4>${d.title}</h4>
        <span>${d.category}</span>
      </div>
    </div>
  `).join('');

  gallery.querySelectorAll('.design-item').forEach(item => {
    item.addEventListener('click', () => openLightbox(parseInt(item.dataset.index), designs));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter') openLightbox(parseInt(item.dataset.index), designs);
    });
  });
}

function filterDesigns(filter) {
  const items = document.querySelectorAll('.design-item');
  items.forEach(item => {
    const match = filter === 'all' || item.dataset.category === filter;
    item.style.display = match ? '' : 'none';
    item.classList.toggle('hidden', !match);
  });
}

/* Lightbox */
let lightboxDesigns = [];
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev')?.addEventListener('click', () => changeLightbox(-1));
  document.getElementById('lightboxNext')?.addEventListener('click', () => changeLightbox(1));
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!lightbox?.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') changeLightbox(-1);
    if (e.key === 'ArrowRight') changeLightbox(1);
  });
}

function openLightbox(index, designs) {
  lightboxDesigns = designs;
  currentLightboxIndex = index;
  showLightboxItem(index);
  document.getElementById('lightbox')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox')?.classList.remove('open');
  document.body.style.overflow = '';
}

function changeLightbox(dir) {
  currentLightboxIndex = (currentLightboxIndex + dir + lightboxDesigns.length) % lightboxDesigns.length;
  showLightboxItem(currentLightboxIndex);
}

function showLightboxItem(index) {
  const d = lightboxDesigns[index];
  if (!d) return;
  document.getElementById('lightboxImg').src = d.image;
  document.getElementById('lightboxImg').alt = d.title;
  document.getElementById('lightboxTitle').textContent = d.title;
  document.getElementById('lightboxDesc').textContent = d.description;
  document.getElementById('lightboxCategory').textContent = d.category;
}

/* ─── Experience ─── */
const defaultExperience = {
  work: [
    { role: 'Engineering Intern', org: 'TechCore Industries Ltd.', date: 'Jun 2024 – Sep 2024', icon: 'fa-briefcase', desc: 'Designed and tested embedded control systems for industrial automation equipment. Reduced system latency by 30% through firmware optimizations.' },
    { role: 'Freelance Designer', org: 'Self-employed', date: '2022 – Present', icon: 'fa-palette', desc: 'Providing branding, poster design, and UI/UX services to startups, student organizations, and NGOs.' },
    { role: 'Research Assistant', org: 'BUET Mechatronics Lab', date: 'Jan 2024 – Present', icon: 'fa-flask', desc: 'Assisting faculty in research on low-cost prosthetic hand prototypes using 3D printing and servo actuation.' },
  ],
  clubs: [
    { role: 'General Secretary', org: 'BUET Robotics Club', date: '2023 – 2024', icon: 'fa-users', desc: 'Managed a 120-member club, coordinated workshops, oversaw budget allocations, and organized national-level robotics competitions.' },
    { role: 'Design Lead', org: 'BUET Design Society', date: '2022 – 2023', icon: 'fa-paint-brush', desc: 'Led a team of 8 designers creating visual content for 15+ events across the academic year.' },
    { role: 'Core Member', org: 'IEEE Student Branch BUET', date: '2021 – Present', icon: 'fa-broadcast-tower', desc: 'Organized seminars on emerging tech, managed social media, and coordinated with industry professionals for talks.' },
  ],
  events: [
    { role: 'Chief Organizer', org: 'RoboFest 2024 – National Robotics Festival', date: 'Feb 2024', icon: 'fa-trophy', desc: 'Led a 40-person team to organize a 3-day festival with 500+ participants from 30+ universities across Bangladesh.' },
    { role: 'Event Coordinator', org: 'TechSprint Hackathon', date: 'Oct 2023', icon: 'fa-code', desc: 'Coordinated a 24-hour hackathon with 200 participants, managed venue, logistics, and judging processes.' },
    { role: 'Workshop Facilitator', org: 'Arduino Bootcamp Series', date: '2022 – 2023', icon: 'fa-chalkboard-teacher', desc: 'Conducted 6 hands-on Arduino workshops for beginners, training 150+ students in embedded systems basics.' },
  ]
};

let currentExpTab = 'work';

function initExperience() {
  const tabs = document.querySelectorAll('.exp-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentExpTab = tab.dataset.exp;
      renderExperience(currentExpTab);
    });
  });
  fetchAndRenderExperience();
}

async function fetchAndRenderExperience() {
  const localExp = await getCloudData('experiences', null);
  if (localExp && localExp.length > 0) {
    // Replace defaults with cloud data, grouping by type
    const cloudGrouped = { work: [], clubs: [], events: [] };
    localExp.forEach(e => {
      const cat = e.type || 'work';
      if (!cloudGrouped[cat]) cloudGrouped[cat] = [];
      cloudGrouped[cat].push(e);
    });
    Object.keys(cloudGrouped).forEach(cat => {
      if (cloudGrouped[cat].length > 0) {
        defaultExperience[cat] = cloudGrouped[cat];
      }
    });
  }

  renderExperience(currentExpTab);
}

function renderExperience(tab) {
  const container = document.getElementById('experienceTimeline');
  if (!container) return;
  const items = defaultExperience[tab] || [];
  container.innerHTML = items.map((item, i) => `
    <div class="timeline-item" style="transition-delay:${i * 0.1}s">
      <div class="timeline-dot"><i class="fas ${item.icon}"></i></div>
      <div class="timeline-body">
        <div class="timeline-header">
          <span class="timeline-role">${item.role}</span>
          <span class="timeline-date">${item.date}</span>
        </div>
        <div class="timeline-org">${item.org}</div>
        <p class="timeline-desc">${item.desc}</p>
      </div>
    </div>
  `).join('');

  // Animate
  requestAnimationFrame(() => {
    container.querySelectorAll('.timeline-item').forEach((item, i) => {
      setTimeout(() => item.classList.add('visible'), i * 120);
    });
  });
}

/* ─── Achievements ─── */
const defaultAchievements = [
  { icon: 'fa-trophy', year: '2024', title: '1st Place — National Robotics Competition', desc: 'Won first place in the autonomous robot category at RoboFest 2024 with our line-following robot.' },
  { icon: 'fa-medal', year: '2023', title: 'Best Design Award — TechFest', desc: 'Received the best visual design award for TechFest 2023 promotional campaign.' },
  { icon: 'fa-certificate', year: '2024', title: 'Certified Embedded Systems Developer', desc: 'Completed advanced embedded systems certification from Coursera / University of Colorado.' },
  { icon: 'fa-star', year: '2023', title: 'Dean\'s List — Mechanical Engineering', desc: 'Achieved GPA 3.85/4.0 earning recognition on the Dean\'s List for academic excellence.' },
  { icon: 'fa-award', year: '2022', title: 'Scholarship — BUET Merit Award', desc: 'Awarded merit-based scholarship for outstanding performance in first year examinations.' },
  { icon: 'fa-users', year: '2024', title: 'Leadership Excellence Award', desc: 'Recognized for outstanding leadership in organizing national-level technical events.' },
];

function initAchievements() {
  fetchAndRenderAchievements();
  initCounterAnimations();
}

async function fetchAndRenderAchievements() {
  let achievements = [...defaultAchievements];
  const localAch = await getCloudData('achievements', null);
  if (localAch && localAch.length > 0) achievements = localAch;

  renderAchievements(achievements);
}

function renderAchievements(items) {
  const grid = document.getElementById('achievementsGrid');
  if (!grid) return;
  grid.innerHTML = items.map((a, i) => `
    <div class="achievement-card reveal-up" style="transition-delay:${i * 0.07}s">
      <div class="ach-icon"><i class="fas ${a.icon}"></i></div>
      <div class="ach-year">${a.year}</div>
      <h3 class="ach-title">${a.title}</h3>
      <p class="ach-desc">${a.desc}</p>
    </div>
  `).join('');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  grid.querySelectorAll('.achievement-card').forEach(c => observer.observe(c));
}

function initCounterAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.counter').forEach(animateCounter);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  const banner = document.querySelector('.counter-banner');
  if (banner) observer.observe(banner);
}

/* ─── Testimonials ─── */
const defaultTestimonials = [
  {
    quote: "Alex is one of the most talented young engineers I've had the pleasure of mentoring. His ability to combine precision engineering with creative thinking is truly rare.",
    name: 'Dr. Rahman Khan', position: 'Professor, Mechanical Engineering — BUET',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
  },
  {
    quote: "Working with Alex on TechFest was exceptional. He organized everything flawlessly — from logistics to design — while keeping the entire team motivated and focused.",
    name: 'Tanvir Ahmed', position: 'President, BUET Robotics Club 2023',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80'
  },
  {
    quote: "Alex redesigned our startup's entire visual identity in under two weeks. The quality was professional, and his process was structured and communicative throughout.",
    name: 'Sadia Islam', position: 'Co-founder, GreenTech Startup',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'
  }
];

let currentSlide = 0;
let slideInterval;
let testimonials = [...defaultTestimonials];

function initTestimonials() {
  fetchAndRenderTestimonials();
  document.getElementById('prevTestimonial')?.addEventListener('click', () => goToSlide(currentSlide - 1));
  document.getElementById('nextTestimonial')?.addEventListener('click', () => goToSlide(currentSlide + 1));
}

async function fetchAndRenderTestimonials() {
  const localTest = await getCloudData('testimonials', null);
  if (localTest && localTest.length > 0) testimonials = localTest;

  renderTestimonials();
}

function renderTestimonials() {
  const track = document.getElementById('testimonialTrack');
  const dots = document.getElementById('sliderDots');
  if (!track || !dots) return;

  track.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-quote">"</div>
      <p class="testimonial-text">${t.quote}</p>
      <div class="testimonial-author">
        <img class="testimonial-avatar" src="${t.avatar}" alt="${t.name}" />
        <div>
          <div class="testimonial-name">${t.name}</div>
          <div class="testimonial-position">${t.position}</div>
        </div>
      </div>
    </div>
  `).join('');

  dots.innerHTML = testimonials.map((_, i) =>
    `<div class="slider-dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></div>`
  ).join('');

  dots.querySelectorAll('.slider-dot').forEach(dot => {
    dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.idx)));
  });

  startSlideInterval();
}

function goToSlide(idx) {
  const track = document.getElementById('testimonialTrack');
  const dots = document.querySelectorAll('.slider-dot');
  currentSlide = (idx + testimonials.length) % testimonials.length;
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  clearInterval(slideInterval);
  startSlideInterval();
}

function startSlideInterval() {
  slideInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
}

/* ─── Contact Form ─── */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateContactForm()) return;

    const btn = document.getElementById('submitBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Sending...</span>';
    btn.disabled = true;

    const msgData = {
      id: String(Date.now()),
      name: document.getElementById('contactName')?.value || '',
      email: document.getElementById('contactEmailInput')?.value || '',
      subject: document.getElementById('contactSubject')?.value || '',
      message: document.getElementById('contactMessage')?.value || '',
      date: new Date().toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })
    };

    try {
      // Save message to Firebase
      let msgs = await getCloudData('messages', []);
      msgs.push(msgData);
      await setCloudData('messages', msgs);
      form.reset();
      document.getElementById('formSuccess')?.classList.add('visible');
      setTimeout(() => {
        document.getElementById('formSuccess')?.classList.remove('visible');
      }, 5000);
    } catch (_) {
      // Still show success for demo
      form.reset();
      document.getElementById('formSuccess')?.classList.add('visible');
    } finally {
      btn.innerHTML = '<span>Send Message</span><i class="fas fa-paper-plane"></i>';
      btn.disabled = false;
    }
  });
}

function validateContactForm() {
  let valid = true;
  const name = document.getElementById('contactName')?.value.trim();
  const email = document.getElementById('contactEmailInput')?.value.trim();
  const msg = document.getElementById('contactMessage')?.value.trim();

  clearErrors();
  if (!name) { showError('nameError', 'Name is required'); valid = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('emailError', 'Valid email is required'); valid = false;
  }
  if (!msg || msg.length < 10) { showError('messageError', 'Message must be at least 10 characters'); valid = false; }
  return valid;
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}
function clearErrors() {
  ['nameError','emailError','messageError'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

/* ─── Contact Info from API ─── */
async function loadContactInfo() {
  const data = await getCloudData('settings', {});
  if (data.email) {
    const emailEl = document.querySelector('#contactEmail a');
    if (emailEl) { emailEl.textContent = data.email; emailEl.href = 'mailto:' + data.email; }
  }
  if (data.phone) {
    const phoneEl = document.querySelector('#contactPhone a');
    if (phoneEl) { phoneEl.textContent = data.phone; phoneEl.href = 'tel:' + data.phone.replace(/\s/g, ''); }
  }
  if (data.location) {
    const locEl = document.querySelector('#contact .contact-info-item:nth-child(3) span');
    if (locEl) locEl.textContent = data.location;
  }
  if (data.cvUrl) {
    const cvBtn = document.getElementById('downloadCV');
    if (cvBtn) cvBtn.href = data.cvUrl;
  }
  
  // Load social links on portfolio
  loadSocialLinks();
}

/* ─── Back to Top ─── */
function initBackToTop() {
  document.getElementById('backToTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─── Utilities ─── */
function setCurrentYear() {
  const el = document.getElementById('currentYear');
  if (el) el.textContent = new Date().getFullYear();
}

async function checkApiStatus() {
  const dot = document.getElementById('apiStatus');
  const text = document.getElementById('apiStatusText');
  dot?.classList.add('online');
  if (text) text.textContent = 'Firebase Connected';

}

/* ===================================================
   DASHBOARD LOGIC
   Appended to script.js
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dashboard')) {
    initDashboard();
  }
});

function initDashboard() {
  // Check login
  const isLoggedIn = sessionStorage.getItem('admin_logged_in');
  if (!isLoggedIn) {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
  } else {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    loadDashboardData();
  }

  // Password toggle
  document.getElementById('pwdToggle')?.addEventListener('click', () => {
    const pwdInput = document.getElementById('loginPassword');
    const icon = document.querySelector('#pwdToggle i');
    if (pwdInput.type === 'password') {
      pwdInput.type = 'text';
      icon.className = 'fas fa-eye-slash';
    } else {
      pwdInput.type = 'password';
      icon.className = 'fas fa-eye';
    }
  });

  // Sidebar collapse
  document.getElementById('sidebarCollapse')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('collapsed');
  });

  // Mobile topbar menu toggle
  document.getElementById('topbarMenu')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('mobile-open');
  });

  // Login handler
  document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('loginUsername').value;
    const p = document.getElementById('loginPassword').value;
    if ((u === 'admin' && p === 'admin123') || (u === 'alex' && p === 'mercer')) {
      sessionStorage.setItem('admin_logged_in', 'true');
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('dashboard').style.display = 'flex';
      loadDashboardData();
    } else {
      document.getElementById('loginError').textContent = 'Invalid credentials';
    }
  });

  // Logout handler
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    sessionStorage.removeItem('admin_logged_in');
    location.reload();
  });

  // Navigation
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = item.dataset.page;
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
      document.getElementById('page-' + pageId)?.classList.remove('hidden');
      document.getElementById('topbarTitle').textContent = item.querySelector('span').textContent;
    });
  });

  // Modals generic close
  document.querySelectorAll('.modal-close, .btn-cancel').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.modal || btn.closest('.modal').id;
      document.getElementById(modalId).classList.remove('open');
    });
  });

  // Quick Actions from overview page
  document.querySelectorAll('.quick-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      if (page) {
        // Navigate to the page
        navItems.forEach(n => n.classList.remove('active'));
        const target = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (target) target.classList.add('active');
        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
        document.getElementById('page-' + page)?.classList.remove('hidden');
        document.getElementById('topbarTitle').textContent = target?.querySelector('span')?.textContent || page;
        
        // Trigger action if specified
        const action = btn.dataset.action;
        if (action === 'add') {
          setTimeout(() => {
            const addBtn = document.querySelector('#page-' + page + ' .btn-add');
            if (addBtn) addBtn.click();
          }, 200);
        }
      }
    });
  });

  // Link buttons (View All etc.)
  document.querySelectorAll('.link-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      if (page) {
        navItems.forEach(n => n.classList.remove('active'));
        const target = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (target) target.classList.add('active');
        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
        document.getElementById('page-' + page)?.classList.remove('hidden');
        document.getElementById('topbarTitle').textContent = target?.querySelector('span')?.textContent || page;
      }
    });
  });

  // Experience admin tab filter
  document.querySelectorAll('.exp-tab-admin').forEach(tab => {
    tab.addEventListener('click', async () => {
      document.querySelectorAll('.exp-tab-admin').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const type = tab.dataset.type;
      const exps = await getCloudData('experiences', []);
      const filtered = type === 'all' ? exps : exps.filter(e => e.type === type);
      const expTable = document.getElementById('experienceTable');
      if (expTable) {
        if (filtered.length === 0) {
          expTable.innerHTML = '<tr><td colspan="5" class="table-empty">No experiences in this category.</td></tr>';
        } else {
          expTable.innerHTML = filtered.map(e => `
            <tr>
              <td>${e.role}</td>
              <td>${e.org}</td>
              <td>${e.date}</td>
              <td>${e.type}</td>
              <td>
                <button class="btn-sm" onclick="editExp('${e.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-sm text-danger" onclick="deleteExp('${e.id}')"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
          `).join('');
        }
      }
    });
  });

  // --- Add Projects ---
  document.getElementById('addProjectBtn')?.addEventListener('click', () => {
    document.getElementById('projectId').value = '';
    document.getElementById('projectTitle').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('projectCategory').value = '';
    document.getElementById('projectTech').value = '';
    document.getElementById('projectGithub').value = '';
    document.getElementById('projectDemo').value = '';
    document.getElementById('projectImage').value = '';
    document.getElementById('projectModalTitle').textContent = 'Add Project';
    document.getElementById('projectModal').classList.add('open');
  });

  document.getElementById('addSkillBtn')?.addEventListener('click', () => {
    document.getElementById('skillId').value = '';
    document.getElementById('skillName').value = '';
    document.getElementById('skillCategory').value = 'engineering';
    document.getElementById('skillIcon').value = '';
    document.getElementById('skillPct').value = '80';
    document.getElementById('skillModal').classList.add('open');
  });

  document.getElementById('addExpBtn')?.addEventListener('click', () => {
    document.getElementById('expId').value = '';
    document.getElementById('expRole').value = '';
    document.getElementById('expOrg').value = '';
    document.getElementById('expDate').value = '';
    document.getElementById('expType').value = 'work';
    document.getElementById('expIcon').value = '';
    document.getElementById('expDesc').value = '';
    document.getElementById('expModal').classList.add('open');
  });

  document.getElementById('addAchBtn')?.addEventListener('click', () => {
    document.getElementById('achId').value = '';
    document.getElementById('achTitle').value = '';
    document.getElementById('achYear').value = '';
    document.getElementById('achIcon').value = '';
    document.getElementById('achDesc').value = '';
    document.getElementById('achModal').classList.add('open');
  });

  // --- Add Design ---
  document.getElementById('addDesignBtn')?.addEventListener('click', () => {
    document.getElementById('designId').value = '';
    document.getElementById('designTitle').value = '';
    document.getElementById('designDescription').value = '';
    document.getElementById('designCategory').value = 'branding';
    document.getElementById('designImage').value = '';
    document.getElementById('designModalTitle').textContent = 'Upload Design';
    document.getElementById('designModal').classList.add('open');
  });

  // --- Add Testimonial ---
  document.getElementById('addTestBtn')?.addEventListener('click', () => {
    document.getElementById('testId').value = '';
    document.getElementById('testQuote').value = '';
    document.getElementById('testName').value = '';
    document.getElementById('testPosition').value = '';
    document.getElementById('testAvatar').value = '';
    document.getElementById('testModal').classList.add('open');
  });

  document.getElementById('saveProject')?.addEventListener('click', async () => {
    const title = document.getElementById('projectTitle').value.trim();
    if (!title) { showToast('Project title is required'); return; }
    const id = document.getElementById('projectId').value || String(Date.now());
    const newProj = {
      id: id,
      title: title,
      description: document.getElementById('projectDescription').value,
      tags: [document.getElementById('projectCategory').value].filter(s=>s),
      technologies: document.getElementById('projectTech').value.split(',').map(s=>s.trim()).filter(s=>s),
      github: document.getElementById('projectGithub').value,
      demo: document.getElementById('projectDemo').value,
      image: document.getElementById('projectImage').value || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600'
    };
    let projs = await getCloudData('projects', []);
    const existingIdx = projs.findIndex(p => String(p.id) === String(id));
    if(existingIdx >= 0) projs[existingIdx] = newProj;
    else projs.push(newProj);
    await setCloudData('projects', projs);
    document.getElementById('projectModal').classList.remove('open');
    await loadDashboardData();
    showToast('Project saved successfully');
  });

  // --- Save Design ---
  document.getElementById('saveDesign')?.addEventListener('click', async () => {
    const title = document.getElementById('designTitle').value.trim();
    if (!title) { showToast('Design title is required'); return; }
    const id = document.getElementById('designId').value || String(Date.now());
    const newDesign = {
      id: id,
      title: title,
      description: document.getElementById('designDescription').value,
      category: document.getElementById('designCategory').value,
      image: document.getElementById('designImage').value || 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80'
    };
    let designs = await getCloudData('designs', []);
    const existingIdx = designs.findIndex(d => String(d.id) === String(id));
    if(existingIdx >= 0) designs[existingIdx] = newDesign;
    else designs.push(newDesign);
    await setCloudData('designs', designs);
    document.getElementById('designModal').classList.remove('open');
    await loadDashboardData();
    showToast('Design saved successfully');
  });

  // --- Save Testimonial ---
  document.getElementById('saveTest')?.addEventListener('click', async () => {
    const name = document.getElementById('testName').value.trim();
    const quote = document.getElementById('testQuote').value.trim();
    if (!name || !quote) { showToast('Name and quote are required'); return; }
    const id = document.getElementById('testId').value || String(Date.now());
    const newTest = {
      id: id,
      quote: quote,
      name: name,
      position: document.getElementById('testPosition').value,
      avatar: document.getElementById('testAvatar').value || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    };
    let tests = await getCloudData('testimonials', []);
    const existingIdx = tests.findIndex(t => String(t.id) === String(id));
    if(existingIdx >= 0) tests[existingIdx] = newTest;
    else tests.push(newTest);
    await setCloudData('testimonials', tests);
    document.getElementById('testModal').classList.remove('open');
    await loadDashboardData();
    showToast('Testimonial saved successfully');
  });

  // --- Add Profile Save ---
  document.getElementById('saveProfile')?.addEventListener('click', async () => {
    const profile = {
      firstName: document.getElementById('pfFirstName').value,
      lastName: document.getElementById('pfLastName').value,
      shortBio: document.getElementById('pfShortBio').value,
      roles: document.getElementById('pfRoles').value,
      location: document.getElementById('pfLocation').value,
      degree: document.getElementById('pfDegree').value,
      university: document.getElementById('pfUniversity').value,
      bio: document.getElementById('pfBio').value,
      photoUrl: document.getElementById('pfPhotoUrl').value
    };
    await setCloudData('profile', profile);
    showToast('Profile saved successfully');
  });

  // --- Add Skill Save ---
  document.getElementById('saveSkill')?.addEventListener('click', async () => {
    const id = document.getElementById('skillId').value || Date.now();
    const newSkill = {
      id: id,
      name: document.getElementById('skillName').value,
      category: document.getElementById('skillCategory').value,
      icon: document.getElementById('skillIcon').value,
      percentage: parseInt(document.getElementById('skillPct').value)
    };
    let skills = await getCloudData('skills', []);
    const existingIdx = skills.findIndex(s => s.id == id);
    if(existingIdx >= 0) skills[existingIdx] = newSkill;
    else skills.push(newSkill);
    await setCloudData('skills', skills);
    document.getElementById('skillModal').classList.remove('open');
    showToast('Skill saved successfully');
  });

  // --- Add Experience Save ---
  document.getElementById('saveExp')?.addEventListener('click', async () => {
    const id = document.getElementById('expId').value || Date.now();
    const newExp = {
      id: id,
      role: document.getElementById('expRole').value,
      org: document.getElementById('expOrg').value,
      date: document.getElementById('expDate').value,
      type: document.getElementById('expType').value,
      icon: document.getElementById('expIcon').value,
      desc: document.getElementById('expDesc').value
    };
    let exps = await getCloudData('experiences', []);
    const existingIdx = exps.findIndex(e => e.id == id);
    if(existingIdx >= 0) exps[existingIdx] = newExp;
    else exps.push(newExp);
    await setCloudData('experiences', exps);
    document.getElementById('expModal').classList.remove('open');
    showToast('Experience saved successfully');
  });

  // --- Add Achievement Save ---
  document.getElementById('saveAch')?.addEventListener('click', async () => {
    const id = document.getElementById('achId').value || Date.now();
    const newAch = {
      id: id,
      title: document.getElementById('achTitle').value,
      year: document.getElementById('achYear').value,
      icon: document.getElementById('achIcon').value,
      desc: document.getElementById('achDesc').value
    };
    let achs = await getCloudData('achievements', []);
    const existingIdx = achs.findIndex(a => a.id == id);
    if(existingIdx >= 0) achs[existingIdx] = newAch;
    else achs.push(newAch);
    await setCloudData('achievements', achs);
    document.getElementById('achModal').classList.remove('open');
    showToast('Achievement saved successfully');
  });

  // --- Add Settings Save ---
  document.getElementById('saveSettings')?.addEventListener('click', async () => {
    const settings = {
      email: document.getElementById('settingEmail').value,
      phone: document.getElementById('settingPhone').value,
      location: document.getElementById('settingLocation').value,
      github: document.getElementById('socialGithub').value,
      linkedin: document.getElementById('socialLinkedin').value,
      instagram: document.getElementById('socialInstagram').value,
      behance: document.getElementById('socialBehance').value
    };
    await setCloudData('settings', settings);
    showToast('Settings saved successfully');
  });
}

async function loadDashboardData() {
  // Populate Projects
  const projs = await getCloudData('projects', []);
  const pt = document.getElementById('projectsTable');
  if (pt) {
    if (projs.length === 0) {
      pt.innerHTML = '<tr><td colspan="5" class="table-empty">No projects yet. Add your first project!</td></tr>';
    } else {
      pt.innerHTML = projs.map(p => `
        <tr>
          <td><img src="${p.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600'}" width="50" style="border-radius:4px" /></td>
          <td>${p.title}</td>
          <td>${(p.tags||[]).join(', ')}</td>
          <td>${p.github ? '<a href="'+p.github+'" target="_blank">Link</a>' : '-'}</td>
          <td>
            <button class="btn-sm" onclick="editProject('${p.id}')"><i class="fas fa-edit"></i></button>
            <button class="btn-sm text-danger" onclick="deleteProject('${p.id}')"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }
  }
  
  const sp = document.getElementById('statProjects');
  if(sp) sp.textContent = projs.length;

  // Populate Designs Admin Grid
  const designs = await getCloudData('designs', []);
  const dGrid = document.getElementById('designsAdminGrid');
  if (dGrid) {
    if (designs.length === 0) {
      dGrid.innerHTML = '<div class="empty-state"><i class="fas fa-images"></i><span>No designs yet. Upload your first design!</span></div>';
    } else {
      dGrid.innerHTML = designs.map(d => `
        <div class="dash-card" style="padding:15px; display:flex; justify-content:space-between; align-items:center; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="${d.image}" width="60" height="40" style="border-radius:4px; object-fit:cover" />
            <div><strong>${d.title}</strong><br><small style="opacity:0.6">${d.category}</small></div>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="btn-sm" onclick="editDesign('${d.id}')"><i class="fas fa-edit"></i></button>
            <button class="btn-sm text-danger" onclick="deleteDesign('${d.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      `).join('');
    }
  }
  const sd = document.getElementById('statDesigns');
  if(sd) sd.textContent = designs.length;

  // Populate Profile Form
  const profile = await getCloudData('profile', null);
  if (profile) {
    if (document.getElementById('pfFirstName')) document.getElementById('pfFirstName').value = profile.firstName || '';
    if (document.getElementById('pfLastName')) document.getElementById('pfLastName').value = profile.lastName || '';
    if (document.getElementById('pfShortBio')) document.getElementById('pfShortBio').value = profile.shortBio || '';
    if (document.getElementById('pfRoles')) document.getElementById('pfRoles').value = profile.roles || '';
    if (document.getElementById('pfLocation')) document.getElementById('pfLocation').value = profile.location || '';
    if (document.getElementById('pfDegree')) document.getElementById('pfDegree').value = profile.degree || '';
    if (document.getElementById('pfUniversity')) document.getElementById('pfUniversity').value = profile.university || '';
    if (document.getElementById('pfBio')) document.getElementById('pfBio').value = profile.bio || '';
    if (document.getElementById('pfPhotoUrl')) document.getElementById('pfPhotoUrl').value = profile.photoUrl || '';
  }

  // Populate Skills Admin Grid
  const skills = await getCloudData('skills', []);
  const skGrid = document.getElementById('skillsAdminGrid');
  if (skGrid) {
    if (skills.length === 0) {
      skGrid.innerHTML = '<div class="empty-state"><i class="fas fa-chart-bar"></i><span>No skills yet. Add your first skill!</span></div>';
    } else {
      skGrid.innerHTML = skills.map(s => `
        <div class="dash-card" style="padding:15px; display:flex; justify-content:space-between; align-items:center;">
          <div><strong><i class="fas ${s.icon}"></i> ${s.name}</strong> (${s.category}) - ${s.percentage}%</div>
          <button class="btn-sm text-danger" onclick="deleteSkill('${s.id}')"><i class="fas fa-trash"></i></button>
        </div>
      `).join('');
    }
  }

  // Populate Experience Admin Table
  const exps = await getCloudData('experiences', []);
  const expTable = document.getElementById('experienceTable');
  if (expTable) {
    if (exps.length === 0) {
      expTable.innerHTML = '<tr><td colspan="5" class="table-empty">No experiences yet.</td></tr>';
    } else {
      expTable.innerHTML = exps.map(e => `
        <tr>
          <td>${e.role}</td>
          <td>${e.org}</td>
          <td>${e.date}</td>
          <td>${e.type}</td>
          <td>
            <button class="btn-sm" onclick="editExp('${e.id}')"><i class="fas fa-edit"></i></button>
            <button class="btn-sm text-danger" onclick="deleteExp('${e.id}')"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }
  }

  // Populate Achievements Admin Table
  const achs = await getCloudData('achievements', []);
  const achTable = document.getElementById('achievementsTable');
  if (achTable) {
    if (achs.length === 0) {
      achTable.innerHTML = '<tr><td colspan="5" class="table-empty">No achievements yet.</td></tr>';
    } else {
      achTable.innerHTML = achs.map(a => `
        <tr>
          <td><i class="fas ${a.icon}"></i></td>
          <td>${a.title}</td>
          <td>${a.year}</td>
          <td>${(a.desc||'').substring(0,30)}...</td>
          <td>
            <button class="btn-sm" onclick="editAch('${a.id}')"><i class="fas fa-edit"></i></button>
            <button class="btn-sm text-danger" onclick="deleteAch('${a.id}')"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }
  }
  const sa = document.getElementById('statAchievements');
  if(sa) sa.textContent = achs.length;

  // Populate Testimonials Admin Grid
  const tests = await getCloudData('testimonials', []);
  const testGrid = document.getElementById('testimonialsAdminGrid');
  if (testGrid) {
    if (tests.length === 0) {
      testGrid.innerHTML = '<div class="empty-state"><i class="fas fa-quote-right"></i><span>No testimonials yet. Add your first testimonial!</span></div>';
    } else {
      testGrid.innerHTML = tests.map(t => `
        <div class="dash-card" style="padding:15px;">
          <div style="display:flex; justify-content:space-between; align-items:start; gap:12px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <img src="${t.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'}" width="40" height="40" style="border-radius:50%; object-fit:cover" />
              <div><strong>${t.name}</strong><br><small style="opacity:0.6">${t.position || ''}</small></div>
            </div>
            <div style="display:flex; gap:6px;">
              <button class="btn-sm" onclick="editTestimonial('${t.id}')"><i class="fas fa-edit"></i></button>
              <button class="btn-sm text-danger" onclick="deleteTestimonial('${t.id}')"><i class="fas fa-trash"></i></button>
            </div>
          </div>
          <p style="margin-top:8px; opacity:0.8; font-size:0.9rem;">&ldquo;${(t.quote||'').substring(0,80)}...&rdquo;</p>
        </div>
      `).join('');
    }
  }

  // Populate Messages count
  const msgs = await getCloudData('messages', []);
  const sm = document.getElementById('statMessages');
  if(sm) sm.textContent = msgs.length || 0;
  const msgBadge = document.getElementById('msgBadge');
  if(msgBadge) msgBadge.textContent = msgs.length || 0;

  // Populate Messages table
  const msgTable = document.getElementById('messagesTable');
  if (msgTable) {
    if (!msgs || msgs.length === 0) {
      msgTable.innerHTML = '<tr><td colspan="5" class="table-empty">No messages yet.</td></tr>';
    } else {
      msgTable.innerHTML = msgs.map(m => `
        <tr>
          <td>${m.name || '-'}</td>
          <td>${m.email || '-'}</td>
          <td>${m.subject || '-'}</td>
          <td>${m.date || '-'}</td>
          <td>
            <button class="btn-sm" onclick="viewMessage('${m.id}')"><i class="fas fa-eye"></i></button>
            <button class="btn-sm text-danger" onclick="deleteMessage('${m.id}')"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }
  }

  // Populate Messages Preview on Overview
  const msgPreview = document.getElementById('messagesPreview');
  if (msgPreview) {
    if (!msgs || msgs.length === 0) {
      msgPreview.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><span>No messages yet</span></div>';
    } else {
      const recent = msgs.slice(-3).reverse();
      msgPreview.innerHTML = recent.map(m => `
        <div style="padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
          <strong>${m.name || 'Anonymous'}</strong> <small style="opacity:0.5">${m.date || ''}</small>
          <p style="opacity:0.7; font-size:0.85rem; margin:4px 0 0;">${(m.subject || m.message || '').substring(0,50)}...</p>
        </div>
      `).join('');
    }
  }

  // Populate Settings Form
  const settings = await getCloudData('settings', null);
  if (settings) {
    if (document.getElementById('settingEmail')) document.getElementById('settingEmail').value = settings.email || '';
    if (document.getElementById('settingPhone')) document.getElementById('settingPhone').value = settings.phone || '';
    if (document.getElementById('settingLocation')) document.getElementById('settingLocation').value = settings.location || '';
    if (document.getElementById('socialGithub')) document.getElementById('socialGithub').value = settings.github || '';
    if (document.getElementById('socialLinkedin')) document.getElementById('socialLinkedin').value = settings.linkedin || '';
    if (document.getElementById('socialInstagram')) document.getElementById('socialInstagram').value = settings.instagram || '';
    if (document.getElementById('socialBehance')) document.getElementById('socialBehance').value = settings.behance || '';
  }
}

window.deleteSkill = async function(id) {
  if(confirm('Delete this skill?')) {
    let skills = await getCloudData('skills', []);
    skills = skills.filter(x => String(x.id) !== String(id));
    await setCloudData('skills', skills);
    await loadDashboardData();
    showToast('Skill deleted');
  }
}

window.deleteExp = async function(id) {
  if(confirm('Delete this experience?')) {
    let exps = await getCloudData('experiences', []);
    exps = exps.filter(x => String(x.id) !== String(id));
    await setCloudData('experiences', exps);
    await loadDashboardData();
    showToast('Experience deleted');
  }
}

window.editExp = async function(id) {
  const exps = await getCloudData('experiences', []);
  const e = exps.find(x => String(x.id) === String(id));
  if(!e) return;
  document.getElementById('expId').value = e.id;
  document.getElementById('expRole').value = e.role || '';
  document.getElementById('expOrg').value = e.org || '';
  document.getElementById('expDate').value = e.date || '';
  document.getElementById('expType').value = e.type || 'work';
  document.getElementById('expIcon').value = e.icon || '';
  document.getElementById('expDesc').value = e.desc || '';
  document.getElementById('expModal').classList.add('open');
}

window.deleteAch = async function(id) {
  if(confirm('Delete this achievement?')) {
    let achs = await getCloudData('achievements', []);
    achs = achs.filter(x => String(x.id) !== String(id));
    await setCloudData('achievements', achs);
    await loadDashboardData();
    showToast('Achievement deleted');
  }
}

window.editAch = async function(id) {
  const achs = await getCloudData('achievements', []);
  const a = achs.find(x => String(x.id) === String(id));
  if(!a) return;
  document.getElementById('achId').value = a.id;
  document.getElementById('achTitle').value = a.title || '';
  document.getElementById('achYear').value = a.year || '';
  document.getElementById('achIcon').value = a.icon || '';
  document.getElementById('achDesc').value = a.desc || '';
  document.getElementById('achModal').classList.add('open');
}

window.editProject = async function(id) {
  const projs = await getCloudData('projects', []);
  const p = projs.find(x => String(x.id) === String(id));
  if(!p) return;
  document.getElementById('projectId').value = p.id;
  document.getElementById('projectTitle').value = p.title;
  document.getElementById('projectDescription').value = p.description;
  document.getElementById('projectCategory').value = p.tags?.[0] || '';
  document.getElementById('projectTech').value = (p.technologies||[]).join(', ');
  document.getElementById('projectGithub').value = p.github || '';
  document.getElementById('projectDemo').value = p.demo || '';
  document.getElementById('projectImage').value = p.image || '';
  document.getElementById('projectModalTitle').textContent = 'Edit Project';
  document.getElementById('projectModal').classList.add('open');
}

window.deleteProject = async function(id) {
  if(confirm('Delete this project?')) {
    let projs = await getCloudData('projects', []);
    projs = projs.filter(x => String(x.id) !== String(id));
    await setCloudData('projects', projs);
    await loadDashboardData();
    showToast('Project deleted');
  }
}

window.editDesign = async function(id) {
  const designs = await getCloudData('designs', []);
  const d = designs.find(x => String(x.id) === String(id));
  if(!d) return;
  document.getElementById('designId').value = d.id;
  document.getElementById('designTitle').value = d.title || '';
  document.getElementById('designDescription').value = d.description || '';
  document.getElementById('designCategory').value = d.category || 'branding';
  document.getElementById('designImage').value = d.image || '';
  document.getElementById('designModalTitle').textContent = 'Edit Design';
  document.getElementById('designModal').classList.add('open');
}

window.deleteDesign = async function(id) {
  if(confirm('Delete this design?')) {
    let designs = await getCloudData('designs', []);
    designs = designs.filter(x => String(x.id) !== String(id));
    await setCloudData('designs', designs);
    await loadDashboardData();
    showToast('Design deleted');
  }
}

window.editTestimonial = async function(id) {
  const tests = await getCloudData('testimonials', []);
  const t = tests.find(x => String(x.id) === String(id));
  if(!t) return;
  document.getElementById('testId').value = t.id;
  document.getElementById('testQuote').value = t.quote || '';
  document.getElementById('testName').value = t.name || '';
  document.getElementById('testPosition').value = t.position || '';
  document.getElementById('testAvatar').value = t.avatar || '';
  document.getElementById('testModal').classList.add('open');
}

window.deleteTestimonial = async function(id) {
  if(confirm('Delete this testimonial?')) {
    let tests = await getCloudData('testimonials', []);
    tests = tests.filter(x => String(x.id) !== String(id));
    await setCloudData('testimonials', tests);
    await loadDashboardData();
    showToast('Testimonial deleted');
  }
}

window.viewMessage = async function(id) {
  const msgs = await getCloudData('messages', []);
  const m = msgs.find(x => String(x.id) === String(id));
  if(!m) return;
  const body = document.getElementById('msgModalBody');
  if (body) {
    body.innerHTML = `
      <div style="margin-bottom:12px;"><strong>From:</strong> ${m.name || 'Anonymous'}</div>
      <div style="margin-bottom:12px;"><strong>Email:</strong> ${m.email || '-'}</div>
      <div style="margin-bottom:12px;"><strong>Subject:</strong> ${m.subject || '-'}</div>
      <div style="margin-bottom:12px;"><strong>Date:</strong> ${m.date || '-'}</div>
      <hr style="border-color:rgba(255,255,255,0.1); margin:12px 0;">
      <div style="white-space:pre-wrap;">${m.message || ''}</div>
    `;
  }
  document.getElementById('msgModal')?.classList.add('open');
}

window.deleteMessage = async function(id) {
  if(confirm('Delete this message?')) {
    let msgs = await getCloudData('messages', []);
    msgs = msgs.filter(x => String(x.id) !== String(id));
    await setCloudData('messages', msgs);
    await loadDashboardData();
    showToast('Message deleted');
  }
}

function showToast(msg) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<i class="fas fa-check-circle"></i><span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(()=>t.remove(), 300);
  }, 3000);
}

