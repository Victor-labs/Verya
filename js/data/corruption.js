// js/data/corruption.js
// Corruption tier system + avatar options
// Export: CORRUPTION_TIERS, AVATAR_OPTS, getCorruptionTier(), getCorruptionTierIndex(), nextCorruptionTier()

export const CORRUPTION_TIERS = [
  { name:'Scum',       icon:'🪲', minBosses:0,   color:'#6b7280' },
  { name:'Filth',      icon:'🧟', minBosses:5,   color:'#7c6b21' },
  { name:'Tarnish',    icon:'🦠', minBosses:10,  color:'#856832' },
  { name:'Blight',     icon:'🌑', minBosses:18,  color:'#7e3b0e' },
  { name:'Rot',        icon:'💀', minBosses:28,  color:'#7f1d1d' },
  { name:'Decay',      icon:'🕸️', minBosses:40,  color:'#581c87' },
  { name:'Venom',      icon:'🐍', minBosses:55,  color:'#3b0764' },
  { name:'Plague',     icon:'☣️', minBosses:72,  color:'#4c1d95' },
  { name:'Pestilence', icon:'🌪️', minBosses:92,  color:'#1e1b4b' },
  { name:'Oblivion',   icon:'🕳️', minBosses:115, color:'#000000' },
];

export const AVATAR_OPTS = [
  '⚔️','🧙','🧝','🧛','🏹','🗡️','🛡️','👁️',
  '💀','🐉','🦅','🐺','🔮','⚡','🌙','🦁',
  '🐍','🦊','🌋','👑'
];

export function getCorruptionTier(bossCount) {
  let tier = CORRUPTION_TIERS[0];
  for (let i = CORRUPTION_TIERS.length - 1; i >= 0; i--) {
    if (bossCount >= CORRUPTION_TIERS[i].minBosses) { tier = CORRUPTION_TIERS[i]; break; }
  }
  return tier;
}

export function getCorruptionTierIndex(bossCount) {
  let idx = 0;
  for (let i = CORRUPTION_TIERS.length - 1; i >= 0; i--) {
    if (bossCount >= CORRUPTION_TIERS[i].minBosses) { idx = i; break; }
  }
  return idx;
}

export function nextCorruptionTier(bossCount) {
  const idx = getCorruptionTierIndex(bossCount);
  return idx < CORRUPTION_TIERS.length - 1 ? CORRUPTION_TIERS[idx + 1] : null;
}
