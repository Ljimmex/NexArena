export const games = [
  {
    id: "cs2",
    name: "Counter-Strike 2",
    icon: "/games/css2.png"
  },
  {
    id: "lol",
    name: "League of Legends",
    icon: "/games/lol.png"
  },
  {
    id: "dota2",
    name: "DOTA 2",
    icon: "/games/dota2.png"
  },
  {
    id: "valorant",
    name: "Valorant",
    icon: "/games/valo.png"
  }
]

export const gameModes = {
  cs2: [
    { id: 'bomb', name: 'Bomb Defusal' },
    { id: 'wingman', name: 'Wingman' },
    { id: 'aim', name: 'Aim' },
    { id: 'hostage', name: 'Hostage Rescue' }
  ],
  lol: [
    { id: 'classic', name: 'Classic' },
    { id: 'aram', name: 'ARAM' }
  ],
  dota2: [
    { id: 'allpick', name: 'All Pick' }
  ],
  valorant: [
    { id: 'standard', name: 'Standard' }
  ]
};