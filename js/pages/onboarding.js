// js/pages/onboarding.js
// FLOW:
// 1. player-ready fires
// 2. If onboardingComplete → goToPage('home')  (returning user)
// 3. If NOT → show "Start Your Journey" welcome screen with particles
// 4. Player taps "Begin" button → onboarding steps start
// 5. Gender → Character → Alignment → saves to Firebase → goToPage('home')

import { showToast } from '../core/modal.js';
import { goToPage }  from '../core/nav.js';

let ob_gender    = null;
let ob_character = null;
let ob_alignment = null;
let particleStop = null;

/* ── Welcome screen — shown before onboarding steps ── */
function showWelcomeScreen() {
  const overlay = document.getElementById('onboarding-overlay');
  if (!overlay) return;

  /* Show welcome step */
  overlay.style.display = 'flex';
  document.querySelectorAll('.ob-step').forEach(s => s.style.display = 'none');

  const welcome = document.getElementById('ob-step-welcome');
  if (welcome) {
    welcome.style.display = 'flex';
    /* Set hero name on welcome screen */
    const nameEl = document.getElementById('ob-welcome-name');
    if (nameEl) nameEl.textContent = window.PLAYER?.heroName || 'Hero';
    /* Start particles on the welcome canvas */
    startWelcomeParticles();
  }
}

function startWelcomeParticles() {
  const cvs = document.getElementById('ob-welcome-canvas');
  if (!cvs) return;
  cvs.width  = window.innerWidth;
  cvs.height = window.innerHeight;
  const ctx = cvs.getContext('2d');
  const pts = Array.from({length:60},()=>({
    x: Math.random()*cvs.width, y: Math.random()*cvs.height,
    r: Math.random()*2+0.4,
    vx:(Math.random()-0.5)*0.4, vy:(Math.random()-0.5)*0.4,
    a: Math.random()*Math.PI*2,
    hue: Math.random() > 0.5 ? '201,168,76' : '0,180,255',
  }));
  let animId;
  function draw(){
    ctx.clearRect(0,0,cvs.width,cvs.height);
    pts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.a+=0.01;
      if(p.x<0||p.x>cvs.width)  p.vx*=-1;
      if(p.y<0||p.y>cvs.height) p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(${p.hue},${0.3+Math.sin(p.a)*0.2})`; ctx.fill();
    });
    animId = requestAnimationFrame(draw);
  }
  draw();
  particleStop = () => cancelAnimationFrame(animId);
}

/* ── Step helpers ── */
function showStep(id) {
  document.querySelectorAll('.ob-step').forEach(s => s.style.display = 'none');
  const el = document.getElementById(id);
  if (el) el.style.display = 'flex';
}
window.showStep = showStep;

function hideOnboarding() {
  if (particleStop) { particleStop(); particleStop = null; }
  const overlay = document.getElementById('onboarding-overlay');
  if (overlay) overlay.style.display = 'none';
}

/* ── Begin onboarding (after tapping button) ── */
window.obBegin = function() {
  if (particleStop) { particleStop(); particleStop = null; }
  showStep('ob-step-gender');
};

/* ── STEP 1: Gender ── */
window.obSelectGender = function(gender) {
  ob_gender    = gender;
  ob_character = gender === 'male' ? 'andrew' : 'sera';

  const img  = gender === 'male'
    ? 'assets/characters/males/andrew.jpg'
    : 'assets/characters/females/sera.jpg';
  const name = gender === 'male' ? 'Andrew' : 'Sera';
  const lore = gender === 'male'
    ? 'A survivor from the outer slums. No special powers — just will.'
    : 'Wandered into Verya after the collapse. Fights with nothing but instinct.';

  const imgEl  = document.getElementById('ob-char-img');
  const nameEl = document.getElementById('ob-char-name');
  const descEl = document.getElementById('ob-char-desc');
  if (imgEl)  imgEl.src          = img;
  if (nameEl) nameEl.textContent = name;
  if (descEl) descEl.textContent = lore;
  showStep('ob-step-character');
};

/* ── STEP 2: Confirm character ── */
window.obConfirmCharacter = function() {
  showStep('ob-step-alignment');
};

/* ── STEP 3: Alignment ── */
window.obSelectAlignment = function(alignment) {
  ob_alignment = alignment;

  const warnEl    = document.getElementById('ob-align-warning');
  const confirmEl = document.getElementById('ob-align-confirm-btn');
  if (!warnEl || !confirmEl) return;

  if (alignment === 'criminal') {
    warnEl.innerHTML = `<span class="ob-warn-red">⚠️ WARNING:</span> Upon committing a crime you earn a star. Reach 6 stars and you will be jailed. Pay bail or wait 2 hours.`;
    confirmEl.style.background  = 'linear-gradient(135deg,#7f1d1d,#dc2626)';
    confirmEl.style.borderColor = 'rgba(239,68,68,0.5)';
    confirmEl.style.color       = '#fecaca';
    confirmEl.textContent       = '🔴 I Choose Criminal';
  } else {
    warnEl.innerHTML = `<span class="ob-warn-blue">ℹ️ NOTICE:</span> As a Vigilante you may be prone to attacks from criminals. You can report criminals to the CIA.`;
    confirmEl.style.background  = 'linear-gradient(135deg,#1e3a8a,#2563eb)';
    confirmEl.style.borderColor = 'rgba(96,165,250,0.5)';
    confirmEl.style.color       = '#e0eaff';
    confirmEl.textContent       = '🔵 I Choose Vigilante';
  }
  warnEl.style.display    = '';
  confirmEl.style.display = '';

  document.querySelectorAll('.ob-align-card').forEach(c =>
    c.classList.toggle('selected', c.dataset.align === alignment));
};

/* ── STEP 3: Confirm alignment ── */
window.obConfirmAlignment = async function() {
  if (!ob_alignment) { showToast('Please choose an alignment.'); return; }
  const p = window.PLAYER; if (!p) return;

  await window.updatePlayerField({
    gender:             ob_gender,
    equippedCharacter:  ob_character,
    alignment:          ob_alignment,
    pvpEnabled:         false,
    pvpProtection:      true,
    onboardingComplete: true,
  });

  hideOnboarding();
  showToast(`⚔️ Welcome to Verya, ${p.heroName}!`);
  goToPage('home');
};

/* ── Listen for player-ready ── */
document.addEventListener('player-ready', () => {
  const p = window.PLAYER;
  if (!p) return;

  if (p.onboardingComplete) {
    /* Returning player — go straight to home */
    goToPage('home');
  } else {
    /* New player — show welcome screen with button */
    showWelcomeScreen();
  }
});
