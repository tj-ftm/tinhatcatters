
import React from 'react';
import { ScrollArea } from '../ui/scroll-area';
import Game from '../../pages/Game';
import Shop from '../../pages/Shop';
import GrowRoom from '../GrowRoom';
import ComputerContent from './ComputerContent';

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
        </div>
      </ScrollArea>
    </div>
  );
};

export default WindowContent;
