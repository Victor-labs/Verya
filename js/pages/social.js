// js/pages/social.js
// Social hub — tabs: Search Players | Mail | Chat (Chirp) | Feed

import { db }               from '../../firebase-config.js';
import { collection, query,
         where, getDocs,
         limit }             from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { showToast }         from '../core/modal.js';

/* ══════════════════════════════════════
   RENDER SOCIAL PAGE
══════════════════════════════════════ */
export function renderSocial() {
  const el = document.getElementById('page-social'); if (!el) return;
  el.innerHTML = `
    <div class="page-title">🤝 Social</div>

    <!-- Tabs -->
    <div class="social-tabs">
      <div class="social-tab active" onclick="switchSocialTab('search',this)">🔍 Search</div>
      <div class="social-tab"       onclick="switchSocialTab('mail',this)">✉️ Mail</div>
      <div class="social-tab"       onclick="switchSocialTab('chat',this)">💬 Chat</div>
      <div class="social-tab"       onclick="switchSocialTab('feed',this)">📰 Feed</div>
    </div>

    <!-- Search tab -->
    <div id="social-panel-search" class="social-panel">
      <div class="social-search-bar">
        <input id="social-search-input" type="text" placeholder="Search player by hero name..."
               style="flex:1;padding:11px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;font-family:'Crimson Text',serif;font-size:14px;color:#ede0cc;outline:none;"/>
        <button class="social-search-btn" onclick="searchPlayers()">Search</button>
      </div>
      <div id="social-search-results" style="padding:0 14px;"></div>
    </div>

    <!-- Mail tab -->
    <div id="social-panel-mail" class="social-panel" style="display:none;flex-direction:column;flex:1;overflow:hidden;">
      <div id="mail-inbox" style="flex:1;overflow-y:auto;"></div>
      <div id="mail-conversation" style="display:none;flex-direction:column;position:absolute;inset:0;background:var(--bg);z-index:10;">
        <div style="display:flex;align-items:center;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <button id="conv-back" style="font-size:22px;color:#8a7fa0;background:none;border:none;cursor:pointer;margin-right:8px;">‹</button>
          <div id="conv-title" style="font-family:'Cinzel',serif;font-size:13px;font-weight:600;color:#e8c96a;flex:1;">Conversation</div>
        </div>
        <div id="conv-messages" style="flex:1;overflow-y:auto;padding:10px 14px;display:flex;flex-direction:column;gap:10px;"></div>
        <div style="display:flex;gap:8px;padding:10px 14px 14px;border-top:1px solid rgba(255,255,255,0.06);">
          <input id="conv-input" type="text" placeholder="Type a message..."
                 style="flex:1;padding:11px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:24px;font-family:'Crimson Text',serif;font-size:14px;color:#ede0cc;outline:none;"/>
          <button class="conv-send-btn" onclick="sendMail()">➤</button>
        </div>
      </div>
    </div>

    <!-- Chat tab -->
    <div id="social-panel-chat" class="social-panel" style="display:none;flex-direction:column;flex:1;overflow:hidden;">
      <div id="chirp-chat-messages" style="flex:1;overflow-y:auto;padding:10px 14px;display:flex;flex-direction:column;gap:10px;"></div>
      <div id="chat-reply-bar" style="display:none;background:rgba(0,100,200,0.15);border-left:2px solid #00aaff;padding:6px 14px;font-family:'Crimson Text',serif;font-style:italic;font-size:12px;color:#8a7fa0;"></div>
      <div style="display:flex;gap:8px;padding:10px 14px 14px;border-top:1px solid rgba(255,255,255,0.06);">
        <input id="chat-input" type="text" placeholder="Say something..."
               style="flex:1;padding:11px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:24px;font-family:'Crimson Text',serif;font-size:14px;color:#ede0cc;outline:none;"/>
        <button class="chat-send-btn" onclick="sendChatMsg()">➤</button>
      </div>
    </div>

    <!-- Feed tab -->
    <div id="social-panel-feed" class="social-panel" style="display:none;overflow-y:auto;padding:10px 14px 16px;">
      <div id="chirp-feed-list"></div>
    </div>

    <!-- Player profile modal -->
    <div id="player-profile-modal" style="display:none;position:absolute;inset:0;background:var(--bg);flex-direction:column;overflow-y:auto;z-index:20;">
      <div style="display:flex;align-items:center;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.06);">
        <button id="pp-close" style="font-size:22px;color:#8a7fa0;background:none;border:none;cursor:pointer;margin-right:8px;">‹</button>
        <div style="font-family:'Cinzel',serif;font-size:13px;font-weight:600;color:#e8c96a;">Player Profile</div>
      </div>
      <div style="padding:20px;text-align:center;">
        <div id="pp-portrait" style="width:80px;height:80px;font-size:48px;margin:0 auto 12px;border-radius:50%;overflow:hidden;"></div>
        <div id="pp-name"  style="font-family:'Cinzel',serif;font-size:18px;font-weight:600;color:#e8c96a;margin-bottom:4px;"></div>
        <div id="pp-level" style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.15em;color:#8a7fa0;margin-bottom:2px;"></div>
        <div id="pp-align" style="font-family:'Cinzel',serif;font-size:10px;color:#8a7fa0;margin-bottom:2px;"></div>
        <div id="pp-guild" style="font-family:'Cinzel',serif;font-size:10px;color:#8a7fa0;margin-bottom:16px;"></div>
        <div class="profile-action-btns">
          <button class="profile-action-btn attack" id="pp-attack-btn">⚡ Attack</button>
          <button class="profile-action-btn mail"   id="pp-mail-btn">✉️ Mail</button>
          <button class="profile-action-btn friend" id="pp-friend-btn">+ Friend</button>
        </div>
      </div>
    </div>`;

  /* Attach listeners after render */
  document.getElementById('social-search-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') searchPlayers();
  });
  document.getElementById('pp-close')?.addEventListener('click', () => {
    document.getElementById('player-profile-modal').style.display = 'none';
  });
  document.getElementById('conv-back')?.addEventListener('click', () => {
    document.getElementById('mail-conversation').style.display = 'none';
  });
  document.getElementById('conv-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMail();
  });
  document.getElementById('chat-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendChatMsg();
  });
}

/* ── Tab switch ── */
window.switchSocialTab = function(tab, el) {
  document.querySelectorAll('.social-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.social-panel').forEach(p => p.style.display = 'none');
  const panel = document.getElementById('social-panel-' + tab);
  if (panel) panel.style.display = tab === 'search' ? '' : 'flex';
  if (tab === 'chat') { if (window.listenChat) window.listenChat(); }
  if (tab === 'feed') { if (window.listenFeed) window.listenFeed(); }
  if (tab === 'mail') { if (window.renderMailInbox) window.renderMailInbox(); }
};

/* ══════════════════════════════════════
   PLAYER SEARCH
══════════════════════════════════════ */
window.searchPlayers = async function() {
  const input = document.getElementById('social-search-input');
  const term  = input?.value?.trim().toLowerCase(); if (!term) return;
  const el    = document.getElementById('social-search-results'); if (!el) return;
  el.innerHTML = '<div class="empty-state">Searching...</div>';

  const q    = query(collection(db,'players'),
    where('heroNameLower','>=',term),
    where('heroNameLower','<=',term+'\uf8ff'),
    limit(20));
  const snap = await getDocs(q);
  const me   = window.PLAYER_UID;

  if (snap.empty) { el.innerHTML = '<div class="empty-state">No players found.</div>'; return; }

  el.innerHTML = snap.docs
    .filter(d => d.id !== me)
    .map(d => {
      const p = d.data();
      const align = p.alignment === 'criminal' ? '🔴' : '🔵';
      return `<div class="social-player-row" onclick="viewPlayerProfile('${d.id}')">
        <div class="social-avatar-wrap">
          ${p.equippedCharacter
            ? `<img class="social-avatar-img" src="assets/characters/${p.gender==='female'?'females':'males'}/${p.equippedCharacter}.jpg" onerror="this.outerHTML='<div class=social-avatar-fallback>👤</div>'"/>`
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
  const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
  const d = await getDoc(doc(db,'players',uid));
  if (!d.exists()) { showToast('Player not found.'); return; }
  renderPlayerProfile(uid, d.data());
};

function renderPlayerProfile(uid, p) {
  const modal = document.getElementById('player-profile-modal'); if (!modal) return;
  const me    = window.PLAYER_UID;
  const isFriend = (window.PLAYER?.friends||[]).includes(uid);

  document.getElementById('pp-name').textContent  = p.heroName||'Unknown';
  document.getElementById('pp-level').textContent = `Lv.${p.level||1}`;
  document.getElementById('pp-align').textContent = p.alignment === 'criminal' ? '🔴 Criminal' : '🔵 Vigilante';
  document.getElementById('pp-guild').textContent = p.guildId ? `🏛️ Guild member` : 'No guild';

  const portEl = document.getElementById('pp-portrait');
  if (portEl) portEl.innerHTML = p.equippedCharacter
    ? `<img src="assets/characters/${p.gender==='female'?'females':'males'}/${p.equippedCharacter}.jpg" style="width:100%;height:100%;object-fit:cover;object-position:top;" onerror="this.outerHTML='👤'"/>`
    : '👤';

  document.getElementById('pp-friend-btn').textContent = isFriend ? '✅ Friends' : '+ Add Friend';
  document.getElementById('pp-friend-btn').onclick = async () => {
    if (isFriend) return;
    await window.updatePlayerField({ friends:[...(window.PLAYER?.friends||[]), uid] });
    showToast(`✅ ${p.heroName} added!`);
    document.getElementById('pp-friend-btn').textContent = '✅ Friends';
  };
  document.getElementById('pp-mail-btn').onclick = () => {
    modal.style.display = 'none';
    window.startMailTo && window.startMailTo(uid, p.heroName);
    /* Switch to mail tab */
    document.querySelectorAll('.social-tab').forEach((t,i) => t.classList.toggle('active', i===1));
    document.querySelectorAll('.social-panel').forEach(pp => pp.style.display='none');
    const mp = document.getElementById('social-panel-mail');
    if (mp) { mp.style.display='flex'; window.startMailTo && window.startMailTo(uid, p.heroName); }
  };
  document.getElementById('pp-attack-btn').style.display = uid !== me ? '' : 'none';
  document.getElementById('pp-attack-btn').onclick = () => {
    modal.style.display = 'none';
    window.initiatePVP && window.initiatePVP(uid, p);
  };

  modal.style.display = 'flex';
}

/* ── PVP ── */
window.initiatePVP = function(targetUid, targetPlayer) {
  const p = window.PLAYER; if (!p) return;
  if ((p.level||1) < 15 && !p.pvpEnabled) {
    const warn = document.getElementById('pvp-warning-modal');
    if (warn) {
      warn.style.display = 'flex';
      document.getElementById('pvp-warn-confirm').onclick = async () => {
        warn.style.display = 'none';
        await window.updatePlayerField({ pvpEnabled:true, pvpProtection:false });
        doPVP(targetUid, targetPlayer);
      };
    }
    return;
  }
  doPVP(targetUid, targetPlayer);
};

function doPVP(targetUid, targetPlayer) {
  showToast(`⚔️ Initiating PVP against ${targetPlayer.heroName}...`);
  window.openCombat && window.openCombat(null, {
    name:targetPlayer.heroName, emoji:'👤',
    hp:targetPlayer.hp||100, atk:Math.floor((targetPlayer.damage||50)*0.3),
    reward:50, isPVP:true, targetUid,
  });
}

/* ── Event hooks ── */
document.addEventListener('page-change', e => {
  if (e.detail.page === 'social') renderSocial();
});
document.addEventListener('player-ready', () => {
  /* pre-render so mail inbox is ready */
});
