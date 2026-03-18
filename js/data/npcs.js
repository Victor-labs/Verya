// js/data/npcs.js
// All NPC data — City Center shops, Special Missions, Daily Login
// Each NPC has: id, name, img, dialogue tree, quests

export const NPCS = {

  /* ── CITY CENTER ── */
  victor: {
    id:'victor', name:'Victor', img:'assets/citycenter/npcs/npc-victor.jpg',
    greeting: "I don't do much talk, what can I offer you?",
    options: [
      { id:'request', label:'Complete Victor request', action:'quest' },
      { id:'who',     label:'Who are you?',            action:'reply',
        reply:"I am Victor. I just work here overtime as a bartender. I got to run to classes in the early hours of the day, sometimes I work over shift. The job really wears me off." },
    ],
  },
  gabon: {
    id:'gabon', name:'Gabon', img:'assets/citycenter/npcs/npc-gabon.jpg',
    greeting: "Hmmh you sure wanna play this game?",
    options: [
      { id:'play',    label:'Play Pachinko',           action:'pachinko' },
      { id:'rewards', label:'Check reward batch',      action:'pachinko_rewards', levelReq: 20 },
      { id:'request', label:'Complete Gabon request',  action:'quest' },
    ],
  },

  /* ── SPECIAL MISSION NPCs ── */
  seraphina: {
    id:'seraphina', name:'Seraphina', img:'assets/citycenter/npcs/npc-seraphina.jpg',
    levelReq: 2,
    greeting: "My brother was attacked last week downtown. Help me avenge him.",
    options: [{ id:'quest', label:'See Mission', action:'quest' }],
    quest: {
      id:'q_seraphina', name:"Seraphina's Vengeance",
      objectives:[{ type:'kill_mob', target:'Shadow Wolf', count:15, current:0 }],
      rewards:[{ type:'coins', amount:350 },{ type:'diamonds', amount:5 }],
      accepted: false, completed: false,
    },
  },
  presido: {
    id:'presido', name:'Presido', img:'assets/citycenter/npcs/npc-presido.jpg',
    levelReq: 12,
    greeting: "Sigh... I'm still stuck looking for someone to complete my evil conquest.",
    options:[{ id:'quest', label:'See Mission', action:'quest' }],
    quest: {
      id:'q_presido', name:"Presido's Conquest",
      objectives:[
        { type:'find_item',  target:'crystal-evil',  count:1, current:0 },
        { type:'craft_item', target:'armor-evil',     count:1, current:0 },
      ],
      rewards:[{ type:'diamonds', amount:20 },{ type:'studio_token', amount:1 }],
      accepted: false, completed: false,
    },
  },
  daemon_npc: {
    id:'daemon_npc', name:'Daemon', img:'assets/citycenter/npcs/npc-daemon.jpg',
    levelReq: 15,
    greeting: "Hehe haha, a criminal encountered luck today!",
    options:[{ id:'quest', label:'See Mission', action:'quest' }],
    quest: {
      id:'q_daemon', name:"Daemon's Conquest",
      objectives:[
        { type:'attack_player',    count:15, current:0 },
        { type:'attack_vigilante', count:5,  current:0 },
      ],
      rewards:[
        { type:'item', id:'crystal-evil', amount:2 },
        { type:'item', id:'boots-evil',   amount:1 },
      ],
      accepted: false, completed: false,
    },
  },
  gabon_npc: {
    id:'gabon_npc', name:'Gabon', img:'assets/citycenter/npcs/npc-gabon.jpg',
    levelReq: 10,
    greeting: "Hey there, from the bar right? Ok — if you complete my quests you earn a Pachinko token, how about that?",
    options:[
      { id:'okay',   label:'Okay', action:'quest'  },
      { id:'nothanx', label:'No thanks', action:'close' },
    ],
    quest: {
      id:'q_gabon', name:"Gabon's Challenge",
      objectives:[
        { type:'unlock_zone',  target:'blacksmith-forge', count:1, current:0 },
        { type:'own_rare_item', count:1, current:0 },
        { type:'buy_character', count:1, current:0 },
      ],
      rewards:[
        { type:'pachinko_token', amount:5 },
        { type:'coins', amount:1000 },
      ],
      accepted: false, completed: false,
    },
  },
  david: {
    id:'david', name:'David', img:'assets/citycenter/npcs/npc-david.jpg',
    levelReq: 0,
    greeting: "Hello newbie, welcome to Verya. Let's get you started.",
    options:[
      { id:'okay',  label:'Okay David', action:'quest' },
      { id:'who',   label:'Who are you?', action:'reply',
        reply:"Oh sorry for not introducing myself — my name is David. I'm your NPC guide here in Verya, although I have many jobs. My sole purpose for now is to guide you." },
      { id:'what',  label:'What is Verya?', action:'reply',
        reply:"Seems you haven't checked VeryaWiki. Check there to fully grasp what this game is about." },
    ],
    quests: [
      {
        id:'david_q1', name:'Diving into Verya', order:1,
        objectives:[
          { type:'buy_character',  target:'B',   count:1, current:0 },
          { type:'craft_item',                   count:1, current:0 },
          { type:'own_weapon',                   count:1, current:0 },
          { type:'kill_enemy',                   count:20, current:0 },
        ],
        rewards:[{ type:'diamonds', amount:15 },{ type:'coins', amount:100 }],
        completed: false,
      },
      {
        id:'david_q2', name:'Combats and Dungeons', order:2,
        objectives:[
          { type:'unlock_zones', count:3,  current:0 },
          { type:'beat_boss',    count:1,  current:0 },
          { type:'obtain_rare_loot', count:1, current:0 },
        ],
        rewards:[{ type:'diamonds', amount:20 },{ type:'gold_voucher', amount:2 }],
        completed: false,
      },
      {
        id:'david_q3', name:'Friends and Networking', order:3,
        objectives:[
          { type:'have_friends',   count:5, current:0 },
          { type:'send_message',   count:1, current:0 },
          { type:'react_chirp',    count:5, current:0 },
        ],
        rewards:[{ type:'diamonds', amount:50 },{ type:'pachinko_token', amount:1 }],
        completed: false,
      },
      {
        id:'david_q4', name:'Living Conditions', order:4,
        objectives:[
          { type:'buy_apartment',     count:1, current:0 },
          { type:'upgrade_apartment', count:1, current:0 },
          { type:'upgrade_inventory', count:1, current:0 },
          { type:'store_vault_item',  count:1, current:0 },
        ],
        rewards:[{ type:'coins', amount:3000 },{ type:'gold_voucher', amount:2 }],
        completed: false,
      },
      {
        id:'david_q5', name:'PVP in the Making', order:5,
        objectives:[
          { type:'reach_level',    target:15, current:0 },
          { type:'attack_player',  count:1,   current:0 },
          { type:'get_arrested',   count:2,   current:0 },
          { type:'get_bailed',     count:5,   current:0 },
        ],
        rewards:[{ type:'rare_loot', amount:2 },{ type:'gold_voucher', amount:3 }],
        completed: false,
      },
    ],
  },
  alya: {
    id:'alya', name:'Alya', img:'assets/citycenter/npcs/npc-alya.jpg',
    levelReq: 20,
    greeting: "Hey adventurer, wanna help me out?",
    options:[
      { id:'yeah',    label:"Yeah? What happened?", action:'quest_intro',
        reply:"Great! Thanks a lot." },
      { id:'who',     label:'Who are you?', action:'reply',
        reply:"Oops my bad — my name is Alya. I live in the A4 apartment downtown. I work at times in dark districts. My work is rather confidential for now until I can trust you." },
      { id:'nothanx', label:'No thanks', action:'close' },
    ],
    quest: {
      id:'q_alya', name:"Alya's Contract",
      objectives:[
        { type:'buy_evil_item',  count:1, current:0, completed:false },
        { type:'forge_evil_sword', count:1, current:0, completed:false },
        { type:'sell_to_alya',   count:1, current:0, completed:false, locked:true },
      ],
      rewards:[
        { type:'diamonds',    amount:50 },
        { type:'gold_voucher', amount:2 },
        { type:'item',        id:'sword-red', amount:1 },
      ],
      accepted: false, completed: false,
    },
  },
  yin: {
    id:'yin', name:'Yin', img:'assets/citycenter/npcs/npc-yin.jpg',
    greeting: "Welcome back 🙂‍↕️",
  },
};

export const DAILY_LOGIN_REWARDS = [
  { day:1, type:'coins',       amount:5,  label:'5 Coins',        emoji:'🪙' },
  { day:2, type:'coins',       amount:10, label:'10 Coins',       emoji:'🪙' },
  { day:3, type:'coins',       amount:10, label:'10 Coins',       emoji:'🪙' },
  { day:4, type:'item',        id:'potion-regen', label:'Regen Potion', emoji:'🧪' },
  { day:5, type:'coins',       amount:30, label:'30 Coins',       emoji:'🪙' },
  { day:6, type:'coins',       amount:30, label:'30 Coins',       emoji:'🪙' },
  { day:7, type:'studio_token',amount:1,  label:'Studio Token',   emoji:'🎵' },
];
