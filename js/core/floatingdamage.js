// js/core/floatingdamage.js
// Floating damage numbers — appear over the enemy during combat
// Reads floatingDamage setting before showing
// Exported: spawnDamageNumber(amount, isCrit, isEnemy)

export function spawnDamageNumber(amount, isCrit = false, isEnemy = false) {
  /* Check setting */
  const s = window.getSettings?.() || {};
  if (!s.floatingDamage) return;

  const overlay = document.getElementById('combat-overlay');
  if (!overlay?.classList.contains('open')) return;

  const el       = document.createElement('div');
  el.className   = 'float-dmg' + (isCrit ? ' crit' : '') + (isEnemy ? ' enemy' : '');
  el.textContent = (isEnemy ? '-' : '') + amount;

  /* Anchor to enemy emoji position */
  const emojiEl  = document.getElementById('combat-enemy-emoji');
  const rect     = emojiEl
    ? emojiEl.getBoundingClientRect()
    : { left: window.innerWidth / 2, top: window.innerHeight * 0.3, width: 0 };

  /* Randomise horizontal spread */
  const spread   = (Math.random() - 0.5) * 60;
  el.style.left  = (rect.left + rect.width / 2 + spread) + 'px';
  el.style.top   = (rect.top  - 10) + 'px';

  document.body.appendChild(el);
  /* Remove after animation ends (0.9s) */
  setTimeout(() => el.remove(), 900);
}

/* Make globally available so combat.js can call without import issues */
window.spawnDamageNumber = spawnDamageNumber;
