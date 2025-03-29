
import React from 'react';
import { X, Minus } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import WalletConnector from './WalletConnector';

interface WalletWindowProps {
  onClose: () => void;
  onMinimize: () => void;
}

const WalletWindow: React.FC<WalletWindowProps> = ({ onClose, onMinimize }) => {
  const { address, balance, thcBalance, tinHatCatters } = useWeb3();
  
  return (
    <div className="win95-window w-80 shadow-lg">
      <div className="win95-title-bar flex justify-between items-center">
        <span className="text-white font-bold">Wallet</span>
        <div className="flex">
          <button className="text-white hover:bg-blue-800 px-1" onClick={onMinimize}>
            <Minus className="h-3 w-3" />
          </button>
          <button className="text-white hover:bg-red-500 px-1" onClick={onClose}>
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      <div className="p-3 bg-[#c0c0c0]">
        {!address ? (
          <div className="p-2">
            <p className="text-center mb-3 text-sm">Connect your wallet to see your assets</p>
            <WalletConnector />
          </div>
        ) : (
          <div>
            <div className="mb-3">
              <div className="text-xs font-bold mb-1">Address:</div>
              <div className="win95-inset p-1 text-xs overflow-hidden text-overflow-ellipsis">
                {address}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <div className="text-xs font-bold mb-1">ETH Balance:</div>
                <div className="win95-inset p-1 text-xs">
                  {parseFloat(balance).toFixed(4)} ETH
                </div>
              </div>
              
              <div>
                <div className="text-xs font-bold mb-1">THC Balance:</div>
                <div className="win95-inset p-1 text-xs">
                  {thcBalance ? parseFloat(thcBalance).toFixed(2) : '0.00'} THC
                </div>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="text-xs font-bold mb-1">Your THC NFTs:</div>
              <div className="win95-inset p-1 max-h-24 overflow-y-auto">
                {tinHatCatters && tinHatCatters.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1">
                    {tinHatCatters.map((cat, index) => (
                      <div key={index} className="text-xs p-1 bg-white/50 rounded">
                        THC #{cat.id}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-center py-1">No NFTs found</div>
                )}
              </div>
            </div>
            
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
