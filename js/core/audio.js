// js/core/audio.js
// fallenverya.mp3  — in-game background
// chat.mp3         — global chat page only
// Music starts automatically on first user interaction

let bgm       = null;
let chatMusic = null;
let bgmReady  = false;

function tryPlay(audio) {
  if (!audio) return;
  audio.play().catch(() => {});
}

function startBGM() {
  if (bgmReady) return;
  bgmReady = true;
  const s = window.PLAYER?.settings || {};
  if (s.music === false) return;
  bgm        = new Audio('assets/audio/fallenverya.mp3');
  bgm.loop   = true;
  bgm.volume = 0.4;
  tryPlay(bgm);
}

/* Start on ANY user interaction */
window.addEventListener('load', () => {
  document.addEventListener('click',      startBGM, { once: true });
  document.addEventListener('touchstart', startBGM, { once: true });
  document.addEventListener('keydown',    startBGM, { once: true });
});

/* Also try starting after player loads */
document.addEventListener('player-ready', () => {
  const s = window.PLAYER?.settings || {};
  if (s.music !== false) startBGM();
});

/* Settings toggle */
document.addEventListener('settings-changed', e => {
  if (e.detail?.key !== 'music') return;
  if (e.detail.value) {
    if (!bgm) {
      bgm = new Audio('assets/audio/fallenverya.mp3');
      bgm.loop = true; bgm.volume = 0.4;
    }
    tryPlay(bgm);
    bgmReady = true;
  } else {
    if (bgm) { bgm.pause(); bgm = null; bgmReady = false; }
  }
});

/* Chat music */
document.addEventListener('page-change', e => {
  if (e.detail?.page === 'chirp') {
    if (!chatMusic) {
      chatMusic = new Audio('assets/audio/chat.mp3');
      chatMusic.loop = true; chatMusic.volume = 0.35;
    }
    tryPlay(chatMusic);
  } else {
    if (chatMusic) { chatMusic.pause(); chatMusic = null; }
  }
});
