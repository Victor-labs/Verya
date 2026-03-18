// js/core/nav.js
// Navigation — exactly like image 2
// Bottom nav: two rows
// Row 1: Daily Login, City Center, Verya Net, Chirp, Craft
// Row 2: Characters, Inventory, Quests, Social, Profile
// Top bar: player name + level + XP bar + bell + hamburger
// Hamburger menu: Leaderboard, Skill Tree, Log Out, Settings, Account Details
// page-change event fires on every navigation

export function goToPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + name);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.page === name));

  document.dispatchEvent(new CustomEvent('page-change', { detail:{ page:name } }));
}
window.goToPage = goToPage;

/* ── Bottom nav clicks ── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => goToPage(btn.dataset.page));
  });

  /* Hamburger menu */
  document.getElementById('hamburger-btn')?.addEventListener('click', () => {
    const menu = document.getElementById('hamburger-menu');
    if (menu) menu.classList.toggle('open');
  });
  document.getElementById('hamburger-close')?.addEventListener('click', () => {
    document.getElementById('hamburger-menu')?.classList.remove('open');
  });
  /* Close menu when tapping outside */
  document.getElementById('hamburger-menu')?.addEventListener('click', e => {
    if (e.target === document.getElementById('hamburger-menu'))
      document.getElementById('hamburger-menu').classList.remove('open');
  });

  /* Notification bell */
  document.getElementById('bell-btn')?.addEventListener('click', () => {
    document.getElementById('notif-panel')?.classList.toggle('open');
  });
});

/* ── Update top bar ── */
function updateTopBar() {
  const p = window.PLAYER; if (!p) return;
  const nameEl  = document.getElementById('top-hero-name');
  const levelEl = document.getElementById('top-level');
  const xpFill  = document.getElementById('top-xp-fill');
  const goldEl  = document.getElementById('top-gold');
  const diamEl  = document.getElementById('top-diamonds');
  const energyEl= document.getElementById('top-energy');

  if (nameEl)   nameEl.textContent  = p.heroName || 'Hero';
  if (levelEl)  levelEl.textContent = `LV. ${p.level || 1}`;
  if (xpFill) {
    const pct = Math.min(((p.xp||0) / ((p.level||1) * 1000)) * 100, 100);
    xpFill.style.width = pct + '%';
  }
  if (goldEl)    goldEl.textContent    = (p.gold||0).toLocaleString();
  if (diamEl)    diamEl.textContent    = (p.diamonds||0).toLocaleString();
  if (energyEl)  energyEl.textContent  = p.energy||0;
}

document.addEventListener('player-ready',   updateTopBar);
document.addEventListener('player-updated', updateTopBar);
