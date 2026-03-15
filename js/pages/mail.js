// js/pages/mail.js
// Mail system — inbox for history + live chat per conversation
// Text + emoji reactions
// Sends via Firestore conversations collection

import { db }                    from '../../firebase-config.js';
import { collection, query, where,
         orderBy, onSnapshot, addDoc,
         doc, updateDoc, getDoc,
         serverTimestamp, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { showToast }               from '../core/modal.js';

const EMOJIS = ['❤️','😂','😮','😢','😡','👍'];
let activeConvId  = null;
let msgUnsub      = null;
let inboxUnsub    = null;

/* ══════════════════════════════════════
   INBOX
══════════════════════════════════════ */
export function openInbox() {
  document.getElementById('mail-inbox').style.display     = '';
  document.getElementById('mail-conversation').style.display = 'none';
  listenInbox();
}
window.openInbox = openInbox;

function listenInbox() {
  const me = window.PLAYER_UID; if (!me) return;
  const el = document.getElementById('inbox-list'); if (!el) return;

  if (inboxUnsub) { inboxUnsub(); inboxUnsub = null; }

  const q = query(
    collection(db,'conversations'),
    where('participants','array-contains', me),
    orderBy('lastAt','desc')
  );

  inboxUnsub = onSnapshot(q, snap => {
    if (snap.empty) { el.innerHTML = '<div class="mail-empty">No messages yet.</div>'; return; }
    el.innerHTML = snap.docs.map(d => {
      const c    = d.data();
      const other= c.participants?.find(p => p !== me) || '';
      const otherName = c.participantNames?.[other] || 'Unknown';
      const unread    = (c.unread||{})[me] > 0;
      return `<div class="inbox-row ${unread?'unread':''}" onclick="openConversation('${d.id}')">
        <div class="inbox-avatar">✉️</div>
        <div class="inbox-info">
          <div class="inbox-name">${otherName} ${unread?'<span class="inbox-dot"></span>':''}</div>
          <div class="inbox-preview">${c.lastMsg||'...'}</div>
        </div>
        <div class="inbox-time">${c.lastAt?.toDate ? timeAgo(c.lastAt.toDate()) : ''}</div>
      </div>`;
    }).join('');
  });
}

/* ══════════════════════════════════════
   CONVERSATION
══════════════════════════════════════ */
window.openConversation = function(convId) {
  activeConvId = convId;
  document.getElementById('mail-inbox').style.display        = 'none';
  document.getElementById('mail-conversation').style.display = '';
  listenMessages(convId);
};

function listenMessages(convId) {
  if (msgUnsub) { msgUnsub(); msgUnsub = null; }
  const q = query(
    collection(db,'conversations',convId,'messages'),
    orderBy('createdAt','asc'), limit(50)
  );
  const me = window.PLAYER_UID;
  msgUnsub = onSnapshot(q, snap => {
    const el = document.getElementById('conv-messages'); if (!el) return;
    el.innerHTML = snap.docs.map(d => {
      const m    = d.data();
      const isMe = m.from === me;
      const reactions = Object.entries(m.reactions||{}).map(([e,uids])=>
        uids.length ? `<span class="msg-reaction" onclick="addReaction('${convId}','${d.id}','${e}')">${e}${uids.length}</span>`:''
      ).join('');
      return `<div class="conv-msg ${isMe?'me':''}">
        <div class="conv-bubble">${m.text||''}</div>
        <div class="conv-reactions">${reactions}</div>
        <button class="conv-react-btn" onclick="showReactionPicker('${convId}','${d.id}')">＋😊</button>
        <div class="conv-time">${m.createdAt?.toDate ? timeAgo(m.createdAt.toDate()) : ''}</div>
      </div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;
  });
}

window.sendMail = async function() {
  const input = document.getElementById('conv-input');
  const text  = input?.value?.trim(); if (!text) return;
  const me    = window.PLAYER_UID; if (!me) return;

  await addDoc(collection(db,'conversations',activeConvId,'messages'),{
    from: me, text, createdAt: serverTimestamp(), reactions:{},
  });
  await updateDoc(doc(db,'conversations',activeConvId),{
    lastMsg: text, lastAt: serverTimestamp(),
  });
  if (input) input.value = '';
};

/* Start new conversation */
window.startMailTo = async function(targetUid, targetName) {
  const me   = window.PLAYER_UID; if (!me) return;
  const p    = window.PLAYER;
  /* Check existing convo */
  const q    = query(collection(db,'conversations'),
    where('participants','array-contains',me));
  const snap = await getDocs(q);
  const existing = snap.docs.find(d => d.data().participants?.includes(targetUid));
  if (existing) { openConversation(existing.id); return; }

  /* Create new */
  const ref = await addDoc(collection(db,'conversations'),{
    participants:     [me, targetUid],
    participantNames: { [me]: p.heroName, [targetUid]: targetName },
    lastMsg:'', lastAt: serverTimestamp(), unread:{},
  });
  openConversation(ref.id);
};

/* Emoji reactions */
window.showReactionPicker = function(convId, msgId) {
  const existing = document.getElementById('reaction-picker');
  if (existing) existing.remove();
  const picker = document.createElement('div');
  picker.id = 'reaction-picker';
  picker.className = 'reaction-picker';
  picker.innerHTML = EMOJIS.map(e =>
    `<span onclick="addReaction('${convId}','${msgId}','${e}');this.closest('#reaction-picker').remove()">${e}</span>`
  ).join('');
  document.body.appendChild(picker);
  setTimeout(() => picker.remove(), 4000);
};

window.addReaction = async function(convId, msgId, emoji) {
  const me  = window.PLAYER_UID; if (!me) return;
  const ref = doc(db,'conversations',convId,'messages',msgId);
  const snap= await getDoc(ref);
  if (!snap.exists()) return;
  const reactions = snap.data().reactions || {};
  const uids = reactions[emoji] || [];
  if (!uids.includes(me)) uids.push(me);
  await updateDoc(ref, { [`reactions.${emoji}`]: uids });
};

document.getElementById('conv-input')?.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMail(); }
});
document.getElementById('conv-back')?.addEventListener('click', openInbox);

function timeAgo(date) {
  if (!date) return '';
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff/60000);
  if (m < 1) return 'now'; if (m < 60) return `${m}m`;
  const h = Math.floor(m/60); if (h < 24) return `${h}h`;
  return `${Math.floor(h/24)}d`;
}

document.addEventListener('page-change', e => {
  if (e.detail.page === 'mail') openInbox();
});
