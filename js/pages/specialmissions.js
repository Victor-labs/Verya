// js/pages/specialmissions.js
// 7 NPCs, one-time quests, sequential for David
// Level requirement gating, back button always visible

import { showToast }  from '../core/modal.js';
import { NPCS }       from '../data/npcs.js';

const NPC_ORDER = ['seraphina','presido','daemon_npc','gabon_npc','david','alya'];

export function renderSpecialMissions() {
  const el = document.getElementById('sm-npc-list'); if (!el) return;
  const p  = window.PLAYER;
  const lvl = p?.level || 1;
  const completedQuests = p?.completedQuests || [];

  el.innerHTML = NPC_ORDER.map(npcId => {
    const npc    = NPCS[npcId]; if (!npc) return '';
    const locked = npc.levelReq > lvl;
    const done   = npcId === 'david'
      ? false /* David has multiple quests, handled separately */
      : completedQuests.includes(npc.quest?.id || '');

    return `<div class="sm-npc-card ${locked?'locked':''} ${done?'done':''}"
              onclick="${locked
                ? `showToast('Reach Level ${npc.levelReq} to unlock ${npc.name}\\'s mission.')`
                : `openNPCMission('${npcId}')`}">
      <div class="sm-npc-img-wrap">
        <img class="sm-npc-img" src="${npc.img}" alt="${npc.name}"
             onerror="this.style.opacity='0.2'"/>
        ${locked ? `<div class="sm-npc-lock">🔒 Lv.${npc.levelReq}</div>` : ''}
        ${done   ? '<div class="sm-npc-done">✅</div>'                     : ''}
      </div>
      <div class="sm-npc-info">
        <div class="sm-npc-name">${npc.name}</div>
        <div class="sm-npc-status">
          ${locked ? `Locked until Lv.${npc.levelReq}`
          : done   ? 'Quest completed'
          :          'See missions →'}
        </div>
      </div>
    </div>`;
  }).join('');
}

window.openSpecialMission = window.openNPCMission = function(npcId) {
  const npc = NPCS[npcId]; if (!npc) return;
  const p   = window.PLAYER;
  const lvl = p?.level || 1;

  if (npc.levelReq > lvl) {
    showToast(`🔒 Reach Level ${npc.levelReq} first.`); return;
  }

  const overlay = document.getElementById('sm-mission-overlay'); if (!overlay) return;
  document.getElementById('sm-m-npc-img').src          = npc.img;
  document.getElementById('sm-m-npc-name').textContent  = npc.name;
  document.getElementById('sm-m-npc-dial').textContent  = npc.greeting;

  const completedQuests = p?.completedQuests || [];
  const questEl = document.getElementById('sm-m-quest-list');
  questEl.innerHTML = '';

  if (npcId === 'david') {
    /* David — sequential quests */
    renderDavidQuests(questEl, p, completedQuests);
  } else if (npc.quest) {
    const isDone = completedQuests.includes(npc.quest.id);
    questEl.innerHTML = renderSingleQuest(npc.quest, isDone, npcId);
  }

  overlay.classList.add('open');
};

function renderDavidQuests(el, p, completedQuests) {
  const quests = NPCS.david.quests;
  el.innerHTML = quests.map((q,i) => {
    const done     = completedQuests.includes(q.id);
    const prevDone = i === 0 || completedQuests.includes(quests[i-1].id);
    const locked   = !prevDone && !done;

    if (locked) {
      return `<div class="sm-quest-row locked">
        <div class="sm-quest-name">🔒 ${q.name}</div>
        <div class="sm-quest-sub">Complete previous quest first</div>
      </div>`;
    }
    return renderSingleQuest(q, done, 'david');
  }).join('');
}

function renderSingleQuest(quest, isDone, npcId) {
  const p = window.PLAYER;
  const playerQ = (p?.specialQuests || {})[quest.id] || quest;

  const objHtml = quest.objectives.map(obj => {
    const current = playerQ?.objectives?.find(o => o.type === obj.type)?.current || 0;
    const done    = current >= obj.count;
    return `<div class="sm-obj-row ${done?'done':''}">
      ${done?'✅':'⬜'} ${formatObjective(obj)} (${Math.min(current,obj.count)}/${obj.count})
    </div>`;
  }).join('');

  const rewardHtml = quest.rewards.map(r =>
    `<div class="sm-reward-row">${formatReward(r)}</div>`
  ).join('');

  /* Alya special sell button */
  const alyaSell = npcId === 'alya' && quest.objectives.find(o => o.type === 'sell_to_alya')
    ? `<button class="sm-sell-btn ${canAlySell(p)?'':'disabled'}"
        ${canAlySell(p)?'onclick="alyaSell()"':''}>
        ${canAlySell(p)?'⚔️ Sell Sword to Alya':'🔒 Complete other objectives first'}
      </button>` : '';

  return `<div class="sm-quest-card ${isDone?'done':''}">
    <div class="sm-quest-name">${quest.name}</div>
    <div class="sm-quest-objectives">${objHtml}</div>
    <div class="sm-quest-rewards-title">Rewards</div>
    <div class="sm-quest-rewards">${rewardHtml}</div>
    ${alyaSell}
    ${!isDone ? `<button class="sm-accept-btn" onclick="acceptQuest('${quest.id}','${npcId}')">
      Accept Quest
    </button>` : '<div class="sm-done-badge">✅ Completed</div>'}
  </div>`;
}

function canAlySell(p) {
  const q = (p?.specialQuests||{})['q_alya'];
  if (!q) return false;
  return q.objectives?.find(o=>o.type==='buy_evil_item')?.current >= 1 &&
         q.objectives?.find(o=>o.type==='forge_evil_sword')?.current >= 1;
}

window.alyaSell = async function() {
  const p   = window.PLAYER;
  const inv = [...(p?.inventory||[])];
  const idx = inv.findIndex(i => i.id === 'sword-redflame');
  if (idx < 0) { showToast('You need to forge an Evil Sword first!'); return; }
  inv.splice(idx,1);
  const rewInv = [...inv, { id:'sword-red', uses:1 }];
  await window.updatePlayerField({
    inventory:       rewInv,
    diamonds:        (p.diamonds||0)  + 50,
    gold:            (p.gold||0)      + 2000,
    completedQuests: [...(p.completedQuests||[]),'q_alya'],
  });
  showToast('✅ Quest complete! Sold to Alya.');
  document.getElementById('sm-mission-overlay')?.classList.remove('open');
};

window.acceptQuest = async function(questId, npcId) {
  const p = window.PLAYER; if (!p) return;
  const npc = NPCS[npcId]; if (!npc) return;
  const quest = npcId === 'david'
    ? npc.quests?.find(q=>q.id===questId)
    : npc.quest;
  if (!quest) return;

  const specialQuests = { ...(p.specialQuests||{}) };
  specialQuests[questId] = { ...quest, objectives: quest.objectives.map(o=>({...o,current:0})) };
  await window.updatePlayerField({ specialQuests });
  showToast(`📜 Quest accepted: ${quest.name}`);
};

function formatObjective(obj) {
  const map = {
    kill_mob:          `Kill ${obj.count} ${obj.target||'enemies'}`,
    find_item:         `Find ${obj.target}`,
    craft_item:        `Craft ${obj.target||'an item'}`,
    attack_player:     `Attack ${obj.count} players`,
    attack_vigilante:  `Attack ${obj.count} vigilantes`,
    unlock_zone:       `Unlock zone`,
    own_rare_item:     `Own a rare item`,
    buy_character:     `Buy a character`,
    buy_evil_item:     `Buy an evil item from Daemon Store`,
    forge_evil_sword:  `Forge an evil sword`,
    sell_to_alya:      `Sell the sword to Alya`,
    reach_level:       `Reach Level ${obj.target}`,
    kill_enemy:        `Kill ${obj.count} enemies`,
    unlock_zones:      `Unlock ${obj.count} zones`,
    beat_boss:         `Beat a boss`,
    have_friends:      `Have ${obj.count} friends`,
    send_message:      `Send a message`,
    react_chirp:       `React to ${obj.count} chirps`,
    buy_apartment:     `Buy an apartment`,
    upgrade_apartment: `Upgrade apartment`,
    get_arrested:      `Get arrested ${obj.count} times`,
    get_bailed:        `Get bailed ${obj.count} times`,
  };
  return map[obj.type] || obj.type;
}

function formatReward(r) {
  if (r.type === 'coins')         return `🪙 ${r.amount} Coins`;
  if (r.type === 'diamonds')      return `💎 ${r.amount} Diamonds`;
  if (r.type === 'gold_voucher')  return `🏅 ${r.amount} Gold Voucher`;
  if (r.type === 'pachinko_token')return `🎰 ${r.amount} Pachinko Token`;
  if (r.type === 'studio_token')  return `🎵 ${r.amount} Studio Token`;
  if (r.type === 'item')          return `📦 ${r.id}`;
  if (r.type === 'rare_loot')     return `💎 ${r.amount} Rare Loot`;
  return r.type;
}

/* ── Event hooks ── */
document.addEventListener('page-change',  e => { if (e.detail.page === 'special-missions') renderSpecialMissions(); });
document.addEventListener('player-ready', () => renderSpecialMissions());


/* ── Attach DOM listeners after page load ── */
window.addEventListener('load', () => {
  document.getElementById('sm-mission-back')?.addEventListener('click', () => {
    document.getElementById('sm-mission-overlay')?.classList.remove('open');
  });


});