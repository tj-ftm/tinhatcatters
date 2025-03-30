
import React from 'react';
import { ScrollArea } from '../ui/scroll-area';
import Game from '../../pages/Game';
import Shop from '../../pages/Shop';
import GrowRoom from '../GrowRoom';
import ComputerContent from './ComputerContent';
import Leaderboard from '../../pages/Leaderboard';
import Analytics from '../../pages/Analytics';

interface WindowContentProps {
  windowId: string;
  handleOpenWindow: (windowId: string, path?: string) => void;
}

const WindowContent: React.FC<WindowContentProps> = ({ windowId, handleOpenWindow }) => {
  return (
    <div className="bg-[#c0c0c0] h-[calc(100%-24px)]">
      <ScrollArea className="h-full w-full">
        <div className="p-1">
          {windowId === 'game' && <Game />}
          {windowId === 'shop' && <Shop />}
          {windowId === 'growroom' && <GrowRoom />}
          {windowId === 'computer' && <ComputerContent handleOpenWindow={handleOpenWindow} />}
          {windowId === 'leaderboard' && <Leaderboard />}
          {windowId === 'analytics' && <Analytics />}
          {windowId === 'home' && <div className="p-4">Welcome to the Home window!</div>}
        </div>
      </ScrollArea>
    </div>
  );
};

export default WindowContent;
