// js/pages/map.js
// World map — Archlight style
// Scrollable vertical list, zones alternating left/right
// Background images transition every 5 zones
// Locked zones greyed out, current zone glows gold
// Tap locked → toast. Tap unlocked → zone detail panel
// Travel button → updates currentZone + goes to home

import { showToast }                          from '../core/modal.js';
import { goToPage }                            from '../core/nav.js';
import { ZONES, getZoneById, isZoneUnlocked,
         currentZone, BOSS_LOOT, ZONE_ITEMS }  from '../data/zones.js';

/* ── Open map overlay ── */
export function openMap() {
  const overlay = document.getElementById('map-overlay');
  overlay.classList.add('open');
  renderMap();
}
window.openMap = openMap;

/* ── Close map ── */
document.getElementById('map-close-btn')?.addEventListener('click', () => {
  document.getElementById('map-overlay').classList.remove('open');
});

/* ══════════════════════════════════════
   RENDER FULL MAP
══════════════════════════════════════ */
function renderMap() {
  const p          = window.PLAYER; if (!p) return;
  const playerLvl  = p.level || 1;
  const curZoneId  = p.currentZone || 'ashen-slums';
  const listEl     = document.getElementById('map-zone-list');
  if (!listEl) return;

  /* Build reversed list — bottom = zone 1, top = Oblivion */
  const reversed = [...ZONES].reverse();

  listEl.innerHTML = reversed.map((zone, idx) => {
    const unlocked = isZoneUnlocked(zone, playerLvl);
    const isCurrent= zone.id === curZoneId;
    const side     = (ZONES.length - 1 - idx) % 2 === 0 ? 'left' : 'right';

    let statusClass = 'locked';
    let statusText  = `🔒 Lvl ${zone.levelReq}`;
    if (isCurrent) { statusClass = 'current'; statusText = 'CURRENT LOCATION'; }
    else if (unlocked) { statusClass = 'unlocked'; statusText = `Lvl ${zone.levelReq}`; }

    return `
      <div class="map-zone-row ${side}" data-zone-id="${zone.id}">
        <!-- Connector line -->
        <div class="map-connector"></div>

        <!-- Zone card -->
        <div class="map-zone-card ${statusClass} ${isCurrent ? 'pulse' : ''}"
          onclick="onZoneTap('${zone.id}')">
          <div class="map-zone-bg" style="background-image:url('${zone.bg}')"></div>
          <div class="map-zone-overlay"></div>
          <div class="map-zone-content">
            ${isCurrent ? '<div class="map-current-label">CURRENT LOCATION</div>' : ''}
            <div class="map-zone-name">${zone.emoji} ${zone.name.toUpperCase()}</div>
            <div class="map-zone-lvl">${statusText}</div>
          </div>
          ${!unlocked ? '<div class="map-zone-lock">🔒</div>' : ''}
        </div>
      </div>`;
  }).join('');

  /* Scroll to current zone */
  setTimeout(() => {
    const cur = listEl.querySelector('.current');
    if (cur) cur.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
}

/* ══════════════════════════════════════
   ZONE TAP HANDLER
══════════════════════════════════════ */
window.onZoneTap = function(zoneId) {
  const p         = window.PLAYER; if (!p) return;
  const zone      = getZoneById(zoneId);
  const unlocked  = isZoneUnlocked(zone, p.level || 1);
  const curZoneId = p.currentZone || 'ashen-slums';
  const curZone   = getZoneById(curZoneId);

  if (!unlocked) {
    /* Find what zone is blocking */
    showToast(`🔒 Reach Level ${zone.levelReq} to unlock ${zone.name}`);
    return;
  }

  /* Open zone detail panel */
  openZoneDetail(zone, curZoneId);
};

/* ══════════════════════════════════════
   ZONE DETAIL PANEL
══════════════════════════════════════ */
function openZoneDetail(zone, curZoneId) {
  const p         = window.PLAYER;
  const isCurrent = zone.id === curZoneId;

  const panel     = document.getElementById('map-detail-panel');
  const overlay   = document.getElementById('map-detail-overlay');

  /* Zone emoji + name */
  document.getElementById('detail-emoji').textContent   = zone.emoji;
  document.getElementById('detail-name').textContent    = zone.name;
  document.getElementById('detail-danger').textContent  = `⚠️ ${zone.danger}`;
  document.getElementById('detail-lore').textContent    = zone.lore;
  document.getElementById('detail-lvl').textContent     = `Required Level: ${zone.levelReq}`;

  /* Rewards */
  document.getElementById('detail-gold').textContent =
    `🪙 ${zone.goldMin}–${zone.goldMax} Gold per fight`;
  document.getElementById('detail-xp').textContent =
    `⭐ ${zone.xpMin}–${zone.xpMax} XP per fight`;

  /* Special zone item (boss drop) */
  const bossEl = document.getElementById('detail-boss-drop');
  if (zone.bossDrop) {
    bossEl.style.display = '';
    bossEl.innerHTML = `
      <div class="detail-boss-row">
        <span class="detail-boss-emoji">${zone.bossDrop.emoji}</span>
        <div>
          <div class="detail-boss-name">${zone.bossDrop.name}</div>
          <div class="detail-boss-effect">${zone.bossDrop.effect}</div>
          <div class="detail-boss-lore">${zone.bossDrop.lore}</div>
        </div>
      </div>`;
  } else {
    bossEl.style.display = 'none';
  }

  /* Travel button */
  const travelBtn = document.getElementById('detail-travel-btn');
  if (isCurrent) {
    travelBtn.textContent  = '✅ Already Here';
    travelBtn.disabled     = true;
    travelBtn.className    = 'detail-travel-btn disabled';
  } else {
    travelBtn.textContent  = `⚡ Travel to ${zone.name}`;
    travelBtn.disabled     = false;
    travelBtn.className    = 'detail-travel-btn';
    travelBtn.onclick      = () => travelToZone(zone.id);
  }

  /* Show panel */
  overlay.style.display = 'flex';
  panel.style.animation = 'slideUp 0.35s cubic-bezier(.22,1,.36,1) forwards';
}

/* ── Close detail panel ── */
window.closeZoneDetail = function() {
  document.getElementById('map-detail-overlay').style.display = 'none';
};
document.getElementById('map-detail-overlay')?.addEventListener('click', e => {
  if (e.target === document.getElementById('map-detail-overlay')) closeZoneDetail();
});

/* ══════════════════════════════════════
   TRAVEL TO ZONE
══════════════════════════════════════ */
function travelToZone(zoneId) {
  const zone = getZoneById(zoneId);
  window.updatePlayerField({ currentZone: zoneId });
  closeZoneDetail();
  document.getElementById('map-overlay').classList.remove('open');
  goToPage('home');
  showToast(`📍 Arrived at ${zone.name}`);
}

/* ── Event hooks ── */
document.addEventListener('player-ready', () => {
  /* Wire explore button on home to open map */
  const exploreBtn = document.getElementById('action-explore');
  if (exploreBtn) {
    const nb = exploreBtn.cloneNode(true);
    exploreBtn.parentNode.replaceChild(nb, exploreBtn);
    nb.addEventListener('click', openMap);
  }
});
