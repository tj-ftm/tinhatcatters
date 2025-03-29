
import React from 'react';
import { X, Minus, Network } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import WalletConnector from './WalletConnector';
import { switchToSonicNetwork } from '@/lib/web3';
import { Button } from './ui/button';
import { toast } from '@/hooks/use-toast';

interface WalletWindowProps {
  onClose: () => void;
  onMinimize: () => void;
}

const WalletWindow: React.FC<WalletWindowProps> = ({ onClose, onMinimize }) => {
  const { address, balance, thcBalance } = useWeb3();
  const [isCorrectNetwork, setIsCorrectNetwork] = React.useState<boolean>(true);
  
  const handleSwitchNetwork = async () => {
    try {
      const success = await switchToSonicNetwork();
      if (success) {
        setIsCorrectNetwork(true);
        toast({
          title: 'Network Changed',
          description: 'Successfully connected to Sonic Network',
        });
      }
    } catch (error) {
      console.error("Error switching network:", error);
      toast({
        title: 'Network Switch Failed',
        description: 'Failed to switch to Sonic Network. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="win95-window w-80 shadow-lg z-20">
      <div className="win95-title-bar flex justify-between items-center">
        <span className="text-white font-bold">Wallet</span>
        <div className="flex">
          <button 
            className="text-white hover:bg-blue-800 px-1 cursor-pointer z-30" 
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
          >
            <Minus className="h-3 w-3" />
          </button>
          <button 
            className="text-white hover:bg-red-500 px-1 cursor-pointer z-30" 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      <div className="p-3 bg-[#c0c0c0]">
        {!address ? (
          <div className="p-2">
            <p className="text-center mb-3 text-sm">Connect your wallet to see your assets</p>
            <div className="z-30">
              <WalletConnector />
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex-grow">
                <div className="text-xs font-bold mb-1">Address:</div>
                <div className="win95-inset p-1 text-xs overflow-hidden text-overflow-ellipsis font-bold text-black">
                  {address}
                </div>
              </div>
              <Button 
                className="win95-button w-8 h-8 flex items-center justify-center ml-2 flex-shrink-0"
                title="Switch to Sonic Network"
                onClick={handleSwitchNetwork}
              >
                <Network className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <div className="text-xs font-bold mb-1">S Balance:</div>
                <div className="win95-inset p-1 text-xs font-bold text-black">
                  {parseFloat(balance).toFixed(4)} S
                </div>
              </div>
              
              <div>
                <div className="text-xs font-bold mb-1">THC Balance:</div>
                <div className="win95-inset p-1 text-xs font-bold text-black">
                  {thcBalance ? parseFloat(thcBalance).toFixed(2) : '0.00'} THC
                </div>
              </div>
            </div>
            
            <div className="flex justify-center z-30">
              <WalletConnector />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletWindow;
