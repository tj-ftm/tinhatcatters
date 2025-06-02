
import React, { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const WalletBar: React.FC = () => {
  const { address, sonicNFTs, refreshNFTs } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedNFT, setSelectedNFT] = useState<any>(null);

  const fetchNFTs = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      await refreshNFTs();
      if (sonicNFTs.length > 0) {
        setSelectedNFT(sonicNFTs[0]);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch NFTs. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (address && sonicNFTs.length > 0) {
      setSelectedNFT(sonicNFTs[0]);
      setCurrentIndex(0);
    } else {
      setSelectedNFT(null);
      setCurrentIndex(0);
    }
  }, [address, sonicNFTs]);

  const nextNFT = () => {
    if (sonicNFTs.length > 0) {
      const nextIndex = (currentIndex + 1) % sonicNFTs.length;
      setCurrentIndex(nextIndex);
      setSelectedNFT(sonicNFTs[nextIndex]);
    }
  };

  const prevNFT = () => {
    if (sonicNFTs.length > 0) {
      const prevIndex = currentIndex === 0 ? sonicNFTs.length - 1 : currentIndex - 1;
      setCurrentIndex(prevIndex);
      setSelectedNFT(sonicNFTs[prevIndex]);
    }
  };

  if (!address) {
    return null;
  }

  return (
    <div className="win95-window w-full mb-4">
      <div className="win95-title-bar mb-2 flex justify-between items-center">
        <span className="text-sm">Your Sonic NFT Collection</span>
        <Button
          className="win95-button text-xs px-2 py-0.5 flex items-center"
          onClick={fetchNFTs}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </>
          )}
        </Button>
      </div>
      
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-sm">Loading NFTs...</span>
          </div>
        ) : sonicNFTs.length === 0 ? (
          <div className="win95-panel p-4 text-center">
            <p className="text-sm mb-2">No NFTs found in your Sonic wallet.</p>
            <p className="text-xs text-gray-600">Connect your wallet and make sure you have NFTs on the Sonic network.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* NFT Display */}
            <div className="md:col-span-1">
              {selectedNFT && (
                <Card className="win95-panel p-3">
                  <div className="flex justify-between items-center mb-2">
                    <Button
                      className="win95-button p-1"
                      onClick={prevNFT}
                      disabled={sonicNFTs.length <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs font-bold">
                      {currentIndex + 1} / {sonicNFTs.length}
                    </span>
                    <Button
                      className="win95-button p-1"
                      onClick={nextNFT}
                      disabled={sonicNFTs.length <= 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="win95-inset mb-2 aspect-square flex items-center justify-center overflow-hidden">
                    {selectedNFT.image ? (
                      <img
                        src={selectedNFT.image}
                        alt={selectedNFT.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-500">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-xs font-bold mb-1 truncate">{selectedNFT.name}</h3>
                    <p className="text-[10px] text-gray-600">Token ID: {selectedNFT.id}</p>
                  </div>
                </Card>
              )}
            </div>
            
            {/* NFT Metadata */}
            <div className="md:col-span-2">
              {selectedNFT && (
                <Card className="win95-panel p-3 h-full">
                  <h4 className="text-sm font-bold mb-2">Metadata</h4>
                  <ScrollArea className="h-40">
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-bold">Name:</span>
                        <p className="text-xs">{selectedNFT.name}</p>
                      </div>
                      
                      {selectedNFT.description && (
                        <div>
                          <span className="text-xs font-bold">Description:</span>
                          <p className="text-xs">{selectedNFT.description}</p>
                        </div>
                      )}
                      
                      <div>
                        <span className="text-xs font-bold">Token ID:</span>
                        <p className="text-xs">{selectedNFT.id}</p>
                      </div>
                      
                      {selectedNFT.attributes && selectedNFT.attributes.length > 0 && (
                        <div>
                          <span className="text-xs font-bold">Attributes:</span>
                          <div className="space-y-1 mt-1">
                            {selectedNFT.attributes.map((attr: any, index: number) => (
                              <div key={index} className="text-[10px] bg-gray-100 p-1 rounded">
                                <span className="font-bold">{attr.trait_type}:</span> {attr.value}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedNFT.metadata && Object.keys(selectedNFT.metadata).length > 0 && (
                        <div>
                          <span className="text-xs font-bold">Additional Metadata:</span>
                          <pre className="text-[10px] bg-gray-100 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(selectedNFT.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletBar;
