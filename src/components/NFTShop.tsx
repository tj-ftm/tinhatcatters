
import React, { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import NFTCard from './NFTCard';
import { purchaseSnack } from '@/lib/web3';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WalletSelectDialog from './WalletSelectDialog';
import { usePoints } from '@/hooks/use-points';
import WalletConnector from './WalletConnector';
import { useIsMobile } from '@/hooks/use-mobile';

// Configurable icon URLs for each snack item
const SNACK_ICON_IMAGES = {
  // Speed Items
  donut: "/assets/Icons/illuminati.webp",
  cookie: "/assets/Icons/illuminati.webp",
  soda: "/assets/Icons/illuminati.webp",
  shake: "/assets/Icons/illuminati.webp",
  energybar: "/assets/Icons/illuminati.webp",
  speedpotion: "/assets/Icons/illuminati.webp",
  
  // Jump Items
  coffee: "/assets/Icons/illuminati.webp",
  springs: "/assets/Icons/illuminati.webp",
  jumpcandy: "/assets/Icons/illuminati.webp",
  jetpack: "/assets/Icons/illuminati.webp",
  jumpgum: "/assets/Icons/illuminati.webp",
  helium: "/assets/Icons/illuminati.webp",
  
  // Health Items
  firstaid: "/assets/Icons/illuminati.webp",
  shield: "/assets/Icons/illuminati.webp",
  potion: "/assets/Icons/illuminati.webp",
  medkit: "/assets/Icons/illuminati.webp",
  
  // Growing Items
  growfood: "/assets/Icons/illuminati.webp",
  supersoil: "/assets/Icons/illuminati.webp",
  seeds: "/assets/Icons/illuminati.webp",
  water: "/assets/Icons/illuminati.webp",
  
  // THC Items
  thcfert: "/assets/Icons/illuminati.webp",
  thcseed: "/assets/Icons/illuminati.webp",
  hydrokit: "/assets/Icons/illuminati.webp",
  ledlight: "/assets/Icons/illuminati.webp",
  autofeeder: "/assets/Icons/illuminati.webp",
  climatectrl: "/assets/Icons/illuminati.webp"
};

const AVAILABLE_SNACKS = {
  speed: [
    {
      id: 'donut',
      name: 'Energy Donut',
      image: SNACK_ICON_IMAGES.donut,
      price: 5,
      boost: { type: 'speed', value: 20, duration: 10 }
    },
    {
      id: 'cookie',
      name: 'Speed Cookie',
      image: SNACK_ICON_IMAGES.cookie,
      price: 8,
      boost: { type: 'speed', value: 30, duration: 5 }
    },
    {
      id: 'soda',
      name: 'Sonic Soda',
      image: SNACK_ICON_IMAGES.soda,
      price: 12,
      boost: { type: 'speed', value: 40, duration: 8 }
    },
    {
      id: 'shake',
      name: 'Power Shake',
      image: SNACK_ICON_IMAGES.shake,
      price: 15,
      boost: { type: 'speed', value: 50, duration: 7 }
    },
    {
      id: 'energybar',
      name: 'Energy Bar',
      image: SNACK_ICON_IMAGES.energybar,
      price: 10,
      boost: { type: 'speed', value: 25, duration: 15 }
    },
    {
      id: 'speedpotion',
      name: 'Speed Potion',
      image: SNACK_ICON_IMAGES.speedpotion,
      price: 20,
      boost: { type: 'speed', value: 60, duration: 6 }
    }
  ],
  jump: [
    {
      id: 'coffee',
      name: 'Jump Coffee',
      image: SNACK_ICON_IMAGES.coffee,
      price: 7,
      boost: { type: 'jump', value: 25, duration: 10 }
    },
    {
      id: 'springs',
      name: 'Spring Boots',
      image: SNACK_ICON_IMAGES.springs,
      price: 15,
      boost: { type: 'jump', value: 40, duration: 12 }
    },
    {
      id: 'jumpcandy',
      name: 'Bounce Candy',
      image: SNACK_ICON_IMAGES.jumpcandy,
      price: 9,
      boost: { type: 'jump', value: 30, duration: 8 }
    },
    {
      id: 'jetpack',
      name: 'Mini Jetpack',
      image: SNACK_ICON_IMAGES.jetpack,
      price: 25,
      boost: { type: 'jump', value: 50, duration: 6 }
    },
    {
      id: 'jumpgum',
      name: 'Bounce Gum',
      image: SNACK_ICON_IMAGES.jumpgum,
      price: 12,
      boost: { type: 'jump', value: 35, duration: 14 }
    },
    {
      id: 'helium',
      name: 'Helium Balloon',
      image: SNACK_ICON_IMAGES.helium,
      price: 18,
      boost: { type: 'jump', value: 45, duration: 9 }
    }
  ],
  health: [
    {
      id: 'firstaid',
      name: 'First Aid Kit',
      image: SNACK_ICON_IMAGES.firstaid,
      price: 20,
      boost: { type: 'health', value: 50, duration: 0 }
    },
    {
      id: 'shield',
      name: 'Force Shield',
      image: SNACK_ICON_IMAGES.shield,
      price: 30,
      boost: { type: 'invincibility', value: 100, duration: 10 }
    },
    {
      id: 'potion',
      name: 'Health Potion',
      image: SNACK_ICON_IMAGES.potion,
      price: 15,
      boost: { type: 'health', value: 30, duration: 0 }
    },
    {
      id: 'medkit',
      name: 'Mega Medkit',
      image: SNACK_ICON_IMAGES.medkit,
      price: 40,
      boost: { type: 'health', value: 100, duration: 0 }
    }
  ],
  growing: [
    {
      id: 'growfood',
      name: 'Growth Nutrient',
      image: SNACK_ICON_IMAGES.growfood,
      price: 25,
      boost: { type: 'size', value: 50, duration: 15 }
    },
    {
      id: 'supersoil',
      name: 'Super Soil',
      image: SNACK_ICON_IMAGES.supersoil,
      price: 35,
      boost: { type: 'growth', value: 100, duration: 0 }
    },
    {
      id: 'seeds',
      name: 'Sonic Seeds',
      image: SNACK_ICON_IMAGES.seeds,
      price: 15,
      boost: { type: 'planting', value: 1, duration: 0 }
    },
    {
      id: 'water',
      name: 'Special Water',
      image: SNACK_ICON_IMAGES.water,
      price: 10,
      boost: { type: 'hydration', value: 75, duration: 0 }
    }
  ],
  thc: [
    {
      id: 'thcfert',
      name: 'Premium THC Fertilizer',
      image: SNACK_ICON_IMAGES.thcfert,
      price: 20,
      boost: { type: 'growth', value: 50, duration: 0 }
    },
    {
      id: 'thcseed',
      name: 'THC Premium Seeds',
      image: SNACK_ICON_IMAGES.thcseed,
      price: 30,
      boost: { type: 'planting', value: 3, duration: 0 }
    },
    {
      id: 'hydrokit',
      name: 'Hydroponic System',
      image: SNACK_ICON_IMAGES.hydrokit,
      price: 50,
      boost: { type: 'hydration', value: 100, duration: 0 }
    },
    {
      id: 'ledlight',
      name: 'LED Grow Light',
      image: SNACK_ICON_IMAGES.ledlight,
      price: 40,
      boost: { type: 'lighting', value: 75, duration: 0 }
    },
    {
      id: 'autofeeder',
      name: 'Auto Feeding System',
      image: SNACK_ICON_IMAGES.autofeeder,
      price: 35,
      boost: { type: 'feeding', value: 60, duration: 0 }
    },
    {
      id: 'climatectrl',
      name: 'Climate Control System',
      image: SNACK_ICON_IMAGES.climatectrl,
      price: 45,
      boost: { type: 'environment', value: 80, duration: 0 }
    }
  ]
};

// Tab icon images that can be individually customized
const TAB_ICON_IMAGES = {
  speed: "/assets/Icons/illuminati.webp",
  jump: "/assets/Icons/illuminati.webp",
  health: "/assets/Icons/illuminati.webp",
  growing: "/assets/Icons/illuminati.webp",
  thc: "/assets/Icons/illuminati.webp"
};

const NFTShop: React.FC = () => {
  const { address, thcBalance, refreshNFTs, connect } = useWeb3();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('speed');
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [pendingSnackId, setPendingSnackId] = useState<string | null>(null);
  const { addPoints } = usePoints();
  const isMobile = useIsMobile();
  
  const handleSelectWallet = async (walletId: string) => {
    try {
      await connect(walletId);
      if (pendingSnackId) {
        handlePurchase(pendingSnackId);
        setPendingSnackId(null);
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive"
      });
      console.error("Wallet connection error:", error);
    }
  };
  
  const handlePurchaseClick = (snackId: string) => {
    if (!address) {
      setPendingSnackId(snackId);
      setShowWalletDialog(true);
      return;
    }
    
    handlePurchase(snackId);
  };
  
  const handlePurchase = async (snackId: string) => {
    if (!address) {
      return;
    }
    
    let snack = null;
    Object.values(AVAILABLE_SNACKS).forEach(category => {
      const found = category.find(s => s.id === snackId);
      if (found) snack = found;
    });
    
    if (!snack) return;
    
    if (parseFloat(thcBalance || '0') < snack.price) {
      toast({
        title: 'Insufficient Balance',
        description: `You need at least ${snack.price} $THC to purchase this item.`,
        variant: 'destructive'
      });
      return;
    }
    
    setPurchasing(snackId);
    
    try {
      const success = await purchaseSnack(Number(snackId));
      
      if (success) {
        addPoints(address, snack.price * 10);
        
        toast({
          title: 'Purchase Successful',
          description: `You have purchased ${snack.name}! Earned ${snack.price * 10} points.`
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
      
      <div className="p-2 md:p-4">
        {address && (
          <div className="grid grid-cols-2 gap-2 md:gap-4 mb-2 md:mb-4">
            <div className="win95-panel">
              <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-bold mb-1`}>Your $THC Balance:</p>
              <p className="win95-inset p-1 text-xs md:text-sm">{parseFloat(thcBalance || '0').toFixed(4)} $THC</p>
            </div>
            
            <div className="win95-panel">
              <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-bold mb-1`}>Your Points:</p>
              <p className="win95-inset p-1 text-xs md:text-sm">
                {address ? usePoints().getPoints(address) : 0} points
              </p>
            </div>
          </div>
        )}
        
        {!address && (
          <div className="win95-panel p-2 md:p-3 mb-2 md:mb-4 flex items-center justify-between">
            <p className={`${isMobile ? 'text-xs' : ''}`}>Connect wallet to unlock purchases</p>
            <WalletConnector />
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-2 md:mb-4">
          <TabsList className="win95-window p-0 flex w-full mb-2 md:mb-4 overflow-x-auto">
            <TabsTrigger 
              value="speed" 
              className={`flex-1 bg-[#c0c0c0] data-[state=active]:bg-[#FF69B4] data-[state=active]:text-black ${isMobile ? 'text-[10px] py-1' : ''}`}
            >
              <div className="flex items-center gap-1">
                <img 
                  src={TAB_ICON_IMAGES.speed} 
                  alt="Speed" 
                  className="h-4 w-4 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                {isMobile ? 'Speed' : 'Speed Boosts'}
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="jump" 
              className={`flex-1 bg-[#c0c0c0] data-[state=active]:bg-[#FF69B4] data-[state=active]:text-black ${isMobile ? 'text-[10px] py-1' : ''}`}
            >
              <div className="flex items-center gap-1">
                <img 
                  src={TAB_ICON_IMAGES.jump} 
                  alt="Jump" 
                  className="h-4 w-4 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                {isMobile ? 'Jump' : 'Jump Boosts'}
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="health" 
              className={`flex-1 bg-[#c0c0c0] data-[state=active]:bg-[#FF69B4] data-[state=active]:text-black ${isMobile ? 'text-[10px] py-1' : ''}`}
            >
              <div className="flex items-center gap-1">
                <img 
                  src={TAB_ICON_IMAGES.health} 
                  alt="Health" 
                  className="h-4 w-4 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                {isMobile ? 'Health' : 'Health Items'}
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="thc" 
              className={`flex-1 bg-[#c0c0c0] data-[state=active]:bg-[#FF69B4] data-[state=active]:text-black ${isMobile ? 'text-[10px] py-1' : ''}`}
            >
              <div className="flex items-center gap-1">
                <img 
                  src={TAB_ICON_IMAGES.thc} 
                  alt="THC" 
                  className="h-4 w-4 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                {isMobile ? 'THC' : 'THC Grow Items'}
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="speed" className="m-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_SNACKS.speed.map((snack) => (
                <NFTCard
                  key={snack.id}
                  id={snack.id}
                  name={snack.name}
                  image={snack.image}
                  boost={snack.boost}
                  price={snack.price}
                  onPurchase={() => handlePurchaseClick(snack.id)}
                  className="w-full"
                  disabled={!address}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="jump" className="m-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_SNACKS.jump.map((snack) => (
                <NFTCard
                  key={snack.id}
                  id={snack.id}
                  name={snack.name}
                  image={snack.image}
                  boost={snack.boost}
                  price={snack.price}
                  onPurchase={() => handlePurchaseClick(snack.id)}
                  className="w-full"
                  disabled={!address}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="health" className="m-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_SNACKS.health.map((snack) => (
                <NFTCard
                  key={snack.id}
                  id={snack.id}
                  name={snack.name}
                  image={snack.image}
                  boost={snack.boost}
                  price={snack.price}
                  onPurchase={() => handlePurchaseClick(snack.id)}
                  className="w-full"
                  disabled={!address}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="thc" className="m-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_SNACKS.thc.map((snack) => (
                <NFTCard
                  key={snack.id}
                  id={snack.id}
                  name={snack.name}
                  image={snack.image}
                  boost={snack.boost}
                  price={snack.price}
                  onPurchase={() => handlePurchaseClick(snack.id)}
                  className="w-full"
                  disabled={!address}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <WalletSelectDialog 
        open={showWalletDialog}
        onOpenChange={setShowWalletDialog}
        onSelectWallet={handleSelectWallet}
      />
    </div>
  );
};

export default NFTShop;
