
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWeb3 } from '@/contexts/Web3Context';
import { Wallet, LogOut } from 'lucide-react';
import WalletSelectDialog from './WalletSelectDialog';
import { toast } from '@/hooks/use-toast';

const WalletConnector: React.FC = () => {
  const { address, connecting, connect, disconnect } = useWeb3();
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  
  // Format address for display
  const displayAddress = address 
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
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
          className="sonic-btn whitespace-nowrap flex items-center justify-center"
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
  
  // If connected, show address and disconnect button (no dropdown)
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <div className="sonic-btn flex items-center whitespace-nowrap">
        {displayAddress}
      </div>
      <Button 
        className="win95-button flex items-center justify-center p-1 h-8 w-8"
        onClick={() => disconnect()}
        title="Disconnect Wallet"
      >
        <LogOut className="h-4 w-4" />
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
