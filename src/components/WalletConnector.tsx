
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useWeb3 } from '@/contexts/Web3Context';
import { Wallet, LogOut, User, Edit } from 'lucide-react';
import WalletSelectDialog from './WalletSelectDialog';
import NicknameDialog from './NicknameDialog';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNickname } from '@/hooks/useNickname';
import { usePoints } from '@/hooks/use-points';
import { fetchUserNFTs, PaintSwapNFT } from '@/lib/api/paintswap';

const TIN_HAT_CATTER_CONTRACT = "0x2dc1886d67001d5d6a80feaa51513f7bb5a591fd";

const WalletConnector: React.FC = () => {
  const { address, connecting, connect, disconnect } = useWeb3();
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [showNicknameDialog, setShowNicknameDialog] = useState(false);
  const [tinHatCatterNFTs, setTinHatCatterNFTs] = useState<PaintSwapNFT[]>([]);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
  const { nickname, hasNickname } = useNickname();
  const { getPoints } = usePoints();
  const isMobile = useIsMobile();
  
  // Format address for display - shorter on mobile
  const displayAddress = address 
    ? isMobile
      ? `${address.substring(0, 4)}...${address.substring(address.length - 3)}`
      : `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : '';

  // Fetch Tin Hat Catter NFTs when address changes
  useEffect(() => {
    const fetchTinHatCatterNFTs = async () => {
      if (!address) {
        setTinHatCatterNFTs([]);
        return;
      }

      setIsLoadingNFTs(true);
      try {
        const allNFTs = await fetchUserNFTs(address);
        
        // Filter for Tin Hat Catter NFTs
        const tinHatNFTs = allNFTs.filter(nft => 
          nft.collection?.address?.toLowerCase() === TIN_HAT_CATTER_CONTRACT.toLowerCase()
        );
        
        setTinHatCatterNFTs(tinHatNFTs);
      } catch (error) {
        console.error('Error fetching Tin Hat Catter NFTs:', error);
        setTinHatCatterNFTs([]);
      } finally {
        setIsLoadingNFTs(false);
      }
    };

    fetchTinHatCatterNFTs();
  }, [address]);
  
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
  
  // If connected, show wallet dropdown
  return (
    <div className={`flex items-center gap-1 flex-shrink-0 ${isMobile ? 'scale-90 origin-right' : ''}`}>
      <div className="relative group">
        <div className={`sonic-btn flex items-center whitespace-nowrap cursor-pointer ${isMobile ? 'text-xs px-2 py-1 h-7' : ''}`}>
          <div className="flex flex-col items-start">
            {hasNickname && (
              <div className="text-blue-600 font-medium text-xs">
                {nickname}
              </div>
            )}
            <div className="text-gray-600">
              {displayAddress}
            </div>
          </div>
        </div>
        
        {/* Dropdown Menu */}
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 min-w-[300px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Wallet Info</div>
            <div className="text-xs text-gray-500 break-all">{address}</div>
            
            {hasNickname && (
              <div className="border-t pt-2">
                <div className="text-sm font-medium text-gray-700">Nickname</div>
                <div className="text-xs text-blue-600">{nickname}</div>
              </div>
            )}
            
            <div className="border-t pt-2">
              <div className="text-sm font-medium text-gray-700">Balances</div>
              <div className="text-xs text-gray-600">
                <div>THC: 0.00</div>
                <div>Points: {getPoints(address)}</div>
                <div className="text-orange-500 text-xs mt-1">Payouts coming soon!</div>
              </div>
            </div>

            {/* Tin Hat Catter NFTs Section */}
            <div className="border-t pt-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Tin Hat Catter NFTs</div>
              {isLoadingNFTs ? (
                <div className="text-xs text-gray-500">Loading NFTs...</div>
              ) : tinHatCatterNFTs.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {tinHatCatterNFTs.map((nft) => (
                    <div
                      key={`${nft.collection?.address}-${nft.id}`}
                      className="flex items-center p-2 bg-gray-50 rounded border"
                    >
                      <img
                        src={nft.image || "https://via.placeholder.com/32"}
                        alt={nft.name}
                        className="w-8 h-8 rounded mr-2 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/32";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-800 truncate">
                          {nft.name || `Token #${nft.id}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {nft.id}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500">No Tin Hat Catter NFTs found.</div>
              )}
            </div>
            
            <div className="border-t pt-2 space-y-1">
              <Button
                onClick={() => setShowNicknameDialog(true)}
                className="w-full text-xs py-1 h-7 flex items-center gap-1"
                variant="outline"
              >
                <Edit size={12} />
                {hasNickname ? "Edit Nickname" : "Set Nickname"}
              </Button>
              
              <Button
                onClick={() => disconnect()}
                className="w-full text-xs py-1 h-7 flex items-center gap-1"
                variant="destructive"
              >
                <LogOut size={12} />
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <NicknameDialog 
        open={showNicknameDialog} 
        onOpenChange={setShowNicknameDialog} 
      />
      
      <WalletSelectDialog 
        open={showWalletDialog}
        onOpenChange={setShowWalletDialog}
        onSelectWallet={handleSelectWallet}
      />
    </div>
  );
};

export default WalletConnector;
