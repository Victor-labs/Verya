// js/core/audio.js
// Three audio tracks:
// - breakingdawn.mp3  → splash + login (handled in index.html)
// - fallenverya.mp3   → in-game background music
// - chat.mp3          → plays inside global chat
// Reads music toggle from settings
// Stops/starts on settings-changed event

const BGM_SRC  = 'assets/audio/fallenverya.mp3';
const CHAT_SRC = 'assets/audio/chat.mp3';

let bgm        = null;
let chatMusic  = null;
let bgmEnabled = false;

function createAudio(src, vol=0.4) {
  const a = new Audio(src);
  a.loop   = true;
  a.volume = vol;
  return a;
}

function tryPlay(audio) {
  if (!audio) return;
  audio.play().catch(()=>{});
}

/* ── Start bg music on first user interaction ── */
function startBGM() {
  if (!bgmEnabled || bgm) return;
  bgm = createAudio(BGM_SRC, 0.4);
  tryPlay(bgm);
}

document.addEventListener('click',     startBGM, { once:true });
document.addEventListener('touchstart',startBGM, { once:true });

/* ── React to player-ready (apply saved setting) ── */
document.addEventListener('player-ready', () => {
  const s = window.PLAYER?.settings || {};
  bgmEnabled = s.music !== false; /* default on */
  if (bgmEnabled) startBGM();
});

/* ── React to settings toggle ── */
document.addEventListener('settings-changed', e => {
  if (e.detail.key !== 'music') return;
  bgmEnabled = e.detail.value;
  if (bgmEnabled) {
    if (!bgm) bgm = createAudio(BGM_SRC, 0.4);
    tryPlay(bgm);
  } else {
    if (bgm) { bgm.pause(); bgm = null; }
  }
});

/* ── Chat music — play when entering global chat, stop on exit ── */
document.addEventListener('page-change', e => {
  if (e.detail.page === 'chirp') {
    if (!chatMusic) chatMusic = createAudio(CHAT_SRC, 0.35);
    tryPlay(chatMusic);
  } else {
    if (chatMusic) { chatMusic.pause(); chatMusic = null; }
  }
});

export { bgm };
