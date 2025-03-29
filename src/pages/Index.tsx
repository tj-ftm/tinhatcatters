
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useWeb3 } from '@/contexts/Web3Context';
import Header from '@/components/Header';

const Index = () => {
  const { connect, address, connecting } = useWeb3();
  
  return (
    <div className="min-h-screen flex flex-col bg-sonicBlack">
      <Header />
      
      <main className="flex-1 p-4 flex flex-col items-center justify-center">
        <div className="win95-window max-w-4xl w-full">
          <div className="win95-title-bar">
            <span>Welcome to Sonic Sidescroller Adventure</span>
          </div>
          
          <div className="p-6">
            <div className="mb-6 flex flex-col md:flex-row gap-6">
              <div className="win95-inset aspect-square md:w-1/2 flex items-center justify-center bg-[#330033] animate-pulse">
                <div className="text-5xl font-bold text-[#FF69B4]">
                  SONIC
                </div>
              </div>
              
              <div className="md:w-1/2">
                <h1 className="text-2xl font-bold mb-4 text-[#FF69B4]">
                  Web3 Sidescroller Adventure
                </h1>
                
                <div className="win95-panel p-3 mb-4">
                  <p className="mb-2">
                    Experience the nostalgic Windows 95 interface combined with cutting-edge Web3 technology on the Sonic network!
                  </p>
                  
                  <ul className="list-disc pl-6 mb-4 text-sm">
                    <li className="mb-1">Run, jump, and dash through exciting levels</li>
                    <li className="mb-1">Collect rings and increase your score</li>
                    <li className="mb-1">Use TinHatCatters NFTs as in-game pets</li>
                    <li className="mb-1">Buy snack NFTs for powerful gameplay boosts</li>
                    <li className="mb-1">Connect to the Sonic network for seamless Web3 integration</li>
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/game" className="flex-1">
                    <Button className="sonic-btn w-full">
                      Play Now
                    </Button>
                  </Link>
                  
                  <Link to="/shop" className="flex-1">
                    <Button className="sonic-btn w-full">
                      NFT Shop
                    </Button>
                  </Link>
                  
                  {!address && (
                    <Button 
                      className="sonic-btn flex-1" 
                      onClick={connect}
                      disabled={connecting}
                    >
                      {connecting ? 'Connecting...' : 'Connect Wallet'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="win95-panel p-3">
              <h2 className="text-lg font-bold mb-2">
                TinHatCatters NFT Integration
              </h2>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-2/3">
                  <p className="mb-2">
                    Own TinHatCatters NFTs? Use them as pets in the game for special boosts:
                  </p>
                  
                  <ul className="list-disc pl-6 mb-2 text-sm">
                    <li className="mb-1">Speed boost: Move faster through levels</li>
                    <li className="mb-1">Jump boost: Reach higher platforms</li>
                    <li className="mb-1">Unique visual effects based on NFT traits</li>
                  </ul>
                  
                  <p className="text-sm">
                    Connect your wallet to the Sonic network to access your TinHatCatters collection!
                  </p>
                </div>
                
                <div className="md:w-1/3 flex flex-wrap justify-center gap-2">
                  <div className="w-16 h-16 win95-inset flex items-center justify-center bg-[#FF69B4]">
                    <div className="w-10 h-10 bg-[#FFFF00] rounded-full"></div>
                  </div>
                  <div className="w-16 h-16 win95-inset flex items-center justify-center bg-[#FF69B4]">
                    <div className="w-10 h-10 bg-[#000000] rounded-full"></div>
                  </div>
                  <div className="w-16 h-16 win95-inset flex items-center justify-center bg-[#FF69B4]">
                    <div className="w-10 h-10 bg-[#FFFF00] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="win95-window p-2">
        <div className="text-center text-xs">
          <p>© 2023 Sonic Sidescroller Adventure - Windows 95 Edition</p>
          <p>Built with Web3 technology on the Sonic network</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
