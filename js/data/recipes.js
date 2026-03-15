// js/data/recipes.js
// Crafting recipes — 50 total
// 4 craft slots max, 2-4 different materials each (no duplicates)
// Quantities: common=1x, uncommon=1-2x, rare=2-3x, legendary=3-4x, evil=3-4x
// Preview shows after 2nd material placed — live updates as slots fill

export const RECIPES = [
  /* ════ SWORDS ════ */
  { id:'r_ashwood_blade',      result:'sword-wood',     name:'Ashwood Blade',        rarity:'common',
    materials:[{id:'wood',qty:1},{id:'bone',qty:1}] },
  { id:'r_ironclad_crusher',   result:'sword-blunt',    name:'Ironclad Crusher',     rarity:'common',
    materials:[{id:'bar-bronze',qty:1},{id:'shard-copper',qty:1},{id:'cotton',qty:1}] },
  { id:'r_silverite_edge',     result:'sword-silver',   name:'Silverite Edge',       rarity:'uncommon',
    materials:[{id:'bar-silver',qty:1},{id:'frag-silver',qty:2},{id:'crystal-silver',qty:1}] },
  { id:'r_gravecleaver',       result:'sword-blunter',  name:'Gravecleaver',         rarity:'uncommon',
    materials:[{id:'bar-bronze',qty:1},{id:'bar-silver',qty:1},{id:'shard-brown',qty:2},{id:'beast-fangs',qty:1}] },
  { id:'r_bloodthorn_sword',   result:'sword-red',      name:'Bloodthorn Sword',     rarity:'rare',
    materials:[{id:'bar-gold',qty:2},{id:'gem-red',qty:2},{id:'shard-red',qty:2},{id:'dark-resin',qty:1}] },
  { id:'r_cyber_elk_saber',    result:'sword-cyberelk', name:'Cyber Elk Saber',      rarity:'legendary',
    materials:[{id:'bar-diamond',qty:3},{id:'crystal-diamond',qty:3},{id:'soul-dust',qty:2},{id:'moonstone-powder',qty:2}] },
  { id:'r_embervein_sword',    result:'sword-redflame', name:'Embervein Sword',      rarity:'evil',
    materials:[{id:'crystal-evil',qty:3},{id:'spellbook-evil',qty:1},{id:'dark-resin',qty:3},{id:'toxic-glands',qty:2}] },

  /* ════ STAVES ════ */
  { id:'r_rusted_conduit',     result:'staff-bronze',   name:'Rusted Conduit',       rarity:'common',
    materials:[{id:'frag-copper',qty:1},{id:'wood',qty:1}] },
  { id:'r_moonwhisper_staff',  result:'staff-silver',   name:'Moonwhisper Staff',    rarity:'uncommon',
    materials:[{id:'bar-silver',qty:1},{id:'crystal-silver',qty:2}] },
  { id:'r_aurum_sceptre',      result:'staff-gold',     name:'Aurum Sceptre',        rarity:'rare',
    materials:[{id:'bar-gold',qty:2},{id:'crystal-gold',qty:2},{id:'frag-gold',qty:2}] },
  { id:'r_voidcrystal_staff',  result:'staff-diamond',  name:'Voidcrystal Staff',    rarity:'legendary',
    materials:[{id:'bar-diamond',qty:3},{id:'crystal-diamond',qty:3},{id:'pearl-diamond',qty:2},{id:'frag-diamond',qty:3}] },

  /* ════ BOWS ════ */
  { id:'r_whisper_bow',        result:'bow-silver',     name:'Whisper Bow',          rarity:'common',
    materials:[{id:'bone',qty:1},{id:'cotton',qty:1},{id:'frag-copper',qty:1}] },
  { id:'r_gilded_longbow',     result:'bow-gold',       name:'Gilded Longbow',       rarity:'uncommon',
    materials:[{id:'bar-gold',qty:1},{id:'frag-gold',qty:2}] },
  { id:'r_venomstrike_bow',    result:'bow-emerald',    name:'Venomstrike Bow',      rarity:'uncommon',
    materials:[{id:'toxic-glands',qty:2},{id:'crystal-emerald',qty:1},{id:'beast-fangs',qty:2}] },
  { id:'r_prismatic_bow',      result:'bow-diamond',    name:'Prismatic Bow',        rarity:'rare',
    materials:[{id:'crystal-diamond',qty:2},{id:'frag-diamond',qty:2},{id:'gem-white',qty:2}] },
  { id:'r_lacewire_goldbow',   result:'bow-laced-gold', name:'Lacewire Goldbow',     rarity:'rare',
    materials:[{id:'bar-gold',qty:2},{id:'frag-gold',qty:2},{id:'pearl-gold',qty:2}] },
  { id:'r_lucians_grimbow',    result:'bow-lucian',     name:"Lucian's Grimbow",     rarity:'legendary',
    materials:[{id:'bar-diamond',qty:3},{id:'pearl-red',qty:3},{id:'soul-dust',qty:2},{id:'moonstone-powder',qty:2}] },
  { id:'r_cyber_elk_bow',      result:'bow-cyber-elk',  name:'Cyber Elk Bow',        rarity:'legendary',
    materials:[{id:'crystal-diamond',qty:3},{id:'pearl-diamond',qty:2},{id:'crystal-purple',qty:2},{id:'frag-diamond',qty:3}] },
  { id:'r_shadowstring_bow_1', result:'bow-evil-l',     name:'Shadowstring Bow I',   rarity:'evil',
    materials:[{id:'crystal-evil',qty:3},{id:'shard-black',qty:3},{id:'dark-resin',qty:2}] },
  { id:'r_shadowstring_bow_2', result:'bow-evil-ll',    name:'Shadowstring Bow II',  rarity:'evil',
    materials:[{id:'spellbook-evil',qty:1},{id:'crystal-evil',qty:3},{id:'shard-black',qty:3},{id:'shadow-essence',qty:3}] },

  /* ════ ARMOR ════ */
  { id:'r_bronzescale_vest',   result:'armor-bronze',   name:'Bronzescale Vest',     rarity:'common',
    materials:[{id:'frag-bronze',qty:1},{id:'cotton',qty:1},{id:'bone',qty:1}] },
  { id:'r_silverweave_mail',   result:'armor-silver',   name:'Silverweave Mail',     rarity:'uncommon',
    materials:[{id:'bar-silver',qty:1},{id:'frag-silver',qty:2},{id:'cotton',qty:1}] },
  { id:'r_aureate_plate',      result:'armor-gold',     name:'Aureate Plate',        rarity:'rare',
    materials:[{id:'bar-gold',qty:2},{id:'frag-gold',qty:2},{id:'gem-yellow',qty:2}] },
  { id:'r_diamondweave',       result:'armor-diamond',  name:'Diamondweave Cuirass', rarity:'legendary',
    materials:[{id:'bar-diamond',qty:3},{id:'gem-white',qty:3},{id:'frag-diamond',qty:3},{id:'pearl-diamond',qty:2}] },
  { id:'r_corruption_shroud',  result:'armor-evil',     name:'Corruption Shroud',    rarity:'evil',
    materials:[{id:'spellbook-evil',qty:1},{id:'crystal-evil',qty:3},{id:'shadow-essence',qty:3},{id:'toxic-glands',qty:2}] },

  /* ════ HELMETS ════ */
  { id:'r_bronzecrown_helm',   result:'helmet-bronze',  name:'Bronzecrown Helm',     rarity:'common',
    materials:[{id:'frag-bronze',qty:1},{id:'stoneblock',qty:1}] },
  { id:'r_silverguard_helm',   result:'helmet-silver',  name:'Silverguard Helm',     rarity:'uncommon',
    materials:[{id:'bar-silver',qty:1},{id:'shard-white',qty:2}] },
  { id:'r_aurumcrest_helm',    result:'helmet-gold',    name:'Aurumcrest Helm',      rarity:'rare',
    materials:[{id:'bar-gold',qty:2},{id:'gem-yellow',qty:2},{id:'frag-gold',qty:2}] },
  { id:'r_prism_warhelm',      result:'helmet-diamond', name:'Prism Warhelm',        rarity:'legendary',
    materials:[{id:'bar-diamond',qty:3},{id:'gem-white',qty:3},{id:'crystal-diamond',qty:2},{id:'frag-diamond',qty:3}] },
  { id:'r_blisk_warhelm',      result:'helmet-blisk',   name:'Blisk Warhelm',        rarity:'uncommon',
    materials:[{id:'bar-silver',qty:1},{id:'gem-brown',qty:2},{id:'frag-bronze',qty:2}] },
  { id:'r_blightward_helm',    result:'helmet-blight',  name:'Blightward Helm',      rarity:'rare',
    materials:[{id:'bar-gold',qty:2},{id:'crystal-emerald',qty:2},{id:'toxic-glands',qty:2}] },
  { id:'r_gothem_siege_helm',  result:'helmet-gothem',  name:'Gothem Siege Helm',    rarity:'legendary',
    materials:[{id:'bar-diamond',qty:3},{id:'gem-red',qty:3},{id:'soul-dust',qty:2},{id:'moonstone-powder',qty:2}] },
  { id:'r_tidewarden_helm',    result:'helmet-sea',     name:'Tidewarden Helm',      rarity:'rare',
    materials:[{id:'bar-silver',qty:2},{id:'pearl-ash',qty:2},{id:'crystal-silver',qty:2},{id:'frag-silver',qty:2}] },
  { id:'r_arcane_tarot_helm',  result:'helmet-tarot',   name:'Arcane Tarot Helm',    rarity:'legendary',
    materials:[{id:'bar-gold',qty:3},{id:'moonbook',qty:1},{id:'moonstone-powder',qty:3},{id:'soul-dust',qty:2}] },
  { id:'r_dread_visage',       result:'helmet-evil',    name:'Dread Visage',         rarity:'evil',
    materials:[{id:'spellbook-evil',qty:1},{id:'crystal-evil',qty:3},{id:'shard-black',qty:3},{id:'shadow-essence',qty:3}] },

  /* ════ HATS ════ */
  { id:'r_wanderers_brim',     result:'hat-brown',      name:"Wanderer's Brim",      rarity:'common',
    materials:[{id:'cotton',qty:1},{id:'leaf',qty:1},{id:'bone',qty:1}] },
  { id:'r_ashweave_cowl',      result:'hat-ash',        name:'Ashweave Cowl',        rarity:'uncommon',
    materials:[{id:'shadow-essence',qty:2},{id:'cotton',qty:1},{id:'pearl-ash',qty:1}] },
  { id:'r_ivory_spire_hat',    result:'hat-white',      name:'Ivory Spire Hat',      rarity:'uncommon',
    materials:[{id:'shard-white',qty:2},{id:'crystal-silver',qty:1},{id:'frag-silver',qty:2}] },
  { id:'r_aurum_sorcerer_hat', result:'hat-gold',       name:'Aurum Sorcerer Hat',   rarity:'rare',
    materials:[{id:'bar-gold',qty:2},{id:'crystal-gold',qty:2},{id:'witchbook',qty:1}] },
  { id:'r_prism_wizard_crown', result:'hat-diamond',    name:'Prism Wizard Crown',   rarity:'legendary',
    materials:[{id:'crystal-diamond',qty:3},{id:'frag-diamond',qty:3},{id:'pearl-diamond',qty:2},{id:'moonbook',qty:1}] },
  { id:'r_hex_sovereign_hat',  result:'hat-evil',       name:'Hex Sovereign Hat',    rarity:'evil',
    materials:[{id:'witchbook',qty:1},{id:'crystal-evil',qty:3},{id:'spellbook-evil',qty:1},{id:'shard-purple',qty:3}] },

  /* ════ BOOTS ════ */
  { id:'r_bronzestep_boots',   result:'boots-bronze',   name:'Bronzestep Boots',     rarity:'common',
    materials:[{id:'frag-bronze',qty:1},{id:'wood',qty:1}] },
  { id:'r_swiftsilver_treads', result:'boots-silver',   name:'Swiftsilver Treads',   rarity:'uncommon',
    materials:[{id:'bar-silver',qty:1},{id:'frag-silver',qty:2}] },
  { id:'r_goldstrider_boots',  result:'boots-gold',     name:'Goldstrider Boots',    rarity:'rare',
    materials:[{id:'bar-gold',qty:2},{id:'frag-gold',qty:2},{id:'gem-yellow',qty:2}] },
  { id:'r_voidstep_greaves',   result:'boots-diamond',  name:'Voidstep Greaves',     rarity:'legendary',
    materials:[{id:'bar-diamond',qty:3},{id:'frag-diamond',qty:3},{id:'crystal-diamond',qty:2},{id:'soul-dust',qty:2}] },
  { id:'r_shadowwalker_boots', result:'boots-evil',     name:'Shadowwalker Boots',   rarity:'evil',
    materials:[{id:'crystal-evil',qty:3},{id:'shadow-essence',qty:3},{id:'shard-black',qty:3}] },

  /* ════ RINGS ════ */
  { id:'r_sapphire_band',      result:'ring-blue',      name:'Sapphire Band',        rarity:'common',
    materials:[{id:'gem-blue',qty:1},{id:'frag-copper',qty:1}] },
  { id:'r_ironwright_ring',    result:'ring-built',     name:'Ironwright Ring',      rarity:'uncommon',
    materials:[{id:'bar-bronze',qty:1},{id:'gem-brown',qty:2},{id:'frag-bronze',qty:2}] },
  { id:'r_auric_seal',         result:'ring-gold',      name:'Auric Seal',           rarity:'rare',
    materials:[{id:'bar-gold',qty:2},{id:'gem-yellow',qty:2},{id:'frag-gold',qty:2}] },
  { id:'r_malice_signet',      result:'ring-evil',      name:'Malice Signet',        rarity:'evil',
    materials:[{id:'crystal-evil',qty:3},{id:'gem-red',qty:2},{id:'dark-resin',qty:3}] },
  { id:'r_oblivion_signet',    result:'ring-eviler',    name:'Oblivion Signet',      rarity:'corrupted',
    materials:[{id:'spellbook-evil',qty:1},{id:'shard-black',qty:3},{id:'crystal-evil',qty:3},{id:'shadow-essence',qty:3}] },

  /* ════ NECKLACES ════ */
  { id:'r_faded_locket',       result:'necklace-old',   name:'Faded Locket',         rarity:'common',
    materials:[{id:'bone',qty:1},{id:'cotton',qty:1}] },
  { id:'r_blessed_talisman',   result:'necklace-good',  name:'Blessed Talisman',     rarity:'uncommon',
    materials:[{id:'shard-white',qty:2},{id:'talesman',qty:1}] },
  { id:'r_aurum_pendant',      result:'necklace-gold',  name:'Aurum Pendant',        rarity:'rare',
    materials:[{id:'bar-gold',qty:2},{id:'pearl-gold',qty:2},{id:'frag-gold',qty:2}] },
  { id:'r_venom_ward_chain',   result:'necklace-emerald', name:'Venom Ward Chain',   rarity:'rare',
    materials:[{id:'crystal-emerald',qty:2},{id:'gem-emerald',qty:2},{id:'toxic-glands',qty:2}] },
  { id:'r_soulchain_collar',   result:'necklace-evil',  name:'Soulchain Collar',     rarity:'evil',
    materials:[{id:'crystal-evil',qty:3},{id:'soul-dust',qty:3},{id:'spellbook-evil',qty:1},{id:'dark-resin',qty:2}] },
];

/** Find recipe by result item id */
export function getRecipeByResult(resultId) {
  return RECIPES.find(r => r.result === resultId) || null;
}

/** Find all recipes that use a specific material */
export function getRecipesUsingMaterial(matId) {
  return RECIPES.filter(r => r.materials.some(m => m.id === matId));
}

/** Check if a set of material slots matches any recipe */
export function matchRecipe(slots) {
  const filled = slots.filter(s => s !== null);
  if (filled.length < 2) return null;
  return RECIPES.find(recipe => {
    if (recipe.materials.length !== filled.length) return false;
    return recipe.materials.every(req =>
      filled.filter(s => s.id === req.id).length >= req.qty
    );
  }) || null;
}

/** Get partial matches for preview (2+ slots filled) */
export function getPartialMatches(slots) {
  const filled = slots.filter(s => s !== null);
  if (filled.length < 2) return [];
  return RECIPES.filter(recipe =>
    filled.every(slot =>
      recipe.materials.some(m => m.id === slot.id)
    )
  );
}

export const RECIPE_CATS = [
  { id:'all',       label:'All'        },
  { id:'weapon',    label:'Weapons'    },
  { id:'armor',     label:'Armor'      },
  { id:'head',      label:'Head'       },
  { id:'boots',     label:'Boots'      },
  { id:'trinket',   label:'Trinkets'   },
];
