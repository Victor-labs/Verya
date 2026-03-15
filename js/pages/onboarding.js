// js/pages/onboarding.js
// First-time onboarding flow:
// 1. Gender selection
// 2. Starter character selection (Andrew / Sera)
// 3. Criminal or Vigilante alignment selection
// Saves to Firebase, fires 'onboarding-complete' event

import { showToast }         from '../core/modal.js';
import { getStarter }        from '../data/characters.js';

let selectedGender    = null;
let selectedCharacter = null;

/* ── Open onboarding if not complete ── */
export function checkOnboarding() {
  const p = window.PLAYER;
  if (!p || p.onboardingComplete) return;
  openOnboarding();
}
window.checkOnboarding = checkOnboarding;

function openOnboarding() {
  document.getElementById('onboarding-overlay').classList.add('open');
  showStep('step-gender');
}

function showStep(id) {
  document.querySelectorAll('.ob-step').forEach(s => s.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}

/* ── STEP 1: Gender ── */
window.selectGender = function(gender) {
  selectedGender = gender;
  document.querySelectorAll('.ob-gender-btn').forEach(b =>
    b.classList.toggle('selected', b.dataset.gender === gender));
  setTimeout(() => {
    const starter = getStarter(gender);
    renderStarterStep(starter);
    showStep('step-character');
  }, 300);
};

/* ── STEP 2: Starter character ── */
function renderStarterStep(starter) {
  const el = document.getElementById('ob-starter-card');
  if (!el || !starter) return;
  el.innerHTML = `
    <img class="ob-char-img" src="${starter.img}" alt="${starter.name}"
         onerror="this.style.opacity='0.3'"/>
    <div class="ob-char-name">${starter.name}</div>
    <div class="ob-char-tier">Free Starter · D Tier</div>
    <div class="ob-char-desc">${starter.lore}</div>`;
  selectedCharacter = starter.id;
}

window.confirmCharacter = function() {
  showStep('step-alignment');
};

/* ── STEP 3: Alignment ── */
window.selectAlignment = function(alignment) {
  const warning = document.getElementById('ob-alignment-warning');
  const btn     = document.getElementById('ob-alignment-confirm');

  if (alignment === 'criminal') {
    warning.innerHTML = `<span style="color:#ef4444">⚠️ Warning:</span> Upon committing a crime offense you earn a star. Once 6 stars are reached you will be jailed and must pay bail.`;
    warning.style.display = '';
    btn.dataset.alignment = 'criminal';
    btn.textContent = '🔴 Choose Criminal';
    btn.style.borderColor = 'rgba(239,68,68,0.5)';
    btn.style.color = '#ef4444';
  } else {
    warning.innerHTML = `<span style="color:#60a5fa">ℹ️ Notice:</span> Upon choosing Vigilante you may be prone to attacks from criminals. You can report criminals to the CIA.`;
    warning.style.display = '';
    btn.dataset.alignment = 'vigilante';
    btn.textContent = '🔵 Choose Vigilante';
    btn.style.borderColor = 'rgba(96,165,250,0.5)';
    btn.style.color = '#60a5fa';
  }
  btn.style.display = '';

  document.querySelectorAll('.ob-align-btn').forEach(b =>
    b.classList.toggle('selected', b.dataset.align === alignment));
};

window.confirmAlignment = async function() {
  const btn       = document.getElementById('ob-alignment-confirm');
  const alignment = btn.dataset.alignment;
  if (!alignment) return;

  const p = window.PLAYER;
  await window.updatePlayerField({
    gender:             selectedGender,
    equippedCharacter:  selectedCharacter,
    alignment,
    pvpEnabled:         false,
    pvpProtection:      true,
    onboardingComplete: true,
  });

  document.getElementById('onboarding-overlay').classList.remove('open');
  document.dispatchEvent(new CustomEvent('onboarding-complete'));
  showToast(`Welcome to Verya, ${p.heroName}!`);
};
