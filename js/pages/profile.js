// js/pages/profile.js
// Profile page — avatar, XP bar, vitals, combat stats, corruption, battle record, zone progress

import { ZONES }                                                        from '../data/zones.js';
import { AVATAR_OPTS, CORRUPTION_TIERS,
         getCorruptionTier, getCorruptionTierIndex, nextCorruptionTier } from '../data/corruption.js';
import { showToast }                                                     from '../core/modal.js';

const set  = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
const setW = (id, w) => { const el = document.getElementById(id); if (el) el.style.width  = w; };

function deriveStat(base, level, mult) { return base + Math.floor((level - 1) * mult); }

export function renderProfile() {
  const p = window.PLAYER; if (!p) return;

  const level     = p.level   || 1;
  const xp        = p.xp      || 0;
  const xpToNext  = level * 1000;
  const bosses    = p.totalBossKills || 0;
  const kills     = p.totalKills     || 0;
  const cleared   = p.clearedZones   || [];
  const goldEarned= p.goldEarned     || p.gold || 0;
  const avatar    = p.avatar         || '⚔️';

  /* Identity */
  set('prf-hero-name',  p.heroName  || 'Hero');
  set('prf-soul-class', p.soulClass || 'Wanderer');
  set('prf-badge-level','⚔️ Lvl ' + level);

  const curZone = ZONES.find(z => z.id === (p.currentZone || 'guild')) || ZONES[0];
  set('prf-badge-zone', curZone.emoji + ' ' + curZone.name);

  /* Avatar */
  set('prf-avatar', avatar);

  /* XP bar */
  setW('prf-xp-fill',  Math.min((xp / xpToNext) * 100, 100) + '%');
  set ('prf-xp-val',   `${xp} / ${xpToNext} XP`);
  set ('prf-xp-next',  `Next level: ${Math.max(0, xpToNext - xp)} XP needed`);

  /* Vitals */
  const hp = p.hp || 100, maxHp = p.maxHp || 100;
  const mp = p.mp || 50,  maxMp = p.maxMp  || 50;
  const st = p.stamina || 100, maxSt = p.maxStamina || 100;
  setW('prf-hp-fill', ((hp/maxHp)*100) + '%');
  setW('prf-mp-fill', ((mp/maxMp)*100) + '%');
  setW('prf-st-fill', ((st/maxSt)*100) + '%');
  set ('prf-hp-val',  `${hp}/${maxHp}`);
  set ('prf-mp-val',  `${mp}/${maxMp}`);
  set ('prf-st-val',  `${st}/${maxSt}`);

  /* Combat stats — scale with level, max ~260 at level 100 */
  const MAX_STAT = 260;
  const str = deriveStat(10, level, 2.5);
  const agi = deriveStat(10, level, 2.0);
  const int = deriveStat(10, level, 2.0);
  const end = deriveStat(10, level, 1.8);
  const lck = deriveStat(10, level, 1.2);
  set ('prf-str-val', str); setW('prf-str-fill', Math.min((str/MAX_STAT)*100,100)+'%');
  set ('prf-agi-val', agi); setW('prf-agi-fill', Math.min((agi/MAX_STAT)*100,100)+'%');
  set ('prf-int-val', int); setW('prf-int-fill', Math.min((int/MAX_STAT)*100,100)+'%');
  set ('prf-end-val', end); setW('prf-end-fill', Math.min((end/MAX_STAT)*100,100)+'%');
  set ('prf-lck-val', lck); setW('prf-lck-fill', Math.min((lck/MAX_STAT)*100,100)+'%');

  /* Corruption */
  const tier     = getCorruptionTier(bosses);
  const tierIdx  = getCorruptionTierIndex(bosses);
  const nextTier = nextCorruptionTier(bosses);
  set('prf-corr-icon',   tier.icon);
  set('prf-corr-rank',   tier.name);
  set('prf-corr-tier',   `Tier ${tierIdx + 1} / 10`);
  set('prf-corr-bosses', `${bosses} bosses slain`);
  set('prf-corr-next',   nextTier
    ? `Slay ${nextTier.minBosses - bosses} more bosses to reach ${nextTier.name}`
    : 'You have reached the pinnacle of corruption.');

  /* Corruption glow + avatar ring colour */
  const glowEl = document.getElementById('prf-corruption-glow');
  if (glowEl) glowEl.style.background = `radial-gradient(circle, ${tier.color}44, transparent 70%)`;
  const ringEl = document.getElementById('prf-avatar-ring');
  if (ringEl) ringEl.style.setProperty('--ring-color', tier.color);

  /* 10-segment corruption bar */
  const barEl = document.getElementById('prf-corr-bar');
  if (barEl) {
    barEl.innerHTML = Array.from({ length: 10 }, (_, s) => {
      const cls = s < tierIdx ? 'prf-corr-seg active' : s === tierIdx ? 'prf-corr-seg current' : 'prf-corr-seg';
      return `<div class="${cls}"></div>`;
    }).join('');
  }

  /* Battle record */
  set('prf-rec-kills',  kills);
  set('prf-rec-bosses', bosses);
  set('prf-rec-zones',  cleared.length);
  set('prf-rec-gold',   goldEarned);

  /* Zone progress list */
  const zonesListEl = document.getElementById('prf-zones-list');
  if (zonesListEl) {
    zonesListEl.innerHTML = ZONES.map(zone => {
      const isCleared  = cleared.includes(zone.id);
      const isCurrent  = zone.id === (p.currentZone || 'guild');
      const zoneKills  = isCurrent ? (p.kills || 0) : isCleared ? zone.enemyGoal : 0;
      const pct        = Math.min((zoneKills / zone.enemyGoal) * 100, 100);
      const statusText = isCleared ? 'Cleared' : isCurrent ? 'Active' : 'Locked';
      const fillColor  = isCleared ? '#2ecc71' : isCurrent ? '#c9a84c' : 'rgba(255,255,255,0.15)';
      return `<div class="prf-zone-row">
        <div class="prf-zone-emoji">${zone.emoji}</div>
        <div class="prf-zone-info">
          <div class="prf-zone-name">${zone.name}</div>
          <div class="prf-zone-prog-track">
            <div class="prf-zone-prog-fill" style="width:${pct}%;background:${fillColor}"></div>
          </div>
        </div>
        <div class="prf-zone-status ${statusText.toLowerCase()}">${statusText}</div>
      </div>`;
    }).join('');
  }

  set('prf-email', p.email || '—');
  renderAvatarPicker(avatar);
}

/* ── Avatar picker ── */
function renderAvatarPicker(current) {
  const gridEl = document.getElementById('prf-avatar-grid'); if (!gridEl) return;
  gridEl.innerHTML = AVATAR_OPTS.map(av =>
    `<div class="prf-av-opt${av === current ? ' selected' : ''}" onclick="selectAvatar('${av}')">${av}</div>`
  ).join('');
}

window.selectAvatar = function(av) {
  window.updatePlayerField({ avatar: av });
  set('prf-avatar', av);
  renderAvatarPicker(av);
  document.getElementById('prf-avatar-picker').style.display = 'none';
  showToast(`${av} Avatar updated!`);
};

document.getElementById('prf-avatar-btn').addEventListener('click', () => {
  const picker = document.getElementById('prf-avatar-picker');
  picker.style.display = picker.style.display === 'none' ? '' : 'none';
});

/* ── Event hooks ── */
document.addEventListener('page-change',    e => { if (e.detail.page === 'profile') renderProfile(); });
document.addEventListener('player-ready',   () => renderProfile());
document.addEventListener('player-updated', () => renderProfile());
