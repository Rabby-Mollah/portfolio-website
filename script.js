/* ===================================================
   PORTFOLIO WEBSITE — SCRIPT.JS
   Alex Mercer Engineering Portfolio
   =================================================== */

// Removed API_BASE since we are using LocalStorage backend
const STORAGE_PREFIX = 'portfolio_';
function getLocalData(key, def) {
  const data = localStorage.getItem(STORAGE_PREFIX + key);
  return data ? JSON.parse(data) : def;
}
function setLocalData(key, val) {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
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
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('portfolio-theme', theme);
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

/* ─── Navbar ─── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    document.getElementById('scrollProgress').style.width =
      (window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100) + '%';
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
  const close = document.getElementById('mobileClose');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  hamburger?.addEventListener('click', () => {
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
function initTypingEffect() {
  const el = document.getElementById('typedText');
  if (!el) return;
  const roles = ['Robotics Engineer', 'Mechatronics Designer', 'Creative Organizer', 'CAD Designer', 'Embedded Systems Dev', 'Event Manager'];
  let roleIdx = 0, charIdx = 0, deleting = false;

  function type() {
    const current = roles[roleIdx];
    el.textContent = current.substring(0, charIdx);

    if (!deleting && charIdx < current.length) {
      charIdx++; setTimeout(type, 90);
    } else if (!deleting && charIdx === current.length) {
      setTimeout(() => { deleting = true; type(); }, 1800);
    } else if (deleting && charIdx > 0) {
      charIdx--; setTimeout(type, 45);
    } else {
      deleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      setTimeout(type, 300);
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
  fetchAndRenderSkills();
}

async function fetchAndRenderSkills() {
  const localSkills = getLocalData('skills', null);
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
  const localProjects = getLocalData('projects', null);
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
  const localDesigns = getLocalData('designs', null);
  if (localDesigns && localDesigns.length > 0) activeDesigns = localDesigns;

  renderDesigns(defaultDesigns);
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
  const localExp = getLocalData('experiences', null);
  if (localExp && localExp.length > 0) {
    localExp.forEach(e => {
      const cat = e.type || 'work';
      if (!defaultExperience[cat]) defaultExperience[cat] = [];
      defaultExperience[cat].push(e);
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
  const localAch = getLocalData('achievements', null);
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
  const localTest = getLocalData('testimonials', null);
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

    const data = {
      name: document.getElementById('contactName')?.value,
      email: document.getElementById('contactEmailInput')?.value,
      subject: document.getElementById('contactSubject')?.value,
      message: document.getElementById('contactMessage')?.value,
    };

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error();
      form.reset();
      document.getElementById('formSuccess')?.classList.add('visible');
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
  const data = getLocalData('settings', {});
  if (data.email) {
    const emailEl = document.querySelector('#contactEmail a');
    if (emailEl) { emailEl.textContent = data.email; emailEl.href = 'mailto:' + data.email; }
  }
  if (data.phone) {
    const phoneEl = document.querySelector('#contactPhone a');
    if (phoneEl) { phoneEl.textContent = data.phone; phoneEl.href = 'tel:' + data.phone.replace(/\s/g, ''); }
  }
  if (data.cvUrl) {
    const cvBtn = document.getElementById('downloadCV');
    if (cvBtn) cvBtn.href = data.cvUrl;
  }

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
  if (text) text.textContent = 'Local Storage DB';

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

  // --- Add Projects ---
  document.getElementById('addProjectBtn')?.addEventListener('click', () => {
    document.getElementById('projectId').value = '';
    document.getElementById('projectTitle').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('projectCategory').value = '';
    document.getElementById('projectTech').value = '';
    document.getElementById('projectModal').classList.add('open');
  });

  document.getElementById('saveProject')?.addEventListener('click', () => {
    const id = document.getElementById('projectId').value || Date.now();
    const newProj = {
      id: id,
      title: document.getElementById('projectTitle').value,
      description: document.getElementById('projectDescription').value,
      tags: [document.getElementById('projectCategory').value],
      technologies: document.getElementById('projectTech').value.split(',').map(s=>s.trim()),
      github: document.getElementById('projectGithub').value,
      demo: document.getElementById('projectDemo').value,
      image: document.getElementById('projectImage').value || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600'
    };
    let projs = getLocalData('projects', defaultProjects);
    const existingIdx = projs.findIndex(p => p.id == id);
    if(existingIdx >= 0) projs[existingIdx] = newProj;
    else projs.push(newProj);
    setLocalData('projects', projs);
    document.getElementById('projectModal').classList.remove('open');
    loadDashboardData();
    showToast('Project saved successfully');
  });
}

function loadDashboardData() {
  // Populate projects table
  const projs = getLocalData('projects', defaultProjects);
  const pt = document.getElementById('projectsTable');
  if (pt) {
    pt.innerHTML = projs.map(p => `
      <tr>
        <td><img src="${p.image}" width="50" style="border-radius:4px" /></td>
        <td>${p.title}</td>
        <td>${(p.tags||[]).join(', ')}</td>
        <td>${p.github ? '<a href="'+p.github+'" target="_blank">Link</a>' : '-'}</td>
        <td>
          <button class="btn-sm" onclick="editProject(${p.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-sm text-danger" onclick="deleteProject(${p.id})"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  }
  
  document.getElementById('statProjects').textContent = projs.length;
}

window.editProject = function(id) {
  const projs = getLocalData('projects', defaultProjects);
  const p = projs.find(x => x.id == id);
  if(!p) return;
  document.getElementById('projectId').value = p.id;
  document.getElementById('projectTitle').value = p.title;
  document.getElementById('projectDescription').value = p.description;
  document.getElementById('projectCategory').value = p.tags?.[0] || '';
  document.getElementById('projectTech').value = (p.technologies||[]).join(', ');
  document.getElementById('projectGithub').value = p.github || '';
  document.getElementById('projectDemo').value = p.demo || '';
  document.getElementById('projectImage').value = p.image || '';
  document.getElementById('projectModal').classList.add('open');
}

window.deleteProject = function(id) {
  if(confirm('Delete this project?')) {
    let projs = getLocalData('projects', defaultProjects);
    projs = projs.filter(x => x.id != id);
    setLocalData('projects', projs);
    loadDashboardData();
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

