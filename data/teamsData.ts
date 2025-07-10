export interface TeamData {
  id: string;
  name: string;
  logo: string;
  status?: 'registered' | 'ready' | 'confirmed' | 'declined' | 'disqualified' | 'substitute';
}

export const predefinedTeams: TeamData[] = [
  {
    id: "team-1",
    name: "New England Tech Tigers",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Center-Logo-pUzEXTqJAh8NGgkDUc0MP9VFb5gT6p.webp",
  },
  {
    id: "team-2",
    name: "GBX Esports",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gbx-esports-teams-logo-94540734A9-seeklogo.com-YbA6pME2kBg6jDFgV92QGlu1l0zEOm.png",
  },
  {
    id: "team-3",
    name: "Infamous Gaming",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/640px-Infmous_Gaming_Esports_Team_Logo-oMyuVmCIqG9cNuCUk6IdwlwQJXNZuf.png",
  },
  {
    id: "team-4",
    name: "Ghost Tigers",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E2%80%94Pngtree%E2%80%94ghost%20tiger%20roaring%20illustration%20for_5523867-BGbHcrUTVpBxb0r3GHp1iNAkd80T11.png",
  },
  {
    id: "team-5",
    name: "Onuba Esports",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dcbphwq-3cce9227-b772-4416-ab63-261e12063bc2-Do76Pln8IZinHkNY1UjtyS7nFygg7f.png",
  },
  {
    id: "team-6",
    name: "Team Velocity",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pngwing.com-aepWhG2o0WkEy7xrkowOFiwpXLDjF1.png",
  },
  {
    id: "team-7",
    name: "EVOS",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pngwing.com%20(1)-LPvDF5csEnSuIoUHU39QUmGdgcweJ2.png",
  },
  {
    id: "team-8",
    name: "Imperial Esports",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imperial-esports-logo-png_seeklogo-430831-EkSGMHngOoGLidpXfhzphhVRRhF5ZN.png",
  },
  {
    id: "team-9",
    name: "Elevate",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/10-Best-Gaming-Team-Logos-and-How-to-Make-Your-Own-CurrentYear-image17-B1yTOMA5WAosQgrAkW13HUwiXecdKk.png",
  },
  {
    id: "team-10",
    name: "Trace Esports",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Trace_Esports_2023_allmode-9Ju5lkvKkt5U2zYL5njGt5RbOv4fhh.png",
  },
  {
    id: "team-11",
    name: "Your Team Gaming",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pngtree-esporter-gamer-mascot-logo-vector-png-image_7087578-OvUsoqtlqGWPG8gP0OCu0DzrWVzsiV.png",
  },
  {
    id: "team-12",
    name: "Endpoint",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Endpoint-2020-Logo-Equal-Width-5jNEUsBFT6FA5eR3081tC3rumDSWfM.png",
  },
  {
    id: "team-13",
    name: "Shadow Squad",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/esports-gaming-logo-icon-clipart-15-SEEosMEzEvrZptdgVPgNK2m25vmWIR.png",
  },
  {
    id: "team-14",
    name: "Eagle Esports",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E2%80%94Pngtree%E2%80%94e-sports%20team%20logo%20with%20eagle_6062221-6n2w6h75IXYCsoXENjX0zPBcBkno5o.png",
  },
  {
    id: "team-15",
    name: "Team Force",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gaming-esport-logo-AB86E34AF7-seeklogo.com-DwcG4Tr73G4yhXeOKPeKM2HzRSqWic.png",
  },
  {
    id: "team-16",
    name: "Ellipsis Esports",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pngegg%20(6)-rotbzZ6vjLJ0fkLHyFIhzXK7sIPQyb.png",
  },
  {
    id: "team-17",
    name: "Wonder Stag Esports",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pngegg%20(3)-K60x9QiiFubfD4kstyNysIw5ldCJ6e.png",
  },
  {
    id: "team-18",
    name: "Crowns",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pngegg%20(7)-Xk0XMNl3u8PC9CoXLXSvB8t9MUYMF7.png",
  },
  {
    id: "team-19",
    name: "Team Phoenix",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pngwing.com%20(1)-2zRIExk0PLCzlC9oOAn6GSlWeExMjB.png",
  },
  {
    id: "team-20",
    name: "Grizzlys",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pngegg%20(5)-SaxGpQtcawmGXmVE1m9X5nTPi95fYr.png",
  },
  {
    id: "team-21",
    name: "Enhanced Gaming Esports",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pngegg%20(4)-CJzEhGAHqVqS5QuobLkc1TOwjU8EjJ.png",
  },
  {
    id: "team-22",
    name: "Addict Esport",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pngegg-9OzwLsKmNvrFDyibx5hE1227bxDrl3.png",
  },
  {
    id: "team-23",
    name: "Extinction Esports",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pngegg%20(1)-ryKiQ5vZRXMBSH9vF40H1uoIPTHJyJ.png",
  },
  {
    id: "team-24",
    name: "Vaevictis Esports",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pngegg%20(2)-u0gVMznW5fKumpHQK3wcnW6BlI1X8m.png",
  },
  {
    id: "team-25",
    name: "Blue Dragon Esports",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pngtree-blue-dragon-esport-logo-png-image_8209319-F9iKvPzPkFC7IhJlREp247YzMsX1Ck.png",
  },
  {
    id: "team-26",
    name: "Kemain Esports",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kemain-ft-esport-logo-png_seeklogo-402066-zVoG2R6joqdXk1jfoVuasy5RzC0Yu2.png",
  },
  {
    id: "team-27",
    name: "FUT Esports",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FUT_Esports_logo-gN7ETZD9VHuzLT3VSUwJndIEAl0aLt.png",
  },
  {
    id: "team-28",
    name: "GC Esports",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/grp-esports-logo-kQXsBuNzRHv4paCKxIv3Oowehx8WS5.png",
  },
  {
    id: "team-29",
    name: "Eagle Masters",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ori_3767371_0adacly2wzoqrvo4xbbjfns613vd9j1mz2vnj690_eagle-esport-mascot-logo-OyETuICMdUL7Nh91XruvCVbuSQ1hWq.png",
  },
  {
    id: "team-30",
    name: "Slate Esports",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Slate-Esports-Logo-PRNi8Ao1I7gpoRP6kCEnU3caTRBy19.png",
  },
  {
    id: "team-31",
    name: "Python Esports",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6912c000-d8b9-435e-8344-d3005e6c78f5-rEzLNQtUqXW5MtcO5HiOP8ASCPIbHn.png",
  },
  {
    id: "team-32",
    name: "Monkey Esports",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Monkey-Esports-Logo-Design-PNG-Transparent-dcXtZ1VBB59NHytAdtXFJI9O1zqosm.png",
  },
];