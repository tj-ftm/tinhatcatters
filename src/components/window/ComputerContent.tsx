
import React from 'react';
import FileIcon from './FileIcon';

interface ComputerContentProps {
  handleOpenWindow: (windowId: string, path?: string) => void;
}

const ComputerContent: React.FC<ComputerContentProps> = ({ handleOpenWindow }) => {
  const openBuyTHC = () => {
    window.open('https://www.shadow.so/trade?inputCurrency=0x0000000000000000000000000000000000000000&outputCurrency=0x17Af1Df44444AB9091622e4Aa66dB5BB34E51aD5', '_blank');
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">My Computer</h2>
      
      <div className="mb-4">
        <div className="win95-inset p-2 mb-4">
          <p className="text-sm">Welcome to My Computer. Double-click an icon to open the application.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <FileIcon 
          label="Reptilian Attack" 
          icon={<img src="https://cdn3d.iconscout.com/3d/premium/thumb/game-controller-5679567-4730291.png" alt="Game" className="h-8 w-8" />} 
          onClick={() => handleOpenWindow('game', '/game')} 
        />
        <FileIcon 
          label="NFT Shop" 
          icon={<img src="https://cdn3d.iconscout.com/3d/premium/thumb/shopping-cart-5679599-4730323.png" alt="Shop" className="h-8 w-8" />} 
          onClick={() => handleOpenWindow('shop', '/shop')} 
        />
        <FileIcon 
          label="THC Grow Room" 
          icon={<img src="https://cdn3d.iconscout.com/3d/premium/thumb/cannabis-5679566-4730290.png" alt="THC" className="h-8 w-8" />} 
          onClick={() => handleOpenWindow('growroom', '/growroom')} 
        />
        <FileIcon 
          label="Wallet" 
          icon={<img src="https://cdn3d.iconscout.com/3d/premium/thumb/wallet-5679597-4730321.png" alt="Wallet" className="h-8 w-8" />} 
          onClick={() => handleOpenWindow('wallet')} 
        />
        <FileIcon 
          label="Buy $THC" 
          icon={<img src="https://cdn3d.iconscout.com/3d/premium/thumb/dollar-5769602-4828561.png" alt="Buy THC" className="h-8 w-8" />} 
          onClick={openBuyTHC}
        />
      </div>
    </div>
  );
};

export default ComputerContent;
