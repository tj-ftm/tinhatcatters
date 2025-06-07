
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

interface CustomWindowsManagerProps {
  customWindows: CustomWindow[];
  activeCustomWindow: string | null;
  setActiveCustomWindow: (windowId: string | null) => void;
  closeCustomWindow: (windowId: string) => void;
  onNavigate: (windowId: string, route?: string) => void;
}

const CustomWindowsManager: React.FC<CustomWindowsManagerProps> = ({
  customWindows,
  activeCustomWindow,
  setActiveCustomWindow,
  closeCustomWindow,
  onNavigate
}) => {
  const getComputerWindowContent = () => (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">My Computer</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries({
          game: { label: "Reptilian Attack", icon: <Gamepad2 className="h-5 w-5" />, route: "/game" },
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
      {customWindows.map((win, index) => (
        <Windows95Window
          key={win.id}
          title={win.title}
          width={600}
          height={400}
          x={100 + index * 30}
          y={100 + index * 30}
          isActive={activeCustomWindow === win.id}
          onFocus={() => setActiveCustomWindow(win.id)}
          onClose={() => closeCustomWindow(win.id)}
        >
          {win.id === 'computer' && getComputerWindowContent()}
          {win.id === 'game' && <iframe className="w-full h-full" src="/game" />}
          {win.id === 'shop' && <iframe className="w-full h-full" src="/shop" />}
          {win.id === 'growroom' && <iframe className="w-full h-full" src="/growroom" />}
          {win.id === 'leaderboard' && <iframe className="w-full h-full" src="/leaderboard" />}
          {win.id === 'analytics' && <iframe className="w-full h-full" src="/analytics" />}
        </Windows95Window>
      ))}
    </>
  );
};

export default CustomWindowsManager;
