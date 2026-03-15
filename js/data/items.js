// js/data/items.js
// Complete item database for Verya
// Rarity system: common, uncommon, rare, legendary, evil, corrupted
// 5 equip slots: weapon, chest, head, boots, trinket
// weapon = sword OR gear (mutually exclusive)
// head   = helmet OR hat (mutually exclusive)
// trinket = ring OR necklace (mutually exclusive)
// Market: food + few potions + basic fragments + <4 rare gear (NO evil/corrupted)

const ICO = (folder, file) => `assets/icons/${folder}/${file}.png`;

/* ══════════════════════════════════════
   RARITY DEFINITIONS
   Used everywhere — inventory, market, item details
══════════════════════════════════════ */
export const RARITY = {
  common:    { label:'Common',    color:'#9ca3af', glow:'rgba(156,163,175,0.25)', badge:'⬜' },
  uncommon:  { label:'Uncommon',  color:'#4ade80', glow:'rgba(74,222,128,0.25)',  badge:'🟩' },
  rare:      { label:'Rare',      color:'#60a5fa', glow:'rgba(96,165,250,0.3)',   badge:'🟦' },
  legendary: { label:'Legendary', color:'#f5c842', glow:'rgba(245,200,66,0.35)',  badge:'🟡' },
  evil:      { label:'Evil',      color:'#ef4444', glow:'rgba(239,68,68,0.3)',    badge:'🔴' },
  corrupted: { label:'Corrupted', color:'#7c3aed', glow:'rgba(124,58,237,0.3)',   badge:'⚫' },
};

export function getRarity(r) { return RARITY[r] || RARITY.common; }

/* ══════════════════════════════════════
   WEAPONS — Swords
   slot:'weapon', type:'sword'
══════════════════════════════════════ */
export const SWORDS = [
  { id:'sword-wood',     slot:'weapon', type:'sword', rarity:'common',
    name:'Ashwood Blade',        icon:ICO('weapons','sword-wood'),
    effect:'+8 Attack',          lore:'A crude blade carved from cursed ashwood.',
    source:'craft' },
  { id:'sword-blunt',    slot:'weapon', type:'sword', rarity:'common',
    name:'Ironclad Crusher',     icon:ICO('weapons','sword-blunt'),
    effect:'+14 Attack',         lore:'Heavy and brutal. Favoured by dungeon thugs.',
    source:'craft_drop' },
  { id:'sword-silver',   slot:'weapon', type:'sword', rarity:'uncommon',
    name:'Silverite Edge',       icon:ICO('weapons','sword-silver'),
    effect:'+22 Attack',         lore:'Forged in moonlight. Deadly to shadow creatures.',
    source:'craft_drop' },
  { id:'sword-blunter',  slot:'weapon', type:'sword', rarity:'uncommon',
    name:'Gravecleaver',         icon:ICO('weapons','sword-blunter'),
    effect:'+30 Attack',         lore:'Used to split open vault doors in the old wars.',
    source:'craft_drop' },
  { id:'sword-red',      slot:'weapon', type:'sword', rarity:'rare',
    name:'Bloodthorn Sword',     icon:ICO('weapons','sword-red'),
    effect:'+40 Attack +5% Lifesteal', lore:'The blade drinks what it cuts.',
    source:'craft_drop' },
  { id:'sword-cyberelk', slot:'weapon', type:'sword', rarity:'legendary',
    name:'Cyber Elk Saber',      icon:ICO('weapons','sword-cyberelk'),
    effect:'+52 Attack +8 Speed', lore:'Part machine, part cursed relic. Entirely dangerous.',
    source:'craft_drop' },
  { id:'sword-redflame', slot:'weapon', type:'sword', rarity:'evil',
    name:'Embervein Sword',      icon:ICO('weapons','sword-redflame'),
    effect:'+68 Attack +Burn',   lore:'Channels volcanic energy through every swing.',
    source:'craft' },
];

/* ══════════════════════════════════════
   WEAPONS — Gear (Bows & Staves)
   slot:'weapon', type:'gear'
══════════════════════════════════════ */
export const GEAR = [
  { id:'staff-bronze',   slot:'weapon', type:'gear', rarity:'common',
    name:'Rusted Conduit',       icon:ICO('gear','staff-bronze'),
    effect:'+10 Magic Attack',   lore:'A bronze rod wrapped in fraying spell thread.',
    source:'craft' },
  { id:'staff-silver',   slot:'weapon', type:'gear', rarity:'uncommon',
    name:'Moonwhisper Staff',    icon:ICO('gear','staff-silver'),
    effect:'+18 Magic Attack',   lore:'Carved from a petrified moonbeam.',
    source:'craft_drop' },
  { id:'staff-gold',     slot:'weapon', type:'gear', rarity:'rare',
    name:'Aurum Sceptre',        icon:ICO('gear','staff-gold'),
    effect:'+28 Magic Attack +10 MP', lore:'Channels pure gold energy through arcane conduits.',
    source:'craft_drop' },
  { id:'staff-diamond',  slot:'weapon', type:'gear', rarity:'legendary',
    name:'Voidcrystal Staff',    icon:ICO('gear','staff-diamond'),
    effect:'+42 Magic Attack +20 MP', lore:'Diamond core housing a fragment of void energy.',
    source:'craft_drop' },
  { id:'bow-silver',     slot:'weapon', type:'gear', rarity:'common',
    name:'Whisper Bow',          icon:ICO('gear','bow-silver'),
    effect:'+16 Ranged Attack',  lore:'Silent as a ghost. Twice as deadly.',
    source:'craft_drop' },
  { id:'bow-gold',       slot:'weapon', type:'gear', rarity:'uncommon',
    name:'Gilded Longbow',       icon:ICO('gear','bow-gold'),
    effect:'+26 Ranged Attack',  lore:'A masterwork bow traded for a soul.',
    source:'craft_drop' },
  { id:'bow-emerald',    slot:'weapon', type:'gear', rarity:'uncommon',
    name:'Venomstrike Bow',      icon:ICO('gear','bow-emerald'),
    effect:'+36 Ranged Attack +Poison', lore:'Emerald tips coat every arrow in slow death.',
    source:'craft_drop' },
  { id:'bow-diamond',    slot:'weapon', type:'gear', rarity:'rare',
    name:'Prismatic Bow',        icon:ICO('gear','bow-diamond'),
    effect:'+48 Ranged Attack',  lore:'Splits light into lethal beams on each draw.',
    source:'craft_drop' },
  { id:'bow-laced-gold', slot:'weapon', type:'gear', rarity:'rare',
    name:'Lacewire Goldbow',     icon:ICO('gear','bow-laced-gold'),
    effect:'+50 Ranged Attack +Crit', lore:'Gold threads wound tight enough to cut stone.',
    source:'craft_drop' },
  { id:'bow-lucian',     slot:'weapon', type:'gear', rarity:'legendary',
    name:"Lucian's Grimbow",     icon:ICO('gear','bow-lucian'),
    effect:'+62 Ranged Attack +15% Crit', lore:'Cursed by a dying archer. Shoots twice per draw.',
    source:'craft_drop' },
  { id:'bow-cyber-elk',  slot:'weapon', type:'gear', rarity:'legendary',
    name:'Cyber Elk Bow',        icon:ICO('gear','bow-cyber-elk'),
    effect:'+65 Ranged Attack',  lore:'Mechanical precision fused with beast instinct.',
    source:'craft_drop' },
  { id:'bow-evil-l',     slot:'weapon', type:'gear', rarity:'evil',
    name:'Shadowstring Bow I',   icon:ICO('gear','bow-evil-l'),
    effect:'+75 Ranged Attack +Dark', lore:'The string hums with malevolent intent.',
    source:'craft' },
  { id:'bow-evil-ll',    slot:'weapon', type:'gear', rarity:'evil',
    name:'Shadowstring Bow II',  icon:ICO('gear','bow-evil-ll'),
    effect:'+90 Ranged Attack +Dark +Stun', lore:'Second form. The bow begins to hunt on its own.',
    source:'craft' },
];

/* ══════════════════════════════════════
   CHEST — Armor
   slot:'chest'
══════════════════════════════════════ */
export const ARMORS = [
  { id:'armor-bronze',   slot:'chest', rarity:'common',
    name:'Bronzescale Vest',     icon:ICO('armor','armor-bronze'),
    effect:'+12 Defense',        lore:'Lightweight bronze plates stitched to leather.',
    source:'craft_drop' },
  { id:'armor-silver',   slot:'chest', rarity:'uncommon',
    name:'Silverweave Mail',     icon:ICO('armor','armor-silver'),
    effect:'+22 Defense',        lore:'Interlinked silver rings humming with ward magic.',
    source:'craft_drop' },
  { id:'armor-gold',     slot:'chest', rarity:'rare',
    name:'Aureate Plate',        icon:ICO('armor','armor-gold'),
    effect:'+35 Defense +5 HP',  lore:'Hammered gold infused with vitality runes.',
    source:'craft_drop' },
  { id:'armor-diamond',  slot:'chest', rarity:'legendary',
    name:'Diamondweave Cuirass', icon:ICO('armor','armor-diamond'),
    effect:'+50 Defense +15 HP', lore:'Near indestructible. Cut from crystallised void rock.',
    source:'craft_drop' },
  { id:'armor-evil',     slot:'chest', rarity:'evil',
    name:'Corruption Shroud',    icon:ICO('armor','armor-evil'),
    effect:'+65 Defense +Dark Aura', lore:'Worn by those who have given up being good.',
    source:'craft' },
];

/* ══════════════════════════════════════
   HEAD — Helmets
   slot:'head', type:'helmet'
══════════════════════════════════════ */
export const HELMETS = [
  { id:'helmet-bronze',  slot:'head', type:'helmet', rarity:'common',
    name:'Bronzecrown Helm',     icon:ICO('helmets','helmet-bronze'),
    effect:'+10 Defense',        lore:'Simple protection for the simple warrior.',
    source:'craft_drop' },
  { id:'helmet-silver',  slot:'head', type:'helmet', rarity:'uncommon',
    name:'Silverguard Helm',     icon:ICO('helmets','helmet-silver'),
    effect:'+18 Defense',        lore:'Polished silver deflects both blade and curse.',
    source:'craft_drop' },
  { id:'helmet-gold',    slot:'head', type:'helmet', rarity:'rare',
    name:'Aurumcrest Helm',      icon:ICO('helmets','helmet-gold'),
    effect:'+28 Defense +5 HP',  lore:"A general's helmet. Commands respect.",
    source:'craft_drop' },
  { id:'helmet-diamond', slot:'head', type:'helmet', rarity:'legendary',
    name:'Prism Warhelm',        icon:ICO('helmets','helmet-diamond'),
    effect:'+40 Defense +10 HP', lore:'Diamond visor fragments attacks into harmless light.',
    source:'craft_drop' },
  { id:'helmet-blisk',   slot:'head', type:'helmet', rarity:'uncommon',
    name:'Blisk Warhelm',        icon:ICO('helmets','helmet-blisk'),
    effect:'+30 Defense',        lore:'Heavy iron helm favoured by the Blisk mercenaries.',
    source:'craft_drop' },
  { id:'helmet-blight',  slot:'head', type:'helmet', rarity:'rare',
    name:'Blightward Helm',      icon:ICO('helmets','helmet-blight'),
    effect:'+35 Defense +Poison Resist', lore:"Sealed against toxic air. A survivor's helm.",
    source:'craft_drop' },
  { id:'helmet-gothem',  slot:'head', type:'helmet', rarity:'legendary',
    name:'Gothem Siege Helm',    icon:ICO('helmets','helmet-gothem'),
    effect:'+48 Defense',        lore:'Siege warfare helmet. Survived three city falls.',
    source:'craft_drop' },
  { id:'helmet-sea',     slot:'head', type:'helmet', rarity:'rare',
    name:'Tidewarden Helm',      icon:ICO('helmets','helmet-sea'),
    effect:'+32 Defense +Water Resist', lore:'Worn by drowned knights risen from the deep.',
    source:'craft_drop' },
  { id:'helmet-tarot',   slot:'head', type:'helmet', rarity:'legendary',
    name:'Arcane Tarot Helm',    icon:ICO('helmets','helmet-tarot'),
    effect:'+38 Defense +12 MP', lore:'Engraved with tarot symbols that grant foresight.',
    source:'craft_drop' },
  { id:'helmet-evil',    slot:'head', type:'helmet', rarity:'evil',
    name:'Dread Visage',         icon:ICO('helmets','helmet-evil'),
    effect:'+55 Defense +Fear Aura', lore:'Enemies hesitate when they see this helm.',
    source:'craft' },
];

/* ══════════════════════════════════════
   HEAD — Wizard Hats
   slot:'head', type:'hat'
══════════════════════════════════════ */
export const HATS = [
  { id:'hat-brown',      slot:'head', type:'hat', rarity:'common',
    name:"Wanderer's Brim",      icon:ICO('hats','hat-brown'),
    effect:'+8 Magic Attack',    lore:'A dusty hat worn by travelling conjurers.',
    source:'craft_drop' },
  { id:'hat-ash',        slot:'head', type:'hat', rarity:'uncommon',
    name:'Ashweave Cowl',        icon:ICO('hats','hat-ash'),
    effect:'+14 Magic Attack',   lore:'Woven from the hair of ash wraiths.',
    source:'craft_drop' },
  { id:'hat-white',      slot:'head', type:'hat', rarity:'uncommon',
    name:'Ivory Spire Hat',      icon:ICO('hats','hat-white'),
    effect:'+22 Magic Attack +8 MP', lore:'Channelled through white arcane thread.',
    source:'craft_drop' },
  { id:'hat-gold',       slot:'head', type:'hat', rarity:'rare',
    name:'Aurum Sorcerer Hat',   icon:ICO('hats','hat-gold'),
    effect:'+32 Magic Attack +15 MP', lore:'Worn by guild archmages. Pure gold weave.',
    source:'craft_drop' },
  { id:'hat-diamond',    slot:'head', type:'hat', rarity:'legendary',
    name:'Prism Wizard Crown',   icon:ICO('hats','hat-diamond'),
    effect:'+45 Magic Attack +25 MP', lore:'Diamond lattice amplifies every spell cast.',
    source:'craft_drop' },
  { id:'hat-evil',       slot:'head', type:'hat', rarity:'evil',
    name:'Hex Sovereign Hat',    icon:ICO('hats','hat-evil'),
    effect:'+60 Magic Attack +Dark Spells', lore:'The hat chooses its wearer. Not the other way around.',
    source:'craft' },
];

/* ══════════════════════════════════════
   BOOTS
   slot:'boots'
══════════════════════════════════════ */
export const BOOTS = [
  { id:'boots-bronze',   slot:'boots', rarity:'common',
    name:'Bronzestep Boots',     icon:ICO('boots','boots-bronze'),
    effect:'+8 Agility',         lore:'Solid footing for rough terrain.',
    source:'craft_drop' },
  { id:'boots-silver',   slot:'boots', rarity:'uncommon',
    name:'Swiftsilver Treads',   icon:ICO('boots','boots-silver'),
    effect:'+16 Agility',        lore:'Silver-lined soles that quiet every step.',
    source:'craft_drop' },
  { id:'boots-gold',     slot:'boots', rarity:'rare',
    name:'Goldstrider Boots',    icon:ICO('boots','boots-gold'),
    effect:'+26 Agility +5 HP',  lore:'Worn by elite scouts of the fallen empire.',
    source:'craft_drop' },
  { id:'boots-diamond',  slot:'boots', rarity:'legendary',
    name:'Voidstep Greaves',     icon:ICO('boots','boots-diamond'),
    effect:'+38 Agility +10 HP', lore:'Diamond soles that barely touch the ground.',
    source:'craft_drop' },
  { id:'boots-evil',     slot:'boots', rarity:'evil',
    name:'Shadowwalker Boots',   icon:ICO('boots','boots-evil'),
    effect:'+50 Agility +Stealth', lore:'Leave no footprints. Make no sound.',
    source:'craft' },
];

/* ══════════════════════════════════════
   TRINKETS — Rings
   slot:'trinket', type:'ring'
══════════════════════════════════════ */
export const RINGS = [
  { id:'ring-blue',      slot:'trinket', type:'ring', rarity:'common',
    name:'Sapphire Band',        icon:ICO('trinklets','ring-blue'),
    effect:'+10 MP',             lore:'A calm blue ring that steadies the mind.',
    source:'craft_drop' },
  { id:'ring-built',     slot:'trinket', type:'ring', rarity:'uncommon',
    name:'Ironwright Ring',      icon:ICO('trinklets','ring-built'),
    effect:'+15 Defense',        lore:'Crafted by a blacksmith who never lost a battle.',
    source:'craft_drop' },
  { id:'ring-gold',      slot:'trinket', type:'ring', rarity:'rare',
    name:'Auric Seal',           icon:ICO('trinklets','ring-gold'),
    effect:'+20 MP +10 HP',      lore:'A golden ring bearing the seal of a forgotten king.',
    source:'craft_drop' },
  { id:'ring-evil',      slot:'trinket', type:'ring', rarity:'evil',
    name:'Malice Signet',        icon:ICO('trinklets','ring-evil'),
    effect:'+25 Attack +Dark',   lore:'The signet of a condemned warlord.',
    source:'craft' },
  { id:'ring-eviler',    slot:'trinket', type:'ring', rarity:'corrupted',
    name:'Oblivion Signet',      icon:ICO('trinklets','ring-eviler'),
    effect:'+35 Attack +Void Dmg', lore:'Deeper corruption. The ring pulses with hunger.',
    source:'craft' },
];

/* ══════════════════════════════════════
   TRINKETS — Necklaces
   slot:'trinket', type:'necklace'
══════════════════════════════════════ */
export const NECKLACES = [
  { id:'necklace-old',   slot:'trinket', type:'necklace', rarity:'common',
    name:'Faded Locket',         icon:ICO('trinklets','necklace-old'),
    effect:'+8 HP',              lore:'Contains a portrait of someone long forgotten.',
    source:'craft_drop' },
  { id:'necklace-good',  slot:'trinket', type:'necklace', rarity:'uncommon',
    name:'Blessed Talisman',     icon:ICO('trinklets','necklace-good'),
    effect:'+15 HP +5 Defense',  lore:'Blessed by a priest who survived the first purge.',
    source:'craft_drop' },
  { id:'necklace-gold',  slot:'trinket', type:'necklace', rarity:'rare',
    name:'Aurum Pendant',        icon:ICO('trinklets','necklace-gold'),
    effect:'+20 HP +10 MP',      lore:'Pure gold chain holding a pulsing vitality gem.',
    source:'craft_drop' },
  { id:'necklace-emerald',slot:'trinket',type:'necklace', rarity:'rare',
    name:'Venom Ward Chain',     icon:ICO('trinklets','necklace-emerald'),
    effect:'+25 HP +Poison Resist', lore:'Emerald beads neutralise toxins on contact.',
    source:'craft_drop' },
  { id:'necklace-evil',  slot:'trinket', type:'necklace', rarity:'evil',
    name:'Soulchain Collar',     icon:ICO('trinklets','necklace-evil'),
    effect:'+30 HP +Soul Drain', lore:"Chains the wearer's soul to a dark patron.",
    source:'craft' },
];

/* ══════════════════════════════════════
   CONSUMABLES — Food
   cat:'food'
══════════════════════════════════════ */
export const FOOD = [
  { id:'food-burrito',        cat:'food', rarity:'common',
    name:'Cursed Wrap',          icon:ICO('consumables','food-burrito'),
    effect:'Restore 20 HP', uses:3 },
  { id:'food-fruitcake',      cat:'food', rarity:'common',
    name:'Blightfruit Cake',     icon:ICO('consumables','food-fruitcake'),
    effect:'Restore 35 HP', uses:3 },
  { id:'food-meat',           cat:'food', rarity:'uncommon',
    name:'Shadowbeast Meat',     icon:ICO('consumables','food-meat'),
    effect:'Restore 50 HP', uses:3 },
  { id:'food-meatball',       cat:'food', rarity:'common',
    name:'Voidmeat Morsels',     icon:ICO('consumables','food-meatball'),
    effect:'Restore 45 HP', uses:3 },
  { id:'food-nacho',          cat:'food', rarity:'common',
    name:'Ashstone Crisps',      icon:ICO('consumables','food-nacho'),
    effect:'Restore 25 HP', uses:3 },
  { id:'food-pancakes',       cat:'food', rarity:'common',
    name:'Darkflour Cakes',      icon:ICO('consumables','food-pancakes'),
    effect:'Restore 30 HP', uses:3 },
  { id:'food-ramen',          cat:'food', rarity:'uncommon',
    name:'Plaguebroth Ramen',    icon:ICO('consumables','food-ramen'),
    effect:'Restore 55 HP', uses:2 },
  { id:'food-roastedchicken', cat:'food', rarity:'uncommon',
    name:'Hexed Roast',          icon:ICO('consumables','food-roastedchicken'),
    effect:'Restore 65 HP', uses:2 },
  { id:'food-sandwich',       cat:'food', rarity:'common',
    name:'Graveyard Sub',        icon:ICO('consumables','food-sandwich'),
    effect:'Restore 40 HP', uses:3 },
  { id:'food-sushi',          cat:'food', rarity:'uncommon',
    name:'Deep Tide Sushi',      icon:ICO('consumables','food-sushi'),
    effect:'Restore 60 HP', uses:2 },
];

/* ══════════════════════════════════════
   CONSUMABLES — Potions
   cat:'potions'
══════════════════════════════════════ */
export const POTIONS = [
  { id:'potion-heal',         cat:'potions', rarity:'common',
    name:'Blood Mend Potion',    icon:ICO('consumables','potion-heal'),
    effect:'Restore 100 HP immediately', uses:2 },
  { id:'potion-regen',        cat:'potions', rarity:'common',
    name:'Regen Elixir',         icon:ICO('consumables','potion-regen'),
    effect:'Restore 100 HP immediately', uses:2 },
  { id:'potion-magic',        cat:'potions', rarity:'uncommon',
    name:'Arcane Surge Potion',  icon:ICO('consumables','potion-magic'),
    effect:'Restore 80 MP', uses:2 },
  { id:'potion-normal',       cat:'potions', rarity:'common',
    name:'Field Remedy',         icon:ICO('consumables','potion-normal'),
    effect:'Restore 50 HP + 30 MP', uses:3 },
  { id:'potion-lucide',       cat:'potions', rarity:'uncommon',
    name:'Lucid Draught',        icon:ICO('consumables','potion-lucide'),
    effect:'Restore 60 MP + clarity', uses:2 },
  { id:'potion-speed',        cat:'potions', rarity:'uncommon',
    name:'Swiftblood Tonic',     icon:ICO('consumables','potion-speed'),
    effect:'+20 Agility for 3 turns', uses:2 },
  { id:'potion-spikes',       cat:'potions', rarity:'rare',
    name:'Thornblood Vial',      icon:ICO('consumables','potion-spikes'),
    effect:'Reflect 20% damage for 3 turns', uses:2 },
  { id:'potion-strength',     cat:'potions', rarity:'rare',
    name:'Strength Serum',       icon:ICO('consumables','potion-magic'),
    effect:'Grants 100 temp MP; real MP shows when depleted', uses:2 },
  { id:'potion-invisibility', cat:'potions', rarity:'legendary',
    name:'Wraith Cloak Potion',  icon:ICO('consumables','potion-Invisibility'),
    effect:'Invisible to enemies for 2 turns', uses:1 },
];

/* ══════════════════════════════════════
   MATERIALS — Crafting + Sellable
   cat:'materials'
   sellPrice = what player gets when selling
   buyPrice  = only on market items (set separately)
══════════════════════════════════════ */
export const MATERIALS = [
  /* Bars */
  { id:'bar-bronze',    cat:'materials', rarity:'common',    name:'Bronzite Ingot',       icon:ICO('materials','bar-bronze'),        sellPrice:30  },
  { id:'bar-copper',    cat:'materials', rarity:'common',    name:'Copperite Ingot',      icon:ICO('materials','bar-copper'),        sellPrice:40  },
  { id:'bar-silver',    cat:'materials', rarity:'uncommon',  name:'Moonsilver Bar',       icon:ICO('materials','bar-silver'),        sellPrice:60  },
  { id:'bar-gold',      cat:'materials', rarity:'uncommon',  name:'Auric Ingot',          icon:ICO('materials','bar-gold'),          sellPrice:100 },
  { id:'bar-diamond',   cat:'materials', rarity:'rare',      name:'Void Diamond Bar',     icon:ICO('materials','bar-diamond'),       sellPrice:200 },
  /* Bones + Organic */
  { id:'bone',          cat:'materials', rarity:'common',    name:'Hollow Bone',          icon:ICO('materials','bone'),              sellPrice:15  },
  { id:'skull',         cat:'materials', rarity:'uncommon',  name:'Dreadskull',           icon:ICO('materials','Skull'),             sellPrice:80  },
  { id:'slimeball',     cat:'materials', rarity:'common',    name:'Void Slime Core',      icon:ICO('materials','slimeball'),         sellPrice:25  },
  { id:'cotton',        cat:'materials', rarity:'common',    name:'Cursed Cotton',        icon:ICO('materials','cotton'),            sellPrice:10  },
  { id:'leaf',          cat:'materials', rarity:'common',    name:'Shadowleaf',           icon:ICO('materials','leaf'),              sellPrice:12  },
  { id:'wood',          cat:'materials', rarity:'common',    name:'Blightwood',           icon:ICO('materials','wood'),              sellPrice:20  },
  { id:'stoneblock',    cat:'materials', rarity:'common',    name:'Obsidian Chunk',       icon:ICO('materials','stoneblock'),        sellPrice:35  },
  /* Crystals */
  { id:'crystal-dull',    cat:'materials', rarity:'common',    name:'Faded Shard',        icon:ICO('materials','crystal-dull'),      sellPrice:18  },
  { id:'crystal-silver',  cat:'materials', rarity:'uncommon',  name:'Lunar Crystal',      icon:ICO('materials','crystal-silver'),    sellPrice:55  },
  { id:'crystal-gold',    cat:'materials', rarity:'uncommon',  name:'Solar Crystal',      icon:ICO('materials','crystal-gold'),      sellPrice:90  },
  { id:'crystal-emerald', cat:'materials', rarity:'uncommon',  name:'Venom Crystal',      icon:ICO('materials','crystal-emerald'),   sellPrice:75  },
  { id:'crystal-diamond', cat:'materials', rarity:'rare',      name:'Void Crystal',       icon:ICO('materials','crystal-diamond'),   sellPrice:180 },
  { id:'crystal-evil',    cat:'materials', rarity:'evil',      name:'Corruption Shard',   icon:ICO('materials','crystal-evil'),      sellPrice:150 },
  { id:'crystal-orange',  cat:'materials', rarity:'uncommon',  name:'Ember Crystal',      icon:ICO('materials','crystal-orange'),    sellPrice:65  },
  { id:'crystal-pink',    cat:'materials', rarity:'uncommon',  name:'Soulbloom Crystal',  icon:ICO('materials','crystal-pink'),      sellPrice:70  },
  { id:'crystal-purple',  cat:'materials', rarity:'uncommon',  name:'Dusk Crystal',       icon:ICO('materials','crystal-purple'),    sellPrice:80  },
  /* Fragments */
  { id:'frag-bronze',   cat:'materials', rarity:'common',    name:'Bronze Splinter',      icon:ICO('materials','frag-bronze'),       sellPrice:8   },
  { id:'frag-copper',   cat:'materials', rarity:'common',    name:'Copper Splinter',      icon:ICO('materials','frag-copper'),       sellPrice:10  },
  { id:'frag-silver',   cat:'materials', rarity:'common',    name:'Silver Splinter',      icon:ICO('materials','frag-silver'),       sellPrice:20  },
  { id:'frag-gold',     cat:'materials', rarity:'uncommon',  name:'Gold Splinter',        icon:ICO('materials','frag-gold'),         sellPrice:40  },
  { id:'frag-diamond',  cat:'materials', rarity:'rare',      name:'Diamond Splinter',     icon:ICO('materials','frag-diamond'),      sellPrice:90  },
  /* Gems */
  { id:'gem-blue',      cat:'materials', rarity:'uncommon',  name:'Sapphire Gem',         icon:ICO('materials','gem-blue'),          sellPrice:60  },
  { id:'gem-brown',     cat:'materials', rarity:'common',    name:'Earthstone Gem',       icon:ICO('materials','gem-brown'),         sellPrice:35  },
  { id:'gem-emerald',   cat:'materials', rarity:'uncommon',  name:'Venom Gem',            icon:ICO('materials','gem-emerald'),       sellPrice:75  },
  { id:'gem-orange',    cat:'materials', rarity:'uncommon',  name:'Ember Gem',            icon:ICO('materials','gem-orange'),        sellPrice:55  },
  { id:'gem-pink',      cat:'materials', rarity:'uncommon',  name:'Soul Gem',             icon:ICO('materials','gem-pink'),          sellPrice:70  },
  { id:'gem-purple',    cat:'materials', rarity:'uncommon',  name:'Hexstone Gem',         icon:ICO('materials','gem-purple'),        sellPrice:80  },
  { id:'gem-red',       cat:'materials', rarity:'rare',      name:'Blood Gem',            icon:ICO('materials','gem-red'),           sellPrice:85  },
  { id:'gem-white',     cat:'materials', rarity:'rare',      name:'Purity Gem',           icon:ICO('materials','gem-white'),         sellPrice:90  },
  { id:'gem-yellow',    cat:'materials', rarity:'uncommon',  name:'Sundrop Gem',          icon:ICO('materials','gem-yellow'),        sellPrice:65  },
  /* Pearls */
  { id:'pearl-ash',     cat:'materials', rarity:'uncommon',  name:'Ashen Pearl',          icon:ICO('materials','pearl-ash'),         sellPrice:45  },
  { id:'pearl-diamond', cat:'materials', rarity:'legendary', name:'Void Pearl',           icon:ICO('materials','pearl-diamond'),     sellPrice:160 },
  { id:'pearl-gold',    cat:'materials', rarity:'rare',      name:'Aureate Pearl',        icon:ICO('materials','pearl-gold'),        sellPrice:110 },
  { id:'pearl-red',     cat:'materials', rarity:'rare',      name:'Blood Pearl',          icon:ICO('materials','pearl-red'),         sellPrice:95  },
  /* Shards */
  { id:'shard-black',   cat:'materials', rarity:'rare',      name:'Voidstone Shard',      icon:ICO('materials','shard-black'),       sellPrice:70  },
  { id:'shard-brown',   cat:'materials', rarity:'common',    name:'Earthshard',           icon:ICO('materials','shard-brown'),       sellPrice:25  },
  { id:'shard-copper',  cat:'materials', rarity:'common',    name:'Copper Shard',         icon:ICO('materials','shard-copper'),      sellPrice:15  },
  { id:'shard-pink',    cat:'materials', rarity:'uncommon',  name:'Rosebloom Shard',      icon:ICO('materials','shard-pink'),        sellPrice:40  },
  { id:'shard-purple',  cat:'materials', rarity:'uncommon',  name:'Hexshard',             icon:ICO('materials','shard-purple'),      sellPrice:55  },
  { id:'shard-red',     cat:'materials', rarity:'uncommon',  name:'Bloodshard',           icon:ICO('materials','shard-red'),         sellPrice:50  },
  { id:'shard-white',   cat:'materials', rarity:'uncommon',  name:'Purity Shard',         icon:ICO('materials','shard-white'),       sellPrice:60  },
  /* Scrolls */
  { id:'scroll-olaf',   cat:'materials', rarity:'rare',      name:"Olaf's War Scroll",    icon:ICO('materials','scroll-olaf'),       sellPrice:85  },
  { id:'scroll-old',    cat:'materials', rarity:'uncommon',  name:'Ancient Parchment',    icon:ICO('materials','scroll-old'),        sellPrice:50  },
  { id:'scroll-ole',    cat:'materials', rarity:'uncommon',  name:'Ole Binding Scroll',   icon:ICO('materials','scroll-ole'),        sellPrice:60  },
  { id:'scroll-org',    cat:'materials', rarity:'rare',      name:'Corrupted Codex',      icon:ICO('materials','scroll-org'),        sellPrice:75  },
  /* Books + Tomes */
  { id:'book',          cat:'materials', rarity:'uncommon',  name:'Forbidden Tome',       icon:ICO('materials','book'),              sellPrice:100 },
  { id:'moonbook',      cat:'materials', rarity:'rare',      name:'Lunar Grimoire',       icon:ICO('materials','moonbook'),          sellPrice:130 },
  { id:'witchbook',     cat:'materials', rarity:'rare',      name:"Witch's Grimoire",     icon:ICO('materials','witchbook'),         sellPrice:160 },
  { id:'spellbook-gold',   cat:'materials', rarity:'rare',      name:'Auric Spellbook',   icon:ICO('materials','spellbook-gold'),    sellPrice:140 },
  { id:'spellbook-evil',   cat:'materials', rarity:'evil',      name:'Dread Spellbook',   icon:ICO('materials','spellbook-evil'),    sellPrice:175 },
  { id:'spellbook-harem',  cat:'materials', rarity:'uncommon',  name:'Forbidden Codex',   icon:ICO('materials','spellbook-harem'),   sellPrice:120 },
  { id:'spellbook-heat',   cat:'materials', rarity:'uncommon',  name:'Embersong Tome',    icon:ICO('materials','spellbook-heat'),    sellPrice:110 },
  { id:'spellbook-herm',   cat:'materials', rarity:'uncommon',  name:"Hermit's Journal",  icon:ICO('materials','spellbook-herm'),    sellPrice:95  },
  { id:'spellbook-must',   cat:'materials', rarity:'uncommon',  name:'Mustveil Codex',    icon:ICO('materials','spellbook-must'),    sellPrice:105 },
  { id:'spellbook-virex',  cat:'materials', rarity:'rare',      name:'Virex Tome',        icon:ICO('materials','spellbook-virex'),   sellPrice:130 },
  { id:'spellbook-virus',  cat:'materials', rarity:'rare',      name:'Contagion Codex',   icon:ICO('materials','spellbook-virus'),   sellPrice:150 },
  { id:'spellbook-virusc', cat:'materials', rarity:'corrupted', name:'Viral Strain Tome', icon:ICO('materials','spellbook-virusc'),  sellPrice:165 },
  /* Misc */
  { id:'talesman',      cat:'materials', rarity:'rare',      name:'Runic Talisman',       icon:ICO('materials','talesman'),          sellPrice:120 },
];

/* ══════════════════════════════════════
   COMBINED ARRAYS
══════════════════════════════════════ */
export const ALL_EQUIP = [
  ...SWORDS, ...GEAR, ...ARMORS,
  ...HELMETS, ...HATS, ...BOOTS,
  ...RINGS, ...NECKLACES,
];
export const ALL_CONSUMABLES = [...FOOD, ...POTIONS];
export const ALL_ITEMS       = [...ALL_EQUIP, ...ALL_CONSUMABLES, ...MATERIALS];

/* ── Universal item lookup ── */
export function getItemDef(id) {
  return ALL_ITEMS.find(i => i.id === id) || null;
}

/* ══════════════════════════════════════
   EQUIP RULES — mutual exclusion
══════════════════════════════════════ */
export function canEquip(item, currentEquipped) {
  if (!item?.slot) return false;
  const eq       = currentEquipped || {};
  const existing = ALL_EQUIP.find(i => i.id === eq[item.slot]);
  if (!existing) return true;
  /* Same slot — check type conflict */
  if (item.slot === 'weapon'  && existing.type !== item.type)  return false;
  if (item.slot === 'head'    && existing.type !== item.type)  return false;
  if (item.slot === 'trinket' && existing.type !== item.type)  return false;
  return true;
}

/* ══════════════════════════════════════
   MARKET CATALOGUE
   Rules:
   — NO equipment (no swords, gear, armor, helmets, hats, boots, trinkets)
   — NO evil or corrupted items
   — Potions: only common/uncommon (4 items)
   — Food: all 10
   — Materials: only common fragments + stoneblock (3 items)
   — Rare gear: exactly 3 high-price items (non-evil)
══════════════════════════════════════ */
export const MARKET_ITEMS = [
  /* ── Potions (4 basic only) ── */
  { id:'potion-heal',    name:'Blood Mend Potion', emoji:'🧪', cat:'potions',   rarity:'common',   price:80,  maxUses:2, effect:'Restore 100 HP' },
  { id:'potion-regen',   name:'Regen Elixir',       emoji:'⚗️', cat:'potions',   rarity:'common',   price:80,  maxUses:2, effect:'Restore 100 HP' },
  { id:'potion-normal',  name:'Field Remedy',        emoji:'💊', cat:'potions',   rarity:'common',   price:50,  maxUses:3, effect:'Restore 50 HP + 30 MP' },
  { id:'potion-magic',   name:'Arcane Surge',        emoji:'🔮', cat:'potions',   rarity:'uncommon', price:90,  maxUses:2, effect:'Restore 80 MP' },
  /* ── Food (all 10) ── */
  { id:'food-burrito',        name:'Cursed Wrap',       emoji:'🌯', cat:'food', rarity:'common',   price:20,  maxUses:3, effect:'Restore 20 HP' },
  { id:'food-fruitcake',      name:'Blightfruit Cake',  emoji:'🎂', cat:'food', rarity:'common',   price:30,  maxUses:3, effect:'Restore 35 HP' },
  { id:'food-meat',           name:'Shadowbeast Meat',  emoji:'🥩', cat:'food', rarity:'uncommon', price:40,  maxUses:3, effect:'Restore 50 HP' },
  { id:'food-meatball',       name:'Voidmeat Morsels',  emoji:'🍢', cat:'food', rarity:'common',   price:35,  maxUses:3, effect:'Restore 45 HP' },
  { id:'food-nacho',          name:'Ashstone Crisps',   emoji:'🍿', cat:'food', rarity:'common',   price:22,  maxUses:3, effect:'Restore 25 HP' },
  { id:'food-pancakes',       name:'Darkflour Cakes',   emoji:'🥞', cat:'food', rarity:'common',   price:28,  maxUses:3, effect:'Restore 30 HP' },
  { id:'food-ramen',          name:'Plaguebroth Ramen', emoji:'🍜', cat:'food', rarity:'uncommon', price:55,  maxUses:2, effect:'Restore 55 HP' },
  { id:'food-roastedchicken', name:'Hexed Roast',       emoji:'🍗', cat:'food', rarity:'uncommon', price:60,  maxUses:2, effect:'Restore 65 HP' },
  { id:'food-sandwich',       name:'Graveyard Sub',     emoji:'🥪', cat:'food', rarity:'common',   price:32,  maxUses:3, effect:'Restore 40 HP' },
  { id:'food-sushi',          name:'Deep Tide Sushi',   emoji:'🍣', cat:'food', rarity:'uncommon', price:58,  maxUses:2, effect:'Restore 60 HP' },
  /* ── Basic fragments only (3 common materials) ── */
  { id:'frag-copper',   name:'Copper Splinter',  emoji:'🔶', cat:'materials', rarity:'common', price:15,  maxUses:1, effect:'Crafting material' },
  { id:'frag-bronze',   name:'Bronze Splinter',  emoji:'🟫', cat:'materials', rarity:'common', price:12,  maxUses:1, effect:'Crafting material' },
  { id:'stoneblock',    name:'Obsidian Chunk',   emoji:'⬛', cat:'materials', rarity:'common', price:40,  maxUses:1, effect:'Crafting material' },
  /* ── Rare gear (exactly 3, very expensive, non-evil) ── */
  { id:'staff-gold',    name:'Aurum Sceptre',    emoji:'🔮', cat:'gear',      rarity:'rare',   price:1800, maxUses:1, effect:'+28 Magic Attack +10 MP' },
  { id:'bow-diamond',   name:'Prismatic Bow',    emoji:'🏹', cat:'gear',      rarity:'rare',   price:2200, maxUses:1, effect:'+48 Ranged Attack' },
  { id:'sword-red',     name:'Bloodthorn Sword', emoji:'⚔️', cat:'gear',      rarity:'rare',   price:2500, maxUses:1, effect:'+40 Attack +5% Lifesteal' },
];

export const MARKET_CATS = [
  { id:'all',       label:'All'       },
  { id:'potions',   label:'Potions'   },
  { id:'food',      label:'Food'      },
  { id:'materials', label:'Materials' },
  { id:'gear',      label:'Rare Gear' },
];
