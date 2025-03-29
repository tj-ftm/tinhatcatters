
import React, { useEffect, useState } from 'react';
import { X, Minus, Image, FileImage } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import WalletConnector from './WalletConnector';
import { ScrollArea } from './ui/scroll-area';
import { fetchNFTsFromContract } from '@/lib/web3';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

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
  const { address, balance, thcBalance, tinHatCatters, refreshNFTs, refreshBalance } = useWeb3();
  const [nftData, setNftData] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});
  
  // Initial load and refresh of NFT data
  useEffect(() => {
    const loadNFTData = async () => {
      if (address) {
        setLoading(true);
        setError(null);
        try {
          // First try to get NFTs from context
          if (tinHatCatters && tinHatCatters.length > 0) {
            console.log("Using NFTs from context:", tinHatCatters);
            setNftData(tinHatCatters);
          } else {
            // If none in context, fetch directly
            console.log("Fetching NFTs directly");
            await refreshNFTs();
            const data = await fetchNFTsFromContract(address);
            console.log("Fetched NFT data:", data);
            setNftData(data);
          }
        } catch (error) {
          console.error("Error fetching NFT data:", error);
          setError("Failed to load NFT data. Please try again later.");
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadNFTData();
    
    // Set up periodic refresh for balances
    const refreshInterval = setInterval(() => {
      if (address) {
        refreshBalance().catch(e => console.error("Error refreshing balance:", e));
      }
    }, 15000); // Refresh every 15 seconds
    
    return () => clearInterval(refreshInterval);
  }, [address, tinHatCatters, refreshNFTs, refreshBalance]);
  
  // Update nftData when tinHatCatters changes
  useEffect(() => {
    if (tinHatCatters && tinHatCatters.length > 0) {
      setNftData(tinHatCatters);
    }
  }, [tinHatCatters]);
  
  const handleImageError = (nftId: string, fallbackType: string) => {
    setImageLoadErrors(prev => ({
      ...prev,
      [`${nftId}-${fallbackType}`]: true
    }));
  };
  
  const getNFTImage = (nft: NFTData) => {
    // Try primary image
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
    
    // Try first fallback
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
    
    // Try secondary fallback
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
    
    // Show fallback icon/text
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
                <div className="text-xs font-bold mb-1">THC Balance:</div>
                <div className="win95-inset p-1 text-xs font-bold text-black">
                  {thcBalance ? parseFloat(thcBalance).toFixed(2) : '0.00'} THC
                </div>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="text-xs font-bold mb-1">Your Tin Hat Catters:</div>
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
