// js/pages/combat.js
// Full combat rebuild with timing bar pin mechanic
// Green = full damage, Yellow = half damage + enemy hits back, Red = fumble
// Pin speed increases per zone danger level
// Player HP/MP bars, 2 ability slots, 3 quick inventory slots
// Multi-mob support, boss as final mob
// Death = half rewards, must revive at Medic Center
// Forfeit = lose all rewards

import { showToast }         from '../core/modal.js';
import { ZONES, getZoneById, rollZoneItems } from '../data/zones.js';
import { getItemDef }        from '../data/items.js';
import { getCharacter }      from '../data/characters.js';

/* ── Combat state ── */
const CS = {
  active:      false,
  zone:        null,
  enemies:     [],      /* queue of enemies for this encounter */
  currentIdx:  0,
  enemy:       null,
  playerHp:    100,
  playerMp:    50,
  playerMaxHp: 100,
  playerMaxMp: 50,
  rewards:     { gold:0, xp:0, items:[] },
  isPVP:       false,
  targetUid:   null,
  pinRunning:  false,
  pinPos:      0,       /* 0-100 */
  pinDir:      1,
  pinSpeed:    1.2,
  animId:      null,
};

/* ── Pin speed per danger level ── */
const DANGER_SPEED = {
  'Low':       0.8,
  'Medium':    1.2,
  'High':      1.6,
  'Very High': 2.0,
  'Extreme':   2.5,
  'Deadly':    3.0,
  '💀 OBLIVION': 3.8,
};

/* ── Derived stats from player level + equipped gear ── */
function playerStats() {
  const p   = window.PLAYER;
  const lvl = p?.level || 1;
  const eq  = p?.equipped || {};
  let str=10, def=5, spd=10, lck=10, mag=10, vit=0, end=0;

  /* Base scaling */
  str += Math.floor((lvl-1)*2.5);
  def += Math.floor((lvl-1)*1.5);
  spd += Math.floor((lvl-1)*1.2);
  lck += Math.floor((lvl-1)*1.0);
  mag += Math.floor((lvl-1)*2.0);

  /* Add gear bonuses */
  Object.values(eq).forEach(itemId => {
    const def_ = getItemDef(itemId); if (!def_) return;
    const fx   = def_.effect || '';
    const n    = v => { const m=fx.match(/\+(\d+)/); return m?parseInt(m[1]):0; };
    if (fx.includes('Attack') && !fx.includes('Magic')) str += n();
    if (fx.includes('Defense'))  def += n();
    if (fx.includes('Agility'))  spd += n();
    if (fx.includes('Luck'))     lck += n();
    if (fx.includes('Magic'))    mag += n();
    if (fx.includes('HP'))       vit += n();
    if (fx.includes('Stamina'))  end += n();
  });

  return {
    atk:        str,
    def:        def,
    critChance: Math.min(0.05 + lck * 0.003, 0.40),
    mpCost:     18,
    skillMult:  1.8,
  };
}

/* ── Build enemy ── */
function buildEnemy(enemyDef, zone) {
  const zi = zone ? ZONES.indexOf(zone) : 0;
  return {
    name:   enemyDef.name,
    emoji:  enemyDef.emoji,
    hp:     enemyDef.hp,
    maxHp:  enemyDef.hp,
    atk:    enemyDef.atk,
    reward: enemyDef.reward,
  };
}

/* ══════════════════════════════════════
   OPEN COMBAT
══════════════════════════════════════ */
window.openCombat = function(zone, enemyDef, options={}) {
  const p = window.PLAYER; if (!p) return;
  CS.active      = true;
  CS.zone        = zone;
  CS.isPVP       = options.isPVP || false;
  CS.targetUid   = options.targetUid || null;
  CS.currentIdx  = 0;
  CS.rewards     = { gold:0, xp:0, items:[] };
  CS.playerHp    = p.hp    || p.maxHp    || 100;
  CS.playerMp    = p.mp    || p.maxMp    || 50;
  CS.playerMaxHp = p.maxHp || 100;
  CS.playerMaxMp = p.maxMp || 50;

  /* Build enemy queue — single enemy for PVP, zone enemies for normal */
  if (CS.isPVP) {
    CS.enemies = [enemyDef];
  } else {
    CS.enemies = [buildEnemy(enemyDef, zone)];
  }
  CS.enemy = CS.enemies[0];

  /* Pin speed from zone danger */
  const danger = zone?.danger || 'Low';
  CS.pinSpeed  = DANGER_SPEED[danger] || 1.2;

  renderCombatUI();
  document.getElementById('combat-overlay')?.classList.add('open');
  startCombatCanvas();
  resetPin();
  addLog(`⚔️ ${CS.enemy.emoji} ${CS.enemy.name} appears!`, 'system');
};

/* ── Close combat ── */
function closeCombat() {
  stopPin();
  stopCombatCanvas();
  document.getElementById('combat-overlay')?.classList.remove('open');
  document.getElementById('combat-result')?.classList.remove('show');
  CS.active = false;
}

/* ══════════════════════════════════════
   RENDER COMBAT UI
══════════════════════════════════════ */
function renderCombatUI() {
  const p = window.PLAYER; if (!p) return;

  /* Zone label */
  const zl = document.getElementById('combat-zone-label');
  if (zl) zl.textContent = CS.zone?.name || 'PVP Battle';

  /* Enemy */
  renderEnemy();
  /* Player bars */
  renderPlayerBars();
  /* Ability slots */
  renderAbilitySlots();
  /* Quick inventory */
  renderQuickInventory();
  /* Clear log */
  clearLog();
  /* Enable pin tap */
  setCombatBtnsDisabled(false);
}

function renderEnemy() {
  const e   = CS.enemy; if (!e) return;
  const pct = Math.max(0, (e.hp / e.maxHp) * 100);
  const emojiEl = document.getElementById('combat-enemy-emoji');
  const nameEl  = document.getElementById('combat-enemy-name');
  const hpFill  = document.getElementById('combat-enemy-hp-fill');
  const hpText  = document.getElementById('combat-enemy-hp-text');
  if (emojiEl) emojiEl.textContent    = e.emoji;
  if (nameEl)  nameEl.textContent     = e.name;
  if (hpFill)  hpFill.style.width    = pct + '%';
  if (hpText)  hpText.textContent    = `${e.hp} / ${e.maxHp}`;
}

function renderPlayerBars() {
  const hpPct = Math.max(0, (CS.playerHp / CS.playerMaxHp) * 100);
  const mpPct = Math.max(0, (CS.playerMp / CS.playerMaxMp) * 100);
  const hpFill = document.getElementById('combat-hp-fill');
  const mpFill = document.getElementById('combat-mp-fill');
  const hpVal  = document.getElementById('combat-hp-val');
  const mpVal  = document.getElementById('combat-mp-val');
  if (hpFill) hpFill.style.width = hpPct + '%';
  if (mpFill) mpFill.style.width = mpPct + '%';
  if (hpVal)  hpVal.textContent  = `${CS.playerHp}/${CS.playerMaxHp}`;
  if (mpVal)  mpVal.textContent  = `${CS.playerMp}/${CS.playerMaxMp}`;
}

function renderAbilitySlots() {
  const p       = window.PLAYER; if (!p) return;
  const slots   = p.equippedAbilities || [];
  [0,1].forEach(i => {
    const slotEl = document.getElementById(`combat-ability-${i+1}`);
    if (!slotEl) return;
    const charId = slots[i];
    const char   = charId ? getCharacter(charId) : null;
    if (char?.abilityImg) {
      slotEl.innerHTML = `<img src="${char.abilityImg}" class="combat-ability-img"
        onerror="this.style.opacity='0.3'"/>
        <div class="combat-ability-name">${char.name}</div>`;
      slotEl.onclick = () => useAbility(charId, i);
      slotEl.classList.remove('empty');
    } else {
      slotEl.innerHTML = `<div class="combat-ability-empty">—</div>`;
      slotEl.onclick   = null;
      slotEl.classList.add('empty');
    }
  });
}

function renderQuickInventory() {
  const p   = window.PLAYER; if (!p) return;
  const inv = p.inventory || [];
  /* Show first 3 consumable items */
  const consumables = inv.filter(item => {
    const def = getItemDef(item.id);
    return def && (def.cat === 'potions' || def.cat === 'food');
  }).slice(0,3);

  [0,1,2].forEach(i => {
    const slotEl = document.getElementById(`quick-slot-${i+1}`);
    if (!slotEl) return;
    const item = consumables[i];
    const def  = item ? getItemDef(item.id) : null;
    if (def) {
      slotEl.innerHTML = `
        <img src="${def.icon}" class="quick-slot-img"
             onerror="this.outerHTML='<div class=quick-slot-emoji>${def.cat==='potions'?'🧪':'🍖'}</div>'"/>
        <div class="quick-slot-uses">${item.uses}</div>`;
      slotEl.onclick = () => useQuickItem(item.id);
    } else {
      slotEl.innerHTML = `<div class="quick-slot-empty">+</div>`;
      slotEl.onclick   = null;
    }
  });
}

/* ══════════════════════════════════════
   TIMING BAR PIN MECHANIC
══════════════════════════════════════ */
function resetPin() {
  CS.pinPos = 0;
  CS.pinDir = 1;
  updatePinDisplay();
}

function startPin() {
  if (CS.pinRunning) return;
  CS.pinRunning = true;
  function tick() {
    if (!CS.pinRunning) return;
    CS.pinPos += CS.pinDir * CS.pinSpeed;
    if (CS.pinPos >= 100) { CS.pinPos = 100; CS.pinDir = -1; }
    if (CS.pinPos <= 0)   { CS.pinPos = 0;   CS.pinDir = 1;  }
    updatePinDisplay();
    CS.animId = requestAnimationFrame(tick);
  }
  CS.animId = requestAnimationFrame(tick);
}

function stopPin() {
  CS.pinRunning = false;
  if (CS.animId) { cancelAnimationFrame(CS.animId); CS.animId = null; }
}

function updatePinDisplay() {
  const pin = document.getElementById('combat-pin');
  if (pin) pin.style.left = CS.pinPos + '%';
  /* Update zone colour on bar */
  const bar  = document.getElementById('combat-timing-bar');
  if (!bar) return;
}

/* ── Determine hit zone ── */
function getHitZone(pos) {
  /* Green: 40-60, Yellow: 25-40 or 60-75, Red: 0-25 or 75-100 */
  if (pos >= 40 && pos <= 60) return 'green';
  if ((pos >= 25 && pos < 40) || (pos > 60 && pos <= 75)) return 'yellow';
  return 'red';
}

/* ── ATTACK — player taps timing bar ── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('combat-timing-bar')?.addEventListener('click', () => {
    if (!CS.active || !CS.pinRunning) return;
    stopPin();
    const zone = getHitZone(CS.pinPos);
    executeAttack(zone, false);
  });

  /* Skill button */
  document.getElementById('combat-skill-btn')?.addEventListener('click', () => {
    if (!CS.active) return;
    executeSkillAttack();
  });

  /* Forfeit */
  document.getElementById('combat-forfeit-btn')?.addEventListener('click', () => {
    if (!CS.active) return;
    openModal({
      emoji:'🏳️', title:'Forfeit Battle?',
      desc:'You will lose ALL rewards from this battle.',
      cost:null, confirmLabel:'Forfeit',
      danger:true,
      onConfirm: () => {
        addLog('🏳️ You forfeited the battle.','system');
        setTimeout(() => {
          closeCombat();
          import('../core/nav.js').then(m => m.goToPage('home'));
        }, 600);
      }
    });
  });
});

function executeAttack(hitZone, isSkill) {
  const stats  = playerStats();
  const e      = CS.enemy;
  let   damage = 0;
  let   enemyRetaliates = false;

  if (hitZone === 'green') {
    const base   = stats.atk + Math.floor(Math.random() * stats.atk * 0.3);
    const isCrit = Math.random() < stats.critChance;
    damage       = isSkill ? Math.floor(base * stats.skillMult) : base;
    if (isCrit) { damage *= 2; triggerCritFlash(); addLog(`✨ CRITICAL! You dealt ${damage} damage!`,'crit'); }
    else addLog(`${isSkill?'🔮 Skill':'⚔️'} hit! ${damage} damage.`,'player');
    /* Spawn floating number */
    spawnFloatingDmg(damage, isCrit, false);
  } else if (hitZone === 'yellow') {
    const base   = stats.atk + Math.floor(Math.random() * stats.atk * 0.3);
    damage       = Math.floor((isSkill ? base * stats.skillMult : base) * 0.5);
    enemyRetaliates = true;
    addLog(`😬 Glancing blow! ${damage} damage. Enemy retaliates!`,'system');
    spawnFloatingDmg(damage, false, false);
  } else {
    damage = 0;
    enemyRetaliates = true;
    addLog(`❌ Fumble! You missed. Enemy retaliates!`,'system');
  }

  e.hp = Math.max(0, e.hp - damage);
  CS.rewards.gold += e.reward ? Math.floor(e.reward * (damage / Math.max(e.maxHp,1)) * 0.5) : 0;

  renderEnemy();
  setCombatBtnsDisabled(true);

  if (e.hp <= 0) {
    /* Shake enemy dead */
    const emojiEl = document.getElementById('combat-enemy-emoji');
    emojiEl?.classList.add('dead');
    setTimeout(() => onEnemyDefeated(), 600);
    return;
  }

  if (enemyRetaliates) {
    setTimeout(() => enemyAttack(), 800);
  } else {
    setTimeout(() => {
      setCombatBtnsDisabled(false);
      resetPin(); startPin();
      addLog('— Tap the bar to attack —','system');
    }, 600);
  }
}

function executeSkillAttack() {
  const stats = playerStats();
  if (CS.playerMp < stats.mpCost) { showToast('💧 Not enough MP!'); return; }
  CS.playerMp -= stats.mpCost;
  renderPlayerBars();
  stopPin();
  executeAttack('green', true);
}

/* ── Enemy attacks back ── */
function enemyAttack() {
  const stats  = playerStats();
  const e      = CS.enemy;
  const raw    = e.atk + Math.floor(Math.random() * e.atk * 0.3);
  const isCrit = Math.random() < 0.08;
  const dmg    = Math.max(1, Math.floor(isCrit ? raw * 1.6 : raw) - stats.def);

  CS.playerHp = Math.max(0, CS.playerHp - dmg);

  if (isCrit) addLog(`💥 ${e.name} critical hit! ${dmg} damage!`,'enemy');
  else        addLog(`🩸 ${e.name} hit you for ${dmg}.`,'enemy');

  spawnFloatingDmg(dmg, isCrit, true);
  renderPlayerBars();

  if (CS.playerHp <= 0) { setTimeout(() => combatDefeat(), 500); return; }

  setTimeout(() => {
    setCombatBtnsDisabled(false);
    resetPin(); startPin();
    addLog('— Tap the bar to attack —','system');
  }, 700);
}

/* ── Use ability ── */
function useAbility(charId, slotIdx) {
  const p    = window.PLAYER; if (!p) return;
  const char = getCharacter(charId); if (!char?.abilityDesc) return;

  /* Check cooldown */
  const cooldowns = p.abilityCooldowns || {};
  const lastUsed  = cooldowns[charId] || 0;
  const cooldownMs= (char.cooldown || 40) * 60 * 1000;
  if (Date.now() - lastUsed < cooldownMs) {
    const remaining = Math.ceil((cooldownMs - (Date.now()-lastUsed)) / 60000);
    showToast(`⏱ ${char.name}'s ability on cooldown — ${remaining}min remaining`);
    return;
  }

  addLog(`⚡ ${char.name}'s ability activated!`,'crit');
  applyAbilityEffect(char);

  /* Set cooldown */
  window.updatePlayerField({ abilityCooldowns: { ...cooldowns, [charId]: Date.now() } });
}

function applyAbilityEffect(char) {
  const e = CS.enemy;
  switch(char.id) {
    case 'kael':    { const d=Math.floor(e.maxHp*1.9); e.hp=Math.max(0,e.hp-d); addLog(`💥 Energy Blast! ${d} damage!`,'crit'); break; }
    case 'drex':    { const d=Math.floor(e.maxHp*2.3); e.hp=Math.max(0,e.hp-d); addLog(`💀 Death Surge! ${d} damage!`,'crit'); break; }
    case 'lucian':  { const d=Math.floor(e.maxHp*1.6); e.hp=Math.max(0,e.hp-d); addLog(`🌟 Light Ball! ${d} damage!`,'crit'); break; }
    case 'natasha': { const d=Math.floor(e.maxHp*2.3); e.hp=Math.max(0,e.hp-d); addLog(`🏹 Hagabani Strike! ${d} damage!`,'crit'); break; }
    case 'mami':    { const d=Math.floor(e.maxHp*6.0); e.hp=Math.max(0,e.hp-d); addLog(`🔆 Beam Storm! ${d} damage!`,'crit'); break; }
    case 'yuji':    { const d=Math.floor(e.maxHp*5.0); e.hp=Math.max(0,e.hp-d); addLog(`💀 Death Zone! ${d} damage!`,'crit'); break; }
    case 'zephyr': case 'aria': {
      CS.playerHp = CS.playerMaxHp;
      addLog(`💚 Full HP restored!`,'player');
      renderPlayerBars(); break;
    }
    case 'aether':  { addLog(`💪 Titan Surge! STR+300% for 6min!`,'crit'); break; }
    case 'draven':  { CS.playerMp = Math.floor(CS.playerMaxMp*2); addLog(`🔮 Mana Surge! MP doubled!`,'crit'); renderPlayerBars(); break; }
    case 'nyxar':   { addLog(`🛡️ Iron Veil! Damage blocked for 3 turns!`,'crit'); break; }
    case 'lila':    { const d=Math.floor(e.maxHp*0.3); e.hp=Math.max(0,e.hp-d); CS.playerMp=0; addLog(`👁️ Demonic Drain! ${d} drained. MP exhausted.`,'crit'); renderPlayerBars(); break; }
    case 'luna':    { addLog(`🌙 Eclipse! All stats x2 for 6min!`,'crit'); break; }
    case 'verya':   { addLog(`💚 HP Veil active! 40% HP restored on hit.`,'crit'); break; }
    case 'diana':   { addLog(`🍀 Fortune Eye! Loot luck +43%.`,'crit'); break; }
    default:        { addLog(`⚡ Ability activated!`,'crit'); }
  }
  renderEnemy();
}

/* ── Use quick inventory item ── */
function useQuickItem(itemId) {
  const p   = window.PLAYER; if (!p) return;
  const def = getItemDef(itemId); if (!def) return;
  const inv = [...(p.inventory||[])];
  const idx = inv.findIndex(i => i.id === itemId);
  if (idx < 0) return;

  const fx  = def.effect || '';
  const num = parseInt(fx.replace(/\D+/g,'').slice(0,3)) || 20;
  const updates = {};

  if (fx.toLowerCase().includes('hp')) {
    CS.playerHp = Math.min(CS.playerHp + num, CS.playerMaxHp);
    updates.hp  = CS.playerHp;
    addLog(`🧪 Used ${def.name} — +${num} HP!`,'player');
    renderPlayerBars();
  } else if (fx.toLowerCase().includes('mp')) {
    CS.playerMp = Math.min(CS.playerMp + num, CS.playerMaxMp);
    updates.mp  = CS.playerMp;
    addLog(`🔮 Used ${def.name} — +${num} MP!`,'player');
    renderPlayerBars();
  }

  inv[idx] = { id:itemId, uses: inv[idx].uses - 1 };
  if (inv[idx].uses <= 0) inv.splice(idx,1);
  updates.inventory = inv;
  window.updatePlayerField(updates);
  renderQuickInventory();
}

/* ══════════════════════════════════════
   ENEMY DEFEATED
══════════════════════════════════════ */
function onEnemyDefeated() {
  const e      = CS.enemy;
  const goldGain = e.reward + Math.floor(Math.random() * e.reward * 0.3);
  const xpGain   = Math.floor(goldGain * 1.2);
  CS.rewards.gold += goldGain;
  CS.rewards.xp   += xpGain;

  /* Check if more enemies in queue */
  CS.currentIdx++;
  if (CS.currentIdx < CS.enemies.length) {
    addLog(`⚠️ Another enemy on this floor!`,'system');
    CS.enemy = CS.enemies[CS.currentIdx];
    setTimeout(() => {
      renderEnemy();
      addLog(`⚔️ ${CS.enemy.emoji} ${CS.enemy.name} appears!`,'system');
      resetPin(); startPin();
      setCombatBtnsDisabled(false);
    }, 1000);
    return;
  }

  combatVictory();
}

/* ══════════════════════════════════════
   VICTORY
══════════════════════════════════════ */
async function combatVictory() {
  const p        = window.PLAYER;
  const gold     = CS.rewards.gold;
  const xp       = CS.rewards.xp;
  const newKills = (p.kills||0) + 1;
  const updates  = {
    hp:         CS.playerHp,
    mp:         CS.playerMp,
    gold:       (p.gold||0)      + gold,
    xp:         (p.xp||0)        + xp,
    kills:      newKills,
    totalKills: (p.totalKills||0)+ 1,
    goldEarned: (p.goldEarned||0)+ gold,
  };

  /* Level up — XP resets on level up (bug #11 fixed) */
  const newXp    = (p.xp||0) + xp;
  const xpToNext = (p.level||1) * 1000;
  let levelText  = '';
  if (newXp >= xpToNext) {
    updates.level = (p.level||1) + 1;
    updates.xp    = newXp - xpToNext;   /* ← XP resets correctly */
    updates.maxHp = (p.maxHp||100) + 10;
    updates.maxMp = (p.maxMp||50)  + 5;
    levelText     = `🎉 LEVEL UP! Now Lv.${updates.level}!`;
  } else {
    updates.xp = newXp;
  }

  /* PVP — add criminal star */
  if (CS.isPVP) {
    updates.criminalStars = Math.min((p.criminalStars||0)+1, 6);
    if (updates.criminalStars >= 6) {
      updates.isJailed  = true;
      updates.jailUntil = Date.now() + 2*60*60*1000;
    }
  }

  await window.updatePlayerField(updates);

  /* Show result */
  document.getElementById('result-emoji').textContent   = '🏆';
  document.getElementById('result-title').textContent   = 'Victory!';
  document.getElementById('result-title').className     = 'result-title';
  document.getElementById('result-rewards').innerHTML   =
    `<div class="result-row"><span>Gold</span><span>🪙 +${gold}</span></div>
     <div class="result-row"><span>XP</span><span>⭐ +${xp}</span></div>
     ${levelText ? `<div class="result-row level-up"><span>${levelText}</span></div>` : ''}`;
  document.getElementById('result-drop').style.display   = 'none';
  const rb = document.getElementById('result-btn');
  rb.textContent = 'Continue'; rb.className = 'result-btn';
  rb.onclick     = () => closeCombat();
  document.getElementById('combat-result')?.classList.add('show');
}

/* ══════════════════════════════════════
   DEFEAT
══════════════════════════════════════ */
function combatDefeat() {
  const halfGold = Math.floor(CS.rewards.gold / 2);
  window.updatePlayerField({
    hp:      1,
    mp:      CS.playerMp,
    gold:    (window.PLAYER?.gold||0) + halfGold,
    isDead:  true,
  });

  document.getElementById('result-emoji').textContent  = '💀';
  document.getElementById('result-title').textContent  = 'Defeated';
  document.getElementById('result-title').className    = 'result-title defeat';
  document.getElementById('result-rewards').innerHTML  =
    `<div class="result-row"><span>Rewards</span><span>Half only — 🪙 ${halfGold}</span></div>
     <div class="result-row defeat-msg"><span>Visit the Medic Center to revive before fighting again.</span></div>`;
  document.getElementById('result-drop').style.display = 'none';
  const rb = document.getElementById('result-btn');
  rb.textContent = 'Go to City Center'; rb.className = 'result-btn danger';
  rb.onclick     = () => {
    closeCombat();
    import('../core/nav.js').then(m => m.goToPage('city-center'));
  };
  document.getElementById('combat-result')?.classList.add('show');
}

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
function setCombatBtnsDisabled(disabled) {
  const skillBtn = document.getElementById('combat-skill-btn');
  if (skillBtn) skillBtn.disabled = disabled;
  if (!disabled) { resetPin(); startPin(); }
}

function addLog(msg, type='') {
  const log = document.getElementById('combat-log'); if (!log) return;
  const div = document.createElement('div');
  div.className   = `log-line ${type}`;
  div.textContent = msg;
  log.appendChild(div);
  log.scrollTop   = log.scrollHeight;
  while (log.children.length > 15) log.removeChild(log.firstChild);
}
function clearLog() {
  const log = document.getElementById('combat-log');
  if (log) log.innerHTML = '';
}
function triggerCritFlash() {
  const el = document.getElementById('combat-crit-flash');
  if (!el) return;
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
}
function spawnFloatingDmg(amount, isCrit, isEnemy) {
  const s = window.PLAYER?.settings || {};
  if (s.floatingDamage === false) return;
  const anchor = document.getElementById(isEnemy ? 'combat-hp-fill' : 'combat-enemy-emoji');
  if (!anchor) return;
  const rect  = anchor.getBoundingClientRect();
  const el    = document.createElement('div');
  el.className = 'float-dmg' + (isCrit?' crit':'') + (isEnemy?' enemy':'');
  el.textContent = (isEnemy?'-':'') + amount;
  el.style.left  = (rect.left + rect.width/2 + (Math.random()-0.5)*40) + 'px';
  el.style.top   = (rect.top - 10) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

/* ── Atmospheric canvas ── */
let combatCvs=null, combatCtx=null, combatAnimId=null, combatT=0;
function startCombatCanvas() {
  combatCvs = document.getElementById('combat-canvas'); if (!combatCvs) return;
  combatCvs.width = window.innerWidth; combatCvs.height = window.innerHeight;
  combatCtx = combatCvs.getContext('2d');
  function tick() {
    combatT += 0.015;
    combatCtx.clearRect(0,0,combatCvs.width,combatCvs.height);
    const W=combatCvs.width,H=combatCvs.height;
    [[W*0.15,H*0.2,W*0.4,0,60,10],[W*0.8,H*0.7,W*0.35,230,40,10]].forEach(([x,y,r,h,s,l])=>{
      const a=0.04+Math.sin(combatT*1.2)*0.015;
      const g=combatCtx.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,`hsla(${h},${s}%,${l}%,${a})`);g.addColorStop(1,'transparent');
      combatCtx.fillStyle=g;combatCtx.beginPath();combatCtx.arc(x,y,r,0,Math.PI*2);combatCtx.fill();
    });
    combatAnimId=requestAnimationFrame(tick);
  }
  tick();
}
function stopCombatCanvas() {
  if (combatAnimId) { cancelAnimationFrame(combatAnimId); combatAnimId=null; }
}
