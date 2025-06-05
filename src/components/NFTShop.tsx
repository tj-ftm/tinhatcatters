
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import NFTCard from './NFTCard';
import { purchaseSnack } from '@/lib/web3';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WalletSelectDialog from './WalletSelectDialog';
import { usePoints } from '@/hooks/use-points';
import WalletConnector from './WalletConnector';
import { useIsMobile } from '@/hooks/use-mobile';

// Import the ReptilianAttackEngine to access game upgrade info
import ReptilianAttackEngine from '@/game/ReptilianAttackEngine';

// Configurable icon URLs for each snack item
const SNACK_ICON_IMAGES = {
  // Speed Items
  donut: "/assets/Icons/illuminati.webp",
  cookie: "/assets/Icons/illuminati.webp",
  soda: "/assets/Icons/illuminati.webp",
  shake: "/assets/Icons/illuminati.webp",
  energybar: "/assets/Icons/illuminati.webp",
  speedpotion: "/assets/Icons/illuminati.webp",
  
  // Game Upgrades
  speedUpgrade: "/assets/Icons/illuminati.webp",
  fireRateUpgrade: "/assets/Icons/illuminati.webp",
  healthUpgrade: "/assets/Icons/illuminati.webp",
  
  // THC Items
  thcfert: "/assets/Icons/illuminati.webp",
  thcseed: "/assets/Icons/illuminati.webp",
  hydrokit: "/assets/Icons/illuminati.webp",
  ledlight: "/assets/Icons/illuminati.webp",
  autofeeder: "/assets/Icons/illuminati.webp",
  climatectrl: "/assets/Icons/illuminati.webp"
};

// Tab icon images that can be individually customized
const TAB_ICON_IMAGES = {
  gameUpgrades: "/assets/Icons/illuminati.webp",
  thc: "/assets/Icons/weed.png"
};

const NFTShop: React.FC = () => {
  const { address, thcBalance, refreshNFTs, connect } = useWeb3();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('gameUpgrades');
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [pendingSnackId, setPendingSnackId] = useState<string | null>(null);
  const { addPoints } = usePoints();
  const isMobile = useIsMobile();
  
  // State for available upgrades
  const [gameUpgrades, setGameUpgrades] = useState<any>({
    reptilianAttack: [],
    growRoom: []
  });
  
  // Initialize the game engine to get upgrade prices
  useEffect(() => {
    // Create a temporary canvas for getting upgrade prices
    const tempCanvas = document.createElement('canvas');
    const reptilianEngine = new ReptilianAttackEngine(tempCanvas);
    const upgradePrices = reptilianEngine.getUpgradePrices();
    
    // Fetch available upgrades from both games
    setGameUpgrades({
      reptilianAttack: [
        {
          id: 'speedUpgrade',
          name: upgradePrices.speed.name,
          description: upgradePrices.speed.description,
          image: SNACK_ICON_IMAGES.speedUpgrade,
          price: upgradePrices.speed.price,
          type: 'reptilianAttack'
        },
        {
          id: 'fireRateUpgrade',
          name: upgradePrices.fireRate.name,
          description: upgradePrices.fireRate.description,
          image: SNACK_ICON_IMAGES.fireRateUpgrade,
          price: upgradePrices.fireRate.price,
          type: 'reptilianAttack'
        },
        {
          id: 'healthUpgrade',
          name: upgradePrices.health.name,
          description: upgradePrices.health.description,
          image: SNACK_ICON_IMAGES.healthUpgrade,
          price: upgradePrices.health.price,
          type: 'reptilianAttack'
        }
      ],
      growRoom: [
        {
          id: 'thcfert',
          name: 'Premium THC Fertilizer',
          image: SNACK_ICON_IMAGES.thcfert,
          price: 20,
          type: 'growRoom'
        },
        {
          id: 'ledlight',
          name: 'LED Grow Light',
          image: SNACK_ICON_IMAGES.ledlight,
          price: 40,
          type: 'growRoom'
        }
      ]
    });
  }, []);
  
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
    
    // Find the selected upgrade
    let selectedUpgrade = null;
    
    // Check in reptilianAttack upgrades
    gameUpgrades.reptilianAttack.forEach((upgrade: any) => {
      if (upgrade.id === snackId) selectedUpgrade = upgrade;
    });
    
    // Check in growRoom upgrades
    if (!selectedUpgrade) {
      gameUpgrades.growRoom.forEach((upgrade: any) => {
        if (upgrade.id === snackId) selectedUpgrade = upgrade;
      });
    }
    
    if (!selectedUpgrade) {
      toast({
        title: 'Item Not Found',
        description: 'The selected item could not be found.',
        variant: 'destructive'
      });
      return;
    }
    
    if (parseFloat(thcBalance || '0') < selectedUpgrade.price) {
      toast({
        title: 'Insufficient Balance',
        description: `You need at least ${selectedUpgrade.price} $THC to purchase this item.`,
        variant: 'destructive'
      });
      return;
    }
    
    setPurchasing(snackId);
    
    try {
      const success = await purchaseSnack(Number(snackId));
      
      if (success) {
        addPoints(address, selectedUpgrade.price * 10);
        
        toast({
          title: 'Purchase Successful',
          description: `You have purchased ${selectedUpgrade.name}! Earned ${selectedUpgrade.price * 10} points.`
        });
        refreshNFTs();
      }
    } catch (error) {
      toast({
        title: 'Purchase Failed',
        description: error instanceof Error ? error.message : 'Failed to purchase item',
        variant: 'destructive'
      });
    } finally {
      setPurchasing(null);
    }
  };
  
  return (
    <div className="win95-window w-full h-full">
      <div className="win95-title-bar mb-4">
        <span>NFT Upgrades Shop</span>
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
              value="gameUpgrades" 
              className={`flex-1 bg-[#c0c0c0] data-[state=active]:bg-[#FF69B4] data-[state=active]:text-black ${isMobile ? 'text-[10px] py-1' : ''}`}
            >
              <div className="flex items-center gap-1">
                <img 
                  src={TAB_ICON_IMAGES.gameUpgrades} 
                  alt="Game Upgrades" 
                  className="h-4 w-4 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                {isMobile ? 'Games' : 'Game Upgrades'}
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
          
          <TabsContent value="gameUpgrades" className="m-0">
            <div className="win95-window p-2 mb-4">
              <h3 className="text-sm font-bold mb-2">Reptilian Attack Upgrades</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {gameUpgrades.reptilianAttack.map((upgrade: any) => (
                  <NFTCard
                    key={upgrade.id}
                    id={upgrade.id}
                    name={upgrade.name}
                    image={upgrade.image}
                    description={upgrade.description}
                    price={upgrade.price}
                    onPurchase={() => handlePurchaseClick(upgrade.id)}
                    className="w-full"
                    disabled={!address}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="thc" className="m-0">
            <div className="win95-window p-2 mb-4">
              <h3 className="text-sm font-bold mb-2">THC Grow Room Items</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {gameUpgrades.growRoom.map((upgrade: any) => (
                  <NFTCard
                    key={upgrade.id}
                    id={upgrade.id}
                    name={upgrade.name}
                    image={upgrade.image}
                    price={upgrade.price}
                    onPurchase={() => handlePurchaseClick(upgrade.id)}
                    className="w-full"
                    disabled={!address}
                  />
                ))}
              </div>
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
