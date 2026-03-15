// js/pages/combat.js
// Turn-based combat system — full screen takeover
// Player: Attack, Skill (MP cost), Flee
// Crit: 15% chance → double damage + flash
// Win: gold + XP + item drop chance + level up check
// Lose: respawn costs 1 diamond

import { showToast, openModal } from '../core/modal.js';
import { ZONES, currentZone }   from '../data/zones.js';
import { MARKET_ITEMS }         from '../data/items.js';

/* ── Combat state ── */
const CS = {
  active:     false,
  turnLocked: false,
  playerTurn: true,
  zone:       null,
  enemy:      null,   /* { name, emoji, hp, maxHp, atk, reward } */
  playerHp:   100,
  playerMp:   50,
  playerMaxHp:100,
  playerMaxMp:50,
};

/* ── Derived stats from player level ── */
function combatStats() {
  const lvl = window.PLAYER?.level || 1;
  return {
    atk:        10 + Math.floor((lvl - 1) * 2.5),
    def:        5  + Math.floor((lvl - 1) * 1.5),
    mpCost:     18,
    critChance: 0.15,
    skillMult:  1.8,
  };
}

/* ── Build enemy from zone data ── */
function buildEnemy(zone, enemyDef) {
  const zi  = ZONES.indexOf(zone);
  const hp  = (40 + zi * 30) + Math.floor(Math.random() * (20 + zi * 15));
  return {
    name:   enemyDef.name,
    emoji:  enemyDef.emoji,
    hp,
    maxHp:  hp,
    atk:    (6 + zi * 4) + Math.floor(Math.random() * (4 + zi * 2)),
    reward: enemyDef.reward,
  };
}

/* ── Open combat ── */
export function openCombat(zone, enemyDef) {
  const p = window.PLAYER; if (!p) return;
  CS.active       = true;
  CS.turnLocked   = false;
  CS.playerTurn   = true;
  CS.zone         = zone;
  CS.enemy        = buildEnemy(zone, enemyDef);
  CS.playerHp     = p.hp    || p.maxHp    || 100;
  CS.playerMp     = p.mp    || p.maxMp    || 50;
  CS.playerMaxHp  = p.maxHp || 100;
  CS.playerMaxMp  = p.maxMp || 50;

  document.getElementById('combat-result').classList.remove('show');
  document.getElementById('combat-zone-label').textContent = zone.name;

  renderEnemy();
  renderPlayer();
  clearLog();
  addLog(`⚔️ ${CS.enemy.emoji} ${CS.enemy.name} appears!`, 'system');
  setBtnsDisabled(false);

  document.getElementById('combat-overlay').classList.add('open');
  startCanvas();
}

/* Make openCombat globally accessible */
window.openCombat = openCombat;

/* ── Close combat ── */
function closeCombat() {
  document.getElementById('combat-overlay').classList.remove('open');
  CS.active = false;
  stopCanvas();
}

/* ── Render enemy ── */
function renderEnemy() {
  const e   = CS.enemy;
  const pct = Math.max(0, (e.hp / e.maxHp) * 100);
  document.getElementById('combat-enemy-emoji').textContent   = e.emoji;
  document.getElementById('combat-enemy-name').textContent    = e.name;
  document.getElementById('combat-enemy-type').textContent    = CS.zone.type;
  document.getElementById('combat-enemy-hp-fill').style.width = pct + '%';
  document.getElementById('combat-enemy-hp-text').textContent = `${e.hp} / ${e.maxHp}`;
}

/* ── Render player bars ── */
function renderPlayer() {
  const hpPct = Math.max(0, (CS.playerHp / CS.playerMaxHp) * 100);
  const mpPct = Math.max(0, (CS.playerMp / CS.playerMaxMp) * 100);
  document.getElementById('combat-hp-fill').style.width = hpPct + '%';
  document.getElementById('combat-mp-fill').style.width = mpPct + '%';
  document.getElementById('combat-hp-val').textContent  = `${CS.playerHp}/${CS.playerMaxHp}`;
  document.getElementById('combat-mp-val').textContent  = `${CS.playerMp}/${CS.playerMaxMp}`;
}

/* ── Battle log ── */
function addLog(msg, type = '') {
  const log = document.getElementById('combat-log');
  const div = document.createElement('div');
  div.className   = `log-line ${type}`;
  div.textContent = msg;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
  while (log.children.length > 20) log.removeChild(log.firstChild);
}
function clearLog() { document.getElementById('combat-log').innerHTML = ''; }

/* ── Button state ── */
function setBtnsDisabled(disabled) {
  ['combat-attack-btn','combat-skill-btn','combat-flee-btn'].forEach(id => {
    const el = document.getElementById(id); if (el) el.disabled = disabled;
  });
}

/* ── Crit flash ── */
function triggerCritFlash() {
  const el = document.getElementById('combat-crit-flash');
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
}

/* ══════════════════════════════════════
   PLAYER TURN
══════════════════════════════════════ */
function playerAttack(isSkill) {
  if (!CS.playerTurn || CS.turnLocked) return;
  const stats = combatStats();

  if (isSkill && CS.playerMp < stats.mpCost) {
    addLog('💧 Not enough MP for a skill!', 'system'); return;
  }
  if (isSkill) CS.playerMp -= stats.mpCost;

  const base   = stats.atk + Math.floor(Math.random() * (stats.atk * 0.5));
  const dmg    = isSkill ? Math.floor(base * stats.skillMult) : base;
  const isCrit = Math.random() < stats.critChance;
  const final  = isCrit ? dmg * 2 : dmg;

  CS.enemy.hp = Math.max(0, CS.enemy.hp - final);

  /* Shake animation */
  const emojiEl = document.getElementById('combat-enemy-emoji');
  emojiEl.classList.remove('hit');
  void emojiEl.offsetWidth;
  emojiEl.classList.add('hit');
  setTimeout(() => emojiEl.classList.remove('hit'), 350);

  if (isCrit) { triggerCritFlash(); addLog(`✨ CRITICAL HIT! You dealt ${final} damage!`, 'crit'); }
  else if (isSkill) addLog(`🔮 Skill strike! You dealt ${final} damage.`, 'player');
  else              addLog(`⚔️ You attacked for ${final} damage.`, 'player');

  /* Floating damage number */
  window.spawnDamageNumber?.(final, isCrit, false);

  renderEnemy(); renderPlayer();
  CS.turnLocked = true;
  setBtnsDisabled(true);

  if (CS.enemy.hp <= 0) {
    emojiEl.classList.add('dead');
    setTimeout(() => combatVictory(), 600);
    return;
  }
  setTimeout(() => enemyTurn(), 900);
}

/* ══════════════════════════════════════
   ENEMY TURN
══════════════════════════════════════ */
function enemyTurn() {
  const stats  = combatStats();
  const rawDmg = CS.enemy.atk + Math.floor(Math.random() * (CS.enemy.atk * 0.4));
  const isCrit = Math.random() < 0.08;
  const dmg    = Math.max(1, Math.floor(isCrit ? rawDmg * 1.6 : rawDmg) - stats.def);

  CS.playerHp = Math.max(0, CS.playerHp - dmg);

  if (isCrit) addLog(`💥 ${CS.enemy.name} landed a critical hit for ${dmg}!`, 'enemy');
  else        addLog(`🩸 ${CS.enemy.name} attacked you for ${dmg}.`, 'enemy');

  /* Floating damage number — negative, shown near player bars */
  window.spawnDamageNumber?.(dmg, isCrit, true);

  renderPlayer();

  if (CS.playerHp <= 0) { setTimeout(() => combatDefeat(), 500); return; }

  CS.playerTurn = true;
  CS.turnLocked = false;
  setBtnsDisabled(false);
  addLog('— Your turn —', 'system');
}

/* ══════════════════════════════════════
   FLEE
══════════════════════════════════════ */
document.getElementById('combat-flee-btn').addEventListener('click', () => {
  if (CS.turnLocked) return;
  if (Math.random() < 0.6) {
    addLog('💨 You fled the battle!', 'system');
    setBtnsDisabled(true);
    setTimeout(() => closeCombat(), 800);
  } else {
    addLog(`❌ Failed to flee! ${CS.enemy.name} blocks your path.`, 'system');
    CS.turnLocked = true;
    setBtnsDisabled(true);
    setTimeout(() => enemyTurn(), 700);
  }
});

/* ── Button listeners ── */
document.getElementById('combat-attack-btn').addEventListener('click', () => playerAttack(false));
document.getElementById('combat-skill-btn').addEventListener('click',  () => playerAttack(true));

/* ══════════════════════════════════════
   VICTORY
══════════════════════════════════════ */
function combatVictory() {
  const p       = window.PLAYER;
  const e       = CS.enemy;
  const zone    = CS.zone;
  const gold    = e.reward + Math.floor(Math.random() * Math.floor(e.reward * 0.3));
  const xp      = Math.floor(gold * 1.2);
  const newKills= (p.kills || 0) + 1;
  const cleared = [...(p.clearedZones || [])];

  const updates = {
    hp:         CS.playerHp,
    mp:         CS.playerMp,
    gold:       (p.gold       || 0) + gold,
    xp:         (p.xp         || 0) + xp,
    kills:      newKills,
    totalKills: (p.totalKills  || 0) + 1,
    goldEarned: (p.goldEarned  || 0) + gold,
  };

  /* Zone cleared */
  let zoneCleared = false;
  if (newKills >= zone.enemyGoal && !cleared.includes(zone.id)) {
    cleared.push(zone.id);
    updates.clearedZones   = cleared;
    updates.kills          = zone.enemyGoal;
    updates.totalBossKills = (p.totalBossKills || 0) + 1;
    zoneCleared = true;
  }

  /* Level up */
  const newXp    = (p.xp || 0) + xp;
  const xpToNext = (p.level || 1) * 1000;
  let levelText  = '';
  if (newXp >= xpToNext) {
    updates.level = (p.level || 1) + 1;
    updates.maxHp = (p.maxHp || 100) + 10;
    updates.maxMp = (p.maxMp || 50)  + 5;
    levelText = `🎉 LEVEL UP! Now level ${updates.level}!`;
  }

  /* 20% item drop */
  let dropHtml = '';
  const dropPool = ['hp-pot','mp-pot','bread','mon-mat','mag-crys'];
  if (Math.random() < 0.20) {
    const dropId  = dropPool[Math.floor(Math.random() * dropPool.length)];
    const dropDef = MARKET_ITEMS.find(i => i.id === dropId);
    if (dropDef) {
      const inv = [...(p.inventory || [])];
      const di  = inv.findIndex(i => i.id === dropId);
      if (di >= 0) inv[di] = { id: dropId, uses: dropDef.maxUses };
      else         inv.push({ id: dropId, uses: dropDef.maxUses });
      updates.inventory = inv;
      dropHtml = `${dropDef.emoji} ${dropDef.name} dropped!`;
    }
  }

  window.updatePlayerField(updates);

  /* Build result UI */
  document.getElementById('result-rewards').innerHTML =
    `<div class="result-reward-row"><span class="result-reward-label">Gold Earned</span><span class="result-reward-val">🪙 +${gold}</span></div>` +
    `<div class="result-reward-row"><span class="result-reward-label">XP Earned</span><span class="result-reward-val">⭐ +${xp}</span></div>` +
    (zoneCleared ? `<div class="result-reward-row"><span class="result-reward-label">Zone Status</span><span class="result-reward-val" style="color:#2ecc71">✅ Cleared!</span></div>` : '') +
    (levelText   ? `<div class="result-reward-row"><span class="result-reward-val" style="color:var(--gold-l)">${levelText}</span></div>` : '');

  const dropEl = document.getElementById('result-drop');
  if (dropHtml) { dropEl.textContent = dropHtml; dropEl.style.display = ''; }
  else            dropEl.style.display = 'none';

  document.getElementById('result-emoji').textContent = '🏆';
  document.getElementById('result-title').textContent = 'Victory!';
  document.getElementById('result-title').className   = 'result-title';
  const rb = document.getElementById('result-btn');
  rb.textContent = 'Continue'; rb.className = 'result-btn';
  rb.onclick = () => closeCombat();
  document.getElementById('combat-result').classList.add('show');
}

/* ══════════════════════════════════════
   DEFEAT
══════════════════════════════════════ */
function combatDefeat() {
  document.getElementById('result-rewards').innerHTML =
    `<div class="result-reward-row"><span class="result-reward-label">You were defeated...</span><span class="result-reward-val" style="color:#ef4444">💔 HP: 0</span></div>` +
    `<div class="result-reward-row"><span class="result-reward-label">Respawn Cost</span><span class="result-reward-val">💎 1 Diamond</span></div>`;

  document.getElementById('result-drop').style.display  = 'none';
  document.getElementById('result-emoji').textContent   = '💀';
  document.getElementById('result-title').textContent   = 'Defeated';
  document.getElementById('result-title').className     = 'result-title defeat';
  const rb = document.getElementById('result-btn');
  rb.textContent = 'Respawn (💎 1)'; rb.className = 'result-btn danger';
  rb.onclick = () => {
    const p = window.PLAYER;
    if ((p.diamonds || 0) < 1) { showToast('💎 Not enough diamonds!'); return; }
    window.updatePlayerField({ hp: p.maxHp||100, mp: p.maxMp||50, diamonds: (p.diamonds||0) - 1 });
    closeCombat();
    showToast('💎 Respawned!');
  };
  document.getElementById('combat-result').classList.add('show');
}

/* ══════════════════════════════════════
   ATMOSPHERIC CANVAS
══════════════════════════════════════ */
const cvs = document.getElementById('combat-canvas');
const ctx = cvs.getContext('2d');
let animId = null, t = 0;

function startCanvas() {
  cvs.width  = window.innerWidth;
  cvs.height = window.innerHeight;
  function tick() {
    t += 0.015;
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    const W = cvs.width, H = cvs.height;
    [
      [W*0.15, H*0.2,  W*0.4,  230, 40, 10],
      [W*0.8,  H*0.7,  W*0.35, 10,  40, 200],
    ].forEach(([x, y, r, hue, sat, lgt]) => {
      const a = 0.04 + Math.sin(t * 1.2) * 0.015;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `hsla(${hue},${sat}%,${lgt}%,${a})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    });
    animId = requestAnimationFrame(tick);
  }
  tick();
}

function stopCanvas() {
  if (animId) { cancelAnimationFrame(animId); animId = null; }
}
