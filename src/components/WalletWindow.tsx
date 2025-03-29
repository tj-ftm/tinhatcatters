
import React, { useEffect, useState } from 'react';
import { X, Minus, Image, FileImage, RefreshCw } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import WalletConnector from './WalletConnector';
import { ScrollArea } from './ui/scroll-area';
import { fetchNFTsFromContract } from '@/lib/web3';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { toast } from '@/hooks/use-toast';
import { Button } from './ui/button';

interface WalletWindowProps {
  onClose: () => void;
  onMinimize: () => void;
}

interface NFTData {
  id: string;
  image: string;
  name: string;
  fallbackImage?: string;
  secondaryFallback?: string;
  description?: string;
  attributes?: Array<{trait_type: string, value: string}>;
}

const WalletWindow: React.FC<WalletWindowProps> = ({ onClose, onMinimize }) => {
  const { address, balance, thcBalance, tinHatCatters, refreshNFTs, refreshBalance, isRefreshingBalance } = useWeb3();
  const [nftData, setNftData] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  
  useEffect(() => {
    const loadWalletData = async () => {
      if (address) {
        setLoading(true);
        setError(null);
        
        try {
          await refreshBalance();
          
          try {
            await refreshNFTs();
            
            if (!tinHatCatters || tinHatCatters.length === 0) {
              console.log("Fetching NFTs directly");
              const data = await fetchNFTsFromContract(address);
              console.log("Fetched NFT data:", data);
              setNftData(data);
            } else {
              console.log("Using NFTs from context:", tinHatCatters);
              setNftData(tinHatCatters);
            }
          } catch (nftError) {
            console.error("Error fetching NFTs:", nftError);
            toast({
              title: "NFT Loading Issue",
              description: "Unable to load NFTs. Showing placeholder data.",
              variant: "destructive"
            });
            
            const mockData = [
              {
                id: '1',
                name: 'Tin Hat Catter #1',
                image: `/assets/tinhats/1.png`,
                description: "A unique Tin Hat Catter NFT"
              }
            ];
            setNftData(mockData);
          }
        } catch (error) {
          console.error("Error loading wallet data:", error);
          setError("Failed to load wallet data. Please try again.");
        } finally {
          setLoading(false);
          setLastRefresh(Date.now());
        }
      }
    };
    
    loadWalletData();
    
    const refreshInterval = setInterval(() => {
      if (address) {
        refreshBalance().catch(e => console.error("Error refreshing balance:", e));
        setLastRefresh(Date.now());
      }
    }, 15000); // Refresh every 15 seconds
    
    return () => clearInterval(refreshInterval);
  }, [address, refreshBalance]);
  
  useEffect(() => {
    if (tinHatCatters && tinHatCatters.length > 0) {
      console.log("Updated NFT data from context:", tinHatCatters);
      setNftData(tinHatCatters);
    }
  }, [tinHatCatters]);
  
  const handleManualRefresh = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      toast({
        title: "Refreshing",
        description: "Updating wallet data...",
      });
      
      await refreshBalance();
      await refreshNFTs();
      
      toast({
        title: "Refresh Complete",
        description: "Wallet data has been updated.",
      });
    } catch (error) {
      console.error("Manual refresh error:", error);
      toast({
        title: "Refresh Failed",
        description: "Failed to update wallet data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLastRefresh(Date.now());
    }
  };
  
  const handleImageError = (nftId: string, fallbackType: string) => {
    setImageLoadErrors(prev => ({
      ...prev,
      [`${nftId}-${fallbackType}`]: true
    }));
  };
  
  const getNFTImage = (nft: NFTData) => {
    if (!imageLoadErrors[`${nft.id}-primary`]) {
      return (
        <img 
          src={nft.image} 
          alt={nft.name} 
          className="w-full h-auto object-contain mb-1 border border-gray-300"
          onError={() => handleImageError(nft.id, 'primary')}
        />
      );
    }
    
    if (nft.fallbackImage && !imageLoadErrors[`${nft.id}-fallback1`]) {
      return (
        <img 
          src={nft.fallbackImage}
          alt={nft.name} 
          className="w-full h-auto object-contain mb-1 border border-gray-300"
          onError={() => handleImageError(nft.id, 'fallback1')}
        />
      );
    }
    
    if (nft.secondaryFallback && !imageLoadErrors[`${nft.id}-fallback2`]) {
      return (
        <img 
          src={nft.secondaryFallback}
          alt={nft.name} 
          className="w-full h-auto object-contain mb-1 border border-gray-300"
          onError={() => handleImageError(nft.id, 'fallback2')}
        />
      );
    }
    
    return (
      <div className="w-full h-16 bg-gray-200 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <FileImage className="w-6 h-6 text-gray-500 mb-1" />
          <span className="text-[10px] text-center">{nft.name || `THC #${nft.id}`}</span>
        </div>
      </div>
    );
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
          <div className="flex justify-center">
            <WalletConnector />
          </div>
        ) : (
          <div>
            <div className="mb-3">
              <div className="text-xs font-bold mb-1">Address:</div>
              <div className="win95-inset p-1 text-xs overflow-hidden overflow-ellipsis font-bold text-black">
                {address}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <div className="text-xs font-bold mb-1">S Balance:</div>
                <div className="win95-inset p-1 text-xs font-bold text-black">
                  {parseFloat(balance).toFixed(4)} S
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold mb-1">THC Balance:</div>
                  <Button 
                    className="win95-button h-4 w-4 p-0 mb-1"
                    onClick={refreshBalance}
                    disabled={isRefreshingBalance}
                  >
                    <RefreshCw className="h-2 w-2" />
                  </Button>
                </div>
                <div className="win95-inset p-1 text-xs font-bold text-black">
                  {isRefreshingBalance ? (
                    <span className="text-gray-600">Loading...</span>
                  ) : (
                    `${thcBalance ? parseFloat(thcBalance).toFixed(2) : '0.00'} THC`
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between items-center">
                <div className="text-xs font-bold mb-1">Your Tin Hat Catters:</div>
                <button 
                  className="win95-button text-[8px] p-0.5 h-5 mb-1 flex items-center"
                  onClick={handleManualRefresh}
                  disabled={loading}
                >
                  <RefreshCw className="h-2 w-2 mr-1" />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              
              <div className="win95-inset p-1 max-h-36 overflow-y-auto">
                <ScrollArea className="h-full w-full">
                  {loading ? (
                    <div className="text-xs text-center py-1 font-bold text-black">Loading NFTs...</div>
                  ) : error ? (
                    <div className="text-xs text-center py-1 font-bold text-red-600">{error}</div>
                  ) : nftData && nftData.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1 p-1">
                      {nftData.map((nft) => (
                        <div key={nft.id} className="text-xs p-1 bg-white/50 rounded flex flex-col items-center">
                          {getNFTImage(nft)}
                          <span className="font-bold text-black text-center text-[10px] truncate w-full">
                            {nft.name || `THC #${nft.id}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-center py-1 font-bold text-black">No NFTs found</div>
                  )}
                </ScrollArea>
              </div>
            </div>
            
            <div className="flex justify-center mt-3">
              <WalletConnector />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletWindow;
