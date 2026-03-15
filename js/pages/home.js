// js/pages/home.js
// Home page — zone banner, quick action cards (Scan, Enter Realm, Explore)
// Depends on: player.js (window.PLAYER, updatePlayerField), modal.js, map.js

import { showToast, openModal } from '../core/modal.js';
import { ZONES, currentZone }   from '../data/zones.js';
import { openMap }              from './map.js';

/* ── Scan action ── */
document.getElementById('action-scan').addEventListener('click', () => {
  const p = window.PLAYER; if (!p) return;
  const zone = currentZone(p);
  openModal({
    emoji: '🔍', title: 'Scan for Enemies',
    desc:  `Use your scanner to detect enemies lurking in ${zone.name}.`,
    cost:  '⚡ -10 Energy',
    onConfirm() {
      if ((p.energy || 0) < 10) { showToast('⚡ Not enough energy!'); return; }
      const enemy = zone.enemies[Math.floor(Math.random() * zone.enemies.length)];
      window.updatePlayerField({
        energy:     p.energy - 10,
        totalScans: (p.totalScans || 0) + 1,
      });
      showToast(`🔍 Detected: ${enemy.emoji} ${enemy.name} x${Math.floor(Math.random() * 4) + 1}!`);
    },
  });
});

/* ── Enter Realm action ── */
document.getElementById('action-enter').addEventListener('click', () => {
  const p    = window.PLAYER; if (!p) return;
  const zone = currentZone(p);
  openModal({
    emoji: '⚔️', title: 'Enter the Realm',
    desc:  `Charge into battle in ${zone.name}. Defeat enemies to clear this zone.`,
    cost:  '⚡ -50 Energy',
    onConfirm() {
      if ((p.energy || 0) < 50) { showToast('⚡ Not enough energy!'); return; }

      const killsGained = Math.floor(Math.random() * 3) + 1;
      const newKills    = (p.kills || 0) + killsGained;
      const enemy       = zone.enemies[Math.floor(Math.random() * zone.enemies.length)];
      const goldGain    = enemy.reward * killsGained;
      const cleared     = [...(p.clearedZones || [])];

      const updates = {
        energy:       p.energy - 50,
        kills:        newKills,
        gold:         (p.gold || 0) + goldGain,
        totalKills:   (p.totalKills  || 0) + killsGained,
        totalEnters:  (p.totalEnters || 0) + 1,
        goldEarned:   (p.goldEarned  || 0) + goldGain,
      };

      /* Zone cleared when kill goal met */
      if (newKills >= zone.enemyGoal && !cleared.includes(zone.id)) {
        cleared.push(zone.id);
        updates.clearedZones   = cleared;
        updates.kills          = zone.enemyGoal;
        updates.totalBossKills = (p.totalBossKills || 0) + 1;
        showToast(`🏆 Zone cleared! ${zone.bosses[zone.bossGoal - 1].name} defeated! +${goldGain}🪙`);
      } else {
        showToast(`⚔️ ${enemy.emoji} ${enemy.name} defeated! +${goldGain}🪙 (${Math.min(newKills, zone.enemyGoal)}/${zone.enemyGoal})`);
      }

      window.updatePlayerField(updates);

      /* Update kill bar immediately without waiting for re-render */
      const capped = Math.min(updates.kills || newKills, zone.enemyGoal);
      const pct    = Math.min((capped / zone.enemyGoal) * 100, 100);
      const killsEl = document.getElementById('zone-kills');
      const fillEl  = document.getElementById('zone-progress-fill');
      if (killsEl) killsEl.textContent  = `${capped} / ${zone.enemyGoal} enemies defeated`;
      if (fillEl)  fillEl.style.width   = pct + '%';
    },
  });
});

/* ── Explore opens map ── */
document.getElementById('action-explore').addEventListener('click', () => openMap());

/* ── Refresh zone banner when player loads ── */
document.addEventListener('player-ready', e => {
  const p = e.detail;
  const z = ZONES.find(z => z.id === (p.currentZone || 'guild')) || ZONES[0];

  const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  const setW   = (id, w) => { const el = document.getElementById(id); if (el) el.style.width  = w; };

  setTxt('home-zone-emoji', z.emoji);
  setTxt('home-zone-name',  z.name);
  setTxt('home-zone-type',  z.type);
  setTxt('zone-boss-name',  z.bosses[z.bossGoal - 1].name);
  setTxt('zone-boss-icon',  z.bosses[z.bossGoal - 1].emoji);

  const kills = p.kills || 0;
  setTxt('zone-kills',          `${Math.min(kills, z.enemyGoal)} / ${z.enemyGoal} enemies defeated`);
  setW  ('zone-progress-fill',  Math.min((kills / z.enemyGoal) * 100, 100) + '%');
});
