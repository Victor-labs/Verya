// js/pages/home.js
// Home page — zone banner + action rows
// Chat ticker REMOVED — was causing display issues

import { goToPage }              from '../core/nav.js';
import { showToast }             from '../core/modal.js';
import { ZONES, getZoneById }    from '../data/zones.js';

export function renderHome() {
  const p  = window.PLAYER; if (!p) return;
  const el = document.getElementById('page-home'); if (!el) return;
  const zone = getZoneById(p.currentZone || 'ashen-slums');

  el.innerHTML = `
    <div class="home-zone-banner" style="background-image:url('${zone.bg}')">
      <div class="home-zone-overlay"></div>
      <div class="home-zone-content">
        <div class="home-zone-label">CURRENT ZONE</div>
        <div class="home-zone-name">${zone.emoji} ${zone.name.toUpperCase()}</div>
        <div class="home-zone-sub">Level ${zone.levelReq}+ · ${zone.danger}</div>
      </div>
    </div>
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

      <div class="home-action-row" onclick="goToPage('apartment')">
        <div class="home-action-icon">🏠</div>
        <div class="home-action-text">
          <div class="home-action-title">${(p.apartments||[]).length ? 'Back to Apartment' : 'Rent Apartment'}</div>
          <div class="home-action-sub">${(p.apartments||[]).length ? p.apartments[0]+' apartment' : 'No apartment yet'}</div>
        </div>
        <div class="home-action-arrow">›</div>
      </div>

    </div>`;

  /* Wire combat button after render */
  document.getElementById('action-combat')?.addEventListener('click', () => {
    const p = window.PLAYER;
    if (((p.hp||100)/(p.maxHp||100))*100 <= 40) {
      showToast('❤️ HP too low! Visit Medic Center first.'); return;
    }
    if ((p.energy||0) < 50) {
      showToast('⚡ Not enough energy!'); return;
    }
    const zone  = getZoneById(p.currentZone || 'ashen-slums');
    const enemy = zone.enemies[Math.floor(Math.random() * zone.enemies.length)];
    window.updatePlayerField({ energy: Math.max(0,(p.energy||0)-50), totalEnters:(p.totalEnters||0)+1 });
    if (window.openCombat) window.openCombat(zone, enemy);
    else showToast('⚔️ Combat loading...');
  });
}

document.addEventListener('page-change',   e => { if (e.detail.page === 'home') renderHome(); });
document.addEventListener('player-ready',  () => { if (window.PLAYER?.onboardingComplete) renderHome(); });
document.addEventListener('player-updated',() => {
  const pg = document.getElementById('page-home');
  if (pg?.classList.contains('active')) renderHome();
});
