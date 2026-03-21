// js/pages/crafting.js
// FIXED: Removed broken RARITY_COLORS import from recipes.js
// FIXED: page-crafting → page-craft

import { showToast }              from '../core/modal.js';
import { RECIPES, RECIPE_CATS }   from '../data/recipes.js';
import { getItemDef }             from '../data/items.js';

/* Rarity colors defined locally — not imported */
const RARITY_COLORS = {
  common:    { color:'#9ca3af', glow:'rgba(156,163,175,0.2)' },
  uncommon:  { color:'#4ade80', glow:'rgba(74,222,128,0.2)'  },
  rare:      { color:'#60a5fa', glow:'rgba(96,165,250,0.2)'  },
  legendary: { color:'#f5c842', glow:'rgba(245,200,66,0.25)' },
  evil:      { color:'#ef4444', glow:'rgba(239,68,68,0.2)'   },
  corrupted: { color:'#7c3aed', glow:'rgba(124,58,237,0.2)'  },
};

let activeCraftCat = 'all';

const getInventory = () => window.PLAYER?.inventory || [];

function owned(matId) {
  const item = getInventory().find(i => i.id === matId);
  return item ? item.uses : 0;
}

function canCraft(recipe) {
  return recipe.materials.every(m => owned(m.id) >= m.qty);
}

export function renderCrafting() {
  renderCraftCatPills();
  renderRecipeList();
}

function renderCraftCatPills() {
  const el = document.getElementById('craft-cats'); if (!el) return;
  el.innerHTML = RECIPE_CATS.map(c =>
    `<div class="craft-cat-pill${activeCraftCat === c.id ? ' active' : ''}"
      onclick="filterCraft('${c.id}')">${c.label}</div>`
  ).join('');
}

function renderRecipeList() {
  const el = document.getElementById('craft-list'); if (!el) return;
  const list = activeCraftCat === 'all'
    ? RECIPES
    : RECIPES.filter(r => r.category === activeCraftCat);

  el.innerHTML = list.map(recipe => {
    const craftable = canCraft(recipe);
    const rarity    = RARITY_COLORS[recipe.rarity] || RARITY_COLORS.common;
    const resultDef = getItemDef(recipe.result);

    const matsHtml = recipe.materials.map(m => {
      const def    = getItemDef(m.id);
      const have   = owned(m.id);
      const enough = have >= m.qty;
      return `<div class="craft-mat-row">
        <span class="craft-mat-emoji">${def ? def.emoji : '📦'}</span>
        <span class="craft-mat-name">${def ? def.name : m.id}</span>
        <span class="craft-mat-qty ${enough ? 'enough' : 'missing'}">${have}/${m.qty}</span>
      </div>`;
    }).join('');

    return `<div class="craft-card ${craftable ? 'craftable' : ''}"
      style="--rarity-color:${rarity.color};--rarity-glow:${rarity.glow}">
      <div class="craft-card-stripe"></div>
      <div class="craft-card-top">
        <div class="craft-result-emoji">${recipe.emoji || '⚒️'}</div>
        <div class="craft-card-info">
          <div class="craft-card-name">${recipe.name}</div>
          <div class="craft-card-rarity">${recipe.rarity.toUpperCase()}</div>
          ${resultDef ? `<div class="craft-card-effect">${resultDef.effect||''}</div>` : ''}
        </div>
      </div>
      <div class="craft-mats-label">Required Materials</div>
      <div class="craft-mats">${matsHtml}</div>
      <button class="craft-btn ${craftable ? '' : 'disabled'}"
        ${craftable ? `onclick="craftItem('${recipe.id}')"` : 'disabled'}>
        ${craftable ? '🔨 Craft' : '🔒 Missing Materials'}
      </button>
    </div>`;
  }).join('');
}

window.filterCraft = function(cat) {
  activeCraftCat = cat;
  renderCraftCatPills();
  renderRecipeList();
};

window.craftItem = function(recipeId) {
  const recipe = RECIPES.find(r => r.id === recipeId);
  if (!recipe || !canCraft(recipe)) return;
  const p = window.PLAYER; if (!p) return;

  let inv = getInventory().slice();
  recipe.materials.forEach(m => {
    const idx = inv.findIndex(i => i.id === m.id);
    if (idx < 0) return;
    inv[idx] = { ...inv[idx], uses: inv[idx].uses - m.qty };
    if (inv[idx].uses <= 0) inv.splice(idx, 1);
  });

  const existIdx = inv.findIndex(i => i.id === recipe.result);
  if (existIdx >= 0) inv[existIdx] = { id: recipe.result, uses: 1 };
  else               inv.push({ id: recipe.result, uses: 1 });

  window.updatePlayerField({ inventory: inv });
  showToast(`⚒️ ${recipe.name} crafted!`);

  /* Quest tracking */
  if (window.updateQuestProgress) window.updateQuestProgress('craft_item');

  renderRecipeList();
};

/* ── Event hooks ── */
document.addEventListener('page-change', e => {
  if (e.detail.page === 'craft') { activeCraftCat = 'all'; renderCrafting(); }
});
document.addEventListener('player-ready',   () => { /* renders on page-change */ });
document.addEventListener('player-updated', () => {
  const pg = document.getElementById('page-craft');
  if (pg?.classList.contains('active')) renderCrafting();
});
