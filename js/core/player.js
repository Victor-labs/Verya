// js/core/player.js
// Auth guard + player loader
// Uses auth.currentUser.uid directly — never trusts Firestore uid field
// Writes heroNameLower on every heroName update
// Fires: player-ready, player-updated events

import { auth, db }               from '../../firebase-config.js';
import { onAuthStateChanged }      from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { doc, onSnapshot,
         updateDoc }               from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

let playerUnsub = null;

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  /* Store UID from auth — never from Firestore */
  window.PLAYER_UID = user.uid;

  /* Live listener on player document */
  if (playerUnsub) playerUnsub();
  playerUnsub = onSnapshot(doc(db, 'players', user.uid), snap => {
    if (!snap.exists()) { window.location.href = 'index.html'; return; }
    window.PLAYER = { ...snap.data(), uid: user.uid };
    document.dispatchEvent(new CustomEvent('player-updated'));

    /* Fire player-ready only once */
    if (!window._playerReady) {
      window._playerReady = true;
      document.dispatchEvent(new CustomEvent('player-ready'));
    }
  });
});

/* ── updatePlayerField ──────────────────────────────────────────
   Single function all systems use to write to Firestore.
   Automatically adds heroNameLower when heroName is updated.
   Enforces non-negative gold/diamonds.
──────────────────────────────────────────────────────────────── */
window.updatePlayerField = async function(fields) {
  const uid = window.PLAYER_UID;
  if (!uid) return;

  /* Auto-sync zonesCleared count from clearedZones array */
  if (Array.isArray(fields.clearedZones)) {
    fields.zonesCleared = fields.clearedZones.length;
  }

  /* Auto-add heroNameLower */
  if (fields.heroName) {
    fields.heroNameLower = fields.heroName.toLowerCase();
  }

  /* Enforce non-negative currencies */
  if (typeof fields.gold     === 'number') fields.gold     = Math.max(0, Math.floor(fields.gold));
  if (typeof fields.diamonds === 'number') fields.diamonds = Math.max(0, Math.floor(fields.diamonds));

  /* Merge into local PLAYER immediately for responsive UI */
  if (window.PLAYER) Object.assign(window.PLAYER, fields);

  await updateDoc(doc(db, 'players', uid), fields);
  document.dispatchEvent(new CustomEvent('player-updated'));
};
