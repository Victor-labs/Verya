// js/pages/chirp.js
// Chirp — public social feed (AI posts every 2 days, like only)
// Global Chat — WhatsApp style, profile pic visible, reply support

import { db }                     from '../../firebase-config.js';
import { collection, query, orderBy,
         limit, onSnapshot, addDoc,
         updateDoc, doc, arrayUnion,
         serverTimestamp }         from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { showToast }               from '../core/modal.js';

let chirpTab      = 'feed';
let chatUnsub     = null;
let feedUnsub     = null;
let replyingTo    = null;

/* ── Tab switch ── */
window.switchChirpTab = function(tab) {
  chirpTab = tab;
  document.querySelectorAll('.chirp-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab));
  document.getElementById('chirp-feed-panel').style.display  = tab === 'feed'  ? '' : 'none';
  document.getElementById('chirp-chat-panel').style.display  = tab === 'chat'  ? '' : 'none';
  if (tab === 'feed') listenFeed();
  if (tab === 'chat') listenChat();
};

/* ══════════════════════════════════════
   FEED
══════════════════════════════════════ */
function listenFeed() {
  if (feedUnsub) return; /* already listening */
  const q = query(collection(db,'chirps'), orderBy('createdAt','desc'), limit(30));
  feedUnsub = onSnapshot(q, snap => {
    const el = document.getElementById('chirp-feed-list'); if (!el) return;
    const me = window.PLAYER_UID;
    el.innerHTML = snap.docs.map(d => {
      const c = d.data();
      const liked = (c.likes||[]).includes(me);
      return `<div class="chirp-post">
        <div class="chirp-post-header">
          <div class="chirp-post-avatar">🤖</div>
          <div class="chirp-post-meta">
            <div class="chirp-post-author">${c.author||'Verya AI'}</div>
            <div class="chirp-post-time">${timeAgo(c.createdAt?.toDate?.())}</div>
          </div>
        </div>
        <div class="chirp-post-text">${c.text||''}</div>
        <div class="chirp-post-actions">
          <button class="chirp-like-btn ${liked?'liked':''}"
            onclick="likeChirp('${d.id}')">
            ${liked?'❤️':'🤍'} ${(c.likes||[]).length}
          </button>
        </div>
      </div>`;
    }).join('');
  });
}

window.likeChirp = async function(chirpId) {
  const me = window.PLAYER_UID; if (!me) return;
  await updateDoc(doc(db,'chirps',chirpId), { likes: arrayUnion(me) });
  /* Mission tracking — react_chirp */
  const p = window.PLAYER;
  await window.updatePlayerField({ totalChirpLikes: (p.totalChirpLikes||0)+1 });
};

/* ══════════════════════════════════════
   GLOBAL CHAT
══════════════════════════════════════ */
function listenChat() {
  if (chatUnsub) return;
  const q = query(collection(db,'globalChat'), orderBy('createdAt','asc'), limit(60));
  chatUnsub = onSnapshot(q, snap => {
    const el = document.getElementById('chirp-chat-messages'); if (!el) return;
    const me = window.PLAYER_UID;
    el.innerHTML = snap.docs.map(d => {
      const m    = d.data();
      const isMe = m.uid === me;
      const char = m.characterImg
        ? `<img class="chat-avatar-img" src="${m.characterImg}"
               onerror="this.outerHTML='<div class=chat-avatar-fallback>👤</div>'"/>`
        : '<div class="chat-avatar-fallback">👤</div>';

      return `<div class="chat-msg ${isMe?'me':''}" id="msg-${d.id}">
        ${!isMe ? `<div class="chat-avatar" onclick="tapPlayerName('${m.uid}','${m.heroName}')">${char}</div>` : ''}
        <div class="chat-bubble-wrap">
          ${m.replyTo ? `<div class="chat-reply-preview">↩️ ${m.replyTo.text?.slice(0,40)||'...'}</div>` : ''}
          ${!isMe ? `<div class="chat-sender" onclick="tapPlayerName('${m.uid}','${m.heroName}')">${m.heroName||'?'}</div>` : ''}
          <div class="chat-bubble">${m.text||''}</div>
          <div class="chat-time">${timeAgo(m.createdAt?.toDate?.())}</div>
        </div>
        <button class="chat-reply-btn" onclick="setReply('${d.id}','${(m.text||'').replace(/'/g,"\\'")}')">↩</button>
      </div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;
  });
}

window.setReply = function(msgId, text) {
  replyingTo = { id:msgId, text };
  const preview = document.getElementById('chat-reply-bar');
  if (preview) {
    preview.style.display = '';
    preview.textContent   = `↩️ Replying: ${text.slice(0,40)}`;
  }
};

window.cancelReply = function() {
  replyingTo = null;
  const preview = document.getElementById('chat-reply-bar');
  if (preview) preview.style.display = 'none';
};

window.sendChatMsg = async function() {
  const input = document.getElementById('chat-input');
  const text  = input?.value?.trim();
  if (!text) return;
  const p     = window.PLAYER; if (!p) return;

  const charImg = p.equippedCharacter
    ? `assets/characters/${p.gender==='female'?'females':'males'}/${p.equippedCharacter}.jpg`
    : null;

  await addDoc(collection(db,'globalChat'),{
    uid:         window.PLAYER_UID,
    heroName:    p.heroName,
    characterImg:charImg,
    text,
    replyTo:     replyingTo,
    createdAt:   serverTimestamp(),
  });
  if (input) input.value = '';
  cancelReply();
};

/* Send on Enter key */
document.getElementById('chat-input')?.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMsg(); }
});

/* ── Tap player name anywhere → block/report popup ── */
window.tapPlayerName = function(uid, name) {
  if (!uid || uid === window.PLAYER_UID) return;
  const popup = document.getElementById('player-tap-popup');
  if (!popup) return;
  popup.dataset.uid  = uid;
  popup.dataset.name = name;
  document.getElementById('ptap-name').textContent = name;
  popup.style.display = 'flex';
};
document.getElementById('ptap-close')?.addEventListener('click', () => {
  document.getElementById('player-tap-popup').style.display = 'none';
});
document.getElementById('ptap-view')?.addEventListener('click', () => {
  const uid = document.getElementById('player-tap-popup').dataset.uid;
  document.getElementById('player-tap-popup').style.display = 'none';
  viewPlayerProfile(uid);
});
document.getElementById('ptap-block')?.addEventListener('click', async () => {
  const uid  = document.getElementById('player-tap-popup').dataset.uid;
  const name = document.getElementById('player-tap-popup').dataset.name;
  const p    = window.PLAYER;
  await window.updatePlayerField({ blockedUsers: [...(p.blockedUsers||[]), uid] });
  document.getElementById('player-tap-popup').style.display = 'none';
  showToast(`🚫 ${name} blocked.`);
});
document.getElementById('ptap-report')?.addEventListener('click', async () => {
  const uid  = document.getElementById('player-tap-popup').dataset.uid;
  const name = document.getElementById('player-tap-popup').dataset.name;
  document.getElementById('player-tap-popup').style.display = 'none';
  const p    = window.PLAYER;
  if (p.alignment === 'criminal') {
    showToast('🔴 You are a criminal. You cannot report to the CIA.');
  } else {
    showToast(`🔵 Thank you for reporting. Action will be taken if stars reach 6.`);
  }
});

/* ── Helpers ── */
function timeAgo(date) {
  if (!date) return '';
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff/60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}

/* ── Event hooks ── */
document.addEventListener('page-change', e => {
  if (e.detail.page === 'chirp') {
    chirpTab = 'feed';
    switchChirpTab('feed');
  }
});
