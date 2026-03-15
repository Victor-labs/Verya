// js/data/characters.js
// Complete character roster for Verya
// 15 purchasable + 2 free starters (Andrew, Sera)
// Abilities: 40min cooldown (healing 50min), S/SS tier lasts 6min else 3min
// Buy with diamonds only. Equipped character = profile picture.
// 2 ability slots can be equipped from owned characters.

const CHAR_IMG  = (name) => `assets/characters/${name}.jpg`;
const ABIL_IMG  = (name) => `assets/characters/abilities/ability-${name}.jpg`;

export const TIER_COLORS = {
  D:  { color:'#9ca3af', label:'D Tier'  },
  C:  { color:'#4ade80', label:'C Tier'  },
  B:  { color:'#60a5fa', label:'B Tier'  },
  A:  { color:'#f59e0b', label:'A Tier'  },
  S:  { color:'#f5c842', label:'S Tier'  },
  SS: { color:'#ef4444', label:'SS Tier' },
};

export const CHARACTERS = [
  /* ── FREE STARTERS ── */
  {
    id:'andrew', name:'Andrew', gender:'male', tier:'D', free:true, price:0,
    stars:0, damage:30, hp:80, stamina:100,
    img: CHAR_IMG('males/andrew'),
    abilityImg: null, abilityType: null, abilityDesc: null,
    lore: 'A survivor from the outer slums. No special powers — just will.',
  },
  {
    id:'sera', name:'Sera', gender:'female', tier:'D', free:true, price:0,
    stars:0, damage:28, hp:75, stamina:100,
    img: CHAR_IMG('females/sera'),
    abilityImg: null, abilityType: null, abilityDesc: null,
    lore: 'Wandered into Verya after the collapse. Fights with nothing but instinct.',
  },

  /* ── MALE CHARACTERS ── */
  {
    id:'kael', name:'Kael', gender:'male', tier:'S', free:false, price:400,
    stars:4, damage:577, hp:390, stamina:150,
    img: CHAR_IMG('males/kael'),
    abilityImg: ABIL_IMG('kael'),
    abilityType: 'LONG RANGE',
    abilityDesc: 'Energy Blast: Shoots a blast of energy dealing 190% DMG to all enemies around. Long range skill.',
    cooldown: 40, duration: 6,
    lore: 'Silent and calculated. His energy blast has levelled entire districts.',
  },
  {
    id:'zephyr', name:'Zephyr', gender:'male', tier:'B', free:false, price:100,
    stars:3, damage:120, hp:110, stamina:120,
    img: CHAR_IMG('males/zephyr'),
    abilityImg: ABIL_IMG('zephyr'),
    abilityType: 'SINGLE TARGET',
    abilityDesc: 'Full Restore: Heals and restores your full HP back completely.',
    cooldown: 50, duration: 3,
    lore: 'A medic turned fighter. He heals as fast as he hurts.',
  },
  {
    id:'draven', name:'Draven', gender:'male', tier:'A', free:false, price:200,
    stars:4.5, damage:200, hp:140, stamina:130,
    img: CHAR_IMG('males/draven'),
    abilityImg: ABIL_IMG('draven'),
    abilityType: 'SELF BUFF',
    abilityDesc: 'Mana Surge: Temporarily boosts your mana to 200% for a limited time.',
    cooldown: 40, duration: 3,
    lore: 'A sorcerer who discarded his robes for the streets. Power flows through him.',
  },
  {
    id:'nyxar', name:'Nyxar', gender:'male', tier:'B', free:false, price:100,
    stars:2, damage:100, hp:110, stamina:120,
    img: CHAR_IMG('males/nyxar'),
    abilityImg: ABIL_IMG('nyxar'),
    abilityType: 'SELF BUFF',
    abilityDesc: 'Iron Veil: Opens an impenetrable shield on himself for a limited time.',
    cooldown: 40, duration: 3,
    lore: 'Built walls his whole life. Now he becomes one.',
  },
  {
    id:'drex', name:'Drex', gender:'male', tier:'S', free:false, price:400,
    stars:4, damage:599, hp:400, stamina:150,
    img: CHAR_IMG('males/drex'),
    abilityImg: ABIL_IMG('drex'),
    abilityType: 'AOE',
    abilityDesc: 'Death Surge: Immediately deals 230% damage to all nearby targets.',
    cooldown: 40, duration: 6,
    lore: 'The streets fear his name. One step and everything near him crumbles.',
  },
  {
    id:'lucian', name:'Lucian', gender:'male', tier:'C', free:false, price:50,
    stars:2.5, damage:89, hp:100, stamina:110,
    img: CHAR_IMG('males/lucian'),
    abilityImg: ABIL_IMG('lucian'),
    abilityType: 'SINGLE TARGET',
    abilityDesc: 'Light Ball: Shoots a ball of light towards enemies dealing 160% DMG.',
    cooldown: 40, duration: 3,
    lore: 'Carries a lantern in one hand and fights with the other.',
  },
  {
    id:'aether', name:'Aether', gender:'male', tier:'SS', free:false, price:800,
    stars:5.5, damage:700, hp:550, stamina:200,
    img: CHAR_IMG('males/aether'),
    abilityImg: ABIL_IMG('aether'),
    abilityType: 'SELF BUFF',
    abilityDesc: 'Titan Surge: Increases stamina and strength of your player up to 300% for a limited time.',
    cooldown: 40, duration: 6,
    lore: 'They say he was engineered. No one who has faced him survived to confirm it.',
  },
  {
    id:'yuji', name:'Yuji', gender:'male', tier:'SS', free:false, price:800,
    stars:5.5, damage:799, hp:600, stamina:200,
    img: CHAR_IMG('males/yuji'),
    abilityImg: ABIL_IMG('yuji'),
    abilityType: 'AOE',
    abilityDesc: 'Death Zone: Opens a death zone where each enemy present receives a slash dealing 500% DMG.',
    cooldown: 40, duration: 6,
    lore: 'Where Yuji walks, nothing follows.',
  },

  /* ── FEMALE CHARACTERS ── */
  {
    id:'lila', name:'Lila', gender:'female', tier:'A', free:false, price:200,
    stars:4.5, damage:200, hp:147, stamina:130,
    img: CHAR_IMG('females/lila'),
    abilityImg: ABIL_IMG('lila'),
    abilityType: 'AOE DRAIN',
    abilityDesc: 'Demonic Drain: Opens a demonic HP removal area — enemies nearby lose HP continuously. Drains ALL your mana during use.',
    cooldown: 40, duration: 3,
    lore: 'She takes life as easily as she gives it. The cost is always her own.',
  },
  {
    id:'luna', name:'Luna', gender:'female', tier:'SS', free:false, price:800,
    stars:5.5, damage:699, hp:450, stamina:200,
    img: CHAR_IMG('females/luna'),
    abilityImg: ABIL_IMG('luna'),
    abilityType: 'SELF BUFF',
    abilityDesc: 'Eclipse: Causes an eclipse that boosts ALL her stats by 200% for a limited time.',
    cooldown: 40, duration: 6,
    lore: 'When Luna activates her eclipse, the sky dims and enemies run.',
  },
  {
    id:'natasha', name:'Natasha', gender:'female', tier:'B', free:false, price:100,
    stars:3, damage:340, hp:200, stamina:130,
    img: CHAR_IMG('females/natasha'),
    abilityImg: ABIL_IMG('natasha'),
    abilityType: 'SINGLE TARGET',
    abilityDesc: 'Hagabani Strike: Fires her hagabani at the enemy dealing 230% DMG immediately.',
    cooldown: 40, duration: 3,
    lore: 'Trained in silence. Strikes before you see her move.',
  },
  {
    id:'aria', name:'Aria', gender:'female', tier:'A', free:false, price:200,
    stars:3, damage:100, hp:110, stamina:120,
    img: CHAR_IMG('females/aria'),
    abilityImg: ABIL_IMG('aria'),
    abilityType: 'SINGLE TARGET',
    abilityDesc: 'Full Mend: Heals and restores your full HP to your character completely.',
    cooldown: 50, duration: 3,
    lore: 'A healer who walked into the dark and never came back the same.',
  },
  {
    id:'verya', name:'Verya', gender:'female', tier:'B', free:false, price:100,
    stars:5, damage:280, hp:200, stamina:140,
    img: CHAR_IMG('females/verya'),
    abilityImg: ABIL_IMG('verya'),
    abilityType: 'SELF BUFF',
    abilityDesc: 'HP Veil: Casts HP buffs around herself — when hurt, 40% HP is added back instantly without Regen potions.',
    cooldown: 40, duration: 3,
    lore: 'The city was named after her legend. She lives up to every word.',
  },
  {
    id:'mami', name:'Mami', gender:'female', tier:'SS', free:false, price:800,
    stars:6, damage:950, hp:650, stamina:200,
    img: CHAR_IMG('females/mami'),
    abilityImg: ABIL_IMG('mami'),
    abilityType: 'MULTI TARGET',
    abilityDesc: 'Beam Storm: Blasts countless beams at once ×2 — each beam deals 300% DMG.',
    cooldown: 40, duration: 6,
    lore: 'The most dangerous thing in Verya smiles while she destroys.',
  },
  {
    id:'diana', name:'Diana', gender:'female', tier:'B', free:false, price:100,
    stars:4, damage:430, hp:200, stamina:130,
    img: CHAR_IMG('females/diana'),
    abilityImg: ABIL_IMG('diana'),
    abilityType: 'PASSIVE BUFF',
    abilityDesc: 'Fortune Eye: Increases your luck in loot drops by 43%.',
    cooldown: 40, duration: 3,
    lore: 'Luck follows Diana like a shadow. She shares it — for a price.',
  },
];

/** Get character by id */
export function getCharacter(id) {
  return CHARACTERS.find(c => c.id === id) || null;
}

/** Get all purchasable characters by gender */
export function getCharactersByGender(gender) {
  return CHARACTERS.filter(c => !c.free && c.gender === gender);
}

/** Get starter by gender */
export function getStarter(gender) {
  return CHARACTERS.find(c => c.free && c.gender === gender);
}

/** Get all owned characters for a player */
export function getOwnedCharacters(player) {
  const owned = player?.ownedCharacters || [];
  const starter = getStarter(player?.gender || 'male');
  const ids = [starter?.id, ...owned].filter(Boolean);
  return ids.map(id => getCharacter(id)).filter(Boolean);
}
