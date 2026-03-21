// js/pages/inventory.js
// Inventory — Archlight diamond equipment layout + bag grid
// 5 slots: head (top), weapon (left), chest (centre-top),
//          trinket (right), boots (bottom)
// Empty slot → placeholder silhouette + slot name
// Equipped slot → item icon with rarity glow, tap → detail modal
// Bag grid below — filterable by category

import { showToast }       from '../core/modal.js';
import { getRarity,
         ALL_EQUIP,
         ALL_CONSUMABLES,
         MATERIALS,
         getItemDef,
         canEquip }        from '../data/items.js';

/* ── Slot config ── */
const SLOTS = {
  head:    { label:'HEAD',    placeholder:'⛑️',  hint:'Helmet or Hat'  },
  weapon:  { label:'WEAPON',  placeholder:'⚔️',  hint:'Sword or Gear'  },
  chest:   { label:'CHEST',   placeholder:'🧥',  hint:'Armor'          },
  trinket: { label:'TRINKET', placeholder:'💍',  hint:'Ring or Necklace'},
  boots:   { label:'BOOTS',   placeholder:'🥾',  hint:'Boots'          },
};

let activeTab    = 'all';
let selectedItem = null; /* { def, source } */
let pickerSlot   = null;

/* ── Helpers ── */
const getEquipped  = () => window.PLAYER?.equipped  || {};
const getInventory = () => window.PLAYER?.inventory || [];

/* ══════════════════════════════════════
   RENDER EQUIPMENT DIAMOND
══════════════════════════════════════ */
export function renderEquipSlots() {
  const equipped = getEquipped();
  Object.entries(SLOTS).forEach(([slot, cfg]) => {
    const el = document.getElementById('eslot-' + slot);
    if (!el) return;
    const equippedId = equipped[slot];
    const def        = equippedId ? getItemDef(equippedId) : null;
    const rar        = def ? getRarity(def.rarity) : null;

    el.className = 'inv-eslot' + (def ? ` equipped rarity-card ${def.rarity}` : ' empty');

    if (def) {
      /* Show item icon */
      el.innerHTML = `
        <div class="rarity-stripe ${def.rarity}"></div>
        <img class="eslot-icon rarity-icon ${def.rarity}"
             src="${def.icon}" alt="${def.name}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
        <div class="eslot-fallback" style="display:none">${def.slot === 'weapon' ? '⚔️' : SLOTS[slot].placeholder}</div>
        <div class="eslot-label">${cfg.label}</div>
        <div class="rarity-badge ${def.rarity}" style="position:absolute;top:4px;right:4px;font-size:7px;padding:1px 5px">
          ${rar.label}
        </div>`;
      el.onclick = () => openItemDetail(equippedId, 'equip');
    } else {
      /* Empty placeholder */
      el.innerHTML = `
        <div class="eslot-placeholder">${cfg.placeholder}</div>
        <div class="eslot-label">${cfg.label}</div>`;
      el.onclick = () => openSlotPicker(slot);
    }
  });
}

/* ══════════════════════════════════════
   RENDER BAG GRID
══════════════════════════════════════ */
export function renderBagGrid() {
  const el      = document.getElementById('inv-bag-grid');
  const emptyEl = document.getElementById('inv-empty-state');
  if (!el) return;

  const inv = getInventory();
  const filtered = activeTab === 'all'
    ? inv
    : inv.filter(owned => {
        const def = getItemDef(owned.id);
        if (!def) return false;
        if (activeTab === 'equipment') return !!def.slot;
        if (activeTab === 'consumables') return !!def.cat && (def.cat === 'food' || def.cat === 'potions');
        if (activeTab === 'materials') return def.cat === 'materials';
        return true;
      });

  if (!filtered.length) {
    el.innerHTML = '';
    if (emptyEl) emptyEl.style.display = '';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  el.innerHTML = filtered.map(owned => {
    const def = getItemDef(owned.id);
    if (!def) return '';
    const rar = getRarity(def.rarity);
    const isEquip = !!def.slot;

    return `
      <div class="inv-bag-slot rarity-card ${def.rarity}"
           onclick="openItemDetail('${def.id}','bag')"
           style="position:relative;overflow:hidden">
        <div class="rarity-stripe ${def.rarity}"></div>
        ${!isEquip ? `<div class="inv-bag-uses">${owned.uses}</div>` : ''}
        <img class="inv-bag-icon rarity-icon ${def.rarity}"
             src="${def.icon}" alt="${def.name}"
             onerror="this.style.fontSize='28px';this.outerHTML='<div class=inv-bag-emoji>${def.slot ? '⚔️' : '🧪'}</div>'"/>
        <div class="inv-bag-slot-name">${def.name}</div>
        <div class="rarity-badge ${def.rarity}" style="margin-top:3px;font-size:7px">
          ${rar.label}
        </div>
      </div>`;
  }).join('');
}

/* ── Tab switcher ── */
window.switchInvTab = function(tab) {
  activeTab = tab;
  document.querySelectorAll('.inv-bag-tab').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.tab === tab));
  renderBagGrid();
};

/* ══════════════════════════════════════
   ITEM DETAIL MODAL
══════════════════════════════════════ */
window.openItemDetail = function(itemId, source) {
  const def = getItemDef(itemId);
  if (!def) return;
  selectedItem = { def, source };
  const rar    = getRarity(def.rarity);
  const owned  = getInventory().find(i => i.id === itemId);
  const eq     = getEquipped();

  /* Rarity class on modal card */
  const card = document.getElementById('inv-modal-card');
  if (card) {
    card.className = `inv-modal-card rarity-card ${def.rarity}`;
  }

  /* Icon */
  const iconEl = document.getElementById('inv-modal-icon');
  if (iconEl) {
    iconEl.src     = def.icon;
    iconEl.className = `inv-modal-icon-img rarity-icon ${def.rarity}`;
    iconEl.onerror = () => { iconEl.style.display = 'none'; };
  }

  /* Rarity badge */
  const rarEl = document.getElementById('inv-modal-rarity');
  if (rarEl) {
    rarEl.className   = `rarity-badge ${def.rarity}`;
    rarEl.textContent = `◆ ${rar.label}`;
  }

  document.getElementById('inv-modal-name').textContent   = def.name;
  document.getElementById('inv-modal-cat').textContent    =
    def.slot
      ? `${def.slot.toUpperCase()}${def.type ? ' · ' + def.type.toUpperCase() : ''}`
      : (def.cat || 'item').toUpperCase();
  document.getElementById('inv-modal-effect').textContent = def.effect || '—';
  document.getElementById('inv-modal-lore').textContent   = def.lore   || '';

  const usesEl = document.getElementById('inv-modal-uses');
  if (usesEl) usesEl.textContent = owned && !def.slot
    ? `Uses remaining: ${owned.uses}` : '';

  /* Buttons */
  const equipBtn   = document.getElementById('inv-modal-equip-btn');
  const unequipBtn = document.getElementById('inv-modal-unequip-btn');
  const useBtn     = document.getElementById('inv-modal-use-btn');
  equipBtn.style.display   = 'none';
  unequipBtn.style.display = 'none';
  useBtn.style.display     = 'none';

  if (def.slot) {
    if (eq[def.slot] === def.id)        unequipBtn.style.display = '';
    else if (canEquip(def, eq))         equipBtn.style.display   = '';
    else {
      /* Show conflict message */
      equipBtn.style.display   = '';
      equipBtn.textContent     = '⚠️ Unequip conflicting item first';
      equipBtn.disabled        = true;
    }
  } else if (owned && owned.uses > 0)   useBtn.style.display = '';

  /* Open */
  const mm = document.getElementById('inv-modal');
  mm.style.display   = 'flex';
  mm.style.animation = 'modalIn 0.3s ease forwards';
};

/* Close */
  document.getElementById('inv-modal').style.display = 'none');
/* Equip */
/* Unequip */
/* Use consumable */
/* ══════════════════════════════════════
   SLOT PICKER DRAWER
   Opens when tapping an empty equip slot
══════════════════════════════════════ */
window.openSlotPicker = function(slot) {
  pickerSlot = slot;
  const cfg  = SLOTS[slot];
  document.getElementById('inv-picker-title').textContent = `Equip ${cfg.label}`;
  document.getElementById('inv-picker-sub').textContent   = cfg.hint;

  const eligible = getInventory()
    .map(owned => getItemDef(owned.id))
    .filter(def => def && def.slot === slot && canEquip(def, getEquipped()));

  const gridEl  = document.getElementById('inv-picker-grid');
  const emptyEl = document.getElementById('inv-picker-empty');

  if (!eligible.length) {
    gridEl.innerHTML      = '';
    emptyEl.style.display = '';
  } else {
    emptyEl.style.display = 'none';
    gridEl.innerHTML = eligible.map(def => {
      const rar = getRarity(def.rarity);
      return `
        <div class="inv-picker-slot rarity-card ${def.rarity}"
             onclick="pickAndEquip('${def.id}')"
             style="position:relative;overflow:hidden">
          <div class="rarity-stripe ${def.rarity}"></div>
          <img class="inv-picker-icon rarity-icon ${def.rarity}"
               src="${def.icon}" alt="${def.name}"
               onerror="this.style.display='none'"/>
          <div class="inv-picker-slot-name">${def.name}</div>
          <div class="rarity-badge ${def.rarity}" style="font-size:7px;margin-top:3px">${rar.label}</div>
          <div class="inv-picker-slot-effect">${def.effect}</div>
        </div>`;
    }).join('');
  }

  const picker = document.getElementById('inv-slot-picker');
  picker.style.display   = 'flex';
  picker.style.animation = 'modalIn 0.3s ease forwards';
};

window.pickAndEquip = function(itemId) {
  const def = getItemDef(itemId);
  const p   = window.PLAYER; if (!p || !def) return;
  if (!canEquip(def, getEquipped())) { showToast('⚠️ Conflict!'); return; }
  const eq = { ...getEquipped(), [def.slot]: def.id };
  window.updatePlayerField({ equipped: eq });
  document.getElementById('inv-slot-picker').style.display = 'none';
  showToast(`✅ ${def.name} equipped!`);
  renderEquipSlots(); renderBagGrid();
};

  document.getElementById('inv-slot-picker').style.display = 'none');
/* ── Event hooks ── */
document.addEventListener('page-change', e => {
  if (e.detail.page === 'inventory') {
    activeTab = 'all';
    document.querySelectorAll('.inv-bag-tab').forEach(b =>
      b.classList.toggle('active', b.dataset.tab === 'all'));
    renderEquipSlots(); renderBagGrid();
  }
});
document.addEventListener('player-ready',   () => { renderEquipSlots(); renderBagGrid(); });
document.addEventListener('player-updated', () => { renderEquipSlots(); renderBagGrid(); });


/* ── Attach DOM listeners after page load ── */
window.addEventListener('load', () => {
  document.getElementById('inv-modal-close')?.addEventListener('click', () =>

  document.getElementById('inv-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('inv-modal'))
      document.getElementById('inv-modal').style.display = 'none';
  });


  document.getElementById('inv-modal-equip-btn')?.addEventListener('click', () => {
    if (!selectedItem) return;
    const { def } = selectedItem;
    const p = window.PLAYER; if (!p) return;
    if (!canEquip(def, getEquipped())) {
      showToast('⚠️ Unequip conflicting item first'); return;
    }
    const eq = { ...getEquipped(), [def.slot]: def.id };
    window.updatePlayerField({ equipped: eq });
    document.getElementById('inv-modal').style.display = 'none';
    showToast(`${def.rarity === 'legendary' ? '🟡' : def.rarity === 'evil' ? '🔴' : '✅'} ${def.name} equipped!`);
    renderEquipSlots(); renderBagGrid();
  });


  document.getElementById('inv-modal-unequip-btn')?.addEventListener('click', () => {
    if (!selectedItem) return;
    const { def } = selectedItem;
    const eq = { ...getEquipped() };
    delete eq[def.slot];
    window.updatePlayerField({ equipped: eq });
    document.getElementById('inv-modal').style.display = 'none';
    showToast(`${def.name} unequipped.`);
    renderEquipSlots(); renderBagGrid();
  });


  document.getElementById('inv-modal-use-btn')?.addEventListener('click', () => {
    if (!selectedItem) return;
    const { def } = selectedItem;
    const p = window.PLAYER; if (!p) return;
    const inv = getInventory().slice();
    const idx = inv.findIndex(i => i.id === def.id);
    if (idx < 0) return;

    const updates = {};
    const effect  = def.effect || '';
    const num     = parseInt(effect.replace(/\D/g,'')) || 10;

    if      (effect.toLowerCase().includes('hp'))     { updates.hp     = Math.min((p.hp||100)+num, p.maxHp||100); showToast(`❤️ +${num} HP!`); }
    else if (effect.toLowerCase().includes('mp'))     { updates.mp     = Math.min((p.mp||50) +num, p.maxMp||50);  showToast(`💙 +${num} MP!`); }
    else if (effect.toLowerCase().includes('agility')){ showToast(`💨 Agility boosted!`); }
    else                                               { showToast(`✨ Used ${def.name}!`); }

    inv[idx] = { id: def.id, uses: inv[idx].uses - 1 };
    if (inv[idx].uses <= 0) inv.splice(idx, 1);
    updates.inventory = inv;

    window.updatePlayerField(updates);
    document.getElementById('inv-modal').style.display = 'none';
    renderBagGrid();
  });


  document.getElementById('inv-picker-close')?.addEventListener('click', () =>

  document.getElementById('inv-slot-picker')?.addEventListener('click', e => {
    if (e.target === document.getElementById('inv-slot-picker'))
      document.getElementById('inv-slot-picker').style.display = 'none';
  });


});