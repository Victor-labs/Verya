// js/pages/onboarding.js
// First time flow — shown before home page
// Step 1: Gender selection
// Step 2: Starter character display
// Step 3: Criminal or Vigilante
// Saves to Firebase then shows home

import { showToast } from '../core/modal.js';
import { goToPage }  from '../core/nav.js';

let ob_gender    = null;
let ob_character = null;
let ob_alignment = null;

/* ── Show/hide helpers ── */
function showOnboarding() {
  const overlay = document.getElementById('onboarding-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  showStep('ob-step-gender');
}

function hideOnboarding() {
  const overlay = document.getElementById('onboarding-overlay');
  if (overlay) overlay.style.display = 'none';
}

function showStep(id) {
  document.querySelectorAll('.ob-step').forEach(s => s.style.display = 'none');
  const el = document.getElementById(id);
  if (el) el.style.display = 'flex';
}

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
  if (imgEl)  imgEl.src             = img;
  if (nameEl) nameEl.textContent    = name;
  if (descEl) descEl.textContent    = lore;

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
    confirmEl.textContent       = '🔴 I Choose Criminal';
  } else {
    warnEl.innerHTML = `<span class="ob-warn-blue">ℹ️ NOTICE:</span> As a Vigilante you may be prone to attacks from criminals. You can report criminals to the CIA.`;
    confirmEl.style.background  = 'linear-gradient(135deg,#1e3a8a,#2563eb)';
    confirmEl.style.borderColor = 'rgba(96,165,250,0.5)';
    confirmEl.textContent       = '🔵 I Choose Vigilante';
  }
  warnEl.style.display    = '';
  confirmEl.style.display = '';

  document.querySelectorAll('.ob-align-card').forEach(c =>
    c.classList.toggle('selected', c.dataset.align === alignment));
};

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
  if (!p.onboardingComplete) {
    showOnboarding();
  } else {
    goToPage('home');
  }
});
