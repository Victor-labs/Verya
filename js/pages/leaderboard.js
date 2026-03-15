// js/pages/leaderboard.js
// Real-time leaderboard — top 10 per category
// Categories: Level, Total Kills, Gold Earned, Zones Cleared, Top Criminals, Top Guilds
// Live Firestore queries with onSnapshot

import { db }                          from '../../firebase-config.js';
import { collection, query, orderBy,
         limit, onSnapshot }           from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const CATS = [
  { id:'level',       label:'⭐ Level',          field:'level',        dir:'desc' },
  { id:'kills',       label:'⚔️ Total Kills',    field:'totalKills',   dir:'desc' },
  { id:'gold',        label:'🪙 Gold Earned',     field:'goldEarned',   dir:'desc' },
  { id:'zones',       label:'🗺️ Zones Cleared',  field:'clearedZones', dir:'desc' },
  { id:'criminals',   label:'🔴 Top Criminals',   field:'criminalStars',dir:'desc' },
];

let activeCat    = 'level';
let unsubscribe  = null;

export function renderLeaderboard() {
  renderCatPills();
  fetchLeaderboard(activeCat);
}

function renderCatPills() {
  const el = document.getElementById('lb-cats'); if (!el) return;
  el.innerHTML = CATS.map(c =>
    `<div class="lb-cat-pill${activeCat === c.id ? ' active' : ''}"
      onclick="switchLbCat('${c.id}')">${c.label}</div>`
  ).join('');
}

window.switchLbCat = function(cat) {
  activeCat = cat;
  renderCatPills();
  fetchLeaderboard(cat);
};

function fetchLeaderboard(catId) {
  const cat  = CATS.find(c => c.id === catId); if (!cat) return;
  const list = document.getElementById('lb-list'); if (!list) return;
  list.innerHTML = '<div class="lb-loading">Loading...</div>';

  /* Unsubscribe previous listener */
  if (unsubscribe) { unsubscribe(); unsubscribe = null; }

  const q = query(
    collection(db, 'players'),
    orderBy(cat.field, cat.dir),
    limit(10)
  );

  unsubscribe = onSnapshot(q, snap => {
    const players = snap.docs.map((d,i) => ({ ...d.data(), rank: i+1 }));
    renderList(players, cat);
  }, () => {
    list.innerHTML = '<div class="lb-loading">Could not load leaderboard.</div>';
  });
}

function renderList(players, cat) {
  const list = document.getElementById('lb-list'); if (!list) return;
  const me   = window.PLAYER?.uid || window.PLAYER_UID;

  if (!players.length) {
    list.innerHTML = '<div class="lb-loading">No players yet.</div>'; return;
  }

  list.innerHTML = players.map(p => {
    const isMe   = p.uid === me;
    const medal  = p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : `#${p.rank}`;
    const value  = cat.id === 'zones'
      ? `${(p.clearedZones||[]).length} zones`
      : cat.id === 'criminals'
      ? `${p.criminalStars||0} ⭐`
      : cat.id === 'gold'
      ? `🪙 ${(p.goldEarned||0).toLocaleString()}`
      : cat.id === 'kills'
      ? `⚔️ ${(p.totalKills||0).toLocaleString()}`
      : `Lv.${p.level||1}`;

    const align = p.alignment === 'criminal' ? '🔴' : p.alignment === 'vigilante' ? '🔵' : '⚪';

    return `<div class="lb-row ${isMe ? 'me' : ''}" onclick="viewPlayerProfile('${p.uid||''}')">
      <div class="lb-rank">${medal}</div>
      <div class="lb-avatar">${p.equippedCharacter
        ? `<img src="assets/characters/${p.gender==='female'?'females':'males'}/${p.equippedCharacter}.jpg"
               onerror="this.outerHTML='<div class=lb-avatar-fallback>👤</div>'"
               class="lb-avatar-img"/>`
        : '<div class="lb-avatar-fallback">👤</div>'}</div>
      <div class="lb-info">
        <div class="lb-name">${align} ${p.heroName||'Unknown'} ${isMe?'<span class="lb-you">YOU</span>':''}</div>
        <div class="lb-sub">${p.soulClass||'Wanderer'} · ${p.guildId?'[Guild]':''}</div>
      </div>
      <div class="lb-value">${value}</div>
    </div>`;
  }).join('');
}

/* ── Event hooks ── */
document.addEventListener('page-change', e => {
  if (e.detail.page === 'leaderboard') { activeCat = 'level'; renderLeaderboard(); }
});
