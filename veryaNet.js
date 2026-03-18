// js/pages/veryaNet.js
// Verya Net — 4 sections:
// 1. Verya Wiki — game info cards
// 2. Verya News — admin posts (Firestore)
// 3. Stock Market — buy diamonds/vouchers/gems, trade coins
// 4. Real Estate — rent apartments (redirects to apartments page)

import { db }                     from '../../firebase-config.js';
import { collection, query, orderBy,
         limit, onSnapshot, addDoc,
         serverTimestamp, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { showToast, openModal }    from '../core/modal.js';

let activeSection = null;

/* ══════════════════════════════════════
   VERYA NET HUB
══════════════════════════════════════ */
export function renderVeryaNet() {
  const el = document.getElementById('vnet-hub'); if (!el) return;
  const sections = [
    { id:'wiki',    name:'Verya Wiki',    img:'assets/veryanet/verya-wiki.jpg',    desc:'Everything you need to know about Verya.' },
    { id:'news',    name:'Verya News',    img:'assets/veryanet/verya-news.jpg',    desc:'Official announcements and updates.' },
    { id:'stock',   name:'VeryaForex',    img:'assets/veryanet/stock-market.jpg',  desc:'Trade coins, buy diamonds and rare vouchers.' },
    { id:'realestate', name:'Real Estate',img:'assets/veryanet/real-estate.jpg',   desc:'Browse and rent apartments across Verya.' },
  ];

  el.innerHTML = sections.map(s =>
    `<div class="vnet-card" onclick="openVnetSection('${s.id}')">
      <div class="vnet-card-img-wrap">
        <img class="vnet-card-img" src="${s.img}" alt="${s.name}"
             onerror="this.style.opacity='0.15'"/>
        <div class="vnet-card-overlay"></div>
      </div>
      <div class="vnet-card-info">
        <div class="vnet-card-name">${s.name}</div>
        <div class="vnet-card-desc">${s.desc}</div>
      </div>
    </div>`
  ).join('');
}

window.openVnetSection = function(sectionId) {
  activeSection = sectionId;
  const overlay  = document.getElementById('vnet-overlay'); if (!overlay) return;
  const content  = document.getElementById('vnet-overlay-content');
  const title    = document.getElementById('vnet-overlay-title');

  switch(sectionId) {
    case 'wiki':       title.textContent='Verya Wiki';    renderWiki(content);        break;
    case 'news':       title.textContent='Verya News';    renderNews(content);        break;
    case 'stock':      title.textContent='VeryaForex';    renderStockMarket(content); break;
    case 'realestate': title.textContent='Real Estate';
      overlay.classList.remove('open');
      /* Redirect to apartment page */
      import('./apartments.js').then(m => { m.renderApartments(); });
      document.dispatchEvent(new CustomEvent('page-change',{detail:{page:'apartment'}}));
      return;
  }
  overlay.classList.add('open');
};

document.getElementById('vnet-overlay-back')?.addEventListener('click', () =>
  document.getElementById('vnet-overlay')?.classList.remove('open'));

/* ══════════════════════════════════════
   WIKI
══════════════════════════════════════ */
const WIKI_SECTIONS = [
  { id:'combat',    title:'⚔️ Combat',          content:'Combat uses a timing bar. Tap when the pin is in the green zone for full damage. Yellow zone = half damage and the enemy retaliates. Red zone = fumble. Skills bypass the timing bar and deal powerful effects.' },
  { id:'zones',     title:'🗺️ Zones & Map',     content:'There are 24 zones plus Oblivion Citadel. Zones unlock by reaching the required level. Travel to any unlocked zone from the map. Each zone has unique enemies, bosses, and loot drops.' },
  { id:'crafting',  title:'⚒️ Crafting',        content:'Use the Forge to combine materials into gear. Place 2-4 materials in the craft slots. A preview shows what you can make. Each recipe requires specific materials in specific quantities.' },
  { id:'characters',title:'👤 Characters',      content:'Buy characters with diamonds. Each character has unique stats and an ability. Equip a character to use them as your profile picture. You can equip 2 abilities from characters you own.' },
  { id:'veryanet',  title:'🌐 Verya Net',       content:'Verya Net is your gateway to apartments, the stock market, game news, and the wiki. Real Estate lets you rent apartments. VeryaForex lets you trade coins for currency items.' },
  { id:'chirp',     title:'💬 Chirp',           content:'Chirp is Verya\'s social platform. Read AI-generated posts about the world and like them. The Global Chat lets you talk to all players in real time.' },
  { id:'guilds',    title:'🏛️ Guilds',          content:'Join a guild or create your own for 2900 coins. Guild members pay a monthly boost fee. The guild leader manages recruitment, invites, and kicks. Guild chat is separate from global.' },
  { id:'criminal',  title:'🔴 Criminal System', content:'Choose Criminal or Vigilante on first login. Attacking players earns criminal stars. At 6 stars you are jailed. Pay gold bail or wait 2 hours. Vigilantes can report criminals.' },
];

function renderWiki(el) {
  if (!el) return;
  el.innerHTML = `<div class="wiki-grid">
    ${WIKI_SECTIONS.map(s =>
      `<div class="wiki-card" onclick="openWikiSection('${s.id}')">
        <div class="wiki-card-title">${s.title}</div>
        <div class="wiki-card-arrow">›</div>
      </div>`
    ).join('')}
  </div>
  <div id="wiki-detail" style="display:none">
    <button class="wiki-back-btn" onclick="closeWikiDetail()">‹ Back</button>
    <div id="wiki-detail-title" class="wiki-detail-title"></div>
    <div id="wiki-detail-content" class="wiki-detail-content"></div>
  </div>`;
}

window.openWikiSection = function(id) {
  const s = WIKI_SECTIONS.find(w => w.id === id); if (!s) return;
  document.querySelector('.wiki-grid').style.display = 'none';
  const detail = document.getElementById('wiki-detail');
  detail.style.display = '';
  document.getElementById('wiki-detail-title').textContent   = s.title;
  document.getElementById('wiki-detail-content').textContent = s.content;
};
window.closeWikiDetail = function() {
  document.querySelector('.wiki-grid').style.display = '';
  document.getElementById('wiki-detail').style.display = 'none';
};

/* ══════════════════════════════════════
   NEWS
══════════════════════════════════════ */
function renderNews(el) {
  if (!el) return;
  el.innerHTML = '<div class="vnet-loading">Loading news...</div>';
  const q = query(collection(db,'veryaNews'), orderBy('createdAt','desc'), limit(20));
  onSnapshot(q, snap => {
    if (snap.empty) { el.innerHTML = '<div class="vnet-empty">No news yet.</div>'; return; }
    el.innerHTML = snap.docs.map(d => {
      const n = d.data();
      return `<div class="news-card">
        <div class="news-header">
          <div class="news-badge">📰 VERYA NEWS</div>
          <div class="news-date">${n.createdAt?.toDate?.().toLocaleDateString()||''}</div>
        </div>
        <div class="news-title">${n.title||''}</div>
        <div class="news-body">${n.body||''}</div>
      </div>`;
    }).join('');
  });
}

/* ══════════════════════════════════════
   STOCK MARKET (VeryaForex)
══════════════════════════════════════ */
const STOCK_ITEMS = [
  { id:'buy-diamonds-5',   name:'5 Diamonds',         emoji:'💎', price:500,  type:'diamonds', amount:5    },
  { id:'buy-diamonds-15',  name:'15 Diamonds',        emoji:'💎', price:1400, type:'diamonds', amount:15   },
  { id:'buy-voucher-2',    name:'2 Gold Vouchers',    emoji:'🏅', price:500,  type:'gold_voucher', amount:2 },
  { id:'buy-pachinko-1',   name:'1 Pachinko Token',   emoji:'🎰', price:900,  type:'pachinko_token', amount:1 },
  { id:'buy-studio-1',     name:'1 Studio Token',     emoji:'🎵', price:600,  type:'studio_token', amount:1 },
  { id:'buy-gem-rare',     name:'Blood Gem',          emoji:'🩸', price:2000, type:'item', itemId:'gem-red' },
  { id:'buy-gem-void',     name:'Voidstone Shard',    emoji:'⬛', price:2500, type:'item', itemId:'shard-black' },
];

function renderStockMarket(el) {
  if (!el) return;
  const p = window.PLAYER;

  el.innerHTML = `
    <div class="stock-header">
      <div class="stock-balance">🪙 ${(p?.gold||0).toLocaleString()} Coins available</div>
    </div>

    <!-- Trade coins section -->
    <div class="stock-section-title">💰 Trade Coins</div>
    <div class="stock-trade-card">
      <div class="stock-trade-desc">Stake minimum 1000 coins for a chance at higher returns. High risk, hard to win big.</div>
      <div class="stock-trade-row">
        <input class="stock-trade-input" type="number" id="stock-stake-input"
               placeholder="Min 1000 coins" min="1000"/>
        <button class="stock-trade-btn" onclick="tradeCoins()">Trade</button>
      </div>
      <div id="stock-trade-result" class="stock-trade-result"></div>
    </div>

    <!-- Buy items -->
    <div class="stock-section-title" style="margin-top:20px">🛒 Buy Currency & Items</div>
    <div class="stock-items-list">
      ${STOCK_ITEMS.map(item =>
        `<div class="stock-item-row">
          <div class="stock-item-emoji">${item.emoji}</div>
          <div class="stock-item-info">
            <div class="stock-item-name">${item.name}</div>
            <div class="stock-item-price">🪙 ${item.price.toLocaleString()}</div>
          </div>
          <button class="stock-buy-btn" onclick="buyStockItem('${item.id}')">Buy</button>
        </div>`
      ).join('')}
    </div>`;
}

window.buyStockItem = async function(itemId) {
  const p    = window.PLAYER; if (!p) return;
  const item = STOCK_ITEMS.find(i => i.id === itemId); if (!item) return;
  if ((p.gold||0) < item.price) { showToast('🪙 Not enough coins!'); return; }

  const updates = { gold: (p.gold||0) - item.price };
  if (item.type === 'diamonds')      updates.diamonds      = (p.diamonds||0)      + item.amount;
  if (item.type === 'gold_voucher')  updates.goldVouchers  = (p.goldVouchers||0)  + item.amount;
  if (item.type === 'pachinko_token')updates.pachinkoTokens= (p.pachinkoTokens||0)+ item.amount;
  if (item.type === 'studio_token')  updates.studioTokens  = (p.studioTokens||0)  + item.amount;
  if (item.type === 'item') {
    const inv = [...(p.inventory||[])];
    inv.push({ id: item.itemId, uses:1 });
    updates.inventory = inv;
  }

  await window.updatePlayerField(updates);
  showToast(`✅ Purchased ${item.name}!`);

  /* Track for skill tree */
  await window.updatePlayerField({ totalTrades: (p.totalTrades||0)+1 });
};

window.tradeCoins = async function() {
  const p     = window.PLAYER; if (!p) return;
  const input = document.getElementById('stock-stake-input');
  const stake = parseInt(input?.value||'0');
  if (stake < 1000) { showToast('⚠️ Minimum stake is 1000 coins!'); return; }
  if ((p.gold||0) < stake) { showToast('🪙 Not enough coins!'); return; }

  /* Trade logic — hard to win big */
  const rand = Math.random();
  let multiplier, label;
  if (rand < 0.02)      { multiplier = 3.0;  label = '🎉 3x Return!'; }
  else if (rand < 0.08) { multiplier = 2.0;  label = '✨ 2x Return!'; }
  else if (rand < 0.25) { multiplier = 1.5;  label = '📈 1.5x Return'; }
  else if (rand < 0.50) { multiplier = 1.0;  label = '↔️ Break even'; }
  else if (rand < 0.75) { multiplier = 0.5;  label = '📉 Lost half'; }
  else                  { multiplier = 0;    label = '💸 Total loss'; }

  const returns = Math.floor(stake * multiplier);
  const newGold = (p.gold||0) - stake + returns;

  await window.updatePlayerField({
    gold: Math.max(0, newGold),
    totalTrades: (p.totalTrades||0)+1,
  });

  const resultEl = document.getElementById('stock-trade-result');
  if (resultEl) {
    resultEl.textContent = `${label} — ${returns > 0 ? '+'+returns : returns} coins`;
    resultEl.style.color = returns >= stake ? '#2ecc71' : '#ef4444';
  }
  if (input) input.value = '';
};

/* ── Event hooks ── */
document.addEventListener('page-change', e => { if (e.detail.page === 'verya-net') renderVeryaNet(); });
document.addEventListener('player-ready',() => renderVeryaNet());
