
import React from 'react';
import { Gamepad2, ShoppingCart, Cannabis, Wallet, ExternalLink } from 'lucide-react';
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
          icon={<img src="/lovable-uploads/a55fa30c-e72d-45cc-a0fa-02d7143baa9b.jpg" alt="Game" className="h-5 w-5" />} 
          onClick={() => handleOpenWindow('game', '/game')} 
        />
        <FileIcon 
          label="NFT Shop" 
          icon={<img src="/lovable-uploads/e03a9f53-e89d-4a06-aa83-0c24bf7db8db.jpg" alt="Shop" className="h-5 w-5" />} 
          onClick={() => handleOpenWindow('shop', '/shop')} 
        />
        <FileIcon 
          label="THC Grow Room" 
          icon={<img src="/lovable-uploads/a55fa30c-e72d-45cc-a0fa-02d7143baa9b.jpg" alt="THC" className="h-5 w-5" />} 
          onClick={() => handleOpenWindow('growroom', '/growroom')} 
        />
        <FileIcon 
          label="Wallet" 
          icon={<img src="/lovable-uploads/a55fa30c-e72d-45cc-a0fa-02d7143baa9b.jpg" alt="Wallet" className="h-5 w-5" />} 
          onClick={() => handleOpenWindow('wallet')} 
        />
        <FileIcon 
          label="Buy $THC" 
          icon={<img src="/favicon.png" alt="Buy THC" className="h-5 w-5" />} 
          onClick={openBuyTHC}
        />
      </div>
    </div>
  );
};

export default ComputerContent;
