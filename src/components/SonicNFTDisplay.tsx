
import React, { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { NFTMetadata } from '@/lib/web3/nftImport';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader } from 'lucide-react';

interface SonicNFTDisplayProps {
  className?: string;
}

const SonicNFTDisplay: React.FC<SonicNFTDisplayProps> = ({ className }) => {
  const { address, sonicNFTs, refreshNFTs } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<NFTMetadata | null>(null);

  const handleRefresh = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      await refreshNFTs();
    } catch (error) {
      console.error('Error refreshing NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNFTClick = (nft: NFTMetadata) => {
    setSelectedNFT(nft === selectedNFT ? null : nft);
  };

  return (
    <div className={`win95-window w-full ${className || ''}`}>
      <div className="win95-title-bar mb-0">
        <span>Sonic NFT Collection</span>
      </div>
      
      <div className="p-4 bg-[#c0c0c0]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-black">Your Sonic NFTs</h2>
          <Button 
            className="win95-button"
            onClick={handleRefresh}
            disabled={loading || !address}
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Refresh NFTs'
            )}
          </Button>
        </div>
        
        {!address ? (
          <div className="win95-inset p-4 text-center">
            <p className="text-sm text-black">Connect your wallet to view your Sonic NFTs.</p>
          </div>
        ) : sonicNFTs.length === 0 ? (
          <div className="win95-inset p-4 text-center">
            <p className="text-sm text-black mb-2">No Sonic NFTs found in your wallet.</p>
            <p className="text-xs text-black">
              If you own NFTs from the Sonic collection, make sure you're connected to the right account.
            </p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4">
            {/* NFT Grid */}
            <div className="win95-inset p-2 flex-1">
              <ScrollArea className="h-64">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {sonicNFTs.map((nft) => (
                    <div 
                      key={nft.id}
                      className={`win95-button cursor-pointer p-1 ${selectedNFT?.id === nft.id ? 'bg-blue-200' : ''}`}
                      onClick={() => handleNFTClick(nft)}
                    >
                      <div className="aspect-square overflow-hidden mb-1">
                        <img 
                          src={nft.image || '/placeholder.svg'} 
                          alt={nft.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="text-[10px] font-bold truncate text-black">
                        {nft.name || `NFT #${nft.id}`}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            {/* NFT Details */}
            <div className="win95-inset p-2 flex-1">
              <ScrollArea className="h-64">
                {selectedNFT ? (
                  <div className="text-black p-2">
                    <h3 className="text-sm font-bold mb-2">{selectedNFT.name}</h3>
                    
                    <div className="mb-3">
                      <img 
                        src={selectedNFT.image || '/placeholder.svg'}
                        alt={selectedNFT.name}
                        className="w-full max-h-32 object-contain mx-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    
                    <div className="text-xs">
                      <div className="mb-2">
                        <strong>Token ID:</strong> {selectedNFT.id}
                      </div>
                      
                      {selectedNFT.description && (
                        <div className="mb-2">
                          <strong>Description:</strong>
                          <p className="mt-1">{selectedNFT.description}</p>
                        </div>
                      )}
                      
                      {selectedNFT.attributes && selectedNFT.attributes.length > 0 && (
                        <div>
                          <strong>Attributes:</strong>
                          <div className="mt-1 grid grid-cols-2 gap-1">
                            {selectedNFT.attributes.map((attr, index) => (
                              <div key={index} className="win95-inset px-1 py-0.5">
                                <span className="font-bold">{attr.trait_type}:</span> {attr.value}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-center p-4">
                    <p className="text-sm text-black">
                      Select an NFT to view details
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SonicNFTDisplay;
