// js/pages/apartments.js
// Apartment system — rent, vault, studio music, swipeable gallery

import { showToast, openModal }   from '../core/modal.js';
import { APARTMENT_TIERS, STUDIO_TRACKS,
         getApartmentTier, isStudioOpen,
         STUDIO_OPEN_HOUR, STUDIO_CLOSE_HOUR } from '../data/apartments.js';

let activeApt     = null;
let galleryIdx    = 0;
let studioAudio   = null;
let studioTimer   = null;

/* ══════════════════════════════════════
   APARTMENT HUB — render owned + rent
══════════════════════════════════════ */
export function renderApartments() {
  const p   = window.PLAYER; if (!p) return;
  const owned = p.apartments || [];
  const el    = document.getElementById('apt-content'); if (!el) return;

  if (owned.length === 0) {
    el.innerHTML = renderRealEstate();
    return;
  }

  /* Show first owned apartment */
  const tier = getApartmentTier(owned[0]);
  if (tier) renderApartmentInside(tier, el);
}

function renderApartmentInside(tier, el) {
  activeApt  = tier;
  galleryIdx = 0;

  el.innerHTML = `
    <!-- Gallery -->
    <div class="apt-gallery">
      <img class="apt-gallery-img" id="apt-gallery-img" src="${tier.images[0]}" alt="${tier.name}"/>
      <button class="apt-gallery-prev" onclick="aptGalleryPrev()">‹</button>
      <button class="apt-gallery-next" onclick="aptGalleryNext()">›</button>
      <div class="apt-gallery-dots" id="apt-gallery-dots">
        ${tier.images.map((_,i)=>`<span class="apt-dot ${i===0?'active':''}"></span>`).join('')}
      </div>
    </div>

    <!-- Apt info -->
    <div class="apt-info-row">
      <div class="apt-tier-name">${tier.emoji} ${tier.name} Apartment</div>
      <div class="apt-rent">🪙 ${tier.weeklyRent.toLocaleString()} / week</div>
    </div>

    <!-- Actions -->
    <div class="apt-actions">
      <div class="apt-action-row" onclick="openVault()">
        <span class="apt-action-icon">🗄️</span>
        <div class="apt-action-text">
          <div class="apt-action-label">Vault</div>
          <div class="apt-action-sub">${(window.PLAYER?.vaultItems||[]).length} / ${tier.vaultSlots} items</div>
        </div>
        <span class="apt-action-arrow">›</span>
      </div>
      <div class="apt-action-row" onclick="openStudio()">
        <span class="apt-action-icon">🎵</span>
        <div class="apt-action-text">
          <div class="apt-action-label">Studio</div>
          <div class="apt-action-sub">Play music · ${isStudioOpen()?'Open':'Closed'}</div>
        </div>
        <span class="apt-action-arrow">›</span>
      </div>
    </div>

    <!-- View all apartments / rent another -->
    <button class="apt-rent-more-btn" onclick="showRealEstate()">🏠 View / Rent Apartments</button>`;
}

/* Gallery navigation */
window.aptGalleryNext = function() {
  if (!activeApt) return;
  galleryIdx = (galleryIdx + 1) % activeApt.images.length;
  updateGallery();
};
window.aptGalleryPrev = function() {
  if (!activeApt) return;
  galleryIdx = (galleryIdx - 1 + activeApt.images.length) % activeApt.images.length;
  updateGallery();
};
function updateGallery() {
  const img  = document.getElementById('apt-gallery-img');
  const dots = document.getElementById('apt-gallery-dots');
  if (img)  img.src = activeApt.images[galleryIdx];
  if (dots) dots.querySelectorAll('.apt-dot').forEach((d,i) =>
    d.classList.toggle('active', i === galleryIdx));
}

/* ══════════════════════════════════════
   REAL ESTATE — rent apartments
══════════════════════════════════════ */
function renderRealEstate() {
  return `<div class="apt-page-title">🏠 Real Estate</div>
    <div class="apt-page-sub">Rent an apartment. Weekly payments auto-deducted.</div>
    <div class="apt-tier-list">
      ${APARTMENT_TIERS.map(tier => {
        const owned = (window.PLAYER?.apartments||[]).includes(tier.id);
        return `<div class="apt-tier-card ${owned?'owned':''}">
          <img class="apt-tier-img" src="${tier.images[0]}" alt="${tier.name}"
               onerror="this.style.opacity='0.3'"/>
          <div class="apt-tier-info">
            <div class="apt-tier-label">${tier.emoji} ${tier.name}</div>
            <div class="apt-tier-desc">${tier.desc}</div>
            <div class="apt-tier-stats">
              🗄️ ${tier.vaultSlots} vault slots · 🪙 ${tier.weeklyRent.toLocaleString()}/wk
            </div>
          </div>
          ${owned
            ? '<div class="apt-owned-tag">✅ Rented</div>'
            : `<button class="apt-rent-btn" onclick="rentApartment('${tier.id}',${tier.weeklyRent})">
                Rent Now
               </button>`}
        </div>`;
      }).join('')}
    </div>`;
}

window.showRealEstate = function() {
  const el = document.getElementById('apt-content'); if (!el) return;
  el.innerHTML = renderRealEstate();
};

window.rentApartment = async function(tierId, weeklyRent) {
  const p    = window.PLAYER; if (!p) return;
  const tier = getApartmentTier(tierId); if (!tier) return;

  if ((p.gold||0) < weeklyRent) { showToast('🪙 Not enough gold for first week!'); return; }

  openModal({
    emoji: tier.emoji, title: `Rent ${tier.name}`,
    desc:  `${tier.desc}\n\n🪙 ${weeklyRent.toLocaleString()} per week auto-deducted.`,
    cost:  `First week: 🪙 ${weeklyRent.toLocaleString()}`,
    confirmLabel: 'Rent Now',
    onConfirm: async () => {
      const apts = [...(p.apartments||[])];
      if (!apts.includes(tierId)) apts.push(tierId);
      await window.updatePlayerField({
        gold:       (p.gold||0) - weeklyRent,
        apartments: apts,
        nextRent:   { [tierId]: Date.now() + 7*24*60*60*1000 },
      });
      showToast(`✅ ${tier.name} rented!`);
      renderApartments();
    },
  });
};

/* ══════════════════════════════════════
   VAULT
══════════════════════════════════════ */
window.openVault = function() {
  const overlay = document.getElementById('vault-overlay'); if (!overlay) return;
  renderVault();
  overlay.classList.add('open');
};

function renderVault() {
  const p    = window.PLAYER; if (!p) return;
  const apt  = getApartmentTier(p.apartments?.[0]);
  const max  = apt?.vaultSlots || 10;
  const items = p.vaultItems || [];
  const el   = document.getElementById('vault-grid'); if (!el) return;

  document.getElementById('vault-capacity').textContent = `${items.length} / ${max}`;

  if (!items.length) {
    el.innerHTML = '<div class="vault-empty">Vault is empty. Store items from inventory.</div>'; return;
  }
  /* Render vault items */
  const { getItemDef, getRarity } = window._itemsModule || {};
  el.innerHTML = items.map((item, idx) => {
    return `<div class="vault-item-slot" onclick="withdrawVaultItem(${idx})">
      <div class="vault-item-emoji">📦</div>
      <div class="vault-item-name">${item.id}</div>
      <div class="vault-item-sub">Tap to withdraw</div>
    </div>`;
  }).join('');
}

window.withdrawVaultItem = async function(idx) {
  const p    = window.PLAYER; if (!p) return;
  const inv  = [...(p.inventory||[])];
  if (inv.length >= 20) { showToast('🎒 Inventory full! Buy apartment or upgrade.'); return; }
  const vault = [...(p.vaultItems||[])];
  const item  = vault.splice(idx,1)[0];
  inv.push(item);
  await window.updatePlayerField({ inventory:inv, vaultItems:vault });
  showToast('📦 Item moved to inventory!');
  renderVault();
};

document.getElementById('vault-close')?.addEventListener('click', () =>
  document.getElementById('vault-overlay')?.classList.remove('open'));

/* ══════════════════════════════════════
   STUDIO
══════════════════════════════════════ */
window.openStudio = function() {
  const overlay = document.getElementById('studio-overlay'); if (!overlay) return;
  if (!isStudioOpen()) {
    renderStudioClosed();
  } else {
    renderStudioOpen();
  }
  overlay.classList.add('open');
};

function renderStudioOpen() {
  /* Show NPC Sofie */
  const sofieEl = document.getElementById('studio-npc');
  if (sofieEl) {
    sofieEl.innerHTML = `
      <img class="studio-npc-img" src="assets/cityCenter/npcs/npc-studiogirl.jpg"
           onerror="this.style.opacity='0.3'"/>
      <div class="studio-npc-greeting">Hey there monster, what's the vibe?</div>`;
  }

  /* NPC dialogue options */
  const optEl = document.getElementById('studio-npc-opts');
  if (optEl) optEl.innerHTML = `
    <button class="studio-opt-btn" onclick="studioDialogue('vibe')">Feeling good, what do you have for me?</button>
    <button class="studio-opt-btn" onclick="studioDialogue('select')">Select music</button>
    <button class="studio-opt-btn" onclick="studioDialogue('who')">Who are you?</button>`;

  /* Track list */
  const tracksEl = document.getElementById('studio-tracks');
  if (tracksEl) {
    tracksEl.style.display = 'none';
    tracksEl.innerHTML = STUDIO_TRACKS.map(t =>
      `<div class="studio-track-row" onclick="playStudioTrack('${t.id}')">
        <div class="studio-track-emoji">${t.emoji}</div>
        <div class="studio-track-name">${t.name}</div>
        <button class="studio-play-btn">▶ Play (🎵 1 token)</button>
      </div>`
    ).join('');
  }
}

window.studioDialogue = function(opt) {
  const npcText = document.getElementById('studio-npc-greeting');
  const tracksEl = document.getElementById('studio-tracks');
  if (opt === 'who') {
    if (npcText) npcText.textContent = "My name is Sofie. I upload music daily to your studio. I got vibes for you anytime — just keep in mind that we open at 7 and close at 11pm.";
  } else if (opt === 'vibe') {
    if (npcText) npcText.textContent = "I think you will love this jam I created!";
    /* Auto-highlight first track */
    if (tracksEl) tracksEl.style.display = '';
  } else if (opt === 'select') {
    if (tracksEl) tracksEl.style.display = tracksEl.style.display === 'none' ? '' : 'none';
  }
};

window.playStudioTrack = async function(trackId) {
  const p = window.PLAYER; if (!p) return;
  if ((p.studioTokens||0) < 1) { showToast('🎵 Need a Studio Token!'); return; }

  const track = STUDIO_TRACKS.find(t => t.id === trackId); if (!track) return;

  /* Stop bg music, play studio track */
  if (studioAudio) { studioAudio.pause(); studioAudio = null; }
  if (studioTimer)  { clearTimeout(studioTimer); studioTimer = null; }

  studioAudio     = new Audio(track.src);
  studioAudio.loop = true;
  studioAudio.volume = 0.7;
  studioAudio.play().catch(()=>{});

  await window.updatePlayerField({ studioTokens: (p.studioTokens||0) - 1 });
  showToast(`🎵 Now playing: ${track.name} (1 hour)`);

  /* Stop after 1 hour */
  studioTimer = setTimeout(() => {
    if (studioAudio) { studioAudio.pause(); studioAudio = null; }
    showToast('🎵 Studio session ended.');
  }, 60 * 60 * 1000);
};

function renderStudioClosed() {
  const now    = new Date();
  const closeH = STUDIO_CLOSE_HOUR;
  const openH  = STUDIO_OPEN_HOUR;
  const nextOpen = new Date();
  if (now.getHours() >= closeH) {
    nextOpen.setDate(nextOpen.getDate()+1);
    nextOpen.setHours(openH,0,0,0);
  } else {
    nextOpen.setHours(openH,0,0,0);
  }
  const diff = nextOpen - now;
  const hh   = Math.floor(diff/3600000);
  const mm   = Math.floor((diff%3600000)/60000);

  const sofieEl = document.getElementById('studio-npc');
  if (sofieEl) sofieEl.innerHTML = `
    <div class="studio-closed-emoji">🎵</div>
    <div class="studio-closed-msg">We are closed right now.</div>
    <div class="studio-reopen">Reopens in ${hh}h ${mm}m</div>`;
  const optEl = document.getElementById('studio-npc-opts');
  if (optEl) optEl.innerHTML = '';
  const tracksEl = document.getElementById('studio-tracks');
  if (tracksEl) tracksEl.style.display = 'none';
}

document.getElementById('studio-close')?.addEventListener('click', () =>
  document.getElementById('studio-overlay')?.classList.remove('open'));

/* ── Weekly rent check ── */
export function checkWeeklyRent() {
  const p = window.PLAYER; if (!p) return;
  const apts = p.apartments || [];
  if (!apts.length) return;
  const nextRent = p.nextRent || {};
  const now = Date.now();

  apts.forEach(async tierId => {
    const due = nextRent[tierId];
    if (!due || now < due) return;
    const tier = getApartmentTier(tierId); if (!tier) return;
    if ((p.gold||0) < tier.weeklyRent) {
      showToast(`🏠 ${tier.name}: Can't pay rent — apartment locked until paid.`);
      /* Lock apartment */
      const locked = [...(p.lockedApartments||[])];
      if (!locked.includes(tierId)) locked.push(tierId);
      await window.updatePlayerField({ lockedApartments: locked });
    } else {
      await window.updatePlayerField({
        gold:     (p.gold||0) - tier.weeklyRent,
        nextRent: { ...nextRent, [tierId]: now + 7*24*60*60*1000 },
      });
    }
  });
}
window.checkWeeklyRent = checkWeeklyRent;

/* ── Event hooks ── */
document.addEventListener('page-change',  e => { if (e.detail.page === 'apartment') renderApartments(); });
document.addEventListener('player-ready', () => { renderApartments(); checkWeeklyRent(); });
