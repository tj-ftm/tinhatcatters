
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Wallet, X, MinusIcon } from 'lucide-react';
import WalletSelectDialog from './WalletSelectDialog';

interface WalletWindowProps {
  onClose: () => void;
  onMinimize: () => void;
}

const WalletWindow: React.FC<WalletWindowProps> = ({ onClose, onMinimize }) => {
  const { address, balance, thcBalance, connecting, connect } = useWeb3();
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  
  // Format address for display
  const displayAddress = address 
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : '';
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  const handleConnectClick = () => {
    setShowWalletDialog(true);
  };
  
  const handleSelectWallet = (walletId: string) => {
    connect(walletId);
  };
  
  return (
    <div 
      className="win95-window absolute z-40" 
      style={{ 
        width: '280px',
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div 
        className="win95-title-bar flex items-center cursor-move"
        onMouseDown={handleMouseDown}
      >
        <Wallet className="h-4 w-4 mr-2" />
        <span className="flex-grow">Wallet</span>
        <button 
          className="text-white h-5 w-5 flex items-center justify-center hover:bg-red-800 mr-1"
          onClick={onMinimize}
        >
          <MinusIcon className="h-3 w-3" />
        </button>
        <button 
          className="text-white h-5 w-5 flex items-center justify-center hover:bg-red-800"
          onClick={onClose}
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      
      <div className="p-4">
        {!address ? (
          <div className="flex flex-col items-center">
            <p className="mb-3 text-sm">Connect your wallet to view balance</p>
            <button 
              className="win95-button py-1 px-3 flex items-center"
              onClick={handleConnectClick}
              disabled={connecting}
            >
              {connecting ? 'Connecting...' : 'Connect Wallet'}
              <Wallet className="ml-2 h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold mb-1">Address:</p>
              <p className="text-xs win95-inset p-1 break-all overflow-hidden">{address}</p>
            </div>
            <div className="flex space-x-3">
              <div className="flex-1">
                <p className="text-xs font-bold mb-1">S Balance:</p>
                <p className="text-xs win95-inset p-1">{parseFloat(balance).toFixed(4)} S</p>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold mb-1">THC Balance:</p>
                <p className="text-xs win95-inset p-1">{thcBalance || '0'} THC</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <WalletSelectDialog 
        open={showWalletDialog}
        onOpenChange={setShowWalletDialog}
        onSelectWallet={handleSelectWallet}
      />
    </div>
  );
};

export default WalletWindow;
