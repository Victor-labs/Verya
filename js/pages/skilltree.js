// js/pages/skilltree.js
// Skill tree — diamond block layout
// 5 skills, each with a unlock condition
// Unlocked = special title shown on profile
// Forex Trader: 50 stock trades
// Data Analyst: 50 player reports
// Assailant: 50 mob kills
// Cyber Elk: 50 player attacks
// Daemon: obtain all evil gear

import { showToast } from '../core/modal.js';

const SKILLS = [
  {
    id:       'forexTrader',
    title:    'Forex Trader',
    emoji:    '📈',
    desc:     'Master of the stock market. Trade 50 times to unlock.',
    condition:'50 stock market trades',
    field:    'totalTrades',
    target:   50,
  },
  {
    id:       'dataAnalyst',
    title:    'Data Analyst',
    emoji:    '🔎',
    desc:     'Eyes everywhere. Report 50 players to unlock.',
    condition:'50 player reports',
    field:    'totalReports',
    target:   50,
  },
  {
    id:       'assailant',
    title:    'Assailant',
    emoji:    '⚔️',
    desc:     'A force of destruction. Kill 50 enemies in combat.',
    condition:'50 mob kills',
    field:    'totalKills',
    target:   50,
  },
  {
    id:       'cyberElk',
    title:    'Cyber Elk',
    emoji:    '🦌',
    desc:     'Feared by players across Verya. Attack 50 players.',
    condition:'50 player attacks',
    field:    'totalPlayerAttacks',
    target:   50,
  },
  {
    id:       'daemon',
    title:    'Daemon',
    emoji:    '😈',
    desc:     'Consumed by darkness. Obtain all evil gear.',
    condition:'All evil gear obtained',
    field:    'evilGearCount',
    target:   7,
  },
];

/* Diamond layout positions (top, left as % of container) */
const POSITIONS = [
  { top:'0%',   left:'50%',  transform:'translate(-50%,0)'   },  /* top */
  { top:'35%',  left:'10%',  transform:'translate(0,-50%)'   },  /* left */
  { top:'35%',  left:'90%',  transform:'translate(-100%,-50%)' }, /* right */
  { top:'70%',  left:'25%',  transform:'translate(-50%,0)'   },  /* bottom-left */
  { top:'70%',  left:'75%',  transform:'translate(-50%,0)'   },  /* bottom-right */
];

export function renderSkillTree() {
  const p  = window.PLAYER; if (!p) return;
  const el = document.getElementById('page-skill-tree'); if (!el) return;

  const skillTree = p.skillTree || {};

  el.innerHTML = `
    <div class="page-title">🌳 Skill Tree</div>
    <div class="st-subtitle">Unlock titles by completing challenges</div>
    <div class="st-diamond-container" id="st-diamond-container">
      ${SKILLS.map((skill, i) => {
        const pos      = POSITIONS[i];
        const progress = Math.min(p[skill.field]||0, skill.target);
        const unlocked = skillTree[skill.id] || progress >= skill.target;
        const pct      = Math.floor((progress / skill.target) * 100);

        return `<div class="st-node ${unlocked?'unlocked':''}"
          style="top:${pos.top};left:${pos.left};transform:${pos.transform}"
          onclick="openSkillDetail('${skill.id}')">
          <div class="st-node-inner">
            <div class="st-node-emoji">${unlocked ? skill.emoji : '🔒'}</div>
            <div class="st-node-title">${skill.title}</div>
            ${!unlocked ? `<div class="st-node-progress">${pct}%</div>` : ''}
            ${unlocked ? '<div class="st-node-done">✅</div>' : ''}
          </div>
          ${!unlocked ? `
            <div class="st-node-bar">
              <div class="st-node-bar-fill" style="width:${pct}%"></div>
            </div>` : ''}
        </div>`;
      }).join('')}
      <!-- Connecting lines SVG -->
      <svg class="st-lines" viewBox="0 0 300 300" preserveAspectRatio="none">
        <line x1="150" y1="30"  x2="55"  y2="120" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <line x1="150" y1="30"  x2="245" y2="120" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <line x1="55"  y1="120" x2="100" y2="220" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <line x1="245" y1="120" x2="200" y2="220" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <line x1="100" y1="220" x2="200" y2="220" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      </svg>
    </div>

    <!-- Unlocked titles section -->
    <div class="st-titles-section">
      <div class="section-title">🏷️ Unlocked Titles</div>
      <div class="st-titles-list">
        ${SKILLS.filter(s => (p.skillTree||{})[s.id] || (p[s.field]||0) >= s.target)
          .map(s => `<div class="st-title-badge">${s.emoji} ${s.title}</div>`)
          .join('') || '<div class="empty-state">No titles yet. Complete challenges to unlock.</div>'}
      </div>
    </div>`;

  /* Check and auto-unlock any completed skills */
  checkAndUnlockSkills(p);
}

async function checkAndUnlockSkills(p) {
  const skillTree  = { ...(p.skillTree||{}) };
  let   changed    = false;

  SKILLS.forEach(skill => {
    if (!skillTree[skill.id] && (p[skill.field]||0) >= skill.target) {
      skillTree[skill.id] = true;
      changed = true;
      showToast(`🎉 Title unlocked: ${skill.title}!`);
    }
  });

  if (changed) {
    await window.updatePlayerField({ skillTree });
  }
}

window.openSkillDetail = function(skillId) {
  const p     = window.PLAYER; if (!p) return;
  const skill = SKILLS.find(s => s.id === skillId); if (!skill) return;
  const progress = Math.min(p[skill.field]||0, skill.target);
  const unlocked = (p.skillTree||{})[skill.id] || progress >= skill.target;

  openModal({
    emoji:        skill.emoji,
    title:        skill.title,
    desc:         `${skill.desc}\n\nProgress: ${progress} / ${skill.target}\nCondition: ${skill.condition}`,
    cost:         unlocked ? '✅ Unlocked — title active on your profile' : null,
    confirmLabel: 'Close',
    onConfirm:    () => {},
  });
};

/* ── Event hooks ── */
document.addEventListener('page-change',  e => { if (e.detail.page === 'skill-tree') renderSkillTree(); });
document.addEventListener('player-ready', () => renderSkillTree());
document.addEventListener('player-updated', () => {
  const pg = document.getElementById('page-skill-tree');
  if (pg?.classList.contains('active')) renderSkillTree();
});
