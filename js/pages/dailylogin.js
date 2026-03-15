// js/pages/dailylogin.js
// 7-day cycle, resets day 1 after day 7
// Streak resets if missed but keep claimed rewards
// Tap slot to claim — shows claimed notification
// NPC Yin displayed as cutout

import { showToast }          from '../core/modal.js';
import { DAILY_LOGIN_REWARDS } from '../data/npcs.js';

export function renderDailyLogin() {
  const p = window.PLAYER; if (!p) return;
  const login    = p.dailyLogin || { lastClaim:null, currentDay:0, streak:0 };
  const today    = new Date().toDateString();
  const lastDate = login.lastClaim ? new Date(login.lastClaim).toDateString() : null;
  const yesterday= new Date(Date.now()-86400000).toDateString();

  /* Check streak — reset if missed a day */
  let currentDay = login.currentDay || 0;
  if (lastDate && lastDate !== today && lastDate !== yesterday) {
    /* Missed a day — reset streak but keep rewards */
    currentDay = 0;
  }
  /* If already claimed today, currentDay stays */
  const alreadyClaimed = lastDate === today;
  const nextDay        = alreadyClaimed ? currentDay : currentDay + 1;

  /* Render NPC Yin */
  const yinEl = document.getElementById('yin-cutout');
  if (yinEl) {
    yinEl.innerHTML = `
      <img class="yin-img" src="assets/cityCenter/npcs/npc-yin.jpg" alt="Yin"
           onerror="this.style.opacity='0.3'"/>
      <div class="yin-greeting">Welcome back 🙂‍↕️</div>`;
  }

  /* Render 7 reward slots */
  const grid = document.getElementById('daily-grid'); if (!grid) return;
  grid.innerHTML = DAILY_LOGIN_REWARDS.map(r => {
    const claimed  = r.day < nextDay || (r.day === currentDay && alreadyClaimed);
    const isToday  = r.day === nextDay && !alreadyClaimed;
    const locked   = r.day > nextDay;

    return `<div class="daily-slot ${claimed?'claimed':''} ${isToday?'today':''} ${locked?'locked':''}"
              onclick="${isToday ? `claimDailyReward(${r.day})` : ''}">
      <div class="daily-day">Day ${r.day}</div>
      <div class="daily-emoji">${r.emoji}</div>
      <div class="daily-label">${r.label}</div>
      ${claimed ? '<div class="daily-check">✅</div>' : ''}
      ${isToday ? '<div class="daily-tap">Tap!</div>' : ''}
    </div>`;
  }).join('');

  /* Streak info */
  const streakEl = document.getElementById('daily-streak');
  if (streakEl) streakEl.textContent = alreadyClaimed
    ? `✅ Already claimed today — come back tomorrow!`
    : `Day ${nextDay} of 7 — claim your reward!`;
}

window.claimDailyReward = async function(day) {
  const p    = window.PLAYER; if (!p) return;
  const reward = DAILY_LOGIN_REWARDS.find(r => r.day === day); if (!reward) return;
  const today  = new Date().toDateString();
  const login  = p.dailyLogin || { lastClaim:null, currentDay:0 };

  if (login.lastClaim && new Date(login.lastClaim).toDateString() === today) {
    showToast('✅ Already claimed today!'); return;
  }

  const updates = { dailyLogin: { lastClaim: new Date().toISOString(), currentDay: day } };

  /* Apply reward */
  if (reward.type === 'coins')        updates.gold          = (p.gold||0)         + reward.amount;
  if (reward.type === 'diamonds')     updates.diamonds      = (p.diamonds||0)      + reward.amount;
  if (reward.type === 'studio_token') updates.studioTokens  = (p.studioTokens||0)  + reward.amount;
  if (reward.type === 'pachinko_token') updates.pachinkoTokens = (p.pachinkoTokens||0) + reward.amount;
  if (reward.type === 'item') {
    const inv = [...(p.inventory||[])];
    const idx = inv.findIndex(i => i.id === reward.id);
    if (idx >= 0) inv[idx] = { id:reward.id, uses: inv[idx].uses + 1 };
    else          inv.push({ id:reward.id, uses:1 });
    updates.inventory = inv;
  }

  /* Reset to day 1 after day 7 */
  if (day >= 7) updates.dailyLogin.currentDay = 0;

  await window.updatePlayerField(updates);
  showToast(`🎁 Day ${day} reward claimed: ${reward.label}!`);
  renderDailyLogin();
};

/* ── Event hooks ── */
document.addEventListener('page-change',   e => { if (e.detail.page === 'daily-login') renderDailyLogin(); });
document.addEventListener('player-ready',  () => renderDailyLogin());
