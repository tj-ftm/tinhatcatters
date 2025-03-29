
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useWeb3 } from '@/contexts/Web3Context';
import { Wallet, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import WalletSelectDialog from './WalletSelectDialog';
import { toast } from '@/hooks/use-toast';

const WalletConnector: React.FC = () => {
  const { address, balance, connecting, connect, disconnect } = useWeb3();
  const [isOpen, setIsOpen] = useState(false);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Format address for display
  const displayAddress = address 
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : '';
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleConnectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowWalletDialog(true);
  };
  
  const handleSelectWallet = async (walletId: string) => {
    try {
      await connect(walletId);
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive"
      });
      console.error("Wallet connection error:", error);
    }
  };
  
  // If not connected, show connect button
  if (!address) {
    return (
      <>
        <Button 
          className="sonic-btn whitespace-nowrap flex-shrink-0 cursor-pointer" 
          onClick={handleConnectClick} 
          disabled={connecting}
        >
          {connecting ? 'Connecting...' : 'Connect Wallet'}
          <Wallet className="ml-2 h-4 w-4" />
        </Button>
        
        <WalletSelectDialog 
          open={showWalletDialog}
          onOpenChange={setShowWalletDialog}
          onSelectWallet={handleSelectWallet}
        />
      </>
    );
  }
  
  // If connected, show dropdown
  return (
    <div className="relative flex-shrink-0 z-30" ref={dropdownRef}>
      <Button 
        className="sonic-btn flex items-center whitespace-nowrap cursor-pointer" 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        {displayAddress}
        {isOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
      </Button>
      
      {isOpen && (
        <div className="win95-window absolute right-0 mt-2 w-48 py-2 z-50">
          <div className="win95-title-bar mb-2">
            <span>Wallet Info</span>
            <button 
              className="text-white hover:text-gray-300 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            >
              x
            </button>
          </div>
          <div className="px-4 py-2">
            <div className="mb-4">
              <p className="text-sm font-bold mb-1">Address:</p>
              <p className="text-xs win95-inset p-1 break-all">{address}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-bold mb-1">Balance:</p>
              <p className="text-xs win95-inset p-1">{parseFloat(balance).toFixed(4)} S</p>
            </div>
            <Button 
              className="win95-button w-full flex items-center justify-center cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation();
                disconnect();
                setIsOpen(false);
              }}
            >
              Disconnect
              <LogOut className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnector;
