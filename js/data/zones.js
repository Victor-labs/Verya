// js/data/zones.js
// 24 zones + Oblivion Citadel — full world map data
// Unlock formula: zone 1 = level 1, then every 5 levels
// Background images transition every 5 zones
// Rewards scale with zone index
// Item drops: 2 random from zone pool per fight

export const ZONE_ITEMS = [
  { id: 'corrupted-bone',    name: 'Corrupted Bone',    emoji: '🦴', rare: false },
  { id: 'shadow-essence',    name: 'Shadow Essence',    emoji: '🌑', rare: false },
  { id: 'crystal-shards',    name: 'Crystal Shards',    emoji: '💎', rare: false },
  { id: 'ancient-cloth',     name: 'Ancient Cloth',     emoji: '🧵', rare: false },
  { id: 'iron-fragments',    name: 'Iron Fragments',    emoji: '⚙️', rare: false },
  { id: 'gold-fragments',    name: 'Gold Fragments',    emoji: '✨', rare: false },
  { id: 'copper-fragments',  name: 'Copper Fragments',  emoji: '🔶', rare: false },
  { id: 'diamond-fragments', name: 'Diamond Fragments', emoji: '💠', rare: true  },
  { id: 'beast-fangs',       name: 'Beast Fangs',       emoji: '🐾', rare: false },
  { id: 'toxic-glands',      name: 'Toxic Glands',      emoji: '☣️', rare: false },
  { id: 'dark-resin',        name: 'Dark Resin',        emoji: '🫙', rare: false },
  { id: 'soul-dust',         name: 'Soul Dust',         emoji: '👻', rare: true  },
  { id: 'moonstone-powder',  name: 'Moonstone Powder',  emoji: '🌙', rare: true  },
];

/* Boss loot — equippable, one-time permanent */
export const BOSS_LOOT = [
  {
    id:     'heart-of-abyss',
    name:   'Heart of the Abyss',
    emoji:  '🖤',
    slot:   'amulet',
    effect: 'Increases max HP permanently by +50',
    lore:   'A pulsing black heart torn from the abyss itself.',
    apply:  (p) => ({ maxHp: (p.maxHp || 100) + 50 }),
  },
  {
    id:     'crown-of-ashes',
    name:   'Crown of Ashes',
    emoji:  '👑',
    slot:   'head',
    effect: 'Boosts corruption power +30 but drains sanity',
    lore:   'Worn by fallen kings. Power comes at a price.',
    apply:  (p) => ({ totalBossKills: (p.totalBossKills || 0) + 5 }),
  },
  {
    id:     'phantom-lantern',
    name:   'Phantom Lantern',
    emoji:  '🏮',
    slot:   'offhand',
    effect: 'Reveals invisible enemies before they strike',
    lore:   'Its flame never dies. Neither does what it illuminates.',
    apply:  () => ({}),
  },
  {
    id:     'blood-relic',
    name:   'Blood Relic',
    emoji:  '🩸',
    slot:   'ring',
    effect: 'Lifesteal active — max HP becomes 150 for 5 battles',
    lore:   'Ancient blood magic sealed in crimson crystal.',
    apply:  (p) => ({ maxHp: 150, bloodRelicCharges: 5 }),
  },
];

/* ── Zone background image groups ── */
const BG = {
  1: 'assets/images/map-bg-1.jpg',  /* zones 1-5   — snow temple      */
  2: 'assets/images/map-bg-2.jpg',  /* zones 6-10  — dark towers       */
  3: 'assets/images/map-bg-3.jpg',  /* zones 11-15 — cosmic spire      */
  4: 'assets/images/map-bg-4.jpg',  /* zones 16-19 — deep ruins        */
  5: 'assets/images/map-bg-5.jpg',  /* zones 20-24 — blood citadel     */
};

function bg(n) {
  if (n <= 5)  return BG[1];
  if (n <= 10) return BG[2];
  if (n <= 15) return BG[3];
  if (n <= 19) return BG[4];
  return BG[5];
}

/* ── Item pool helpers ── */
const COMMON = ['corrupted-bone','shadow-essence','crystal-shards','ancient-cloth',
                'iron-fragments','copper-fragments','beast-fangs','toxic-glands','dark-resin'];
const UNCOMMON = [...COMMON, 'gold-fragments','soul-dust'];
const RARE     = [...UNCOMMON, 'diamond-fragments','moonstone-powder'];

function pool(tier) {
  if (tier === 'rare')     return RARE;
  if (tier === 'uncommon') return UNCOMMON;
  return COMMON;
}

/* ── 24 Zones + Oblivion Citadel ── */
export const ZONES = [
  /* ════════ BACKGROUND 1 — Snow Temple (zones 1-5) ════════ */
  {
    id: 'ashen-slums', num: 1,
    name: 'Ashen Slums', emoji: '🏚️',
    levelReq: 1,
    lore: 'The lowest district of Verya. Ash falls like snow here and the desperate prey on the weak.',
    danger: 'Low', bg: bg(1),
    goldMin: 40,  goldMax: 60,
    xpMin:   45,  xpMax:   70,
    itemPool: pool('common'),
    bossDrop: null,
    enemies: [
      { name: 'Ash Crawler',    emoji: '🕷️', hp: 45,  atk: 6,  reward: 40  },
      { name: 'Slum Wraith',    emoji: '👤', hp: 50,  atk: 7,  reward: 45  },
      { name: 'Rusted Hollow',  emoji: '🤖', hp: 55,  atk: 8,  reward: 50  },
    ],
  },
  {
    id: 'plaguegate-alley', num: 2,
    name: 'Plaguegate Alley', emoji: '🧪',
    levelReq: 5,
    lore: 'A narrow corridor of disease and rot. The air itself is poison to the unprepared.',
    danger: 'Low', bg: bg(2),
    goldMin: 80,  goldMax: 120,
    xpMin:   90,  xpMax:   130,
    itemPool: pool('common'),
    bossDrop: null,
    enemies: [
      { name: 'Plague Rat',     emoji: '🐀', hp: 65,  atk: 10, reward: 80  },
      { name: 'Infected Grunt', emoji: '🧟', hp: 70,  atk: 11, reward: 90  },
      { name: 'Venom Hound',    emoji: '🐕', hp: 75,  atk: 12, reward: 100 },
    ],
  },
  {
    id: 'toxic-alleyway', num: 3,
    name: 'Toxic Alleyway', emoji: '☠️',
    levelReq: 10,
    lore: 'Barrels of unknown chemicals line every wall. Something mutated lives in the green mist.',
    danger: 'Medium', bg: bg(3),
    goldMin: 130, goldMax: 180,
    xpMin:   140, xpMax:   200,
    itemPool: pool('common'),
    bossDrop: null,
    enemies: [
      { name: 'Toxic Fiend',    emoji: '☣️', hp: 90,  atk: 14, reward: 130 },
      { name: 'Sludge Beast',   emoji: '🐸', hp: 100, atk: 15, reward: 140 },
      { name: 'Acid Crawler',   emoji: '🦎', hp: 110, atk: 16, reward: 160 },
    ],
  },
  {
    id: 'forsaken-bazaar', num: 4,
    name: 'Forsaken Bazaar', emoji: '🏪',
    levelReq: 15,
    lore: 'Once a thriving market. Now merchants of death peddle cursed wares to the damned.',
    danger: 'Medium', bg: bg(4),
    goldMin: 190, goldMax: 250,
    xpMin:   200, xpMax:   270,
    itemPool: pool('common'),
    bossDrop: null,
    enemies: [
      { name: 'Cursed Vendor',  emoji: '👺', hp: 130, atk: 18, reward: 190 },
      { name: 'Market Shade',   emoji: '🌫️', hp: 140, atk: 19, reward: 210 },
      { name: 'Hollow Trader',  emoji: '💀', hp: 150, atk: 20, reward: 230 },
    ],
  },
  {
    id: 'cinderblock-ruins', num: 5,
    name: 'Cinderblock Ruins', emoji: '🧱',
    levelReq: 20,
    lore: 'The skeleton of a city that burned. Something ancient and angry guards the rubble.',
    danger: 'Medium', bg: bg(5),
    goldMin: 260, goldMax: 320,
    xpMin:   270, xpMax:   340,
    itemPool: pool('uncommon'),
    bossDrop: BOSS_LOOT[0], /* Heart of the Abyss */
    enemies: [
      { name: 'Cinder Golem',   emoji: '🗿', hp: 170, atk: 22, reward: 260 },
      { name: 'Ash Revenant',   emoji: '💀', hp: 185, atk: 24, reward: 280 },
      { name: 'Ruin Warden',    emoji: '⚔️', hp: 200, atk: 26, reward: 310 },
    ],
  },

  /* ════════ BACKGROUND 2 — Dark Towers (zones 6-10) ════════ */
  {
    id: 'shadowed-crossroads', num: 6,
    name: 'Shadowed Crossroads', emoji: '🌑',
    levelReq: 25,
    lore: 'Four paths meet in perpetual darkness. Those who linger too long forget which way they came.',
    danger: 'Medium', bg: bg(6),
    goldMin: 330, goldMax: 400,
    xpMin:   340, xpMax:   420,
    itemPool: pool('uncommon'),
    bossDrop: null,
    enemies: [
      { name: 'Shadow Lurker',  emoji: '👥', hp: 220, atk: 28, reward: 330 },
      { name: 'Void Walker',    emoji: '🌀', hp: 235, atk: 30, reward: 355 },
      { name: 'Dark Sentinel',  emoji: '🗡️', hp: 250, atk: 32, reward: 380 },
    ],
  },
  {
    id: 'wraiths-hollow', num: 7,
    name: "Wraith's Hollow", emoji: '👻',
    levelReq: 30,
    lore: 'The dead do not rest here. Wraiths scream through hollow trees that bleed black sap.',
    danger: 'High', bg: bg(7),
    goldMin: 410, goldMax: 490,
    xpMin:   420, xpMax:   510,
    itemPool: pool('uncommon'),
    bossDrop: null,
    enemies: [
      { name: 'Wailing Wraith', emoji: '👻', hp: 265, atk: 34, reward: 410 },
      { name: 'Bone Specter',   emoji: '💀', hp: 280, atk: 36, reward: 440 },
      { name: 'Soul Ripper',    emoji: '🔮', hp: 300, atk: 38, reward: 470 },
    ],
  },
  {
    id: 'obsidian-ward', num: 8,
    name: 'Obsidian Ward', emoji: '🗿',
    levelReq: 35,
    lore: 'Black stone walls tower over silent streets. The ward was sealed from outside — by something inside.',
    danger: 'High', bg: bg(8),
    goldMin: 500, goldMax: 590,
    xpMin:   510, xpMax:   610,
    itemPool: pool('uncommon'),
    bossDrop: BOSS_LOOT[1], /* Crown of Ashes */
    enemies: [
      { name: 'Obsidian Guard', emoji: '🛡️', hp: 320, atk: 40, reward: 500 },
      { name: 'Stone Phantom',  emoji: '🌫️', hp: 340, atk: 43, reward: 540 },
      { name: 'Ward Reaper',    emoji: '⚔️', hp: 360, atk: 46, reward: 575 },
    ],
  },
  {
    id: 'nightmare-docks', num: 9,
    name: 'Nightmare Docks', emoji: '⚓',
    levelReq: 40,
    lore: 'Ships that left never returned. Now their rotting hulls are home to things that breathe underwater.',
    danger: 'High', bg: bg(9),
    goldMin: 600, goldMax: 700,
    xpMin:   610, xpMax:   720,
    itemPool: pool('uncommon'),
    bossDrop: null,
    enemies: [
      { name: 'Tide Wraith',    emoji: '🌊', hp: 380, atk: 48, reward: 600 },
      { name: 'Drowned Knight', emoji: '⚓', hp: 400, atk: 51, reward: 640 },
      { name: 'Depth Horror',   emoji: '🦑', hp: 425, atk: 54, reward: 680 },
    ],
  },
  {
    id: 'ebonwatch-quarter', num: 10,
    name: 'Ebonwatch Quarter', emoji: '🔭',
    levelReq: 45,
    lore: 'Watchtowers of black iron. Observers who never blink stand vigil over streets of broken glass.',
    danger: 'High', bg: bg(10),
    goldMin: 710, goldMax: 820,
    xpMin:   720, xpMax:   840,
    itemPool: pool('rare'),
    bossDrop: null,
    enemies: [
      { name: 'Iron Watcher',   emoji: '👁️', hp: 450, atk: 57, reward: 710 },
      { name: 'Ebon Stalker',   emoji: '🔭', hp: 475, atk: 60, reward: 755 },
      { name: 'Glass Phantom',  emoji: '💀', hp: 500, atk: 63, reward: 800 },
    ],
  },

  /* ════════ BACKGROUND 3 — Cosmic Spire (zones 11-15) ════════ */
  {
    id: 'rotting-tower', num: 11,
    name: 'Rotting Tower', emoji: '🗼',
    levelReq: 50,
    lore: 'A tower that never stops growing downward into the earth. The higher you climb, the deeper it feels.',
    danger: 'Very High', bg: bg(11),
    goldMin: 830,  goldMax: 950,
    xpMin:   840,  xpMax:   970,
    itemPool: pool('rare'),
    bossDrop: null,
    enemies: [
      { name: 'Tower Fiend',    emoji: '🗼', hp: 530, atk: 66, reward: 830  },
      { name: 'Rot Colossus',   emoji: '☣️', hp: 560, atk: 70, reward: 880  },
      { name: 'Spire Wraith',   emoji: '👻', hp: 590, atk: 74, reward: 930  },
    ],
  },
  {
    id: 'graveheart-hospital', num: 12,
    name: 'Graveheart Hospital', emoji: '🏥',
    levelReq: 55,
    lore: 'Patients checked in. None checked out. The halls are full — just not with the living.',
    danger: 'Very High', bg: bg(12),
    goldMin: 960,  goldMax: 1090,
    xpMin:   970,  xpMax:   1110,
    itemPool: pool('rare'),
    bossDrop: BOSS_LOOT[2], /* Phantom Lantern */
    enemies: [
      { name: 'Undead Nurse',   emoji: '🩺', hp: 620, atk: 77, reward: 960  },
      { name: 'Hollow Doctor',  emoji: '💉', hp: 655, atk: 81, reward: 1010 },
      { name: 'Ward Ghoul',     emoji: '🧟', hp: 690, atk: 85, reward: 1060 },
    ],
  },
  {
    id: 'blightspire-lab', num: 13,
    name: 'Blightspire Lab', emoji: '🔬',
    levelReq: 60,
    lore: 'Experiments that should never have been conducted left something behind. It learned. It waited.',
    danger: 'Very High', bg: bg(13),
    goldMin: 1100, goldMax: 1240,
    xpMin:   1110, xpMax:   1260,
    itemPool: pool('rare'),
    bossDrop: null,
    enemies: [
      { name: 'Lab Mutant',     emoji: '🧬', hp: 720, atk: 89, reward: 1100 },
      { name: 'Blight Subject', emoji: '☣️', hp: 760, atk: 93, reward: 1160 },
      { name: 'Void Specimen',  emoji: '🔬', hp: 800, atk: 97, reward: 1210 },
    ],
  },
  {
    id: 'voidmarket-square', num: 14,
    name: 'Voidmarket Square', emoji: '🌀',
    levelReq: 65,
    lore: 'Commerce driven by forbidden currency — souls, memories, years of life. The price is always too high.',
    danger: 'Very High', bg: bg(14),
    goldMin: 1250, goldMax: 1400,
    xpMin:   1260, xpMax:   1420,
    itemPool: pool('rare'),
    bossDrop: null,
    enemies: [
      { name: 'Void Broker',    emoji: '💰', hp: 840, atk: 101, reward: 1250 },
      { name: 'Soul Merchant',  emoji: '🌀', hp: 880, atk: 106, reward: 1310 },
      { name: 'Market Demon',   emoji: '😈', hp: 925, atk: 111, reward: 1370 },
    ],
  },
  {
    id: 'phantom-labyrinth', num: 15,
    name: 'Phantom Labyrinth', emoji: '🌀',
    levelReq: 70,
    lore: 'Walls that move. Paths that loop. The only way out is through the thing at the center.',
    danger: 'Extreme', bg: bg(15),
    goldMin: 1410, goldMax: 1580,
    xpMin:   1420, xpMax:   1600,
    itemPool: pool('rare'),
    bossDrop: null,
    enemies: [
      { name: 'Maze Specter',   emoji: '👁️', hp: 970,  atk: 116, reward: 1410 },
      { name: 'Labyrinth Lord', emoji: '🔮', hp: 1020, atk: 121, reward: 1480 },
      { name: 'Phantom Core',   emoji: '💀', hp: 1070, atk: 126, reward: 1550 },
    ],
  },

  /* ════════ BACKGROUND 4 — Deep Ruins (zones 16-19) ════════ */
  {
    id: 'crimson-vial-alley', num: 16,
    name: 'Crimson Vial Alley', emoji: '🩸',
    levelReq: 75,
    lore: 'Every surface is stained red. The vials contain something that is still alive and very angry.',
    danger: 'Extreme', bg: bg(16),
    goldMin: 1590, goldMax: 1770,
    xpMin:   1600, xpMax:   1790,
    itemPool: pool('rare'),
    bossDrop: BOSS_LOOT[3], /* Blood Relic */
    enemies: [
      { name: 'Blood Fiend',    emoji: '🩸', hp: 1120, atk: 131, reward: 1590 },
      { name: 'Vial Wraith',    emoji: '🧪', hp: 1180, atk: 137, reward: 1670 },
      { name: 'Crimson Shade',  emoji: '💀', hp: 1240, atk: 143, reward: 1740 },
    ],
  },
  {
    id: 'necrospire-clinic', num: 17,
    name: 'Necrospire Clinic', emoji: '💉',
    levelReq: 80,
    lore: 'Healing was a lie here. Every patient was a subject. Every cure was a curse.',
    danger: 'Extreme', bg: bg(17),
    goldMin: 1780, goldMax: 1980,
    xpMin:   1790, xpMax:   2000,
    itemPool: pool('rare'),
    bossDrop: null,
    enemies: [
      { name: 'Necro Surgeon',  emoji: '🩺', hp: 1300, atk: 149, reward: 1780 },
      { name: 'Cursed Patient', emoji: '🧟', hp: 1370, atk: 156, reward: 1870 },
      { name: 'Clinic Horror',  emoji: '😱', hp: 1440, atk: 163, reward: 1950 },
    ],
  },
  {
    id: 'wailing-labyrinth', num: 18,
    name: 'Wailing Labyrinth', emoji: '😱',
    levelReq: 85,
    lore: 'The screams never stop. Those trapped inside became the walls. They remember everything.',
    danger: 'Extreme', bg: bg(18),
    goldMin: 1990, goldMax: 2210,
    xpMin:   2000, xpMax:   2230,
    itemPool: pool('rare'),
    bossDrop: null,
    enemies: [
      { name: 'Wall Screamer',  emoji: '😱', hp: 1510, atk: 170, reward: 1990 },
      { name: 'Grief Specter',  emoji: '👻', hp: 1590, atk: 178, reward: 2090 },
      { name: 'Wail Colossus',  emoji: '💀', hp: 1670, atk: 186, reward: 2180 },
    ],
  },
  {
    id: 'sanguine-tower', num: 19,
    name: 'Sanguine Tower', emoji: '🏯',
    levelReq: 90,
    lore: 'A fortress built on centuries of blood. Its ruler has not aged in five hundred years.',
    danger: 'Extreme', bg: bg(19),
    goldMin: 2220, goldMax: 2460,
    xpMin:   2230, xpMax:   2480,
    itemPool: pool('rare'),
    bossDrop: null,
    enemies: [
      { name: 'Blood Knight',   emoji: '⚔️', hp: 1750, atk: 194, reward: 2220 },
      { name: 'Tower Vampire',  emoji: '🧛', hp: 1840, atk: 203, reward: 2330 },
      { name: 'Sanguine Tyrant',emoji: '👑', hp: 1930, atk: 212, reward: 2430 },
    ],
  },

  /* ════════ BACKGROUND 5 — Blood Citadel (zones 20-24) ════════ */
  {
    id: 'shadowblood-district', num: 20,
    name: 'Shadowblood District', emoji: '🌒',
    levelReq: 95,
    lore: 'Where shadow and blood merge into a single living entity that hunts in silence.',
    danger: 'Deadly', bg: bg(20),
    goldMin: 2470, goldMax: 2730,
    xpMin:   2480, xpMax:   2750,
    itemPool: pool('rare'),
    bossDrop: null,
    enemies: [
      { name: 'Shadow Bleeder', emoji: '🌒', hp: 2020, atk: 221, reward: 2470 },
      { name: 'Blood Shadow',   emoji: '🩸', hp: 2120, atk: 231, reward: 2590 },
      { name: 'Void Vampire',   emoji: '🧛', hp: 2220, atk: 241, reward: 2700 },
    ],
  },
  {
    id: 'forgotten-sanitarium', num: 21,
    name: 'Forgotten Sanitarium', emoji: '🏚️',
    levelReq: 100,
    lore: 'Minds were shattered here on purpose. The fragments gained consciousness and want company.',
    danger: 'Deadly', bg: bg(21),
    goldMin: 2740, goldMax: 3030,
    xpMin:   2750, xpMax:   3050,
    itemPool: pool('rare'),
    bossDrop: null,
    enemies: [
      { name: 'Mind Shard',     emoji: '🔮', hp: 2330, atk: 252, reward: 2740 },
      { name: 'Broken Psyche',  emoji: '🧠', hp: 2450, atk: 264, reward: 2880 },
      { name: 'Sanity Reaper',  emoji: '💀', hp: 2570, atk: 276, reward: 3000 },
    ],
  },
  {
    id: 'dreadspire-hospital', num: 22,
    name: 'Dreadspire Hospital', emoji: '🏥',
    levelReq: 105,
    lore: 'The final hospital. They did not treat illness here — they harvested it for weapons.',
    danger: 'Deadly', bg: bg(22),
    goldMin: 3040, goldMax: 3360,
    xpMin:   3050, xpMax:   3380,
    itemPool: pool('rare'),
    bossDrop: null,
    enemies: [
      { name: 'Dread Surgeon',  emoji: '🩺', hp: 2690, atk: 288, reward: 3040 },
      { name: 'Plague Engine',  emoji: '⚙️', hp: 2820, atk: 301, reward: 3190 },
      { name: 'Horror Host',    emoji: '🧟', hp: 2960, atk: 315, reward: 3330 },
    ],
  },
  {
    id: 'corruption-nexus', num: 23,
    name: 'Corruption Nexus', emoji: '💀',
    levelReq: 110,
    lore: 'The source of all corruption in Verya. Every evil thing born here radiates outward like a plague star.',
    danger: 'Deadly', bg: bg(23),
    goldMin: 3370, goldMax: 3720,
    xpMin:   3380, xpMax:   3740,
    itemPool: pool('rare'),
    bossDrop: null,
    enemies: [
      { name: 'Nexus Spawn',    emoji: '🌑', hp: 3100, atk: 329, reward: 3370 },
      { name: 'Corruption Core',emoji: '💀', hp: 3260, atk: 344, reward: 3540 },
      { name: 'Void Nexus',     emoji: '🌀', hp: 3420, atk: 360, reward: 3700 },
    ],
  },

  /* ════════ FINAL ZONE ════════ */
  {
    id: 'oblivion-citadel', num: 24,
    name: 'Oblivion Citadel', emoji: '🔥',
    levelReq: 115,
    lore: 'The end of everything. A citadel built from the bones of gods. Only one has ever entered. None have left.',
    danger: '💀 OBLIVION',
    bg: bg(24),
    goldMin: 5000, goldMax: 9999,
    xpMin:   5000, xpMax:   9999,
    itemPool: pool('rare'),
    bossDrop: null,
    enemies: [
      { name: 'Citadel Warden', emoji: '⚔️', hp: 5000, atk: 500, reward: 5000 },
      { name: 'Oblivion Knight',emoji: '🗡️', hp: 6000, atk: 560, reward: 6500 },
      { name: 'The Unnamed',    emoji: '🔥', hp: 8000, atk: 666, reward: 9999 },
    ],
  },
];

/* ── Helper: get zone by id ── */
export function getZoneById(id) {
  return ZONES.find(z => z.id === id) || ZONES[0];
}

/* ── Helper: is zone unlocked for player ── */
export function isZoneUnlocked(zone, playerLevel) {
  return (playerLevel || 1) >= zone.levelReq;
}

/* ── Helper: current zone object from player doc ── */
export function currentZone(player) {
  return getZoneById(player?.currentZone || 'ashen-slums');
}

/* ── Helper: get 2 random items from zone pool ── */
export function rollZoneItems(zone) {
  const pool = [...zone.itemPool];
  const picks = [];
  for (let i = 0; i < 2; i++) {
    if (!pool.length) break;
    const idx = Math.floor(Math.random() * pool.length);
    picks.push(pool.splice(idx, 1)[0]);
  }
  return picks;
}
