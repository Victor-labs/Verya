// js/data/cityCenter.js
// City Center shop definitions

export const CITY_SHOPS = [
  {
    id:'victor-market', name:'Victor Market',
    img:'assets/citycenter/shops/victor-makert.jpg',
    desc:'General goods and the occasional rare find.',
    tags:['SHOP'],
    levelReq: 0,
  },
  {
    id:'downtown-cafe', name:'Downtown Café',
    img:'assets/citycenter/shops/downtown-cafe.jpg',
    desc:'Hot meals and cold comfort. Every dish restores HP.',
    tags:['FOOD'],
    levelReq: 0,
  },
  {
    id:'medic-center', name:'Medic Center',
    img:'assets/citycenter/shops/medic-center.jpg',
    desc:'If you are down, come here. Revival and potions available.',
    tags:['CLINIC','SHOP'],
    levelReq: 0,
  },
  {
    id:'daemon-store', name:'Daemon Store',
    img:'assets/citycenter/shops/daemon-store.jpg',
    desc:'Dark wares for darker intentions. Not for the faint of heart.',
    tags:['SHOP'],
    levelReq: 20,
    lockedMsg: 'Reach Level 20 to access the Daemon Store.',
  },
  {
    id:'vix-weapons', name:'Vix Miner & Weapons',
    img:'assets/citycenter/shops/vix-weapons.jpg',
    desc:'Quality bars and basic arms. Reliable stock, fair price.',
    tags:['SHOP','WEAPONS'],
    levelReq: 0,
  },
  {
    id:'victor-bar', name:'Victor Bar',
    img:'assets/citycenter/shops/victor-bar.jpg',
    desc:'The heart of the district. Meet Victor and play Pachinko with Gabon.',
    tags:['BAR','PACHINKO'],
    levelReq: 0,
  },
];

export function getShop(id) {
  return CITY_SHOPS.find(s => s.id === id) || null;
}
