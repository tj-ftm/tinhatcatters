
import React, { useEffect, useState } from 'react';
import { X, Minus } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import WalletConnector from './WalletConnector';
import { ScrollArea } from './ui/scroll-area';
import { fetchTinHatCattersFromSonicscan } from '@/lib/web3';

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
            <div className="z-30">
              <WalletConnector />
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-3">
              <div className="text-xs font-bold mb-1">Address:</div>
              <div className="win95-inset p-1 text-xs overflow-hidden text-overflow-ellipsis font-bold text-black">
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
              <div className="text-xs font-bold mb-1">Your Tin Hat Catter:</div>
              <div className="win95-inset p-1 max-h-24 overflow-y-auto">
                <ScrollArea className="h-full">
                  {loading ? (
                    <div className="text-xs text-center py-1 font-bold text-black">Loading NFTs...</div>
                  ) : nftData && nftData.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1">
                      {nftData.map((nft) => (
                        <div key={nft.id} className="text-xs p-1 bg-white/50 rounded flex flex-col items-center">
                          {nft.image && !imageLoadErrors[nft.id] ? (
                            <img 
                              src={nft.image} 
                              alt={`THC #${nft.id}`} 
                              className="w-full h-auto object-contain mb-1 border border-gray-300"
                              onError={() => handleImageError(nft.id)}
                            />
                          ) : (
                            <div className="w-full h-12 bg-gray-200 flex items-center justify-center">
                              <span className="text-[10px]">THC #{nft.id}</span>
                            </div>
                          )}
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
