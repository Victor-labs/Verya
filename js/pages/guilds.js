// js/pages/guilds.js
// Guild system:
// - Free starter guild exists, first joiner becomes leader
// - Create custom guild: 2900 coins, name + pic + about
// - Max 20 members, leader only can kick
// - Monthly boosting charge starting 900 coins, increases over time
// - Pay = gold glowing border on name in member list
// - Refuse 10 times = auto boot (leader exempt)
// - Leader must assign new leader before leaving
// - Join = request sent to leader's mail
// - Recruitment on/off toggle
// - Guild chat separate from global chat

import { db }                        from '../../firebase-config.js';
import { collection, doc, getDoc,
         setDoc, updateDoc, addDoc,
         query, where, onSnapshot,
         getDocs, orderBy, limit,
         serverTimestamp, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { showToast, openModal }       from '../core/modal.js';

let guildChatUnsub = null;

/* ══════════════════════════════════════
   RENDER GUILDS PAGE
══════════════════════════════════════ */
export function renderGuilds() {
  const p  = window.PLAYER; if (!p) return;
  const el = document.getElementById('page-guilds'); if (!el) return;

  if (p.guildId) {
    renderMyGuild(el, p.guildId);
  } else {
    renderGuildHub(el);
  }
}

/* ── Guild hub — no guild yet ── */
function renderGuildHub(el) {
  el.innerHTML = `
    <div class="page-title">🏛️ Guilds</div>
    <div class="guild-hub-actions">
      <div class="guild-action-card" onclick="showCreateGuild()">
        <div class="guild-action-icon">⚔️</div>
        <div class="guild-action-info">
          <div class="guild-action-title">Create a Guild</div>
          <div class="guild-action-sub">🪙 2,900 coins · Set your own name, image and motto</div>
        </div>
        <div class="guild-action-arrow">›</div>
      </div>
      <div class="guild-action-card" onclick="showGuildSearch()">
        <div class="guild-action-icon">🔍</div>
        <div class="guild-action-info">
          <div class="guild-action-title">Find a Guild</div>
          <div class="guild-action-sub">Search and request to join existing guilds</div>
        </div>
        <div class="guild-action-arrow">›</div>
      </div>
      <div class="guild-action-card" onclick="joinStarterGuild()">
        <div class="guild-action-icon">🏠</div>
        <div class="guild-action-info">
          <div class="guild-action-title">Free Starter Guild</div>
          <div class="guild-action-sub">Join the default guild — first member becomes leader</div>
        </div>
        <div class="guild-action-arrow">›</div>
      </div>
    </div>
    <div class="guild-search-section" id="guild-search-section" style="display:none">
      <div class="guild-search-bar">
        <input class="guild-search-input" id="guild-search-input" type="text" placeholder="Search guild name..."/>
        <button class="guild-search-btn" onclick="searchGuilds()">Search</button>
      </div>
      <div id="guild-search-results"></div>
    </div>`;
}

/* ── Show create guild form ── */
window.showCreateGuild = function() {
  const p = window.PLAYER; if (!p) return;
  if ((p.gold||0) < 2900) { showToast('🪙 Need 2,900 coins to create a guild.'); return; }

  openModal({
    emoji: '🏛️',
    title: 'Create Guild',
    desc:  'Choose a name for your guild.',
    cost:  '🪙 2,900 Coins',
    confirmLabel: 'Create',
    input: true,
    inputPlaceholder: 'Guild name (max 24 chars)',
    inputMax: 24,
    onConfirm: async (name) => {
      if (!name || name.trim().length < 2) { showToast('Enter a valid guild name.'); return; }
      await createGuild(name.trim());
    }
  });
};

async function createGuild(name) {
  const p   = window.PLAYER; if (!p) return;
  const uid = window.PLAYER_UID;

  const guildRef = await addDoc(collection(db,'guilds'), {
    name,
    nameLower:    name.toLowerCase(),
    about:        'A new guild in Verya.',
    img:          null,
    leaderId:     uid,
    leaderName:   p.heroName,
    members:      [uid],
    memberNames:  { [uid]: p.heroName },
    memberBoosts: {},
    recruitOpen:  true,
    boostCost:    900,
    boostMonth:   new Date().getMonth(),
    createdAt:    serverTimestamp(),
    totalAssets:  p.gold || 0,
  });

  await window.updatePlayerField({
    gold:    (p.gold||0) - 2900,
    guildId: guildRef.id,
  });

  showToast(`🏛️ Guild "${name}" created!`);
  renderGuilds();
}

/* ── Join starter guild ── */
window.joinStarterGuild = async function() {
  const uid = window.PLAYER_UID;
  const p   = window.PLAYER;

  const starterRef  = doc(db,'guilds','starter-guild');
  const starterSnap = await getDoc(starterRef);

  if (!starterSnap.exists()) {
    /* Create starter guild, first player becomes leader */
    await setDoc(starterRef, {
      name:        'Wanderers',
      nameLower:   'wanderers',
      about:       'The default guild for new players.',
      img:         null,
      leaderId:    uid,
      leaderName:  p.heroName,
      members:     [uid],
      memberNames: { [uid]: p.heroName },
      memberBoosts:{},
      recruitOpen: true,
      boostCost:   900,
      boostMonth:  new Date().getMonth(),
      createdAt:   serverTimestamp(),
      totalAssets: 0,
    });
    showToast('🏛️ You founded the Wanderers guild!');
  } else {
    const data    = starterSnap.data();
    const members = data.members || [];
    if (members.length >= 20) { showToast('❌ Starter guild is full!'); return; }
    if (members.includes(uid)) { showToast('Already a member!'); return; }
    await updateDoc(starterRef, {
      members:    [...members, uid],
      [`memberNames.${uid}`]: p.heroName,
    });
    showToast('🏛️ Joined the Wanderers guild!');
  }

  await window.updatePlayerField({ guildId: 'starter-guild' });
  renderGuilds();
};

/* ── Search guilds ── */
window.showGuildSearch = function() {
  const sec = document.getElementById('guild-search-section');
  if (sec) sec.style.display = sec.style.display === 'none' ? '' : 'none';
};

window.searchGuilds = async function() {
  const input = document.getElementById('guild-search-input');
  const term  = input?.value?.trim().toLowerCase(); if (!term) return;
  const el    = document.getElementById('guild-search-results'); if (!el) return;
  el.innerHTML = '<div class="guild-loading">Searching...</div>';

  const q    = query(collection(db,'guilds'),
    where('nameLower','>=',term),
    where('nameLower','<=',term+'\uf8ff'),
    limit(10));
  const snap = await getDocs(q);

  if (snap.empty) { el.innerHTML = '<div class="guild-loading">No guilds found.</div>'; return; }

  el.innerHTML = snap.docs.map(d => {
    const g       = d.data();
    const members = (g.members||[]).length;
    const open    = g.recruitOpen !== false;
    return `<div class="guild-result-card">
      <div class="guild-result-info">
        <div class="guild-result-name">${g.name}</div>
        <div class="guild-result-sub">👑 ${g.leaderName} · 👥 ${members}/20 · ${open?'🟢 Open':'🔴 Closed'}</div>
        <div class="guild-result-about">${g.about||''}</div>
      </div>
      ${open && members < 20
        ? `<button class="guild-join-btn" onclick="requestJoinGuild('${d.id}','${g.leaderId}','${g.name}','${g.leaderName}')">Request</button>`
        : `<div class="guild-closed-tag">Closed</div>`}
    </div>`;
  }).join('');
};

/* ── Request to join guild ── */
window.requestJoinGuild = async function(guildId, leaderId, guildName, leaderName) {
  const p = window.PLAYER; if (!p) return;
  showToast(`📨 Join request sent to ${leaderName}!`);
  /* Send mail to guild leader */
  if (window.startMailTo) await window.startMailTo(leaderId, leaderName);
  /* Auto-send join request message */
  const { collection: col, addDoc: add, serverTimestamp: sts } =
    await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
};

/* ══════════════════════════════════════
   MY GUILD VIEW
══════════════════════════════════════ */
async function renderMyGuild(el, guildId) {
  const snap = await getDoc(doc(db,'guilds',guildId));
  if (!snap.exists()) {
    await window.updatePlayerField({ guildId: null });
    renderGuilds(); return;
  }

  const g      = snap.data();
  const uid    = window.PLAYER_UID;
  const p      = window.PLAYER;
  const isLeader = g.leaderId === uid;
  const members  = g.members || [];

  /* Check monthly boost due */
  checkBoostDue(g, guildId);

  el.innerHTML = `
    <div class="guild-banner">
      <div class="guild-banner-img" style="${g.img?`background-image:url('${g.img}')`:''}" ></div>
      <div class="guild-banner-overlay"></div>
      <div class="guild-banner-info">
        <div class="guild-banner-name">${g.name}</div>
        <div class="guild-banner-leader">👑 ${g.leaderName}</div>
        <div class="guild-banner-members">👥 ${members.length}/20 members</div>
      </div>
      ${isLeader ? `<button class="guild-edit-btn" onclick="openGuildEdit('${guildId}')">✏️</button>` : ''}
    </div>

    <div class="guild-about-row">
      <div class="guild-about-text">${g.about||'No description.'}</div>
    </div>

    <!-- Tabs -->
    <div class="guild-tabs">
      <div class="guild-tab active" data-tab="members" onclick="switchGuildTab('members',this)">Members</div>
      <div class="guild-tab"       data-tab="chat"    onclick="switchGuildTab('chat',this)">Guild Chat</div>
    </div>

    <!-- Members tab -->
    <div class="guild-tab-content active" id="guild-tab-members">
      <div class="guild-members-list">
        ${members.map(mid => {
          const name    = (g.memberNames||{})[mid] || 'Unknown';
          const boosted = (g.memberBoosts||{})[mid];
          const isLdr   = mid === g.leaderId;
          return `<div class="guild-member-row ${boosted?'boosted':''}">
            <div class="guild-member-info">
              <div class="guild-member-name">${isLdr?'👑 ':''}${name} ${boosted?'<span class="guild-boost-badge">⭐ Boosted</span>':''}</div>
            </div>
            ${isLeader && mid !== uid
              ? `<button class="guild-kick-btn" onclick="kickMember('${guildId}','${mid}','${name}')">Kick</button>`
              : ''}
          </div>`;
        }).join('')}
      </div>

      <!-- Leader controls -->
      ${isLeader ? `
        <div class="guild-leader-controls">
          <div class="guild-control-title">Leader Controls</div>
          <div class="guild-control-row">
            <span>Recruitment</span>
            <div class="settings-toggle ${g.recruitOpen!==false?'on':''}"
                 onclick="toggleRecruitment('${guildId}',${g.recruitOpen!==false})"></div>
          </div>
          <button class="guild-transfer-btn" onclick="openTransferLeader('${guildId}')">
            Transfer Leadership
          </button>
        </div>` : ''}

      <!-- Leave button -->
      <button class="guild-leave-btn" onclick="leaveGuild('${guildId}','${isLeader}')">
        ${isLeader ? '⚠️ Leave Guild (assign leader first)' : 'Leave Guild'}
      </button>
    </div>

    <!-- Chat tab -->
    <div class="guild-tab-content" id="guild-tab-chat">
      <div id="guild-chat-messages" class="guild-chat-messages"></div>
      <div class="guild-chat-input-row">
        <input class="guild-chat-input" id="guild-chat-input" type="text" placeholder="Message guild..."/>
        <button class="guild-chat-send-btn" onclick="sendGuildMessage('${guildId}')">➤</button>
      </div>
    </div>`;

  /* Start listening to guild chat when tab opened */
  document.getElementById('guild-chat-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendGuildMessage(guildId);
  });
}

/* ── Guild tabs ── */
window.switchGuildTab = function(tab, el) {
  document.querySelectorAll('.guild-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.guild-tab-content').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById(`guild-tab-${tab}`)?.classList.add('active');
  if (tab === 'chat') startGuildChat(window.PLAYER?.guildId);
};

/* ══════════════════════════════════════
   GUILD CHAT
══════════════════════════════════════ */
function startGuildChat(guildId) {
  if (guildChatUnsub) { guildChatUnsub(); guildChatUnsub = null; }
  const q = query(
    collection(db,'guilds',guildId,'chat'),
    orderBy('createdAt','asc'), limit(50)
  );
  const me = window.PLAYER_UID;
  guildChatUnsub = onSnapshot(q, snap => {
    const el = document.getElementById('guild-chat-messages'); if (!el) return;
    el.innerHTML = snap.docs.map(d => {
      const m    = d.data();
      const isMe = m.uid === me;
      return `<div class="guild-chat-msg ${isMe?'me':''}">
        <div class="guild-chat-name">${isMe?'You':m.heroName}</div>
        <div class="guild-chat-bubble">${m.text||''}</div>
      </div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;
  });
}

window.sendGuildMessage = async function(guildId) {
  const input = document.getElementById('guild-chat-input');
  const text  = input?.value?.trim(); if (!text) return;
  const p     = window.PLAYER; if (!p) return;

  await addDoc(collection(db,'guilds',guildId,'chat'), {
    uid:       window.PLAYER_UID,
    heroName:  p.heroName,
    text,
    createdAt: serverTimestamp(),
  });
  if (input) input.value = '';
};

/* ══════════════════════════════════════
   GUILD MANAGEMENT
══════════════════════════════════════ */
window.kickMember = function(guildId, memberId, memberName) {
  openModal({
    emoji:'⚔️', title:`Kick ${memberName}?`,
    desc:`Remove ${memberName} from the guild permanently.`,
    cost:null, confirmLabel:'Kick', danger:true,
    onConfirm: async () => {
      const ref  = doc(db,'guilds',guildId);
      const snap = await getDoc(ref); if (!snap.exists()) return;
      const g    = snap.data();
      const newMembers = (g.members||[]).filter(m => m !== memberId);
      const newNames   = { ...g.memberNames };
      delete newNames[memberId];
      await updateDoc(ref, { members: newMembers, memberNames: newNames });
      /* Remove guild from kicked player */
      const playerRef = doc(db,'players',memberId);
      await updateDoc(playerRef, { guildId: null });
      showToast(`⚔️ ${memberName} kicked.`);
      renderGuilds();
    }
  });
};

window.leaveGuild = function(guildId, isLeader) {
  if (isLeader === 'true' || isLeader === true) {
    showToast('⚠️ Assign a new leader before leaving.');
    return;
  }
  openModal({
    emoji:'🚪', title:'Leave Guild?',
    desc:'You will lose access to guild chat and resources.',
    cost:null, confirmLabel:'Leave', danger:true,
    onConfirm: async () => {
      const ref  = doc(db,'guilds',guildId);
      const snap = await getDoc(ref); if (!snap.exists()) return;
      const g    = snap.data();
      const uid  = window.PLAYER_UID;
      const newMembers = (g.members||[]).filter(m => m !== uid);
      const newNames   = { ...g.memberNames };
      delete newNames[uid];
      await updateDoc(ref, { members: newMembers, memberNames: newNames });
      await window.updatePlayerField({ guildId: null });
      showToast('🚪 Left the guild.');
      renderGuilds();
    }
  });
};

window.openTransferLeader = function(guildId) {
  openModal({
    emoji:'👑', title:'Transfer Leadership',
    desc:'Enter the hero name of the member to promote as leader.',
    cost:null, confirmLabel:'Transfer',
    input:true, inputPlaceholder:'Hero name',
    onConfirm: async (name) => {
      if (!name) return;
      const ref  = doc(db,'guilds',guildId);
      const snap = await getDoc(ref); if (!snap.exists()) return;
      const g    = snap.data();
      /* Find member by name */
      const entry = Object.entries(g.memberNames||{}).find(([,n]) => n.toLowerCase() === name.toLowerCase());
      if (!entry) { showToast('Player not found in guild.'); return; }
      await updateDoc(ref, { leaderId: entry[0], leaderName: entry[1] });
      showToast(`👑 Leadership transferred to ${entry[1]}!`);
      renderGuilds();
    }
  });
};

window.toggleRecruitment = async function(guildId, currentlyOpen) {
  await updateDoc(doc(db,'guilds',guildId), { recruitOpen: !currentlyOpen });
  showToast(`Recruitment ${!currentlyOpen ? 'opened' : 'closed'}.`);
  renderGuilds();
};

/* ── Guild edit (leader only) ── */
window.openGuildEdit = function(guildId) {
  openModal({
    emoji:'✏️', title:'Edit Guild About',
    desc:'Update your guild description.',
    cost:null, confirmLabel:'Save',
    input:true, inputPlaceholder:'Guild description...',
    inputMax: 120,
    onConfirm: async (text) => {
      if (!text) return;
      await updateDoc(doc(db,'guilds',guildId), { about: text });
      showToast('✅ Guild updated!');
      renderGuilds();
    }
  });
};

/* ══════════════════════════════════════
   MONTHLY BOOST
══════════════════════════════════════ */
function checkBoostDue(g, guildId) {
  const p         = window.PLAYER; if (!p) return;
  const uid       = window.PLAYER_UID;
  const isLeader  = g.leaderId === uid;
  if (isLeader) return; /* Leader never charged */

  const currentMonth = new Date().getMonth();
  if (g.boostMonth === currentMonth) return;

  const refusals = (g.memberRefusals||{})[uid] || 0;

  const el = document.getElementById('guild-boost-prompt');
  if (el) { el.remove(); }

  const prompt = document.createElement('div');
  prompt.id    = 'guild-boost-prompt';
  prompt.className = 'guild-boost-prompt';
  prompt.innerHTML = `
    <div class="guild-boost-title">🏛️ Monthly Guild Boosting</div>
    <div class="guild-boost-desc">Your payment due is <strong>🪙 ${g.boostCost}</strong> coins</div>
    <div class="guild-boost-warning">${refusals > 0 ? `⚠️ ${10-refusals} refusals remaining before auto-boot` : ''}</div>
    <div class="guild-boost-btns">
      <button onclick="payGuildBoost('${guildId}',${g.boostCost})">Pay Now</button>
      <button onclick="refuseGuildBoost('${guildId}')">No Thanks</button>
    </div>`;

  document.getElementById('page-guilds')?.prepend(prompt);
}

window.payGuildBoost = async function(guildId, cost) {
  const p   = window.PLAYER; if (!p) return;
  const uid = window.PLAYER_UID;
  if ((p.gold||0) < cost) { showToast('🪙 Not enough coins!'); return; }

  const gRef = doc(db,'guilds',guildId);
  const snap = await getDoc(gRef); if (!snap.exists()) return;
  const g    = snap.data();

  await updateDoc(gRef, {
    boostMonth:          new Date().getMonth(),
    boostCost:           Math.floor(g.boostCost * 1.1), /* Increases each month */
    [`memberBoosts.${uid}`]: true,
    [`memberRefusals.${uid}`]: 0,
  });
  await window.updatePlayerField({ gold: (p.gold||0) - cost });
  document.getElementById('guild-boost-prompt')?.remove();
  showToast('✅ Guild boost paid!');
  renderGuilds();
};

window.refuseGuildBoost = async function(guildId) {
  const uid  = window.PLAYER_UID;
  const gRef = doc(db,'guilds',guildId);
  const snap = await getDoc(gRef); if (!snap.exists()) return;
  const g    = snap.data();

  const refusals = ((g.memberRefusals||{})[uid]||0) + 1;

  if (refusals >= 10) {
    /* Auto-boot */
    const newMembers = (g.members||[]).filter(m => m !== uid);
    const newNames   = { ...g.memberNames }; delete newNames[uid];
    await updateDoc(gRef, { members:newMembers, memberNames:newNames, [`memberRefusals.${uid}`]:0 });
    await window.updatePlayerField({ guildId:null });
    showToast('❌ Auto-booted from guild after 10 refusals.');
    renderGuilds();
    return;
  }

  await updateDoc(gRef, { [`memberRefusals.${uid}`]: refusals, [`memberBoosts.${uid}`]: false });
  document.getElementById('guild-boost-prompt')?.remove();
  showToast(`⚠️ Refused. ${10-refusals} refusals remaining.`);
};

/* ── Event hooks ── */
document.addEventListener('page-change',  e => { if (e.detail.page === 'guilds') renderGuilds(); });
document.addEventListener('player-ready', () => renderGuilds());
