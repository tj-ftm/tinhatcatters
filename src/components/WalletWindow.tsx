
import React, { useEffect, useState, useRef } from 'react';
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
  const { address, balance, thcBalance, tinHatCatters, sonicNFTs } = useWeb3();
  const [nftData, setNftData] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});
  const windowRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState(false);
  const [size, setSize] = useState({ width: 320, height: 'auto' });
  const startResizePos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });
  
  useEffect(() => {
    const loadNFTData = async () => {
      if (address) {
        setLoading(true);
        setError(null);
        try {
          const data = await fetchTinHatCattersFromSonicscan(address);
          setNftData(data);
        } catch (error) {
          console.error("Error fetching NFT data:", error);
          setError("Failed to load NFT data. Please try again later.");
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

  // Resize handling
  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setResizing(true);
    startResizePos.current = { x: e.clientX, y: e.clientY };
    if (windowRef.current) {
      startSize.current = { 
        width: windowRef.current.offsetWidth, 
        height: windowRef.current.offsetHeight 
      };
    }
    
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
  };
  
  const handleResize = (e: MouseEvent) => {
    if (!resizing) return;
    
    const dx = e.clientX - startResizePos.current.x;
    const dy = e.clientY - startResizePos.current.y;
    
    setSize({
      width: Math.max(280, startSize.current.width + dx),
      height: 'auto' // Keep height auto for content flexibility
    });
  };
  
  const stopResize = () => {
    setResizing(false);
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
  };
  
  return (
    <div 
      ref={windowRef}
      className="win95-window shadow-lg z-20"
      style={{ 
        width: `${size.width}px`, 
        height: size.height,
        cursor: resizing ? 'se-resize' : 'default'
      }}
    >
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
            
            {/* Sonic NFTs Preview */}
            {sonicNFTs.length > 0 && (
              <div className="mb-2">
                <div className="text-xs font-bold mb-1">Your Sonic NFTs:</div>
                <div className="win95-inset p-1 max-h-24 overflow-y-auto">
                  <ScrollArea className="h-full">
                    <div className="grid grid-cols-2 gap-1">
                      {sonicNFTs.slice(0, 4).map((nft) => (
                        <div key={nft.id} className="text-xs p-1 bg-white/50 rounded flex flex-col items-center">
                          <img 
                            src={nft.image || '/placeholder.svg'} 
                            alt={nft.name}
                            className="w-full h-auto object-contain mb-1 border border-gray-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          <span className="font-bold text-black text-center text-[10px] truncate w-full">
                            {nft.name || `#${nft.id}`}
                          </span>
                        </div>
                      ))}
                      {sonicNFTs.length > 4 && (
                        <div className="text-xs p-1 flex items-center justify-center">
                          <span className="text-[10px] text-black">+{sonicNFTs.length - 4} more</span>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
            
            <div className="flex justify-center">
              <WalletConnector />
            </div>
          </div>
        )}
      </div>
      
      {/* Resize handle */}
      <div 
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={startResize}
        style={{
          backgroundImage: 'linear-gradient(135deg, transparent 50%, #000 50%, #000 60%, transparent 60%)',
          backgroundSize: '8px 8px',
          backgroundPosition: 'bottom right'
        }}
      />
    </div>
  );
};

export default WalletWindow;
