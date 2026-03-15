// js/data/missions.js
// Mission definitions + reset timing helpers
// Export: DAILY_MISSIONS, WEEKLY_MISSIONS, msUntilDailyReset(), msUntilWeeklyReset(), formatCountdown()

export const DAILY_MISSIONS = [
  { id:'d_kill5',  emoji:'⚔️', name:'First Blood',    desc:'Defeat 5 enemies in any zone.',   type:'kills',  goal:5,   xp:100, gold:50  },
  { id:'d_kill15', emoji:'💀', name:'Relentless',     desc:'Defeat 15 enemies in any zone.',  type:'kills',  goal:15,  xp:200, gold:100 },
  { id:'d_zone',   emoji:'🗺️', name:'Zone Walker',    desc:'Enter the Realm 3 times.',        type:'enters', goal:3,   xp:150, gold:75  },
  { id:'d_scan',   emoji:'🔍', name:'Tracker',        desc:'Scan for enemies 5 times.',       type:'scans',  goal:5,   xp:80,  gold:40  },
  { id:'d_gold',   emoji:'🪙', name:'Coin Collector', desc:'Earn 200 gold from battles.',     type:'gold',   goal:200, xp:120, gold:60  },
];

export const WEEKLY_MISSIONS = [
  { id:'w_kill50',  emoji:'🩸', name:'Blood Trail',     desc:'Defeat 50 enemies across all zones.',  type:'kills',  goal:50,  xp:500,  gold:300 },
  { id:'w_kill100', emoji:'☠️', name:'Mass Slaughter',  desc:'Defeat 100 enemies.',                  type:'kills',  goal:100, xp:1000, gold:600 },
  { id:'w_zone2',   emoji:'🏴', name:'Conqueror',       desc:'Clear 2 different zones this week.',   type:'clears', goal:2,   xp:800,  gold:500 },
  { id:'w_enter10', emoji:'⚡', name:'Realm Veteran',   desc:'Enter the Realm 10 times.',            type:'enters', goal:10,  xp:600,  gold:350 },
  { id:'w_gold500', emoji:'💰', name:'Treasure Hunter', desc:'Earn 500 gold from battles.',          type:'gold',   goal:500, xp:700,  gold:400 },
  { id:'w_boss1',   emoji:'👑', name:'Boss Slayer',     desc:'Defeat a zone boss.',                  type:'bosses', goal:1,   xp:1200, gold:800 },
  { id:'w_scan10',  emoji:'🔭', name:'Realm Scout',     desc:'Scan for enemies 10 times.',           type:'scans',  goal:10,  xp:400,  gold:200 },
];

/** Milliseconds until next 4:00 AM (daily reset) */
export function msUntilDailyReset() {
  const now   = new Date();
  const reset = new Date(now);
  reset.setHours(4, 0, 0, 0);
  if (now >= reset) reset.setDate(reset.getDate() + 1);
  return reset - now;
}

/** Milliseconds until next Monday 4:00 AM (weekly reset) */
export function msUntilWeeklyReset() {
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now);
  mon.setDate(now.getDate() - ((day + 6) % 7));
  mon.setHours(4, 0, 0, 0);
  const nextMon = new Date(mon);
  nextMon.setDate(mon.getDate() + 7);
  return nextMon - now;
}

/** Format milliseconds as D:HH:MM:SS or HH:MM:SS */
export function formatCountdown(ms) {
  if (ms <= 0) return '00:00:00';
  const s   = Math.floor(ms / 1000);
  const sec = s % 60;
  const min = Math.floor(s / 60) % 60;
  const hr  = Math.floor(s / 3600) % 24;
  const day = Math.floor(s / 86400);
  const pad = n => String(n).padStart(2, '0');
  return day > 0
    ? `${day}d ${pad(hr)}:${pad(min)}:${pad(sec)}`
    : `${pad(hr)}:${pad(min)}:${pad(sec)}`;
}
