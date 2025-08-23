
export interface DesktopIconConfig {
  id: string;
  label: string;
  iconSrc: string;
  fallbackIcon: string;
  route?: string;
  position: { top: number; left: number };
}

export const desktopIconImages = {
  computer: "/assets/Icons/computer.png",
  game: "/assets/Icons/player_idle.webm",
  growroom: "/assets/Icons/weed.png",
  shop: "/assets/Icons/nftshop.ico",
  chat: "/assets/Icons/illuminati.webp",
  leaderboard: "/assets/Icons/illuminati.webp",
  analytics: "/assets/Icons/illuminati.webp"
};

export const desktopIcons: DesktopIconConfig[] = [
  {
    id: "computer",
    label: "My Computer",
    iconSrc: desktopIconImages.computer,
    fallbackIcon: "💻",
    position: { top: 20, left: 20 }
  },
  {
    id: "game",
    label: "Reptilian Run",
    iconSrc: desktopIconImages.game,
    fallbackIcon: "🎮",
    route: "/game",
    position: { top: 110, left: 20 }
  },
  {
    id: "growroom",
    label: "THC Grow Room",
    iconSrc: desktopIconImages.growroom,
    fallbackIcon: "🌿",
    route: "/growroom",
    position: { top: 200, left: 20 }
  },
  {
    id: "shop",
    label: "NFT Shop",
    iconSrc: desktopIconImages.shop,
    fallbackIcon: "🛒",
    route: "/shop",
    position: { top: 290, left: 20 }
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    iconSrc: desktopIconImages.leaderboard,
    fallbackIcon: "🏆",
    route: "/leaderboard",
    position: { top: 380, left: 20 }
  },
  {
    id: "analytics",
    label: "Analytics",
    iconSrc: desktopIconImages.analytics,
    fallbackIcon: "📊",
    route: "/analytics",
    position: { top: 20, left: 110 }
  },
  {
    id: "chat",
    label: "Community Chat",
    iconSrc: desktopIconImages.chat,
    fallbackIcon: "💬",
    position: { top: 110, left: 110 }
  }
];
