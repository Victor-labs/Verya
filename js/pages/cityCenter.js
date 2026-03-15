// js/pages/cityCenter.js
// City Center hub — 6 shops, NPC cards, dialogue trees
// Archlight-style shop cards with image, name, desc, service tags

import { showToast }              from '../core/modal.js';
import { CITY_SHOPS }             from '../data/cityCenter.js';
import { NPCS }                   from '../data/npcs.js';

let activeShop    = null;
let activeNPC     = null;
let npcDialogStep = null;

/* ══════════════════════════════════════
   RENDER CITY CENTER HUB
══════════════════════════════════════ */
export function renderCityCenter() {
  const el = document.getElementById('city-center-list'); if (!el) return;
  const p  = window.PLAYER;
  const lvl = p?.level || 1;

  el.innerHTML = CITY_SHOPS.map(shop => {
    const locked = shop.levelReq > lvl;
    return `<div class="city-shop-card ${locked?'locked':''}"
              onclick="${locked ? `showToast('${shop.lockedMsg||'Level up to access this shop.'}')` : `openShop('${shop.id}')`}">
      <div class="city-shop-img-wrap">
        <img class="city-shop-img" src="${shop.img}" alt="${shop.name}"
             onerror="this.style.opacity='0.15'"/>
        <div class="city-shop-overlay"></div>
        ${locked ? `<div class="city-shop-lock">🔒 Lv.${shop.levelReq}</div>` : ''}
      </div>
      <div class="city-shop-info">
        <div class="city-shop-name">${shop.name}</div>
        <div class="city-shop-desc">${shop.desc}</div>
        <div class="city-shop-tags">
          ${shop.tags.map(t=>`<span class="city-shop-tag">${t}</span>`).join('')}
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ══════════════════════════════════════
   OPEN SHOP
══════════════════════════════════════ */
window.openShop = function(shopId) {
  activeShop = shopId;
  const overlay = document.getElementById('shop-overlay');
  const title   = document.getElementById('shop-overlay-title');
  const content = document.getElementById('shop-overlay-content');
  if (!overlay) return;

  switch(shopId) {
    case 'victor-market': renderVictorMarket(content); break;
    case 'downtown-cafe': renderCafe(content);         break;
    case 'medic-center':  renderMedic(content);        break;
    case 'daemon-store':  renderDaemon(content);       break;
    case 'vix-weapons':   renderVix(content);          break;
    case 'victor-bar':    renderVictorBar(content);    break;
  }
  const shop = CITY_SHOPS.find(s => s.id === shopId);
  if (title) title.textContent = shop?.name || '';
  overlay.classList.add('open');
};

document.getElementById('shop-overlay-back')?.addEventListener('click', () => {
  document.getElementById('shop-overlay').classList.remove('open');
  document.getElementById('npc-dialogue-overlay').classList.remove('open');
});

/* ── Victor Market ── */
function renderVictorMarket(el) {
  const { MARKET_ITEMS, getRarity } = window._itemsModule || {};
  if (!el) return;
  el.innerHTML = `<div class="shop-npc-trigger" onclick="openNPCDialogue('victor')">
    <img class="shop-npc-thumb" src="${NPCS.victor.img}" onerror="this.style.opacity='0.3'"/>
    <div class="shop-npc-name">Victor</div>
  </div>
  <div id="victor-market-items"></div>`;
  /* Items rendered by market.js renderBuyGrid equivalent */
  showToast('Welcome to Victor Market!');
}

/* ── Downtown Café ── */
function renderCafe(el) {
  if (!el) return;
  el.innerHTML = `<div class="shop-npc-trigger" onclick="openNPCDialogue('cafe_npc')">
    <div class="shop-npc-thumb" style="font-size:48px;display:flex;align-items:center;justify-content:center">☕</div>
    <div class="shop-npc-name">Café Staff</div>
  </div>
  <div class="shop-section-title">Food Menu</div>
  <div id="cafe-items"></div>`;
}

/* ── Medic Center ── */
function renderMedic(el) {
  if (!el) return;
  const p       = window.PLAYER;
  const revCost = Math.max(100, (p?.level||1) * 80);
  const isDead  = (p?.hp||1) <= 0;

  el.innerHTML = `<div class="medic-revival-card">
    <div class="medic-emoji">🏥</div>
    <div class="medic-title">Revive your hero</div>
    <div class="medic-desc">Restore full HP and return to battle.</div>
    <div class="medic-cost">🪙 ${revCost} Gold</div>
    <button class="medic-revive-btn ${isDead?'':'disabled'}"
      ${isDead?`onclick="reviveHero(${revCost})"`:''}>
      ${isDead ? '💊 Revive Now' : '✅ You are alive'}
    </button>
  </div>
  <div class="shop-section-title" style="margin-top:20px">Potions</div>
  <div id="medic-potions"></div>`;
}

window.reviveHero = async function(cost) {
  const p = window.PLAYER; if (!p) return;
  if ((p.gold||0) < cost) { showToast('🪙 Not enough gold!'); return; }
  await window.updatePlayerField({
    hp:   p.maxHp || 100,
    mp:   p.maxMp || 50,
    gold: (p.gold||0) - cost,
  });
  showToast('💊 Revived! Full HP restored.');
  document.getElementById('shop-overlay').classList.remove('open');
};

/* ── Daemon Store ── */
function renderDaemon(el) {
  if (!el) return;
  el.innerHTML = `<div class="shop-npc-trigger" onclick="openNPCDialogue('daemon_npc')">
    <img class="shop-npc-thumb" src="${NPCS.daemon_npc.img}" onerror="this.style.opacity='0.3'"/>
    <div class="shop-npc-name">Daemon</div>
  </div>
  <div class="shop-section-title">Evil Fragments &amp; Ore</div>
  <div id="daemon-items"></div>`;
}

/* ── Vix Miner & Weapons ── */
function renderVix(el) {
  if (!el) return;
  el.innerHTML = `<div class="shop-section-title">Bars &amp; Basic Weapons</div>
  <div id="vix-items"></div>`;
}

/* ── Victor Bar ── */
function renderVictorBar(el) {
  if (!el) return;
  el.innerHTML = `<div class="shop-npc-trigger" onclick="openNPCDialogue('victor')">
    <img class="shop-npc-thumb" src="${NPCS.victor.img}" onerror="this.style.opacity='0.3'"/>
    <div class="shop-npc-name">Victor</div>
  </div>
  <div class="shop-npc-trigger" style="margin-top:12px" onclick="openNPCDialogue('gabon')">
    <img class="shop-npc-thumb" src="${NPCS.gabon.img}" onerror="this.style.opacity='0.3'"/>
    <div class="shop-npc-name">Gabon</div>
  </div>`;
}

/* ══════════════════════════════════════
   NPC DIALOGUE
══════════════════════════════════════ */
window.openNPCDialogue = function(npcId) {
  const npc     = NPCS[npcId]; if (!npc) return;
  activeNPC     = npcId;
  const overlay = document.getElementById('npc-dialogue-overlay'); if (!overlay) return;

  document.getElementById('npc-d-img').src         = npc.img;
  document.getElementById('npc-d-name').textContent = npc.name;
  document.getElementById('npc-d-text').textContent = npc.greeting;

  const optEl = document.getElementById('npc-d-options');
  optEl.innerHTML = (npc.options||[]).map(opt => {
    const p = window.PLAYER;
    const locked = opt.levelReq && (p?.level||1) < opt.levelReq;
    return `<button class="npc-opt-btn ${locked?'locked':''}"
      onclick="${locked ? `showToast('Reach Level ${opt.levelReq} to access this.')` : `handleNPCOption('${npcId}','${opt.id}')`}">
      ${locked ? `🔒 ` : ''}${opt.label}${locked ? ` (Lv.${opt.levelReq})` : ''}
    </button>`;
  }).join('');

  overlay.classList.add('open');
};

window.handleNPCOption = function(npcId, optId) {
  const npc = NPCS[npcId]; if (!npc) return;
  const opt = npc.options?.find(o => o.id === optId); if (!opt) return;

  if (opt.action === 'close') {
    document.getElementById('npc-dialogue-overlay').classList.remove('open'); return;
  }
  if (opt.action === 'reply') {
    document.getElementById('npc-d-text').textContent = opt.reply; return;
  }
  if (opt.action === 'quest') {
    document.getElementById('npc-dialogue-overlay').classList.remove('open');
    openSpecialMission(npcId); return;
  }
  if (opt.action === 'pachinko') {
    document.getElementById('npc-dialogue-overlay').classList.remove('open');
    openPachinko(); return;
  }
  if (opt.action === 'quest_intro') {
    document.getElementById('npc-d-text').textContent = opt.reply;
    setTimeout(() => openSpecialMission(npcId), 1500); return;
  }
};

document.getElementById('npc-d-back')?.addEventListener('click', () => {
  document.getElementById('npc-dialogue-overlay').classList.remove('open');
});

/* ══════════════════════════════════════
   PACHINKO
══════════════════════════════════════ */
window.openPachinko = function() {
  const p = window.PLAYER; if (!p) return;
  const hasFree = !p.pachinkoFreeUsed;
  const tokens  = p.pachinkoTokens || 0;

  if (!hasFree && tokens < 1) {
    showToast('🎰 You need a Pachinko Token! Buy one from the Stock Market.'); return;
  }

  const overlay = document.getElementById('pachinko-overlay');
  if (overlay) overlay.classList.add('open');
};

window.spinPachinko = async function() {
  const p = window.PLAYER; if (!p) return;
  const hasFree = !p.pachinkoFreeUsed;

  if (!hasFree && (p.pachinkoTokens||0) < 1) {
    showToast('No tokens!'); return;
  }

  /* Deduct token or mark free used */
  const updates = hasFree
    ? { pachinkoFreeUsed: true }
    : { pachinkoTokens: (p.pachinkoTokens||0) - 1 };

  /* Spin animation */
  const spinEl = document.getElementById('pachinko-spinner');
  if (spinEl) spinEl.classList.add('spinning');

  setTimeout(async () => {
    if (spinEl) spinEl.classList.remove('spinning');
    const reward = rollPachinko();
    /* Apply reward */
    if (reward.type === 'coins')    updates.gold     = (p.gold||0)     + reward.amount;
    if (reward.type === 'diamonds') updates.diamonds = (p.diamonds||0) + reward.amount;
    if (reward.type === 'gem') {
      const inv = [...(p.inventory||[])];
      inv.push({ id: reward.id, uses:1 });
      updates.inventory = inv;
    }
    await window.updatePlayerField(updates);
    document.getElementById('pachinko-result').textContent =
      `🎰 You got: ${reward.emoji} ${reward.label}!`;
    showToast(`🎰 ${reward.label}!`);
  }, 2000);
};

function rollPachinko() {
  const rand = Math.random();
  if (rand < 0.005) return { type:'diamonds', amount: Math.floor(Math.random()*78)+2, emoji:'💎', label:`${Math.floor(Math.random()*78)+2} Diamonds` };
  if (rand < 0.010) return { type:'gem', id:'gem-red', emoji:'💎', label:'Blood Gem' };
  if (rand < 0.3)   return { type:'coins', amount: Math.floor(Math.random()*79)+2,   emoji:'🪙', label:`${Math.floor(Math.random()*79)+2} Coins` };
  return { type:'coins', amount: Math.floor(Math.random()*20)+2, emoji:'🪙', label:`${Math.floor(Math.random()*20)+2} Coins` };
}

document.getElementById('pachinko-close')?.addEventListener('click', () => {
  document.getElementById('pachinko-overlay')?.classList.remove('open');
});

/* ── Event hooks ── */
document.addEventListener('page-change',   e => { if (e.detail.page === 'city-center') renderCityCenter(); });
document.addEventListener('player-ready',  () => renderCityCenter());
document.addEventListener('player-updated',() => {
  const pg = document.getElementById('page-city-center');
  if (pg?.classList.contains('active')) renderCityCenter();
});
