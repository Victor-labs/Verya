// js/pages/characters.js
// Character selection, purchase, ability equip system
// Grid shows cards + name until tapped → full detail
// Buy with diamonds only
// Equipped character = profile picture
// 2 ability slots from owned characters

import { showToast, openModal }              from '../core/modal.js';
import { CHARACTERS, getCharacter,
         getOwnedCharacters, TIER_COLORS }   from '../data/characters.js';

let selectedCharId = null;

/* ══════════════════════════════════════
   RENDER CHARACTER GRID
══════════════════════════════════════ */
export function renderCharacters() {
  const p   = window.PLAYER; if (!p) return;
  const el  = document.getElementById('char-grid'); if (!el) return;
  const owned      = p.ownedCharacters || [];
  const equipped   = p.equippedCharacter;
  const starter    = p.gender === 'female' ? 'sera' : 'andrew';
  const allOwned   = [starter, ...owned];
  const purchasable = CHARACTERS.filter(c => !c.free);

  el.innerHTML = purchasable.map(char => {
    const isOwned    = allOwned.includes(char.id);
    const isEquipped = equipped === char.id;
    const tier       = TIER_COLORS[char.tier] || TIER_COLORS.B;
    const stars      = renderStars(char.stars);

    return `<div class="char-card ${isEquipped ? 'equipped' : ''}"
              onclick="openCharDetail('${char.id}')">
      <div class="char-card-img-wrap">
        <img class="char-card-img" src="${char.img}" alt="${char.name}"
             onerror="this.style.opacity='0.3'"/>
        ${isEquipped ? '<div class="char-equipped-badge">✅ Equipped</div>' : ''}
        ${isOwned && !isEquipped ? '<div class="char-owned-badge">Owned</div>' : ''}
      </div>
      <div class="char-card-name">${char.name}</div>
      <div class="char-card-tier" style="color:${tier.color}">${tier.label}</div>
      <div class="char-card-stars">${stars}</div>
    </div>`;
  }).join('');
}

function renderStars(count) {
  const full = Math.floor(count);
  const half = count % 1 >= 0.5;
  return '⭐'.repeat(full) + (half ? '✨' : '');
}

/* ══════════════════════════════════════
   CHARACTER DETAIL MODAL
══════════════════════════════════════ */
window.openCharDetail = function(charId) {
  const char = getCharacter(charId); if (!char) return;
  const p    = window.PLAYER; if (!p) return;
  selectedCharId = charId;

  const owned    = [p.gender === 'female' ? 'sera' : 'andrew', ...(p.ownedCharacters || [])];
  const isOwned  = owned.includes(charId);
  const isEquip  = p.equippedCharacter === charId;
  const tier     = TIER_COLORS[char.tier] || TIER_COLORS.B;

  /* Full art background */
  const modal = document.getElementById('char-detail-modal');
  modal.style.backgroundImage = `url('${char.img}')`;

  document.getElementById('cd-name').textContent   = char.name;
  document.getElementById('cd-tier').textContent   = tier.label;
  document.getElementById('cd-tier').style.color   = tier.color;
  document.getElementById('cd-stars').innerHTML    = renderStars(char.stars);
  document.getElementById('cd-barcode').textContent= generateBarcode(charId);

  /* Ability section */
  const abilEl = document.getElementById('cd-ability');
  if (char.abilityImg) {
    abilEl.innerHTML = `
      <img class="cd-ability-icon" src="${char.abilityImg}" alt="ability"
           onerror="this.style.display='none'"/>
      <div>
        <div class="cd-ability-type">${char.abilityType}</div>
        <div class="cd-ability-desc">${char.abilityDesc}</div>
        <div class="cd-ability-cd">⏱ ${char.cooldown}min cooldown · ${char.duration}min duration</div>
      </div>`;
  } else {
    abilEl.innerHTML = '<div class="cd-ability-desc">No ability — starter character.</div>';
  }

  /* Stats */
  document.getElementById('cd-dmg').textContent     = char.damage;
  document.getElementById('cd-hp').textContent      = char.hp;
  document.getElementById('cd-stamina').textContent  = char.stamina;

  /* Action buttons */
  const buyBtn    = document.getElementById('cd-buy-btn');
  const equipBtn  = document.getElementById('cd-equip-btn');
  const abilSlot  = document.getElementById('cd-abil-slot-btn');

  if (isEquip) {
    buyBtn.style.display   = 'none';
    equipBtn.style.display = '';
    equipBtn.textContent   = '✅ Currently Equipped';
    equipBtn.disabled      = true;
  } else if (isOwned) {
    buyBtn.style.display   = 'none';
    equipBtn.style.display = '';
    equipBtn.textContent   = '⚔️ Equip Character';
    equipBtn.disabled      = false;
  } else {
    equipBtn.style.display = 'none';
    buyBtn.style.display   = '';
    buyBtn.textContent     = `💎 Buy — ${char.price} Diamonds`;
    buyBtn.disabled        = (p.diamonds || 0) < char.price;
  }

  /* Ability slot button — only for owned */
  abilSlot.style.display = isOwned && char.abilityImg ? '' : 'none';

  modal.classList.add('open');
};

window.closeCharDetail = function() {
  document.getElementById('char-detail-modal').classList.remove('open');
};

/* Buy character */
/* Equip character */
/* Equip ability slot */
/* ══════════════════════════════════════
   ABILITY SLOT PICKER
══════════════════════════════════════ */
function openAbilitySlotPicker(charId) {
  const p       = window.PLAYER; if (!p) return;
  const slots   = p.equippedAbilities || [];
  const char    = getCharacter(charId); if (!char) return;
  const inSlot1 = slots[0] === charId;
  const inSlot2 = slots[1] === charId;

  openModal({
    emoji: '⚡',
    title: `Equip ${char.name}'s Ability`,
    desc:  `Choose which ability slot to assign.\nCurrently: Slot 1 = ${slots[0]||'Empty'}, Slot 2 = ${slots[1]||'Empty'}`,
    cost:  null,
    confirmLabel: inSlot1 ? 'Move to Slot 2' : 'Equip to Slot 1',
    onConfirm: async () => {
      let newSlots = [...slots];
      if (!newSlots[0] || newSlots[0] === charId) newSlots[0] = charId;
      else newSlots[1] = charId;
      await window.updatePlayerField({ equippedAbilities: newSlots.slice(0,2) });
      showToast(`⚡ ${char.name}'s ability equipped!`);
    },
  });
}

function generateBarcode(id) {
  return id.toUpperCase().replace(/-/g,'').padEnd(12,'0').slice(0,12);
}

/* ── Event hooks ── */
document.addEventListener('page-change',   e => { if (e.detail.page === 'characters') renderCharacters(); });
document.addEventListener('player-ready',  () => renderCharacters());
document.addEventListener('player-updated',() => {
  const pg = document.getElementById('page-characters');
  if (pg?.classList.contains('active')) renderCharacters();
});


/* ── Attach DOM listeners after page load ── */
window.addEventListener('load', () => {
  document.getElementById('cd-buy-btn')?.addEventListener('click', () => {
    const char = getCharacter(selectedCharId); if (!char) return;
    const p    = window.PLAYER;
    if ((p.diamonds || 0) < char.price) { showToast('💎 Not enough diamonds!'); return; }

    openModal({
      emoji: char.img ? '' : '👤',
      title: `Buy ${char.name}`,
      desc:  `${char.name} · ${TIER_COLORS[char.tier]?.label}\n💎 ${char.price} Diamonds`,
      cost:  `💎 ${char.price} Diamonds`,
      confirmLabel: 'Purchase',
      onConfirm: async () => {
        const owned = [...(p.ownedCharacters || []), selectedCharId];
        await window.updatePlayerField({
          diamonds:        (p.diamonds || 0) - char.price,
          ownedCharacters: owned,
        });
        showToast(`✅ ${char.name} unlocked!`);
        renderCharacters();
        window.openCharDetail(selectedCharId);
      },
    });
  });


  document.getElementById('cd-equip-btn')?.addEventListener('click', async () => {
    const char = getCharacter(selectedCharId); if (!char) return;
    await window.updatePlayerField({ equippedCharacter: selectedCharId });
    showToast(`✅ ${char.name} equipped as your character!`);
    renderCharacters();
    closeCharDetail();
  });


  document.getElementById('cd-abil-slot-btn')?.addEventListener('click', () => {
    openAbilitySlotPicker(selectedCharId);
  });


});