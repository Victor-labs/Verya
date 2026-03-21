// js/pages/settings.js
// Settings page — all toggles + account actions
// Sections:
//   1. Hero Identity   — rename + soul class
//   2. Audio           — sound fx + music
//   3. Display         — reduce effects, floating damage numbers
//   4. Notifications   — push toggle
//   5. Account         — info + sign out
//   6. Danger Zone     — delete account

import { showToast, openModal } from '../core/modal.js';
import { auth, db }             from '../../firebase-config.js';
import {
  signOut, deleteUser,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  doc, deleteDoc,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

/* ══════════════════════════════════════
   SETTINGS STATE
   Stored on the player doc under "settings"
   so preferences survive across devices
══════════════════════════════════════ */
const DEFAULTS = {
  soundFx:        true,
  music:          false,
  reduceEffects:  false,
  floatingDamage: true,
  notifications:  false,
};

/** Read current settings — merge with defaults for safety */
export function getSettings() {
  return Object.assign({}, DEFAULTS, window.PLAYER?.settings || {});
}

/** Expose globally so combat.js / canvas.js can read them */
window.getSettings = getSettings;

/** Save one or more setting keys */
function saveSetting(key, value) {
  const current = getSettings();
  current[key]  = value;
  window.updatePlayerField({ settings: current });
  /* Fire custom event so other modules can react immediately */
  document.dispatchEvent(new CustomEvent('settings-changed', { detail: { key, value } }));
}

/* ══════════════════════════════════════
   RENDER
══════════════════════════════════════ */
export function renderSettings() {
  const p  = window.PLAYER; if (!p) return;
  const s  = getSettings();

  /* Account info */
  const user = auth.currentUser;
  setEl('stg-email',    user?.email        || p.email    || '—');
  setEl('stg-uid',      (user?.uid || p.uid || '—').slice(0, 18) + '…');
  setEl('stg-hero-val', p.heroName         || 'Hero');
  setEl('stg-class-val',p.soulClass        || 'Wanderer');

  /* Sync all toggles to current state */
  syncToggle('stg-sound-fx',        s.soundFx);
  syncToggle('stg-music',           s.music);
  syncToggle('stg-reduce-effects',  s.reduceEffects);
  syncToggle('stg-floating-damage', s.floatingDamage);
  syncToggle('stg-notifications',   s.notifications);
}

function setEl(id, val) {
  const el = document.getElementById(id); if (el) el.textContent = val;
}
function syncToggle(id, isOn) {
  const el = document.getElementById(id); if (!el) return;
  el.classList.toggle('on', !!isOn);
  el.setAttribute('aria-checked', !!isOn);
}

/* ══════════════════════════════════════
   TOGGLE HANDLER — single function for all toggles
══════════════════════════════════════ */
window.stgToggle = function(key, elementId) {
  const current = getSettings()[key];
  const next    = !current;
  saveSetting(key, next);
  syncToggle(elementId, next);
  showToast(next ? '✅ Enabled' : '⭕ Disabled');
};

/* ══════════════════════════════════════
   HERO NAME EDIT
══════════════════════════════════════ */
window.stgEditHeroName = function() {
  const current = window.PLAYER?.heroName || 'Hero';
  /* Use a small inline form inside openModal */
  openModal({
    emoji: '🧝',
    title: 'Change Hero Name',
    desc:  `Current name: ${current}\nEnter your new hero name below.`,
    input: true,          /* tells modal to show an input field */
    inputPlaceholder: 'New hero name…',
    inputMax: 20,
    cost: null,
    confirmLabel: 'Save',
    onConfirm: function(newName) {
      const trimmed = (newName || '').trim();
      if (!trimmed || trimmed.length < 2) { showToast('⚠️ Name too short!'); return; }
      window.updatePlayerField({ heroName: trimmed });
      setEl('stg-hero-val', trimmed);
      showToast('🧝 Hero name updated!');
    },
  });
};

/* ══════════════════════════════════════
   SOUL CLASS EDIT
══════════════════════════════════════ */
const SOUL_CLASSES = [
  { id:'Wanderer',    emoji:'🌫️' },
  { id:'Berserker',   emoji:'⚔️' },
  { id:'Shadowblade', emoji:'🗡️' },
  { id:'Arcanist',    emoji:'🔮' },
  { id:'Warden',      emoji:'🛡️' },
  { id:'Hexbinder',   emoji:'⛓️' },
];

window.stgEditSoulClass = function() {
  const picker = document.getElementById('stg-class-picker');
  picker.style.display = picker.style.display === 'none' ? '' : 'none';
};

window.stgPickClass = function(cls) {
  window.updatePlayerField({ soulClass: cls });
  setEl('stg-class-val', cls);
  document.getElementById('stg-class-picker').style.display = 'none';
  showToast(`${SOUL_CLASSES.find(c=>c.id===cls)?.emoji || ''} Soul class updated!`);
};

function renderClassPicker() {
  const el = document.getElementById('stg-class-picker'); if (!el) return;
  el.innerHTML = SOUL_CLASSES.map(c =>
    `<div class="stg-class-opt" onclick="stgPickClass('${c.id}')">
      <span>${c.emoji}</span><span>${c.id}</span>
    </div>`
  ).join('');
}

/* ══════════════════════════════════════
   SIGN OUT
══════════════════════════════════════ */
document.getElementById('stg-signout-btn').addEventListener('click', () => {
  openModal({
    emoji: '👋',
    title: 'Sign Out',
    desc:  'Your progress is saved. You can sign back in anytime.',
    cost:  null,
    confirmLabel: 'Sign Out',
    onConfirm: async () => {
      try {
        await signOut(auth);
        window.location.href = 'index.html';
      } catch (e) {
        showToast('❌ Error signing out.');
      }
    },
  });
});

/* ══════════════════════════════════════
   DELETE ACCOUNT (Danger Zone)
══════════════════════════════════════ */
document.getElementById('stg-delete-btn').addEventListener('click', () => {
  openModal({
    emoji: '💀',
    title: 'Delete Account',
    desc:  'This permanently deletes your hero and all progress. This cannot be undone.',
    cost:  '⚠️ Irreversible action',
    confirmLabel: 'Delete Forever',
    danger: true,
    onConfirm: async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        /* Delete Firestore player document first */
        await deleteDoc(doc(db, 'players', user.uid));
        /* Delete Firebase Auth account */
        await deleteUser(user);
        window.location.href = 'index.html';
      } catch (err) {
        /* If re-auth required (recent login needed) */
        if (err.code === 'auth/requires-recent-login') {
          showToast('🔐 Please sign out and sign in again to delete.');
        } else {
          showToast('❌ Could not delete account.');
          console.error(err);
        }
      }
    },
  });
});

/* ══════════════════════════════════════
   EVENT HOOKS
══════════════════════════════════════ */
document.addEventListener('page-change', e => {
  if (e.detail.page === 'settings') {
    renderSettings();
    renderClassPicker();
    document.getElementById('stg-class-picker').style.display = 'none';
  }
});
document.addEventListener('player-ready',   () => renderSettings());
document.addEventListener('player-updated', () => {
  const pg = document.getElementById('page-settings');
  if (pg?.classList.contains('active')) renderSettings();
});
