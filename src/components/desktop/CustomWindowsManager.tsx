import React from 'react';
import Windows95Window from '../window/Windows95Window';
import { 
  Gamepad2, 
  ShoppingCart, 
  Cannabis, 
  TrendingUp, 
  BarChart2, 
  MessageSquare, 
  Wallet 
} from 'lucide-react';
import { CustomWindow } from '@/hooks/useDesktopState';
import Game from '@/pages/Game';
import Shop from '@/pages/Shop';
import GrowRoom from '@/components/GrowRoom';
import Leaderboard from '@/pages/Leaderboard';
import Analytics from '@/pages/Analytics';

interface CustomWindowsManagerProps {
  customWindows: CustomWindow[];
  activeCustomWindow: string | null;
  setActiveCustomWindow: (windowId: string | null) => void;
  closeCustomWindow: (windowId: string) => void;
  minimizeCustomWindow: (windowId: string) => void;
  maximizeCustomWindow: (windowId: string) => void;
  windowsMaximized: Record<string, boolean>;
  onNavigate: (windowId: string, route?: string) => void;
}

const CustomWindowsManager: React.FC<CustomWindowsManagerProps> = ({
  customWindows,
  activeCustomWindow,
  setActiveCustomWindow,
  closeCustomWindow,
  minimizeCustomWindow,
  maximizeCustomWindow,
  windowsMaximized,
  onNavigate
}) => {
  // Calculate centered position for windows
  const getWindowPosition = (index: number) => {
    const windowWidth = 500;
    const windowHeight = 350;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    const centerX = (screenWidth - windowWidth) / 2 + (index * 20);
    const centerY = (screenHeight - windowHeight) / 2 + (index * 20);
    
    return {
      x: Math.max(20, centerX),
      y: Math.max(20, centerY),
      width: windowWidth,
      height: windowHeight
    };
  };

  const getComputerWindowContent = () => (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">My Computer</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries({
          game: { label: "Reptilian Run", icon: <Gamepad2 className="h-5 w-5" />, route: "/game" },
          shop: { label: "NFT Shop", icon: <ShoppingCart className="h-5 w-5" />, route: "/shop" },
          growroom: { label: "THC Grow Room", icon: <Cannabis className="h-5 w-5" />, route: "/growroom" },
          leaderboard: { label: "Leaderboard", icon: <TrendingUp className="h-5 w-5" />, route: "/leaderboard" },
          analytics: { label: "Analytics Dashboard", icon: <BarChart2 className="h-5 w-5" />, route: "/analytics" },
          chat: { label: "Community Chat", icon: <MessageSquare className="h-5 w-5" />, route: null },
          wallet: { label: "Wallet", icon: <Wallet className="h-5 w-5" />, route: null }
        }).map(([key, { label, icon, route }]) => (
          <div 
            key={key}
            className="flex flex-col items-center cursor-pointer p-3 hover:bg-gray-200 border border-transparent hover:border-gray-400"
            onClick={() => onNavigate(key, route || undefined)}
          >
            <div className="mb-2 flex items-center justify-center w-10 h-10">
              {icon}
            </div>
            <span className="text-xs text-center">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {customWindows.map((win, index) => {
        const position = getWindowPosition(index);
        return (
          <Windows95Window
            key={win.id}
            title={win.title}
            width={position.width}
            height={position.height}
            x={position.x}
            y={position.y}
            isActive={activeCustomWindow === win.id}
            onFocus={() => setActiveCustomWindow(win.id)}
            onClose={() => closeCustomWindow(win.id)}
            onMinimize={() => minimizeCustomWindow(win.id)}
            onMaximize={() => maximizeCustomWindow(win.id)}
            isMaximized={windowsMaximized[win.id] || false}
            showMinimize={true}
            showMaximize={true}
          >
            {win.id === 'computer' && getComputerWindowContent()}
            {win.id === 'game' && <div className="w-full h-full overflow-hidden"><Game /></div>}
            {win.id === 'shop' && <div className="w-full h-full overflow-hidden"><Shop /></div>}
            {win.id === 'growroom' && <div className="w-full h-full overflow-hidden"><GrowRoom /></div>}
            {win.id === 'leaderboard' && <div className="w-full h-full overflow-hidden"><Leaderboard /></div>}
            {win.id === 'analytics' && <div className="w-full h-full overflow-hidden"><Analytics /></div>}
          </Windows95Window>
        );
      })}
    </>
  );
};

export default CustomWindowsManager;