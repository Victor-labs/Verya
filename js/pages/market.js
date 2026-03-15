// js/pages/market.js
// Market page — buy and sell items
// Shows item icons from assets/, rarity badges, no evil/corrupted items
// Buy tab: MARKET_ITEMS catalogue
// Sell tab: player inventory — all items sellable

import { showToast, openModal } from '../core/modal.js';
import { MARKET_ITEMS, MARKET_CATS,
         getItemDef, getRarity,
         ALL_CONSUMABLES, MATERIALS } from '../data/items.js';

let activeMarketTab = 'buy';
let activeCat       = 'all';

/* ── Helpers ── */
const getInventory = () => window.PLAYER?.inventory || [];
const getGold      = () => window.PLAYER?.gold || 0;

/* ══════════════════════════════════════
   RENDER MARKET
══════════════════════════════════════ */
export function renderMarket() {
  /* Update gold display */
  const goldEl = document.getElementById('mkt-gold-val');
  if (goldEl) goldEl.textContent = (window.PLAYER?.gold || 0).toLocaleString();
  renderMarketTabs();
  if (activeMarketTab === 'buy') renderBuyGrid();
  else                           renderSellGrid();
}

/* ── Buy / Sell tab pills ── */
function renderMarketTabs() {
  document.querySelectorAll('.mkt-main-tab').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.tab === activeMarketTab));
}

window.switchMarketTab = function(tab) {
  activeMarketTab = tab;
  activeCat       = 'all';
  renderMarketTabs();
  renderCatPills();
  if (tab === 'buy') renderBuyGrid();
  else               renderSellGrid();
};

/* ══════════════════════════════════════
   CATEGORY PILLS
══════════════════════════════════════ */
function renderCatPills() {
  const el = document.getElementById('mkt-cats'); if (!el) return;
  const cats = activeMarketTab === 'buy'
    ? MARKET_CATS
    : [
        { id:'all',       label:'All'       },
        { id:'equipment', label:'Equipment' },
        { id:'food',      label:'Food'      },
        { id:'potions',   label:'Potions'   },
        { id:'materials', label:'Materials' },
      ];

  el.innerHTML = cats.map(c =>
    `<div class="mkt-cat-pill${activeCat === c.id ? ' active' : ''}"
      onclick="filterMarket('${c.id}')">${c.label}</div>`
  ).join('');
}

window.filterMarket = function(cat) {
  activeCat = cat;
  renderCatPills();
  if (activeMarketTab === 'buy') renderBuyGrid();
  else                           renderSellGrid();
};

/* ══════════════════════════════════════
   BUY GRID
══════════════════════════════════════ */
function renderBuyGrid() {
  const el = document.getElementById('mkt-grid'); if (!el) return;
  const playerGold = getGold();

  const list = activeCat === 'all'
    ? MARKET_ITEMS
    : MARKET_ITEMS.filter(i => i.cat === activeCat);

  if (!list.length) { el.innerHTML = '<div class="mkt-empty">Nothing here.</div>'; return; }

  el.innerHTML = list.map(item => {
    const rar        = getRarity(item.rarity || 'common');
    const canAfford  = playerGold >= item.price;
    const isGear     = item.cat === 'gear';

    return `
      <div class="mkt-item-card rarity-card ${item.rarity || 'common'}"
           onclick="openBuyModal('${item.id}')"
           style="position:relative;overflow:hidden">
        <div class="rarity-stripe ${item.rarity || 'common'}"></div>

        <!-- Icon — try asset image first, fall back to emoji -->
        <div class="mkt-icon-wrap">
          ${item.icon
            ? `<img class="mkt-item-icon rarity-icon ${item.rarity||'common'}"
                    src="${item.icon}"
                    onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
                    alt="${item.name}"/>
               <div class="mkt-item-emoji" style="display:none">${item.emoji||'📦'}</div>`
            : `<div class="mkt-item-emoji">${item.emoji||'📦'}</div>`
          }
        </div>

        <div class="mkt-item-info">
          <div class="mkt-item-name">${item.name}</div>
          <div class="rarity-badge ${item.rarity||'common'}" style="margin:3px 0;font-size:7px">
            ${rar.label}
          </div>
          <div class="mkt-item-effect">${item.effect}</div>
        </div>

        <div class="mkt-item-price ${canAfford ? '' : 'cant-afford'}">
          🪙 ${item.price.toLocaleString()}
          ${isGear ? '<div class="mkt-rare-tag">RARE</div>' : ''}
        </div>
      </div>`;
  }).join('');
}

/* ══════════════════════════════════════
   SELL GRID
══════════════════════════════════════ */
function renderSellGrid() {
  const el  = document.getElementById('mkt-grid'); if (!el) return;
  const inv = getInventory();

  const filtered = inv.filter(owned => {
    const def = getItemDef(owned.id);
    if (!def) return false;
    if (activeCat === 'all')       return true;
    if (activeCat === 'equipment') return !!def.slot;
    if (activeCat === 'food')      return def.cat === 'food';
    if (activeCat === 'potions')   return def.cat === 'potions';
    if (activeCat === 'materials') return def.cat === 'materials';
    return true;
  });

  if (!filtered.length) {
    el.innerHTML = '<div class="mkt-empty">Nothing to sell here.</div>'; return;
  }

  el.innerHTML = filtered.map(owned => {
    const def = getItemDef(owned.id);
    if (!def) return '';
    const rar      = getRarity(def.rarity || 'common');
    /* Sell price = sell price for materials, or half buy price for consumables */
    const sellPrice = def.sellPrice
      || (MARKET_ITEMS.find(i => i.id === def.id)?.price
          ? Math.floor(MARKET_ITEMS.find(i=>i.id===def.id).price / 2)
          : 10);

    return `
      <div class="mkt-item-card rarity-card ${def.rarity||'common'}"
           onclick="openSellModal('${def.id}')"
           style="position:relative;overflow:hidden">
        <div class="rarity-stripe ${def.rarity||'common'}"></div>

        <div class="mkt-icon-wrap">
          ${def.icon
            ? `<img class="mkt-item-icon rarity-icon ${def.rarity||'common'}"
                    src="${def.icon}" alt="${def.name}"
                    onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
               <div class="mkt-item-emoji" style="display:none">${def.slot ? '⚔️' : '🧪'}</div>`
            : `<div class="mkt-item-emoji">${def.slot ? '⚔️' : '🧪'}</div>`
          }
        </div>

        <div class="mkt-item-info">
          <div class="mkt-item-name">${def.name}</div>
          <div class="rarity-badge ${def.rarity||'common'}" style="margin:3px 0;font-size:7px">
            ${rar.label}
          </div>
          ${!def.slot ? `<div class="mkt-item-qty">x${owned.uses}</div>` : ''}
        </div>

        <div class="mkt-item-price sell">
          🪙 ${sellPrice.toLocaleString()}
        </div>
      </div>`;
  }).join('');
}

/* ══════════════════════════════════════
   BUY MODAL
══════════════════════════════════════ */
window.openBuyModal = function(itemId) {
  const item = MARKET_ITEMS.find(i => i.id === itemId); if (!item) return;
  const rar  = getRarity(item.rarity || 'common');
  const p    = window.PLAYER;

  openModal({
    emoji:        item.emoji || '📦',
    title:        item.name,
    desc:         `${item.effect}\n\n${rar.label} item`,
    cost:         `🪙 ${item.price.toLocaleString()} Gold`,
    confirmLabel: 'Buy',
    onConfirm: () => {
      if (getGold() < item.price) { showToast('🪙 Not enough gold!'); return; }

      const inv = getInventory().slice();
      const idx = inv.findIndex(i => i.id === itemId);
      if (idx >= 0) inv[idx] = { id: itemId, uses: item.maxUses };
      else          inv.push({ id: itemId, uses: item.maxUses });

      window.updatePlayerField({
        gold:      getGold() - item.price,
        inventory: inv,
        goldEarned: (p.goldEarned || 0), /* no change — buying not earning */
      });
      showToast(`✅ Bought ${item.name}!`);
      renderBuyGrid();
    },
  });
};

/* ══════════════════════════════════════
   SELL MODAL
══════════════════════════════════════ */
window.openSellModal = function(itemId) {
  const def = getItemDef(itemId); if (!def) return;
  const rar = getRarity(def.rarity || 'common');
  const sellPrice = def.sellPrice
    || (MARKET_ITEMS.find(i => i.id === itemId)?.price
        ? Math.floor(MARKET_ITEMS.find(i=>i.id===itemId).price / 2)
        : 10);

  openModal({
    emoji:        def.slot ? '⚔️' : '🧪',
    title:        def.name,
    desc:         `${def.effect || ''}\n${rar.label} · Sell for 🪙 ${sellPrice}`,
    cost:         null,
    confirmLabel: `Sell for 🪙 ${sellPrice}`,
    onConfirm: () => {
      const inv = getInventory().slice();
      const idx = inv.findIndex(i => i.id === itemId);
      if (idx < 0) return;

      /* Remove one use or whole stack */
      if (!def.slot && inv[idx].uses > 1)
        inv[idx] = { id: itemId, uses: inv[idx].uses - 1 };
      else
        inv.splice(idx, 1);

      window.updatePlayerField({
        gold:      getGold() + sellPrice,
        inventory: inv,
        goldEarned:(window.PLAYER?.goldEarned || 0) + sellPrice,
      });
      showToast(`🪙 Sold ${def.name} for ${sellPrice} gold!`);
      renderSellGrid();
    },
  });
};

/* ── Event hooks ── */
document.addEventListener('page-change', e => {
  if (e.detail.page === 'market') {
    activeMarketTab = 'buy';
    activeCat       = 'all';
    renderMarket();
    renderCatPills();
  }
});
document.addEventListener('player-ready', () => { renderCatPills(); renderMarket(); });
document.addEventListener('player-updated', () => {
  const pg = document.getElementById('page-market');
  if (pg?.classList.contains('active')) renderMarket();
});
