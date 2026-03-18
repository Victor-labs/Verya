// js/pages/social.js
// Social page — player search, mail friends, guild section

import { db }                    from '../../firebase-config.js';
import { collection, query, where,
         getDocs, limit }         from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { showToast }              from '../core/modal.js';
import { startMailTo }            from './mail.js';

/* ══════════════════════════════════════
   PLAYER SEARCH
══════════════════════════════════════ */
window.searchPlayers = async function() {
  const input = document.getElementById('social-search-input');
  const term  = input?.value?.trim().toLowerCase(); if (!term) return;
  const el    = document.getElementById('social-search-results'); if (!el) return;
  el.innerHTML = '<div class="social-loading">Searching...</div>';

  const q = query(
    collection(db,'players'),
    where('heroNameLower','>=',term),
    where('heroNameLower','<=',term+'\uf8ff'),
    limit(20)
  );
  const snap = await getDocs(q);
  const me   = window.PLAYER_UID;

  if (snap.empty) { el.innerHTML = '<div class="social-empty">No players found.</div>'; return; }

  el.innerHTML = snap.docs
    .filter(d => d.id !== me)
    .map(d => {
      const p = d.data();
      const align = p.alignment === 'criminal' ? '🔴' : '🔵';
      return `<div class="social-player-row" onclick="viewPlayerProfile('${d.id}')">
        <div class="social-player-avatar">
          ${p.equippedCharacter
            ? `<img src="assets/characters/${p.gender==='female'?'females':'males'}/${p.equippedCharacter}.jpg"
                   class="social-avatar-img"
                   onerror="this.outerHTML='<div class=social-avatar-fallback>👤</div>'"/>`
            : '<div class="social-avatar-fallback">👤</div>'}
        </div>
        <div class="social-player-info">
          <div class="social-player-name">${align} ${p.heroName||'Unknown'}</div>
          <div class="social-player-sub">Lv.${p.level||1} · ${p.soulClass||'Wanderer'}</div>
        </div>
        <div class="social-player-arrow">›</div>
      </div>`;
    }).join('');
};

/* ══════════════════════════════════════
   VIEW PLAYER PROFILE
══════════════════════════════════════ */
window.viewPlayerProfile = async function(uid) {
  if (!uid) return;
  const snap = await getDocs(query(collection(db,'players'),where('uid','==',uid),limit(1)));
  let pData  = snap.docs[0]?.data();
  if (!pData) {
    /* Try direct doc */
    const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const d = await getDoc(doc(db,'players',uid));
    if (!d.exists()) { showToast('Player not found.'); return; }
    pData = d.data();
  }
  renderPlayerProfile(uid, pData);
};

function renderPlayerProfile(uid, p) {
  const modal = document.getElementById('player-profile-modal'); if (!modal) return;
  const me    = window.PLAYER_UID;
  const align = p.alignment === 'criminal' ? '🔴 Criminal' : '🔵 Vigilante';
  const isFriend = (window.PLAYER?.friends||[]).includes(uid);

  document.getElementById('pp-name').textContent     = p.heroName||'Unknown';
  document.getElementById('pp-level').textContent    = `Lv.${p.level||1}`;
  document.getElementById('pp-class').textContent    = p.soulClass||'Wanderer';
  document.getElementById('pp-align').textContent    = align;
  document.getElementById('pp-guild').textContent    = p.guildId ? `🏛️ ${p.guildId}` : 'No guild';
  document.getElementById('pp-zone').textContent     = p.currentZone||'Ashen Slums';
  document.getElementById('pp-gold').textContent     = `🪙 ${(p.gold||0).toLocaleString()}`;
  document.getElementById('pp-stars').textContent    = `⭐ ${p.criminalStars||0} criminal stars`;
  document.getElementById('pp-apt').textContent      = p.apartments?.length ? `🏠 ${p.apartments[0]}` : 'No apartment';

  /* Character portrait */
  const portEl = document.getElementById('pp-portrait');
  if (portEl) {
    portEl.innerHTML = p.equippedCharacter
      ? `<img src="assets/characters/${p.gender==='female'?'females':'males'}/${p.equippedCharacter}.jpg"
             class="pp-portrait-img" onerror="this.outerHTML='<div class=pp-portrait-fallback>👤</div>'"/>`
      : '<div class="pp-portrait-fallback">👤</div>';
  }

  /* Equipped gear summary */
  const gearEl = document.getElementById('pp-gear');
  if (gearEl && p.equipped) {
    gearEl.innerHTML = Object.entries(p.equipped).map(([slot,id])=>
      `<div class="pp-gear-slot"><span>${slot}</span><span>${id}</span></div>`
    ).join('') || '<div class="pp-gear-empty">No gear equipped</div>';
  }

  /* Action buttons */
  document.getElementById('pp-mail-btn').onclick  = () => { modal.classList.remove('open'); startMailTo(uid, p.heroName); };
  document.getElementById('pp-friend-btn').textContent = isFriend ? '✅ Friends' : '+ Add Friend';
  document.getElementById('pp-friend-btn').onclick = async () => {
    if (isFriend) return;
    const friends = [...(window.PLAYER?.friends||[]), uid];
    await window.updatePlayerField({ friends });
    showToast(`✅ ${p.heroName} added as friend!`);
    document.getElementById('pp-friend-btn').textContent = '✅ Friends';
  };
  document.getElementById('pp-attack-btn').style.display = uid !== me ? '' : 'none';
  document.getElementById('pp-attack-btn').onclick = () => {
    modal.classList.remove('open');
    initiatePVP(uid, p);
  };

  modal.dataset.uid = uid;
  modal.classList.add('open');
}

document.getElementById('pp-close')?.addEventListener('click', () =>
  document.getElementById('player-profile-modal')?.classList.remove('open'));

/* ── PVP initiate ── */
window.initiatePVP = function(targetUid, targetPlayer) {
  const p = window.PLAYER;
  if (!p) return;
  if ((p.level||1) < 15 && !p.pvpEnabled) {
    /* Show PVP protection warning */
    const modal = document.getElementById('pvp-warning-modal');
    if (modal) {
      modal.classList.add('open');
      document.getElementById('pvp-warn-confirm').onclick = async () => {
        modal.classList.remove('open');
        await window.updatePlayerField({ pvpEnabled:true, pvpProtection:false });
        startPVPCombat(targetUid, targetPlayer);
      };
    }
    return;
  }
  startPVPCombat(targetUid, targetPlayer);
};

function startPVPCombat(targetUid, targetPlayer) {
  showToast(`⚔️ Initiating PVP against ${targetPlayer.heroName}...`);
  /* PVP combat — opens combat with enemy built from target player stats */
  window.openCombat && window.openCombat(null, {
    name:   targetPlayer.heroName,
    emoji:  '👤',
    hp:     targetPlayer.hp || 100,
    atk:    Math.floor((targetPlayer.damage || 50) * 0.3),
    reward: 50,
    isPVP:  true,
    targetUid,
  });
}

/* ── Event hooks ── */
document.getElementById('social-search-input')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') searchPlayers();
});
document.addEventListener('page-change', e => {
  if (e.detail.page === 'social') {
    const el = document.getElementById('social-search-results');
    if (el) el.innerHTML = '';
  }
});
