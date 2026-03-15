// js/core/player.js
// Firebase auth + Firestore player load/save
// Fires 'player-ready' event when player data is loaded
// Exposes window.PLAYER, window.updatePlayerField()

import { auth, db }             from '../../firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, updateDoc }     from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { ZONES }                      from '../data/zones.js';

/** Default field values — ensures old accounts still work */
const DEFAULTS = {
  energy:        100,
  diamonds:      0,
  kills:         0,
  totalKills:    0,
  totalEnters:   0,
  totalScans:    0,
  goldEarned:    0,
  totalBossKills:0,
  soulClass:     'Wanderer',
  currentZone:   'guild',
  clearedZones:  [],
  inventory:     [],
  equipped:      {},
  missionsClaimed: {},
  avatar:        '⚔️',
};

/** Populate every piece of UI that depends on player data */
function populateUI(p) {
  /* Currency bar */
  const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  const setW   = (id, pct) => { const el = document.getElementById(id); if (el) el.style.width = pct + '%'; };

  setTxt('ui-energy',   p.energy);
  setTxt('ui-coins',    p.gold || 0);
  setTxt('ui-diamonds', p.diamonds);

  /* Home hero panel */
  setTxt('home-hero-name', p.heroName || 'Hero');
  setTxt('home-level',     'Lvl ' + (p.level || 1));
  setTxt('home-class',     p.soulClass);
  setW  ('home-hp-bar',    ((p.hp / p.maxHp) * 100));
  setW  ('home-mp-bar',    ((p.mp / p.maxMp) * 100));
  setTxt('home-hp-val',    p.hp + '/' + p.maxHp);
  setTxt('home-mp-val',    p.mp + '/' + p.maxMp);

  /* Zone banner */
  const zone = ZONES.find(z => z.id === (p.currentZone || 'guild')) || ZONES[0];
  setTxt('home-zone-emoji', zone.emoji);
  setTxt('home-zone-name',  zone.name);
  setTxt('home-zone-type',  zone.type);
  setTxt('zone-boss-name',  zone.bosses[zone.bossGoal - 1].name);
  setTxt('zone-boss-icon',  zone.bosses[zone.bossGoal - 1].emoji);

  /* Kill progress bar */
  const kills = p.kills || 0;
  setTxt('zone-kills',           kills + ' / ' + zone.enemyGoal + ' enemies defeated');
  setW  ('zone-progress-fill',   Math.min((kills / zone.enemyGoal) * 100, 100));
}

/** Save fields to Firestore and sync window.PLAYER */
window.updatePlayerField = async function(fields) {
  if (!window.PLAYER_UID) return;
  await updateDoc(doc(db, 'players', window.PLAYER_UID), fields);
  Object.assign(window.PLAYER, fields);
  populateUI(window.PLAYER);
  /* Let every page system know data changed */
  document.dispatchEvent(new CustomEvent('player-updated', { detail: window.PLAYER }));
};

/** Auth guard — redirect to login if not signed in */
onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = 'index.html'; return; }

  const snap = await getDoc(doc(db, 'players', user.uid));
  if (!snap.exists()) { window.location.href = 'index.html'; return; }

  /* Merge defaults so new fields don't break old accounts */
  const p = { ...DEFAULTS, ...snap.data(), uid: user.uid };

  window.PLAYER     = p;
  window.PLAYER_UID = user.uid;

  populateUI(p);

  /* Signal all page systems */
  document.dispatchEvent(new CustomEvent('player-ready', { detail: p }));
});

/* Logout button (optional — may not exist on every build) */
const logoutBtn = document.getElementById('btn-logout');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = 'index.html';
  });
}
