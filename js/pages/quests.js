// js/pages/quests.js
// Daily quests — 3 per day, reset at 4am every day
// Weekly quests — 3 per week, reset exactly 7 days from first generation
// Task types: kill enemies, craft items, visit zones, attack players, buy from shops
// Rewards: coins + XP only
// Missed quests = rewards lost, new quests generate at next reset

import { showToast } from '../core/modal.js';

/* ── Quest templates ── */
const DAILY_TEMPLATES = [
  { type:'kill_enemy',    label: n => `Kill ${n} enemies`,           targets:[5,8,10,12,15], difficulty: n => n },
  { type:'craft_item',    label: n => `Craft ${n} items`,            targets:[1,2,3],         difficulty: n => n*2 },
  { type:'visit_zone',    label: n => `Visit ${n} different zones`,  targets:[1,2,3],         difficulty: n => n },
  { type:'attack_player', label: n => `Attack ${n} players`,         targets:[1,2,3],         difficulty: n => n*3 },
  { type:'buy_item',      label: n => `Buy ${n} items from a shop`,  targets:[1,2,3],         difficulty: n => n },
];

const WEEKLY_TEMPLATES = [
  { type:'kill_enemy',    label: n => `Kill ${n} enemies`,           targets:[30,50,75],      difficulty: n => n },
  { type:'craft_item',    label: n => `Craft ${n} items`,            targets:[5,8,10],        difficulty: n => n*2 },
  { type:'visit_zone',    label: n => `Visit ${n} different zones`,  targets:[3,5,7],         difficulty: n => n },
  { type:'attack_player', label: n => `Attack ${n} players`,         targets:[5,10,15],       difficulty: n => n*3 },
  { type:'buy_item',      label: n => `Buy ${n} items from a shop`,  targets:[3,5,8],         difficulty: n => n },
];

/* ── Generate quest list ── */
function generateQuests(templates, count, seed) {
  const rng    = seededRng(seed);
  const picked = [];
  const pool   = [...templates];

  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx      = Math.floor(rng() * pool.length);
    const template = pool.splice(idx, 1)[0];
    const target   = template.targets[Math.floor(rng() * template.targets.length)];
    const diff     = template.difficulty(target);
    picked.push({
      id:       `${template.type}_${target}_${seed}`,
      type:     template.type,
      label:    template.label(target),
      target,
      current:  0,
      completed:false,
      claimed:  false,
      reward:   {
        coins: Math.floor(diff * 15),
        xp:    Math.floor(diff * 20),
      },
    });
  }
  return picked;
}

/* ── Seeded RNG for reproducible daily/weekly quests ── */
function seededRng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/* ── Get today's 4am timestamp ── */
function getResetTime4am() {
  const now  = new Date();
  const reset= new Date(now);
  reset.setHours(4,0,0,0);
  if (now < reset) reset.setDate(reset.getDate() - 1);
  return reset.getTime();
}

/* ── Daily seed = days since epoch at 4am ── */
function getDailySeed() {
  return Math.floor(getResetTime4am() / (24 * 60 * 60 * 1000));
}

/* ── Weekly seed = floor(dailySeed / 7) ── */
function getWeeklySeed(weekStart) {
  if (!weekStart) return Math.floor(getDailySeed() / 7);
  return Math.floor(weekStart / (7 * 24 * 60 * 60 * 1000));
}

/* ══════════════════════════════════════
   RENDER QUESTS PAGE
══════════════════════════════════════ */
export function renderQuests() {
  const p   = window.PLAYER; if (!p) return;
  const el  = document.getElementById('page-quests'); if (!el) return;

  const now       = Date.now();
  const dailySeed = getDailySeed();

  /* Get or generate saved quests */
  let questData  = p.questData || {};
  let dailyQ     = questData.daily || [];
  let weeklyQ    = questData.weekly || [];
  let weekStart  = questData.weekStart || now;

  /* Check if daily needs reset */
  const lastDailySeed = questData.dailySeed || 0;
  if (lastDailySeed !== dailySeed) {
    dailyQ     = generateQuests(DAILY_TEMPLATES, 3, dailySeed);
    questData  = { ...questData, daily: dailyQ, dailySeed };
    window.updatePlayerField({ questData });
  }

  /* Check if weekly needs reset — exactly 7 days from weekStart */
  if (now - weekStart >= 7 * 24 * 60 * 60 * 1000) {
    weekStart  = now;
    weeklyQ    = generateQuests(WEEKLY_TEMPLATES, 3, getWeeklySeed(weekStart));
    questData  = { ...questData, weekly: weeklyQ, weekStart };
    window.updatePlayerField({ questData });
  } else if (!weeklyQ.length) {
    weeklyQ    = generateQuests(WEEKLY_TEMPLATES, 3, getWeeklySeed(weekStart));
    questData  = { ...questData, weekly: weeklyQ, weekStart };
    window.updatePlayerField({ questData });
  }

  /* Time until next reset */
  const nextDaily  = new Date(getResetTime4am() + 24*60*60*1000);
  const dailyDiff  = nextDaily - now;
  const dh = Math.floor(dailyDiff/3600000);
  const dm = Math.floor((dailyDiff%3600000)/60000);

  const weeklyDiff = (weekStart + 7*24*60*60*1000) - now;
  const wd = Math.floor(weeklyDiff/86400000);
  const wh = Math.floor((weeklyDiff%86400000)/3600000);

  el.innerHTML = `
    <div class="page-title">📜 Quests</div>

    <!-- Daily -->
    <div class="quest-section">
      <div class="quest-section-header">
        <div class="quest-section-title">⚡ Daily Quests</div>
        <div class="quest-reset-timer">Resets in ${dh}h ${dm}m</div>
      </div>
      <div class="quest-list" id="daily-quest-list">
        ${dailyQ.map((q,i) => renderQuestCard(q, i, 'daily')).join('')}
      </div>
    </div>

    <!-- Weekly -->
    <div class="quest-section">
      <div class="quest-section-header">
        <div class="quest-section-title">🏆 Weekly Quests</div>
        <div class="quest-reset-timer">Resets in ${wd}d ${wh}h</div>
      </div>
      <div class="quest-list" id="weekly-quest-list">
        ${weeklyQ.map((q,i) => renderQuestCard(q, i, 'weekly')).join('')}
      </div>
    </div>`;
}

function renderQuestCard(q, idx, type) {
  const pct      = Math.min(100, Math.floor((q.current / q.target) * 100));
  const done     = q.current >= q.target;
  const claimed  = q.claimed;

  return `<div class="quest-card ${done && !claimed ? 'ready' : ''} ${claimed ? 'claimed' : ''}">
    <div class="quest-card-top">
      <div class="quest-info">
        <div class="quest-label">${q.label}</div>
        <div class="quest-progress-text">${q.current} / ${q.target}</div>
      </div>
      <div class="quest-reward">
        <div class="quest-reward-row">🪙 ${q.reward.coins}</div>
        <div class="quest-reward-row">⭐ ${q.reward.xp} XP</div>
      </div>
    </div>
    <div class="quest-progress-bar">
      <div class="quest-progress-fill ${done?'complete':''}" style="width:${pct}%"></div>
    </div>
    ${claimed
      ? `<div class="quest-claimed-badge">✅ Claimed</div>`
      : done
        ? `<button class="quest-claim-btn" onclick="claimQuest('${type}',${idx})">Claim Reward</button>`
        : `<div class="quest-progress-label">${pct}% complete</div>`
    }
  </div>`;
}

/* ── Claim quest reward ── */
window.claimQuest = async function(type, idx) {
  const p = window.PLAYER; if (!p) return;
  const questData = p.questData || {};
  const quests    = [...(questData[type] || [])];
  const q         = quests[idx];
  if (!q || q.claimed || q.current < q.target) return;

  quests[idx] = { ...q, claimed: true };

  await window.updatePlayerField({
    gold:     (p.gold||0)     + q.reward.coins,
    xp:       (p.xp||0)       + q.reward.xp,
    questData:{ ...questData, [type]: quests },
  });

  showToast(`✅ Claimed! 🪙 ${q.reward.coins} + ⭐ ${q.reward.xp} XP`);
  renderQuests();
};

/* ══════════════════════════════════════
   QUEST PROGRESS TRACKING
   Called from other systems to update progress
══════════════════════════════════════ */
export async function updateQuestProgress(type, amount=1) {
  const p = window.PLAYER; if (!p) return;
  const questData = p.questData || {};
  let changed     = false;

  ['daily','weekly'].forEach(period => {
    const quests = [...(questData[period] || [])];
    quests.forEach((q,i) => {
      if (q.type === type && !q.claimed && q.current < q.target) {
        quests[i] = { ...q, current: Math.min(q.current + amount, q.target) };
        changed   = true;
      }
    });
    questData[period] = quests;
  });

  if (changed) {
    await window.updatePlayerField({ questData });
    const pg = document.getElementById('page-quests');
    if (pg?.classList.contains('active')) renderQuests();
  }
}
window.updateQuestProgress = updateQuestProgress;

/* ── Event hooks ── */
document.addEventListener('page-change',   e => { if (e.detail.page === 'quests') renderQuests(); });
document.addEventListener('player-ready',  () => renderQuests());
