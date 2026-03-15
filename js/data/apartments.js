// js/data/apartments.js
// Apartment tiers, vault sizes, weekly rent, studio music

export const APARTMENT_TIERS = [
  {
    id: 'basic', name: 'Basic', emoji: '🏠',
    weeklyRent: 1500,
    vaultSlots: 10,
    images: ['assets/apartments/basic/basic-1.jpg','assets/apartments/basic/basic-2.jpg','assets/apartments/basic/basic-3.jpg'],
    desc: 'A small but functional space in the lower district.',
    statBonus: { vitality: 2 },
  },
  {
    id: 'standard', name: 'Standard', emoji: '🏢',
    weeklyRent: 3000,
    vaultSlots: 20,
    images: ['assets/apartments/standard/standard-1.jpg','assets/apartments/standard/standard-2.jpg','assets/apartments/standard/standard-3.jpg'],
    desc: 'A comfortable mid-city apartment with solid amenities.',
    statBonus: { vitality: 5, endurance: 3 },
  },
  {
    id: 'deluxe', name: 'Deluxe', emoji: '🏙️',
    weeklyRent: 3500,
    vaultSlots: 40,
    images: ['assets/apartments/deluxe/deluxe-1.jpg','assets/apartments/deluxe/deluxe-2.jpg','assets/apartments/deluxe/deluxe-3.jpg'],
    desc: 'Premium living in the heart of Verya. Views worth dying for.',
    statBonus: { vitality: 10, endurance: 5, luck: 3 },
  },
  {
    id: 'penthouse', name: 'Penthouse', emoji: '🌆',
    weeklyRent: 5000,
    vaultSlots: 80,
    images: ['assets/apartments/penthouse/penthouse-1.jpg','assets/apartments/penthouse/penthouse-2.jpg','assets/apartments/penthouse/penthouse-3.jpg'],
    desc: 'The pinnacle of luxury. Above everything. Above everyone.',
    statBonus: { vitality: 20, endurance: 10, luck: 8, speed: 5 },
  },
];

export const STUDIO_TRACKS = [
  { id:'fallenverya',    name:'Fallen Verya',       emoji:'🌑', src:'assets/audio/fallenverya.mp3'    },
  { id:'baddie-verya',   name:'Baddie Verya',        emoji:'🔥', src:'assets/audio/baddie-verya.mp3'   },
  { id:'corruption',     name:'Corruption',          emoji:'☣️', src:'assets/audio/corruption.mp3'     },
  { id:'jjkxchillverse', name:'JJK x Chillverse',   emoji:'⛩️', src:'assets/audio/jjkxchillverse.mp3' },
  { id:'presido',        name:'Presido',             emoji:'🎭', src:'assets/audio/presido.mp3'        },
  { id:'purgatory',      name:'Purgatory',           emoji:'👁️', src:'assets/audio/purgatory.mp3'     },
  { id:'ramadan',        name:'Ramadan',             emoji:'🌙', src:'assets/audio/ramadan.mp3'        },
  { id:'verya-untamed',  name:'Verya Untamed',       emoji:'⚡', src:'assets/audio/verya-untamed.mp3'  },
  { id:'veryaforce',     name:'Verya Force',         emoji:'💠', src:'assets/audio/veryaforce.mp3'     },
  { id:'victor',         name:'Victor',              emoji:'🎵', src:'assets/audio/victor.mp3'         },
];

export function getApartmentTier(tierId) {
  return APARTMENT_TIERS.find(t => t.id === tierId) || null;
}

export const STUDIO_OPEN_HOUR  = 7;   /* 7am  */
export const STUDIO_CLOSE_HOUR = 23;  /* 11pm */

export function isStudioOpen() {
  const h = new Date().getHours();
  return h >= STUDIO_OPEN_HOUR && h < STUDIO_CLOSE_HOUR;
}
