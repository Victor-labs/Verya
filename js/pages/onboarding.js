// js/pages/onboarding.js
// First time flow ONLY — shown before home page
// Step 1: Gender selection (Male / Female)
// Step 2: Starter character display + confirm
// Step 3: Criminal or Vigilante selection
// On complete: saves to Firebase, shows home page

import { showToast }      from '../core/modal.js';
import { goToPage }       from '../core/nav.js';

let ob_gender    = null;
let ob_character = null;
let ob_alignment = null;

/* ── Check if onboarding needed ── */
export function checkOnboarding() {
  const p = window.PLAYER;
  if (!p) return;
  if (!p.onboardingComplete) {
    showOnboarding();
  } else {
    goToPage('home');
  }
}
window.checkOnboarding = checkOnboarding;

function showOnboarding() {
  document.getElementById('onboarding-overlay').style.display = 'flex';
  showStep('ob-step-gender');
}

function showStep(id) {
  document.querySelectorAll('.ob-step').forEach(s => s.style.display = 'none');
  const el = document.getElementById(id);
  if (el) el.style.display = 'flex';
}

/* ── STEP 1: Gender ── */
window.obSelectGender = function(gender) {
  ob_gender = gender;
  ob_character = gender === 'male' ? 'andrew' : 'sera';

  /* Render starter character */
  const img  = gender === 'male'
    ? 'assets/characters/males/andrew.jpg'
    : 'assets/characters/females/sera.jpg';
  const name = gender === 'male' ? 'Andrew' : 'Sera';

  document.getElementById('ob-char-img').src              = img;
  document.getElementById('ob-char-name').textContent     = name;
  document.getElementById('ob-char-tier').textContent     = 'Free Starter · D Tier';
  document.getElementById('ob-char-desc').textContent     =
    gender === 'male'
      ? 'A survivor from the outer slums. No special powers — just will.'
      : 'Wandered into Verya after the collapse. Fights with nothing but instinct.';

  showStep('ob-step-character');
};

/* ── STEP 2: Confirm character ── */
window.obConfirmCharacter = function() {
  showStep('ob-step-alignment');
};

/* ── STEP 3: Alignment ── */
window.obSelectAlignment = function(alignment) {
  ob_alignment = alignment;

  const warnEl = document.getElementById('ob-align-warning');
  const confirmEl = document.getElementById('ob-align-confirm-btn');

  if (alignment === 'criminal') {
    warnEl.innerHTML = `<span class="ob-warn-red">⚠️ WARNING:</span> Upon committing a crime you earn a star. Reach 6 stars and you will be jailed. You must pay bail or wait 2 hours to be released.`;
    confirmEl.style.background = 'linear-gradient(135deg,#7f1d1d,#dc2626)';
    confirmEl.style.borderColor= 'rgba(239,68,68,0.5)';
    confirmEl.textContent      = '🔴 I Choose Criminal';
  } else {
    warnEl.innerHTML = `<span class="ob-warn-blue">ℹ️ NOTICE:</span> As a Vigilante you may be prone to attacks from criminals. You can report criminals to the CIA to get them jailed faster.`;
    confirmEl.style.background = 'linear-gradient(135deg,#1e3a8a,#2563eb)';
    confirmEl.style.borderColor= 'rgba(96,165,250,0.5)';
    confirmEl.textContent      = '🔵 I Choose Vigilante';
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

  document.getElementById('onboarding-overlay').style.display = 'none';
  showToast(`⚔️ Welcome to Verya, ${p.heroName}!`);
  goToPage('home');
};

/* ── Listen for player-ready ── */
document.addEventListener('player-ready', () => {
  const p = window.PLAYER;
  if (p && !p.onboardingComplete) {
    showOnboarding();
  } else {
    goToPage('home');
  }
});
