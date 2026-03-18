// js/core/player.js
// Auth guard + player loader
// FIXED: Race condition on registration — waits for doc to exist before redirecting
// Uses auth.currentUser.uid directly — never trusts Firestore uid field
// Fires: player-ready, player-updated events

import { auth, db }          from '../../firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { doc, onSnapshot,
         updateDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

let playerUnsub = null;
let retryCount  = 0;
const MAX_RETRY = 10;

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  window.PLAYER_UID = user.uid;

  if (playerUnsub) { playerUnsub(); playerUnsub = null; }

  /* Wait for player document to exist before starting listener */
  waitForPlayerDoc(user.uid);
});

async function waitForPlayerDoc(uid) {
  retryCount = 0;
  tryLoad(uid);
}

async function tryLoad(uid) {
  try {
    const snap = await getDoc(doc(db, 'players', uid));
    if (!snap.exists()) {
      /* Doc not written yet — retry up to 10 times with 500ms delay */
      if (retryCount < MAX_RETRY) {
        retryCount++;
        setTimeout(() => tryLoad(uid), 500);
      } else {
        /* Gave up — go back to login */
        window.location.href = 'index.html';
      }
      return;
    }
    /* Doc exists — start live listener */
    startListener(uid);
  } catch(e) {
    if (retryCount < MAX_RETRY) {
      retryCount++;
      setTimeout(() => tryLoad(uid), 500);
    }
  }
}

function startListener(uid) {
  if (playerUnsub) playerUnsub();
  playerUnsub = onSnapshot(doc(db, 'players', uid), snap => {
    if (!snap.exists()) return; /* ignore if doc temporarily missing */
    window.PLAYER = { ...snap.data(), uid };
    document.dispatchEvent(new CustomEvent('player-updated'));

    if (!window._playerReady) {
      window._playerReady = true;
      document.dispatchEvent(new CustomEvent('player-ready'));
    }
  });
}

window.updatePlayerField = async function(fields) {
  const uid = window.PLAYER_UID; if (!uid) return;

  if (Array.isArray(fields.clearedZones)) {
    fields.zonesCleared = fields.clearedZones.length;
  }
  if (fields.heroName) {
    fields.heroNameLower = fields.heroName.toLowerCase();
  }
  if (typeof fields.gold     === 'number') fields.gold     = Math.max(0, Math.floor(fields.gold));
  if (typeof fields.diamonds === 'number') fields.diamonds = Math.max(0, Math.floor(fields.diamonds));

  if (window.PLAYER) Object.assign(window.PLAYER, fields);
  await updateDoc(doc(db, 'players', uid), fields);
  document.dispatchEvent(new CustomEvent('player-updated'));
};
