
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWeb3 } from '@/contexts/Web3Context';
import { Wallet, LogOut } from 'lucide-react';
import WalletSelectDialog from './WalletSelectDialog';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const WalletConnector: React.FC = () => {
  const { address, connecting, connect, disconnect } = useWeb3();
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const isMobile = useIsMobile();
  
  // Format address for display - shorter on mobile
  const displayAddress = address 
    ? isMobile
      ? `${address.substring(0, 4)}...${address.substring(address.length - 3)}`
      : `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : '';
  
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
          className={`sonic-btn whitespace-nowrap flex items-center justify-center ${isMobile ? 'text-xs px-2 py-1 h-7' : ''}`}
          onClick={handleConnectClick} 
          disabled={connecting}
        >
          {connecting ? 'Connecting...' : isMobile ? 'Connect' : 'Connect Wallet'}
          <Wallet className={`ml-1 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
        </Button>
        
        <WalletSelectDialog 
          open={showWalletDialog}
          onOpenChange={setShowWalletDialog}
          onSelectWallet={handleSelectWallet}
        />
      </>
    );
  }
  
  // If connected, show address and disconnect button (no dropdown)
  return (
    <div className={`flex items-center gap-1 flex-shrink-0 ${isMobile ? 'scale-90 origin-right' : ''}`}>
      <div className={`sonic-btn flex items-center whitespace-nowrap ${isMobile ? 'text-xs px-2 py-1 h-7' : ''}`}>
        {displayAddress}
      </div>
      <Button 
        className={`win95-button flex items-center justify-center ${isMobile ? 'p-0.5 h-7 w-7' : 'p-1 h-8 w-8'}`}
        onClick={() => disconnect()}
        title="Disconnect Wallet"
      >
        <LogOut className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
      </Button>
      
      <WalletSelectDialog 
        open={showWalletDialog}
        onOpenChange={setShowWalletDialog}
        onSelectWallet={handleSelectWallet}
      />
    </div>
  );
};

export default WalletConnector;
