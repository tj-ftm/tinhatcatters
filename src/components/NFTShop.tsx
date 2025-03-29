
import React, { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import NFTCard from './NFTCard';
import { purchaseSnack } from '@/lib/web3';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Expanded snack collection with different categories
const AVAILABLE_SNACKS = {
  speed: [
    {
      id: 'donut',
      name: 'Energy Donut',
      image: '/assets/snacks/donut.png',
      price: 5,
      boost: { type: 'speed', value: 20, duration: 10 }
    },
    {
      id: 'cookie',
      name: 'Speed Cookie',
      image: '/assets/snacks/cookie.png',
      price: 8,
      boost: { type: 'speed', value: 30, duration: 5 }
    },
    {
      id: 'soda',
      name: 'Sonic Soda',
      image: '/assets/snacks/soda.png',
      price: 12,
      boost: { type: 'speed', value: 40, duration: 8 }
    },
    {
      id: 'shake',
      name: 'Power Shake',
      image: '/assets/snacks/shake.png',
      price: 15,
      boost: { type: 'speed', value: 50, duration: 7 }
    },
    {
      id: 'energybar',
      name: 'Energy Bar',
      image: '/assets/snacks/energybar.png',
      price: 10,
      boost: { type: 'speed', value: 25, duration: 15 }
    },
    {
      id: 'speedpotion',
      name: 'Speed Potion',
      image: '/assets/snacks/speedpotion.png',
      price: 20,
      boost: { type: 'speed', value: 60, duration: 6 }
    }
  ],
  jump: [
    {
      id: 'coffee',
      name: 'Jump Coffee',
      image: '/assets/snacks/coffee.png',
      price: 7,
      boost: { type: 'jump', value: 25, duration: 10 }
    },
    {
      id: 'springs',
      name: 'Spring Boots',
      image: '/assets/snacks/springs.png',
      price: 15,
      boost: { type: 'jump', value: 40, duration: 12 }
    },
    {
      id: 'jumpcandy',
      name: 'Bounce Candy',
      image: '/assets/snacks/jumpcandy.png',
      price: 9,
      boost: { type: 'jump', value: 30, duration: 8 }
    },
    {
      id: 'jetpack',
      name: 'Mini Jetpack',
      image: '/assets/snacks/jetpack.png',
      price: 25,
      boost: { type: 'jump', value: 50, duration: 6 }
    },
    {
      id: 'jumpgum',
      name: 'Bounce Gum',
      image: '/assets/snacks/jumpgum.png',
      price: 12,
      boost: { type: 'jump', value: 35, duration: 14 }
    },
    {
      id: 'helium',
      name: 'Helium Balloon',
      image: '/assets/snacks/helium.png',
      price: 18,
      boost: { type: 'jump', value: 45, duration: 9 }
    }
  ],
  health: [
    {
      id: 'firstaid',
      name: 'First Aid Kit',
      image: '/assets/snacks/firstaid.png',
      price: 20,
      boost: { type: 'health', value: 50, duration: 0 }
    },
    {
      id: 'shield',
      name: 'Force Shield',
      image: '/assets/snacks/shield.png',
      price: 30,
      boost: { type: 'invincibility', value: 100, duration: 10 }
    },
    {
      id: 'potion',
      name: 'Health Potion',
      image: '/assets/snacks/potion.png',
      price: 15,
      boost: { type: 'health', value: 30, duration: 0 }
    },
    {
      id: 'medkit',
      name: 'Mega Medkit',
      image: '/assets/snacks/medkit.png',
      price: 40,
      boost: { type: 'health', value: 100, duration: 0 }
    }
  ],
  growing: [
    {
      id: 'growfood',
      name: 'Growth Nutrient',
      image: '/assets/snacks/growfood.png',
      price: 25,
      boost: { type: 'size', value: 50, duration: 15 }
    },
    {
      id: 'supersoil',
      name: 'Super Soil',
      image: '/assets/snacks/supersoil.png',
      price: 35,
      boost: { type: 'growth', value: 100, duration: 0 }
    },
    {
      id: 'seeds',
      name: 'Sonic Seeds',
      image: '/assets/snacks/seeds.png',
      price: 15,
      boost: { type: 'planting', value: 1, duration: 0 }
    },
    {
      id: 'water',
      name: 'Special Water',
      image: '/assets/snacks/water.png',
      price: 10,
      boost: { type: 'hydration', value: 75, duration: 0 }
    }
  ]
};

const NFTShop: React.FC = () => {
  const { address, balance, refreshNFTs } = useWeb3();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('speed');
  
  const handlePurchase = async (snackId: string) => {
    if (!address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first.',
        variant: 'destructive'
      });
      return;
    }
    
    // Find the snack in any category
    let snack = null;
    Object.values(AVAILABLE_SNACKS).forEach(category => {
      const found = category.find(s => s.id === snackId);
      if (found) snack = found;
    });
    
    if (!snack) return;
    
    // Check if user has enough balance
    if (parseFloat(balance) < snack.price) {
      toast({
        title: 'Insufficient Balance',
        description: `You need at least ${snack.price} S to purchase this item.`,
        variant: 'destructive'
      });
      return;
    }
    
    setPurchasing(snackId);
    
    try {
      const success = await purchaseSnack(Number(snackId));
      
      if (success) {
        toast({
          title: 'Purchase Successful',
          description: `You have purchased ${snack.name}!`
        });
        refreshNFTs();
      }
    } catch (error) {
      toast({
        title: 'Purchase Failed',
        description: error instanceof Error ? error.message : 'Failed to purchase snack',
        variant: 'destructive'
      });
    } finally {
      setPurchasing(null);
    }
  };
  
  return (
    <div className="win95-window w-full h-full">
      <div className="win95-title-bar mb-4">
        <span>NFT Snack Shop</span>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <p className="text-sm mb-2">
            Purchase snack NFTs to boost your gameplay! Each snack provides temporary enhancements to help you achieve higher scores.
          </p>
          
          <div className="win95-panel">
            <p className="text-xs font-bold mb-1">Your Balance:</p>
            <p className="win95-inset p-1 text-sm">{parseFloat(balance).toFixed(4)} S</p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="win95-window p-0 flex w-full mb-4">
            <TabsTrigger 
              value="speed" 
              className="flex-1 bg-[#c0c0c0] data-[state=active]:bg-[#FF69B4] data-[state=active]:text-black"
            >
              Speed Boosts
            </TabsTrigger>
            <TabsTrigger 
              value="jump" 
              className="flex-1 bg-[#c0c0c0] data-[state=active]:bg-[#FF69B4] data-[state=active]:text-black"
            >
              Jump Boosts
            </TabsTrigger>
            <TabsTrigger 
              value="health" 
              className="flex-1 bg-[#c0c0c0] data-[state=active]:bg-[#FF69B4] data-[state=active]:text-black"
            >
              Health Items
            </TabsTrigger>
            <TabsTrigger 
              value="growing" 
              className="flex-1 bg-[#c0c0c0] data-[state=active]:bg-[#FF69B4] data-[state=active]:text-black"
            >
              Growing Items
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="speed" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AVAILABLE_SNACKS.speed.map((snack) => (
                <NFTCard
                  key={snack.id}
                  id={snack.id}
                  name={snack.name}
                  image={snack.image}
                  boost={snack.boost}
                  price={snack.price}
                  onPurchase={() => handlePurchase(snack.id)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="jump" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AVAILABLE_SNACKS.jump.map((snack) => (
                <NFTCard
                  key={snack.id}
                  id={snack.id}
                  name={snack.name}
                  image={snack.image}
                  boost={snack.boost}
                  price={snack.price}
                  onPurchase={() => handlePurchase(snack.id)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="health" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AVAILABLE_SNACKS.health.map((snack) => (
                <NFTCard
                  key={snack.id}
                  id={snack.id}
                  name={snack.name}
                  image={snack.image}
                  boost={snack.boost}
                  price={snack.price}
                  onPurchase={() => handlePurchase(snack.id)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="growing" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AVAILABLE_SNACKS.growing.map((snack) => (
                <NFTCard
                  key={snack.id}
                  id={snack.id}
                  name={snack.name}
                  image={snack.image}
                  boost={snack.boost}
                  price={snack.price}
                  onPurchase={() => handlePurchase(snack.id)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NFTShop;
