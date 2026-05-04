/* ================================================================
   Abundance Elegance — Form Handler
   3 fields: name, phone, email · submits to Google Apps Script
   Debug: append ?debug=1 to URL
   ================================================================ */

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzXKOtap7Vv6fjsk-IORH-leJmxRpv3dsxaPBbe1Lnmi_wONWmFrREno47tcTSK_k_nkA/exec';
const REDIRECT_URL = 'thank-you.html';

const DEBUG = new URLSearchParams(location.search).get('debug') === '1';
const log = (...a) => { if (DEBUG) console.log('[landing]', ...a); };

const HEBREW_LETTERS = /[\u0590-\u05FFa-zA-Z]/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(raw) {
  return (raw || '').replace(/[\s\-+()]/g, '');
}

function validateName(value) {
  const v = (value || '').trim();
  if (v.length < 2) return 'אנא הזיני שם מלא';
  if (!HEBREW_LETTERS.test(v)) return 'אנא הזיני שם תקין';
  return null;
}

function validatePhone(value) {
  const v = normalizePhone(value);
  if (!v) return 'אנא הזיני מספר טלפון';
  if (!/^05\d{8}$/.test(v)) return 'אנא הזיני מספר טלפון ישראלי תקין (05...)';
  return null;
}

function validateEmail(value) {
  const v = (value || '').trim();
  if (!v) return 'אנא הזיני כתובת מייל';
  if (!EMAIL_RE.test(v)) return 'אנא הזיני כתובת מייל תקינה';
  return null;
}

function showMsg(form, text, type) {
  const msg = form.querySelector('.form-msg');
  if (!msg) return;
  msg.textContent = text || '';
  msg.classList.toggle('success', type === 'success');
}

function setLoading(form, loading) {
  const btn = form.querySelector('.btn-gold');
  if (!btn) return;
  btn.classList.toggle('loading', loading);
  btn.disabled = loading;
}

async function handleSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const nameInput  = form.querySelector('input[name="name"]');
  const phoneInput = form.querySelector('input[name="phone"]');
  const emailInput = form.querySelector('input[name="email"]');

  [nameInput, phoneInput, emailInput].forEach(i => i.classList.remove('invalid'));

  const nameErr  = validateName(nameInput.value);
  const phoneErr = validatePhone(phoneInput.value);
  const emailErr = validateEmail(emailInput.value);

  if (nameErr)  { nameInput.classList.add('invalid');  showMsg(form, nameErr);  nameInput.focus();  return; }
  if (phoneErr) { phoneInput.classList.add('invalid'); showMsg(form, phoneErr); phoneInput.focus(); return; }
  if (emailErr) { emailInput.classList.add('invalid'); showMsg(form, emailErr); emailInput.focus(); return; }

  const consentInput = form.querySelector('input[name="consent"]');
  if (consentInput && !consentInput.checked) {
    showMsg(form, 'יש לאשר את מדיניות הפרטיות כדי להמשיך.');
    consentInput.focus();
    return;
  }

  showMsg(form, '');
  setLoading(form, true);

  const payload = {
    name: nameInput.value.trim(),
    phone: normalizePhone(phoneInput.value),
    email: emailInput.value.trim(),
    source: location.href,
    timestamp: new Date().toISOString()
  };

  if (DEBUG) {
    log('submitting:');
    log(payload);
  }

  try {
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    log('fetch completed (Success)');
    showMsg(form, 'מעולה! מעבירה אותך...', 'success');
    setTimeout(() => { window.location.href = REDIRECT_URL; }, 600);
  } catch (err) {
    log('fetch failed:', err);
    const generic = 'אופס, משהו השתבש עם האימייל. נסי שוב או כתבי לנו.';
    showMsg(form, DEBUG ? generic + ' (DEBUG: ' + (err && err.message || err) + ')' : generic);
    setLoading(form, false);
  }
}

document.querySelectorAll('form.lead-form').forEach(form => {
  form.addEventListener('submit', handleSubmit);

  const phoneInput = form.querySelector('input[name="phone"]');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^\d\s\-+()]/g, '');
    });
  }
});

/* ----------------------------------------------------------------
   GOLD PARTICLES — full-viewport, glowing, twinkling
   ---------------------------------------------------------------- */
(function heroParticles() {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, parts = [];
  const count = () => (window.innerWidth >= 768 ? 70 : 35);

  function resize() {
    W = Math.max(1, window.innerWidth);
    H = Math.max(1, window.innerHeight);
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function rand(min, max) { return min + Math.random() * (max - min); }

  function spawn(initial) {
    const sy = window.scrollY || 0;
    const coreR = rand(220, 250);
    const coreG = rand(195, 235);
    const coreB = rand(120, 200);
    const coreA = rand(0.85, 1);
    return {
      x: rand(0, W),
      y: initial ? sy + rand(0, H) : sy + H + rand(5, 30),
      r: rand(1.6, 4),
      vx: -rand(0.08, 0.20),
      vy: -rand(0.12, 0.30),
      fill: `rgba(${coreR|0}, ${coreG|0}, ${coreB|0}, ${coreA.toFixed(2)})`,
      twinkleDur: rand(2.5, 6) * 60,
      twinklePhase: rand(0, Math.PI * 2)
    };
  }

  function draw(p, screenY, frame) {
    const phase = (frame / p.twinkleDur) * Math.PI * 2 + p.twinklePhase;
    const pulse = 0.4 + 0.6 * ((Math.sin(phase) + 1) / 2);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    ctx.globalAlpha = pulse * 0.45;
    ctx.shadowBlur = 35;
    ctx.shadowColor = 'rgba(245, 231, 184, 1)';
    ctx.fillStyle = 'rgba(245, 231, 184, 0.55)';
    ctx.beginPath();
    ctx.arc(p.x, screenY, p.r * 1.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = pulse;
    ctx.shadowBlur = 22;
    ctx.shadowColor = 'rgba(255, 240, 195, 1)';
    ctx.fillStyle = p.fill;
    ctx.beginPath();
    ctx.arc(p.x, screenY, p.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  let frame = 0;
  function tick() {
    const sy = window.scrollY || 0;
    ctx.clearRect(0, 0, W, H);
    parts.forEach(p => {
      if (!reduce) {
        p.x += p.vx;
        p.y += p.vy;
      }
      const screenY = p.y - sy;
      if (screenY < -60 || screenY > H + 200 || p.x < -10 || p.x > W + 10) {
        Object.assign(p, spawn(false));
        return;
      }
      draw(p, screenY, frame);
    });
    if (!reduce) {
      frame++;
      requestAnimationFrame(tick);
    }
  }

  function init() {
    resize();
    parts = Array.from({ length: count() }, () => spawn(true));
    tick();
  }

  init();
  let resizeT;
  const onResize = () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      resize();
      parts = Array.from({ length: count() }, () => spawn(true));
      if (reduce) tick();
    }, 120);
  };
  window.addEventListener('resize', onResize);
})();

/* ----------------------------------------------------------------
   HERO VIDEO PLAY BUTTON — custom centered overlay
   ---------------------------------------------------------------- */
(function heroVideoPlay() {
  const video = document.querySelector('.hero-video');
  const btn = document.querySelector('.video-play-btn');
  const stage = document.querySelector('.video-stage');
  if (!video || !btn || !stage) return;
  function toggle() {
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }
  btn.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
  stage.addEventListener('click', toggle);
  video.addEventListener('play', () => btn.classList.add('is-hidden'));
  video.addEventListener('pause', () => btn.classList.remove('is-hidden'));
})();

/* ----------------------------------------------------------------
   THEME TOGGLE — switch between dark and light/cream
   ---------------------------------------------------------------- */
(function themeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const light = document.body.classList.toggle('theme-light');
    btn.textContent = light ? 'מצב כהה' : 'מצב בהיר';
  });
})();

/* ----------------------------------------------------------------
   COOKIE CONSENT POPUP
   ---------------------------------------------------------------- */
(function cookieConsent() {
  const popup = document.getElementById('cookie-popup');
  const btn = document.getElementById('cookie-accept');
  if (!popup || !btn) return;
  
  if (!localStorage.getItem('cookies-accepted')) {
    popup.style.display = 'flex';
    popup.removeAttribute('aria-hidden');
  }

  btn.addEventListener('click', () => {
    localStorage.setItem('cookies-accepted', 'true');
    popup.style.display = 'none';
    popup.setAttribute('aria-hidden', 'true');
  });
})();

log('initialized · DEBUG=' + DEBUG);
