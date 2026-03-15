// js/pages/crafting.js
// Crafting system — combine materials to forge gear
// Recipe list with material requirements, craft animation, result modal
// Accessible from nav bar AND from inventory page

import { showToast }                          from '../core/modal.js';
import { RECIPES, RECIPE_CATS, RARITY_COLORS } from '../data/recipes.js';
import { getItemDef }                          from '../data/items.js';

let activeCraftCat = 'all';

/* ── Helpers ── */
const getInventory = () => window.PLAYER?.inventory || [];

/** How many of a material the player owns */
function owned(matId) {
  const item = getInventory().find(i => i.id === matId);
  return item ? item.uses : 0;
}

/** True if player has all materials for this recipe */
function canCraft(recipe) {
  return recipe.materials.every(m => owned(m.id) >= m.qty);
}

/* ══════════════════════════════════════
   RENDER RECIPE LIST
══════════════════════════════════════ */
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

    /* Material rows */
    const matsHtml = recipe.materials.map(m => {
      const def   = getItemDef(m.id);
      const have  = owned(m.id);
      const enough= have >= m.qty;
      return `<div class="craft-mat-row">
        <span class="craft-mat-emoji">${def ? def.emoji : '?'}</span>
        <span class="craft-mat-name">${def ? def.name : m.id}</span>
        <span class="craft-mat-qty ${enough ? 'enough' : 'missing'}">${have}/${m.qty}</span>
      </div>`;
    }).join('');

    return `<div class="craft-card ${craftable ? 'craftable' : ''}"
      style="--rarity-color:${rarity.color};--rarity-glow:${rarity.glow}">

      <!-- Rarity accent stripe -->
      <div class="craft-card-stripe"></div>

      <div class="craft-card-top">
        <div class="craft-result-emoji">${recipe.emoji}</div>
        <div class="craft-card-info">
          <div class="craft-card-name">${recipe.name}</div>
          <div class="craft-card-rarity">${recipe.rarity.toUpperCase()}</div>
          <div class="craft-card-desc">${recipe.desc}</div>
          ${resultDef ? `<div class="craft-card-effect">${resultDef.effect}</div>` : ''}
        </div>
      </div>

      <!-- Materials needed -->
      <div class="craft-mats-label">Required Materials</div>
      <div class="craft-mats">${matsHtml}</div>

      <!-- Craft button -->
      <button class="craft-btn ${craftable ? '' : 'disabled'}"
        ${craftable ? `onclick="craftItem('${recipe.id}')"` : 'disabled'}>
        ${craftable ? '🔨 Craft' : '🔒 Missing Materials'}
      </button>
    </div>`;
  }).join('');
}

/* ── Category filter ── */
window.filterCraft = function(cat) {
  activeCraftCat = cat;
  renderCraftCatPills();
  renderRecipeList();
};

/* ══════════════════════════════════════
   CRAFT AN ITEM
══════════════════════════════════════ */
window.craftItem = function(recipeId) {
  const recipe = RECIPES.find(r => r.id === recipeId);
  if (!recipe || !canCraft(recipe)) return;

  const p = window.PLAYER; if (!p) return;

  /* Show craft animation overlay */
  openCraftAnimation(recipe, () => {
    /* Deduct materials */
    let inv = getInventory().slice();
    recipe.materials.forEach(m => {
      const idx = inv.findIndex(i => i.id === m.id);
      if (idx < 0) return;
      inv[idx] = { ...inv[idx], uses: inv[idx].uses - m.qty };
      if (inv[idx].uses <= 0) inv.splice(idx, 1);
    });

    /* Add crafted item to inventory */
    const resultDef = getItemDef(recipe.result);
    const existIdx  = inv.findIndex(i => i.id === recipe.result);
    if (existIdx >= 0) inv[existIdx] = { id: recipe.result, uses: 1 };
    else               inv.push({ id: recipe.result, uses: 1 });

    window.updatePlayerField({ inventory: inv });
    showToast(`${recipe.emoji} ${recipe.name} crafted!`);
    renderRecipeList();
  });
};

/* ══════════════════════════════════════
   CRAFT ANIMATION OVERLAY
   Spinning rune circle → result reveal
══════════════════════════════════════ */
function openCraftAnimation(recipe, onComplete) {
  const overlay = document.getElementById('craft-anim-overlay');
  const canvas  = document.getElementById('craft-anim-canvas');
  const ctx     = canvas.getContext('2d');
  const label   = document.getElementById('craft-anim-label');

  overlay.classList.add('open');
  label.textContent = `Forging ${recipe.name}...`;

  canvas.width  = canvas.offsetWidth  || 300;
  canvas.height = canvas.offsetHeight || 300;

  const cx = canvas.width  / 2;
  const cy = canvas.height / 2;
  let   t  = 0;
  let   phase = 0; /* 0=spinning, 1=flash, 2=result */
  let   animId = null;

  /* Rune symbols around ring */
  const runes = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ'];
  const rarity = RARITY_COLORS[recipe.rarity] || RARITY_COLORS.common;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const R = Math.min(cx, cy) * 0.7;

    if (phase === 0) {
      /* Spinning outer ring */
      ctx.save();
      ctx.strokeStyle = rarity.color;
      ctx.lineWidth   = 2;
      ctx.globalAlpha = 0.6 + Math.sin(t * 3) * 0.2;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();

      /* Inner spinning ring (opposite direction) */
      ctx.strokeStyle = rarity.color;
      ctx.lineWidth   = 1;
      ctx.globalAlpha = 0.3;
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.7, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();

      /* Rune symbols orbiting */
      ctx.save();
      ctx.font      = '14px serif';
      ctx.fillStyle = rarity.color;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      runes.forEach((r, i) => {
        const angle = (i / runes.length) * Math.PI * 2 + t * 1.5;
        const x = cx + Math.cos(angle) * R;
        const y = cy + Math.sin(angle) * R;
        ctx.globalAlpha = 0.5 + Math.sin(t * 2 + i) * 0.3;
        ctx.fillText(r, x, y);
      });
      ctx.restore();

      /* Centre glow */
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.4);
      glow.addColorStop(0, rarity.glow.replace('0.', (0.3 + Math.sin(t*2)*0.15).toFixed(2)));
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.4, 0, Math.PI * 2); ctx.fill();

      /* Centre emoji getting larger */
      ctx.save();
      ctx.font = (32 + Math.sin(t * 3) * 4) + 'px serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.4 + Math.sin(t * 2) * 0.2;
      ctx.fillText('🔨', cx, cy);
      ctx.restore();

    } else if (phase === 1) {
      /* Flash burst */
      const alpha = Math.max(0, 1 - (t - phaseStart) * 4);
      const burst = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      burst.addColorStop(0, `rgba(255,255,255,${alpha})`);
      burst.addColorStop(1, 'transparent');
      ctx.fillStyle = burst; ctx.fillRect(0, 0, canvas.width, canvas.height);

    } else if (phase === 2) {
      /* Result — show crafted item emoji */
      const age   = t - phaseStart;
      const scale = Math.min(1, age * 3);
      ctx.save();
      ctx.font = (64 * scale) + 'px serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = Math.min(1, age * 2);
      ctx.fillText(recipe.emoji, cx, cy);
      ctx.restore();
    }

    t += 0.025;
    animId = requestAnimationFrame(draw);
  }

  let phaseStart = 0;

  /* Phase timing */
  draw();
  setTimeout(() => { phase = 1; phaseStart = t; }, 1800); /* start flash */
  setTimeout(() => { phase = 2; phaseStart = t; }, 2100); /* show result */
  setTimeout(() => {
    cancelAnimationFrame(animId);
    overlay.classList.remove('open');
    onComplete();
  }, 2800);
}

/* ══════════════════════════════════════
   EVENT HOOKS
══════════════════════════════════════ */
document.addEventListener('page-change', e => {
  if (e.detail.page === 'crafting') {
    activeCraftCat = 'all';
    renderCrafting();
  }
});
document.addEventListener('player-ready',   () => renderCrafting());
document.addEventListener('player-updated', () => {
  /* Re-render only if crafting page is visible */
  const pg = document.getElementById('page-crafting');
  if (pg && pg.classList.contains('active')) renderCrafting();
});
