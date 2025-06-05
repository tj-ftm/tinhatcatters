
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useWeb3 } from '@/contexts/Web3Context';
import { useNickname } from '@/hooks/useNickname';
import { usePoints } from '@/hooks/use-points';
import { Wallet, LogOut, User, Edit3 } from 'lucide-react';
import WalletSelectDialog from './WalletSelectDialog';
import NicknameDialog from './NicknameDialog';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const WalletConnector: React.FC = () => {
  const { address, balance, thcBalance, connecting, connect, disconnect } = useWeb3();
  const { nickname, hasNickname, saveNickname } = useNickname();
  const { getPoints, addPoints } = usePoints();
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [showNicknameDialog, setShowNicknameDialog] = useState(false);
  const [hasReceivedWelcomeBonus, setHasReceivedWelcomeBonus] = useState(false);
  const isMobile = useIsMobile();
  
  // Check if user has received welcome bonus
  useEffect(() => {
    if (address) {
      const welcomeBonusKey = `welcome-bonus-${address}`;
      const received = localStorage.getItem(welcomeBonusKey);
      setHasReceivedWelcomeBonus(!!received);
      
      // If first time connecting and no nickname, show dialog and give bonus
      if (!received && !hasNickname) {
        setTimeout(() => {
          setShowNicknameDialog(true);
        }, 1000);
      }
    }
  }, [address, hasNickname]);

  // Handle nickname save with welcome bonus
  const handleNicknameSave = async (newNickname: string) => {
    if (address && !hasReceivedWelcomeBonus) {
      // Give welcome bonus
      addPoints(address, 500);
      localStorage.setItem(`welcome-bonus-${address}`, 'true');
      setHasReceivedWelcomeBonus(true);
      
      toast({
        title: "Welcome Bonus!",
        description: "You've received 500 points for setting your nickname! 🎉",
      });
    }
  };

  // Format address for display - shorter on mobile
  const displayAddress = address 
    ? isMobile
      ? `${address.substring(0, 4)}...${address.substring(address.length - 3)}`
      : `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : '';
  
  const displayNickname = nickname || displayAddress;
  const currentPoints = address ? getPoints(address) : 0;
  
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
  
  // If connected, show dropdown with wallet info
  return (
    <div className={`flex items-center gap-1 flex-shrink-0 ${isMobile ? 'scale-90 origin-right' : ''}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className={`sonic-btn flex items-center whitespace-nowrap ${isMobile ? 'text-xs px-2 py-1 h-7' : ''}`}>
            {displayNickname}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <div className="font-semibold">{nickname || 'Anonymous'}</div>
              <div className="text-xs text-gray-500 font-normal">{displayAddress}</div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem disabled>
            <div className="flex flex-col w-full">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Balance:</span>
                <span className="text-xs">{parseFloat(balance).toFixed(4)} S</span>
              </div>
              {thcBalance && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">THC:</span>
                  <span className="text-xs">{parseFloat(thcBalance).toFixed(2)} THC</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Points:</span>
                <span className="text-xs font-semibold text-yellow-600">{currentPoints}</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                Points → THC payouts coming soon!
              </div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowNicknameDialog(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>{hasNickname ? 'Edit Nickname' : 'Set Nickname'}</span>
            <Edit3 className="ml-auto h-3 w-3" />
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => disconnect()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <WalletSelectDialog 
        open={showWalletDialog}
        onOpenChange={setShowWalletDialog}
        onSelectWallet={handleSelectWallet}
      />
      
      <NicknameDialog 
        open={showNicknameDialog} 
        onOpenChange={setShowNicknameDialog}
        onNicknameSave={handleNicknameSave}
      />
    </div>
  );
};

export default WalletConnector;
