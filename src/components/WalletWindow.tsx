import React, { useEffect, useState } from 'react';
import { X, Minus, Eye, EyeOff } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import WalletConnector from './WalletConnector';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';

interface WalletWindowProps {
  onClose: () => void;
  onMinimize: () => void;
}

const WalletWindow: React.FC<WalletWindowProps> = ({ onClose, onMinimize }) => {
  const { address, balance, thcBalance, sonicNFTs } = useWeb3();
  const [showBalances, setShowBalances] = useState<boolean>(true);
  
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
          <div className="flex justify-center">
            <WalletConnector />
          </div>
        ) : (
          <div>
            <div className="mb-3 flex items-center">
              <Button 
                variant="outline" 
                size="sm" 
                className="mr-2 win95-button h-6 w-6 p-0" 
                onClick={() => setShowBalances(!showBalances)}
              >
                {showBalances ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
              <div className="flex-1">
                <div className="text-xs font-bold mb-1">Address:</div>
                <div className="win95-inset p-1 text-xs overflow-hidden text-overflow-ellipsis font-bold text-black">
                  {address}
                </div>
              </div>
            </div>
            
            {showBalances && (
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
            )}
            
            {sonicNFTs.length > 0 && (
              <div className="mb-2">
                <div className="text-xs font-bold mb-1">Your Sonic NFTs:</div>
                <div className="win95-inset p-1 max-h-24 overflow-y-auto">
                  <ScrollArea className="h-full">
                    <div className="grid grid-cols-2 gap-1">
                      {sonicNFTs.slice(0, 4).map((nft) => (
                        <div key={nft.id} className="text-xs p-1 bg-white/50 rounded flex flex-col items-center">
                          <img 
                            src={nft.image || '/placeholder.svg'} 
                            alt={nft.name}
                            className="w-full h-auto object-contain mb-1 border border-gray-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          <span className="font-bold text-black text-center text-[10px] truncate w-full">
                            {nft.name || `#${nft.id}`}
                          </span>
                        </div>
                      ))}
                      {sonicNFTs.length > 4 && (
                        <div className="text-xs p-1 flex items-center justify-center">
                          <span className="text-[10px] text-black">+{sonicNFTs.length - 4} more</span>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
            
            <div className="flex justify-center">
              <WalletConnector />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletWindow;
