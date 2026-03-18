// js/pages/home.js
// Home page — action rows like Archlight image 2
// Actions: Combat, Special Missions, Quests, Go to City Center, Back to Apartment
// Live chat ticker at top (global chat latest message)
// Current zone display with zone image

import { goToPage }     from '../core/nav.js';
import { showToast }    from '../core/modal.js';
import { ZONES, getZoneById } from '../data/zones.js';
import { db }           from '../../firebase-config.js';
import { collection, query, orderBy,
         limit, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

let tickerUnsub = null;

export function renderHome() {
  const p    = window.PLAYER; if (!p) return;
  const zone = getZoneById(p.currentZone || 'ashen-slums');
  const el   = document.getElementById('page-home'); if (!el) return;

  el.innerHTML = `
    <!-- Zone banner -->
    <div class="home-zone-banner" style="background-image:url('${zone.bg}')">
      <div class="home-zone-overlay"></div>
      <div class="home-zone-content">
        <div class="home-zone-label">CURRENT ZONE</div>
        <div class="home-zone-name">${zone.emoji} ${zone.name.toUpperCase()}</div>
        <div class="home-zone-sub">Level ${zone.levelReq}+ · ${zone.danger}</div>
      </div>
    </div>

    <!-- Action rows -->
    <div class="home-actions">
      <div class="home-action-row" id="action-combat">
        <div class="home-action-icon">⚔️</div>
        <div class="home-action-text">
          <div class="home-action-title">Combat</div>
          <div class="home-action-sub">Fight enemies in ${zone.name}</div>
        </div>
        <div class="home-action-cost">⚡ 50</div>
      </div>

      <div class="home-action-row" onclick="goToPage('special-missions')">
        <div class="home-action-icon">📋</div>
        <div class="home-action-text">
          <div class="home-action-title">Special Missions</div>
          <div class="home-action-sub">NPC quests with unique rewards</div>
        </div>
        <div class="home-action-arrow">›</div>
      </div>

      <div class="home-actions-half">
        <div class="home-action-row half" onclick="goToPage('quests')">
          <div class="home-action-icon">📜</div>
          <div class="home-action-text">
            <div class="home-action-title">Quests</div>
          </div>
        </div>
        <div class="home-action-row half" onclick="goToPage('map')">
          <div class="home-action-icon">🗺️</div>
          <div class="home-action-text">
            <div class="home-action-title">World Map</div>
          </div>
        </div>
      </div>

      <div class="home-action-row" onclick="goToPage('city-center')">
        <div class="home-action-icon">🏙️</div>
        <div class="home-action-text">
          <div class="home-action-title">Go to City Center</div>
          <div class="home-action-sub">Shops, market, medic, bar</div>
        </div>
        <div class="home-action-arrow">›</div>
      </div>

      <div class="home-action-row" id="action-apartment" onclick="goToPage('apartment')">
        <div class="home-action-icon">🏠</div>
        <div class="home-action-text">
          <div class="home-action-title">
            ${(p.apartments||[]).length ? 'Back to Apartment' : 'Rent Apartment'}
          </div>
          <div class="home-action-sub">
            ${(p.apartments||[]).length
              ? `${p.apartments[0]} apartment`
              : 'No apartment yet'}
          </div>
        </div>
        <div class="home-action-arrow">›</div>
      </div>
    </div>`;

  /* Wire combat button */
  document.getElementById('action-combat')?.addEventListener('click', () => {
    const p = window.PLAYER;
    /* HP check — below 40% block combat */
    const hpPct = ((p.hp||100) / (p.maxHp||100)) * 100;
    if (hpPct <= 40) {
      showToast('❤️ HP too low! Visit Medic Center to revive first.'); return;
    }
    if ((p.energy||0) < 50) {
      showToast('⚡ Not enough energy!'); return;
    }
    /* Open combat with random enemy from current zone */
    const zone   = getZoneById(p.currentZone || 'ashen-slums');
    const enemy  = zone.enemies[Math.floor(Math.random() * zone.enemies.length)];
    window.updatePlayerField({ energy: Math.max(0, (p.energy||0) - 50), totalEnters: (p.totalEnters||0)+1 });
    window.openCombat(zone, enemy);
  });

  /* Start chat ticker */
  startChatTicker();
}

/* ── Chat ticker ── */
function startChatTicker() {
  if (tickerUnsub) return;
  const q = query(collection(db,'globalChat'), orderBy('createdAt','desc'), limit(1));
  tickerUnsub = onSnapshot(q, snap => {
    const tickerEl = document.getElementById('chat-ticker-inner');
    if (!tickerEl) return;
    if (snap.empty) { tickerEl.textContent = 'No messages yet...'; return; }
    const m = snap.docs[0].data();
    tickerEl.textContent = `💬 ${m.heroName||'?'}: ${m.text||''}`;
  });
}

/* ── Event hooks ── */
document.addEventListener('page-change',   e => { if (e.detail.page === 'home') renderHome(); });
document.addEventListener('player-ready',  () => {
  /* Only render home if onboarding is already complete */
  if (window.PLAYER?.onboardingComplete) renderHome();
});
document.addEventListener('player-updated',() => {
  const pg = document.getElementById('page-home');
  if (pg?.classList.contains('active')) renderHome();
});
