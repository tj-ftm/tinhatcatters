
import React, { useEffect, useState } from 'react';
import { X, Minus, Network } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import WalletConnector from './WalletConnector';
import { ScrollArea } from './ui/scroll-area';
import { fetchTinHatCattersFromSonicscan, switchToSonicNetwork } from '@/lib/web3';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { toast } from '@/hooks/use-toast';

interface WalletWindowProps {
  onClose: () => void;
  onMinimize: () => void;
}

interface NFTData {
  id: string;
  image: string;
}

const WalletWindow: React.FC<WalletWindowProps> = ({ onClose, onMinimize }) => {
  const { address, balance, thcBalance, tinHatCatters } = useWeb3();
  const [nftData, setNftData] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(true);
  
  useEffect(() => {
    const loadNFTData = async () => {
      if (address) {
        setLoading(true);
        try {
          const data = await fetchTinHatCattersFromSonicscan(address);
          setNftData(data);
        } catch (error) {
          console.error("Error fetching NFT data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadNFTData();
  }, [address]);
  
  const handleImageError = (nftId: string) => {
    setImageLoadErrors(prev => ({
      ...prev,
      [nftId]: true
    }));
  };
  
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
            
            <div className="mb-2">
              <div className="text-xs font-bold mb-1">Your Tin Hat Catter:</div>
              <div className="win95-inset p-1 max-h-24 overflow-y-auto">
                <ScrollArea className="h-full">
                  {loading ? (
                    <div className="text-xs text-center py-1 font-bold text-black">Loading NFTs...</div>
                  ) : nftData && nftData.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1">
                      {nftData.map((nft) => (
                        <div key={nft.id} className="text-xs p-1 bg-white/50 rounded flex flex-col items-center">
                          <Avatar className="w-12 h-12 mb-1 border border-gray-300">
                            {nft.image && !imageLoadErrors[nft.id] ? (
                              <AvatarImage 
                                src={nft.image} 
                                alt={`THC #${nft.id}`}
                                onError={() => handleImageError(nft.id)}
                              />
                            ) : (
                              <AvatarFallback className="bg-gray-200 text-[10px]">
                                THC #{nft.id}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span className="font-bold text-black text-center text-[10px]">THC #{nft.id}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-center py-1 font-bold text-black">No NFTs found</div>
                  )}
                </ScrollArea>
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
