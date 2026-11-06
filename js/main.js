/**
 * PORTFÓLIO ARTHUR SOUZA — INTERACTIVE ENGINE
 * Features:
 * - Reactive Canvas Constellation / Particle Field
 * - Cursor Spotlight & Custom Magnetic Pointer
 * - 3D Card Tilt with Specular Glare
 * - Theme Switcher (Crimson Noir vs. Cyber Glass)
 * - Synthesized Micro-Audio Engine (Web Audio API)
 * - Smooth Project Filters & Interactive Modal/Feedback
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCustomCursor();
  initCanvasBackground();
  initMouseSpotlight();
  initTiltCards();
  initAudioEngine();
  initSmoothScroll();
  initContactForm();
  initMobileMenu();
});

/* ==========================================================================
   1. THEME SWITCHER (Crimson Noir <-> Cyber Glass)
   ========================================================================== */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');
  const savedTheme = localStorage.getItem('devas_theme') || 'crimson';

  setTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'crimson';
      const nextTheme = current === 'cyber' ? 'crimson' : 'cyber';
      setTheme(nextTheme);
      playSynthSound('switch');
    });
  }

  function setTheme(theme) {
    if (theme === 'cyber') {
      document.documentElement.setAttribute('data-theme', 'cyber');
      if (themeLabel) themeLabel.textContent = 'Cyber Neon';
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeLabel) themeLabel.textContent = 'Crimson Noir';
    }
    localStorage.setItem('devas_theme', theme);
    // Notify canvas to update particle colors
    if (window.updateCanvasColors) window.updateCanvasColors();
  }
}

/* ==========================================================================
   2. INTERACTIVE CANVAS (Constelação de Partículas e Reatividade ao Mouse)
   ========================================================================== */
function initCanvasBackground() {
  const canvas = document.getElementById('interactive-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  let mouse = {
    x: width / 2,
    y: height / 2,
    radius: 140,
    isActive: false
  };

  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 35 : 75;
  const particles = [];

  function getParticleColor() {
    const isCyber = document.documentElement.getAttribute('data-theme') === 'cyber';
    return isCyber
      ? { r: 0, g: 240, b: 255 }    // Neon Cyan
      : { r: 255, g: 42, b: 85 };   // Crimson Red
  }

  let colorObj = getParticleColor();
  window.updateCanvasColors = () => {
    colorObj = getParticleColor();
  };

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.radius = Math.random() * 2 + 1;
      this.baseX = this.x;
      this.baseY = this.y;
      this.density = Math.random() * 20 + 5;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, 0.7)`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, 0.5)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    update() {
      // Repel / Attract on mouse interaction
      if (mouse.isActive) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const directionX = (dx / distance) * force * this.density * 0.4;
          const directionY = (dy / distance) * force * this.density * 0.4;
          this.x -= directionX;
          this.y -= directionY;
        }
      }

      this.x += this.vx;
      this.y += this.vy;

      // Screen wrap
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function connectParticles() {
    const maxDistance = isMobile ? 85 : 125;
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          const opacity = 1 - distance / maxDistance;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${opacity * 0.22})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    connectParticles();
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.isActive = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.isActive = false;
  });

  animate();
}

/* ==========================================================================
   3. MOUSE SPOTLIGHT (Aura radial suave seguindo o cursor)
   ========================================================================== */
function initMouseSpotlight() {
  const spotlight = document.querySelector('.mouse-spotlight');
  if (!spotlight || window.innerWidth < 768) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let curX = mouseX;
  let curY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function renderSpotlight() {
    curX += (mouseX - curX) * 0.12;
    curY += (mouseY - curY) * 0.12;
    spotlight.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(renderSpotlight);
  }

  renderSpotlight();
}

/* ==========================================================================
   4. CUSTOM CURSOR & MAGNETIC EFFECT
   ========================================================================== */
function initCustomCursor() {
  const dot = document.querySelector('.custom-cursor');
  const ring = document.querySelector('.custom-cursor-follower');
  if (!dot || !ring || window.innerWidth < 1024) return;

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  });

  function renderCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Hover states over interactive elements
  const interactives = document.querySelectorAll('a, button, input, textarea, .tilt-card, .clickable');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('active');
      ring.classList.add('active');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('active');
      ring.classList.remove('active');
    });
  });
}

/* ==========================================================================
   5. 3D TILT CARDS (Efeito de profundidade e reflexo nos projetos)
   ========================================================================== */
function initTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');
  if (window.innerWidth < 1024) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -9; // Max 9 deg
      const rotateY = ((x - centerX) / centerX) * 9;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
    });
  });
}

/* ==========================================================================
   6. SYNTHESIZED MICRO-AUDIO ENGINE (Web Audio API - Sem arquivos externos)
   ========================================================================== */
let audioCtx = null;
let soundEnabled = true;

function initAudioEngine() {
  const soundBtn = document.getElementById('sound-toggle');
  const soundStatus = document.getElementById('sound-status');

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundStatus) soundStatus.textContent = soundEnabled ? 'Audio ON' : 'Mudo';
      soundBtn.classList.toggle('opacity-50', !soundEnabled);
      if (soundEnabled) playSynthSound('switch');
    });
  }

  // Add subtle sound to buttons & links
  const buttons = document.querySelectorAll('button, a.btn-action, .filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => playSynthSound('click'));
    btn.addEventListener('mouseenter', () => playSynthSound('hover'));
  });
}

function playSynthSound(type) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'hover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.05);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.linearRampToValueAtTime(0.0001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'switch') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.12);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (e) {
    // Audio context not allowed until user interaction
  }
}

/* ==========================================================================
   7. SMOOTH SCROLL & NAVIGATION
   ========================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile drawer if open
        const mobileDrawer = document.getElementById('mobile-drawer');
        if (mobileDrawer && !mobileDrawer.classList.contains('hidden')) {
          mobileDrawer.classList.add('hidden');
        }
      }
    });
  });
}

/* ==========================================================================
   8. CONTACT FORM WITH PERSONALIZED WHATSAPP & EMAIL DISPATCH
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const nameInput = document.getElementById('form-name');
  const emailInput = document.getElementById('form-email');
  const messageInput = document.getElementById('form-message');
  const previewText = document.getElementById('message-preview-text');
  const feedback = document.getElementById('form-feedback');
  const btnWhatsapp = document.getElementById('btn-send-whatsapp');
  const btnEmail = document.getElementById('btn-send-email');
  const templateChips = document.querySelectorAll('.template-chip');

  // Templates pré-definidos para personalização rápida
  const templates = {
    estagio: "Olá Arthur! Acompanhamos seus projetos práticos (como o DevRadar) e sua formação no SENAC. Temos interesse em conversar sobre uma oportunidade de Estágio em Desenvolvimento de Software / Inteligência Artificial. Qual seria o melhor dia e horário para batermos um papo?",
    freelance: "Olá Arthur! Conhecemos suas entregas no Devas Web e seu portfólio. Gostaríamos de solicitar um orçamento e conversar sobre o desenvolvimento de uma aplicação web para nossa demanda.",
    entrevista: "Olá Arthur! Seu perfil técnico e suas competências chamaram nossa atenção. Gostaríamos de agendar uma entrevista para nos aprofundarmos nas suas experiências e projetos."
  };

  // Atualização em tempo real da prévia personalizada
  function updatePreview() {
    if (!previewText) return;
    const name = nameInput?.value.trim() || '[Seu Nome]';
    const email = emailInput?.value.trim() ? ` (${emailInput.value.trim()})` : '';
    const message = messageInput?.value.trim() || 'Gostaria de conversar sobre uma oportunidade de tecnologia...';

    previewText.textContent = `"Olá Arthur! Meu nome é ${name}${email}. ${message}"`;
  }

  if (nameInput) nameInput.addEventListener('input', updatePreview);
  if (emailInput) emailInput.addEventListener('input', updatePreview);
  if (messageInput) messageInput.addEventListener('input', updatePreview);

  // Manipulação de chips de templates com microinteração
  templateChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const type = chip.getAttribute('data-template');
      if (type && templates[type] && messageInput) {
        messageInput.value = templates[type];
        templateChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        updatePreview();
        playSynthSound('click');
        messageInput.focus();
      }
    });
  });

  // Validação simples e amigável
  function validateInputs() {
    const name = nameInput?.value.trim();
    const message = messageInput?.value.trim();

    if (!name) {
      showFeedback('Por favor, informe seu nome ou o da sua empresa para personalizarmos a mensagem.', 'error');
      nameInput?.focus();
      return null;
    }
    if (!message) {
      showFeedback('Por favor, escreva uma mensagem ou selecione um dos modelos acima.', 'error');
      messageInput?.focus();
      return null;
    }

    const email = emailInput?.value.trim() || '';
    return { name, email, message };
  }

  function showFeedback(text, type = 'success') {
    if (!feedback) return;
    feedback.classList.remove('hidden');

    const isSuccess = type === 'success';
    const borderCol = isSuccess ? 'border-emerald-500/40' : 'border-rose-500/40';
    const bgCol = isSuccess ? 'bg-emerald-500/10' : 'bg-rose-500/10';
    const textCol = isSuccess ? 'text-emerald-300' : 'text-rose-300';
    const icon = isSuccess 
      ? '<svg class="w-5 h-5 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
      : '<svg class="w-5 h-5 flex-shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>';

    feedback.innerHTML = `
      <div class="p-3.5 rounded-xl border ${borderCol} ${bgCol} ${textCol} text-xs flex items-center gap-3">
        ${icon}
        <div class="font-mono">${text}</div>
      </div>
    `;

    if (isSuccess) {
      playSynthSound('switch');
    }
  }

  // Disparo via WhatsApp
  if (btnWhatsapp) {
    btnWhatsapp.addEventListener('click', () => {
      const data = validateInputs();
      if (!data) return;

      const emailPart = data.email ? ` (${data.email})` : '';
      const whatsappText = `*Olá Arthur!* Meu nome é *${data.name}*${emailPart}.\n\nVi seu portfólio profissional e gostaria de falar com você:\n"${data.message}"\n\n_Enviado pelo seu portfólio oficial._`;
      
      const whatsappUrl = `https://wa.me/5575981450488?text=${encodeURIComponent(whatsappText)}`;

      showFeedback(`Redirecionando para o WhatsApp com a mensagem personalizada para o Arthur...`, 'success');
      
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 700);
    });
  }

  // Disparo via E-mail
  if (btnEmail) {
    btnEmail.addEventListener('click', () => {
      const data = validateInputs();
      if (!data) return;

      const subject = `Oportunidade / Contato de ${data.name}`;
      const emailBody = `Olá Arthur,\n\nMeu nome é ${data.name}${data.email ? ' (' + data.email + ')' : ''}.\n\nGostaria de falar sobre a seguinte oportunidade:\n\n${data.message}\n\nAguardo seu retorno!\nAtenciosamente,\n${data.name}`;
      
      const mailtoUrl = `mailto:ssouzarthur90@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

      showFeedback(`Abrindo seu aplicativo de e-mail com o texto formatado para ssouzarthur90@gmail.com...`, 'success');

      setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 700);
    });
  }

  // Se o formulário receber 'submit' (ex: Enter)
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Aciona o WhatsApp como padrão se der Enter
      if (btnWhatsapp) btnWhatsapp.click();
    });
  }
}

/* ==========================================================================
   9. MOBILE MENU DRAWER
   ========================================================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('mobile-menu-close');
  const drawer = document.getElementById('mobile-drawer');

  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => {
      drawer.classList.remove('hidden');
      playSynthSound('click');
    });
  }
  if (closeBtn && drawer) {
    closeBtn.addEventListener('click', () => {
      drawer.classList.add('hidden');
      playSynthSound('click');
    });
  }
}
