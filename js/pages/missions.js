// js/pages/missions.js
// Missions system — daily/weekly, auto-tracking, claim rewards, countdown timer

import { showToast }                                              from '../core/modal.js';
import { DAILY_MISSIONS, WEEKLY_MISSIONS,
         msUntilDailyReset, msUntilWeeklyReset, formatCountdown } from '../data/missions.js';

let activeMsnTab = 'daily';

/* ── Read mission progress from live player data ── */
function getMsnProgress(mission) {
  const p = window.PLAYER || {};
  switch (mission.type) {
    case 'kills':   return Math.min(p.totalKills  || p.kills || 0, mission.goal);
    case 'enters':  return Math.min(p.totalEnters || 0,            mission.goal);
    case 'scans':   return Math.min(p.totalScans  || 0,            mission.goal);
    case 'gold':    return Math.min(p.goldEarned  || 0,            mission.goal);
    case 'clears':  return Math.min((p.clearedZones||[]).length,   mission.goal);
    case 'bosses':  return Math.min(p.totalBossKills || 0,         mission.goal);
    default:        return 0;
  }
}

const isMsnClaimed = mission => !!(window.PLAYER?.missionsClaimed?.[mission.id]);

/* ── Build a mission card HTML string ── */
function buildMsnCard(mission, tabType) {
  const progress  = getMsnProgress(mission);
  const done      = progress >= mission.goal;
  const claimed   = isMsnClaimed(mission);
  const pct       = Math.min((progress / mission.goal) * 100, 100);
  const fillClass = claimed || done ? 'done-fill' : `${tabType}-fill`;

  const statusCls = claimed ? `msn-card ${tabType} claimed`
                  : done    ? `msn-card ${tabType} completed`
                  :            `msn-card ${tabType}`;

  const actionHtml = claimed
    ? '<div class="msn-claimed-stamp">✔ Reward Claimed</div>'
    : done
      ? `<button class="msn-claim-btn" onclick="claimMission('${mission.id}','${tabType}')">Claim Reward</button>`
      : '';

  return `<div class="${statusCls}" id="msn-card-${mission.id}">
    <div class="msn-card-top">
      <div class="msn-card-left">
        <div class="msn-card-emoji">${mission.emoji}</div>
        <div class="msn-card-info">
          <div class="msn-card-name">${mission.name}</div>
          <div class="msn-card-desc">${mission.desc}</div>
        </div>
      </div>
      <div class="msn-reward">
        <span class="msn-reward-chip msn-reward-xp">⭐ ${mission.xp} XP</span>
        <span class="msn-reward-chip msn-reward-gold">🪙 ${mission.gold}</span>
      </div>
    </div>
    <div class="msn-progress-row">
      <div class="msn-prog-track">
        <div class="msn-prog-fill ${fillClass}" style="width:${pct}%"></div>
      </div>
      <div class="msn-prog-text">${progress} / ${mission.goal}</div>
    </div>
    ${actionHtml}
  </div>`;
}

/* ── Render all mission cards ── */
export function renderMissions() {
  const dailyEl  = document.getElementById('msn-daily-list');
  const weeklyEl = document.getElementById('msn-weekly-list');
  if (dailyEl)  dailyEl.innerHTML  = DAILY_MISSIONS.map(m => buildMsnCard(m, 'daily')).join('');
  if (weeklyEl) weeklyEl.innerHTML = WEEKLY_MISSIONS.map(m => buildMsnCard(m, 'weekly')).join('');
  updateMsnTimer();
}

/* ── Claim reward ── */
window.claimMission = function(missionId, tabType) {
  const p       = window.PLAYER; if (!p) return;
  const list    = tabType === 'daily' ? DAILY_MISSIONS : WEEKLY_MISSIONS;
  const mission = list.find(m => m.id === missionId);
  if (!mission || isMsnClaimed(mission)) return;
  if (getMsnProgress(mission) < mission.goal) { showToast('❌ Mission not complete yet!'); return; }

  const claimed = { ...(p.missionsClaimed || {}), [mission.id]: Date.now() };
  window.updatePlayerField({
    xp:             (p.xp   || 0) + mission.xp,
    gold:           (p.gold || 0) + mission.gold,
    missionsClaimed: claimed,
  });
  showToast(`🎉 ${mission.name} — ⭐ +${mission.xp} XP  🪙 +${mission.gold}`);
  renderMissions();
};

/* ── Tab switch ── */
window.switchMsnTab = function(tab) {
  activeMsnTab = tab;
  document.getElementById('msn-tab-daily').classList.toggle('active',  tab === 'daily');
  document.getElementById('msn-tab-weekly').classList.toggle('active', tab === 'weekly');
  document.getElementById('msn-daily-panel').style.display  = tab === 'daily'  ? '' : 'none';
  document.getElementById('msn-weekly-panel').style.display = tab === 'weekly' ? '' : 'none';
  updateMsnTimer();
};

/* ── Live countdown ── */
function updateMsnTimer() {
  const labelEl = document.getElementById('msn-timer-label');
  const iconEl  = document.getElementById('msn-timer-icon');
  if (!labelEl) return;
  const ms    = activeMsnTab === 'daily' ? msUntilDailyReset() : msUntilWeeklyReset();
  const label = activeMsnTab === 'daily' ? 'Daily reset in ' : 'Weekly reset in ';
  labelEl.textContent = label + formatCountdown(ms);
  if (iconEl) iconEl.textContent = activeMsnTab === 'daily' ? '⏳' : '📅';
}

/* Tick every second (only costs CPU when missions page is visible) */
setInterval(() => {
  if (document.getElementById('page-missions')?.classList.contains('active')) updateMsnTimer();
}, 1000);

/* ── Event hooks ── */
document.addEventListener('player-ready',   () => renderMissions());
document.addEventListener('player-updated', () => renderMissions());
document.addEventListener('page-change', e => {
  if (e.detail.page === 'quests') {
    activeMsnTab = 'daily';
    document.getElementById('msn-tab-daily').classList.add('active');
    document.getElementById('msn-tab-weekly').classList.remove('active');
    document.getElementById('msn-daily-panel').style.display  = '';
    document.getElementById('msn-weekly-panel').style.display = 'none';
    renderMissions();
  }
});
