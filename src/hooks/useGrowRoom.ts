
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/contexts/Web3Context';
import { sendTransaction } from '@/lib/web3';
import { 
  GrowthStage, 
  Plant, 
  Equipment, 
  EquipmentType,
  GameState
} from '@/types/growRoom';
import { initialEquipment } from '@/data/initialEquipment';

// Wallet address to send THC to
const RECIPIENT_ADDRESS = '0x097766e8dE97A0A53B3A31AB4dB02d0004C8cc4F';

export const useGrowRoom = () => {
  const { thcBalance, address } = useWeb3();
  const [thcAmount, setThcAmount] = useState<number>(50); // Starting with 50 $THC
  const [plants, setPlants] = useState<Plant[]>([]);
  const [equipment, setEquipment] = useState<Record<EquipmentType, Equipment>>(initialEquipment);
  const [plantCapacity, setPlantCapacity] = useState<number>(1);
  const [showUpgradeModal, setShowUpgradeModal] = useState<EquipmentType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Load game state from localStorage on component mount
  useEffect(() => {
    const loadGameState = () => {
      if (!address) return;
      
      const savedState = localStorage.getItem(`growroom-${address}`);
      if (!savedState) return;
      
      try {
        const parsedState: GameState = JSON.parse(savedState);
        
        // Update plants with correct progress based on time passed
        const updatedPlants = parsedState.plants.map(plant => {
          if (!plant.isGrowing || plant.stage === GrowthStage.Harvest) return plant;
          
          // Calculate progress based on time passed since last save
          const { speedMultiplier } = calculateMultipliers(parsedState.equipment);
          const now = Date.now();
          const timePassed = now - (plant.lastUpdateTime || parsedState.lastSaved);
          const progressIncrement = (timePassed / 1000) * speedMultiplier;
          
          let newProgress = plant.progress + progressIncrement;
          let newStage = plant.stage;
          
          // Check if plant moved to next stage
          if (newProgress >= 100) {
            newProgress = 0;
            
            switch (plant.stage) {
              case GrowthStage.Seed:
                newStage = GrowthStage.Sprout;
                break;
              case GrowthStage.Sprout:
                newStage = GrowthStage.Vegetative;
                break;
              case GrowthStage.Vegetative:
                newStage = GrowthStage.Flowering;
                break;
              case GrowthStage.Flowering:
                newStage = GrowthStage.Harvest;
                newProgress = 100;
                break;
            }
          }
          
          return {
            ...plant,
            progress: newProgress,
            stage: newStage,
            lastUpdateTime: now,
            isGrowing: newStage !== GrowthStage.Harvest,
          };
        });
        
        setPlants(updatedPlants);
        setEquipment(parsedState.equipment);
        setPlantCapacity(parsedState.plantCapacity);
        
        // Only update thcAmount from localStorage if wallet balance is not available
        if (!thcBalance) {
          setThcAmount(parsedState.thcAmount);
        }
        
        toast({
          title: "Game Loaded",
          description: "Your grow room progress has been loaded!",
        });
      } catch (error) {
        console.error('Error loading game state:', error);
        toast({
          title: "Load Error",
          description: "Failed to load your saved game. Starting fresh.",
          variant: "destructive",
        });
      }
    };
    
    loadGameState();
  }, [address, toast, thcBalance]);
  
  // Save game state to localStorage whenever important state changes
  useEffect(() => {
    if (!address) return;
    
    const saveGameState = () => {
      const updatedPlants = plants.map(plant => ({
        ...plant,
        lastUpdateTime: Date.now()
      }));
      
      const gameState: GameState = {
        thcAmount,
        plants: updatedPlants,
        equipment,
        plantCapacity,
        lastSaved: Date.now()
      };
      
      localStorage.setItem(`growroom-${address}`, JSON.stringify(gameState));
      console.log('Game state saved:', gameState);
    };
    
    saveGameState();
    
    // Set up auto-save interval
    const saveInterval = setInterval(saveGameState, 15000); // Save every 15 seconds
    
    return () => clearInterval(saveInterval);
  }, [thcAmount, plants, equipment, plantCapacity, address]);

  // Update local THC amount from wallet if available
  useEffect(() => {
    if (thcBalance) {
      const parsedBalance = parseFloat(thcBalance);
      if (!isNaN(parsedBalance)) {
        setThcAmount(parsedBalance);
      }
    }
  }, [thcBalance]);

  // Calculate total speed and quality multipliers from equipment
  const calculateMultipliers = (equipmentState = equipment) => {
    let speedMultiplier = 1;
    let qualityMultiplier = 1;

    Object.values(equipmentState).forEach(item => {
      speedMultiplier *= item.effect.speedBoost;
      qualityMultiplier *= item.effect.qualityBoost;
    });

    return { speedMultiplier, qualityMultiplier };
  };

  // Handle plant growing process
  useEffect(() => {
    const { speedMultiplier } = calculateMultipliers();
    const growthInterval = setInterval(() => {
      const now = Date.now();
      
      setPlants(prevPlants => 
        prevPlants.map(plant => {
          if (!plant.isGrowing) return plant;
          
          const newProgress = plant.progress + (1 * speedMultiplier);
          
          // Check if plant is ready for next stage
          if (newProgress >= 100) {
            // Move to next stage or harvest
            switch (plant.stage) {
              case GrowthStage.Seed:
                return {
                  ...plant,
                  stage: GrowthStage.Sprout,
                  progress: 0,
                  totalGrowthTime: 30000 / speedMultiplier, // 30 seconds for sprout stage
                  lastUpdateTime: now
                };
              case GrowthStage.Sprout:
                return {
                  ...plant,
                  stage: GrowthStage.Vegetative,
                  progress: 0,
                  totalGrowthTime: 45000 / speedMultiplier, // 45 seconds for vegetative stage
                  lastUpdateTime: now
                };
              case GrowthStage.Vegetative:
                return {
                  ...plant,
                  stage: GrowthStage.Flowering,
                  progress: 0,
                  totalGrowthTime: 60000 / speedMultiplier, // 60 seconds for flowering stage
                  lastUpdateTime: now
                };
              case GrowthStage.Flowering:
                return {
                  ...plant,
                  stage: GrowthStage.Harvest,
                  progress: 100,
                  isGrowing: false,
                  lastUpdateTime: now
                };
              default:
                return plant;
            }
          }
          
          return {
            ...plant,
            progress: newProgress,
            lastUpdateTime: now
          };
        })
      );
    }, 1000);

    return () => clearInterval(growthInterval);
  }, [equipment]);

  // Function to handle THC transaction
  const handleTransaction = async (amount: number, actionType: string): Promise<boolean> => {
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to perform this action.",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    setPendingAction(actionType);

    try {
      // Send THC to the recipient address
      const success = await sendTransaction(RECIPIENT_ADDRESS, amount.toString());
      
      if (success) {
        toast({
          title: "Transaction Successful",
          description: `Successfully sent ${amount} THC to the game.`,
        });
        return true;
      } else {
        toast({
          title: "Transaction Failed",
          description: "Failed to send THC. Please try again.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: "Transaction Error",
        description: error.message || "An error occurred during the transaction.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
      setPendingAction(null);
    }
  };

  // Plant a new seed
  const plantSeed = async () => {
    if (plants.length >= plantCapacity) {
      toast({
        title: "Maximum Capacity Reached",
        description: "Upgrade your grow room to plant more seeds!",
        variant: "destructive"
      });
      return;
    }

    const seedCost = 0.1; // Reduced from 10
    
    if (thcAmount < seedCost) {
      toast({
        title: "Not Enough $THC",
        description: `You need ${seedCost} $THC to plant a new seed.`,
        variant: "destructive"
      });
      return;
    }

    // Process transaction
    const transactionSuccess = await handleTransaction(seedCost, "Planting Seed");
    if (!transactionSuccess) return;

    const { speedMultiplier } = calculateMultipliers();
    const newPlant: Plant = {
      id: Date.now(),
      stage: GrowthStage.Seed,
      progress: 0,
      totalGrowthTime: 15000 / speedMultiplier, // 15 seconds for seed stage
      isGrowing: true,
      quality: 1,
      lastUpdateTime: Date.now()
    };

    setPlants([...plants, newPlant]);
    setThcAmount(prev => prev - seedCost); // Seeds cost seedCost $THC

    toast({
      title: "Seed Planted!",
      description: "Your seed has been planted and is now growing.",
    });
  };

  // Harvest a plant
  const harvestPlant = (plantId: number) => {
    const plantToHarvest = plants.find(p => p.id === plantId);
    if (!plantToHarvest || plantToHarvest.stage !== GrowthStage.Harvest) return;

    const { qualityMultiplier } = calculateMultipliers();
    const thcEarned = Math.floor(25 * qualityMultiplier * plantToHarvest.quality);
    
    setThcAmount(prev => prev + thcEarned);
    setPlants(plants.filter(p => p.id !== plantId));
    
    toast({
      title: "Plant Harvested!",
      description: `You earned ${thcEarned} $THC from your harvest!`
    });
  };

  // Upgrade equipment
  const upgradeEquipment = async (type: EquipmentType) => {
    const itemToUpgrade = equipment[type];
    if (!itemToUpgrade.nextLevel) return;

    if (thcAmount < itemToUpgrade.nextLevel.cost) {
      toast({
        title: "Not Enough $THC",
        description: `You need ${itemToUpgrade.nextLevel.cost} $THC for this upgrade.`,
        variant: "destructive"
      });
      return;
    }

    // Process transaction
    const transactionSuccess = await handleTransaction(
      itemToUpgrade.nextLevel.cost, 
      `Upgrading ${itemToUpgrade.name}`
    );
    if (!transactionSuccess) return;

    setThcAmount(prev => prev - itemToUpgrade.nextLevel!.cost);
    
    // Create the next level for the advanced equipment
    let newNextLevel = null;
    if (itemToUpgrade.level === 1) {
      // Set up the third tier with costs reduced by 100x
      switch (type) {
        case EquipmentType.Light:
          newNextLevel = {
            name: 'Full-Spectrum Quantum Board',
            effect: { speedBoost: 2, qualityBoost: 1.5 },
            cost: 3.5 // Reduced from 350
          };
          break;
        case EquipmentType.Pot:
          newNextLevel = {
            name: 'Hydroponic Tray',
            effect: { speedBoost: 1.5, qualityBoost: 2 },
            cost: 4 // Reduced from 400
          };
          break;
        case EquipmentType.Nutrients:
          newNextLevel = {
            name: 'Premium Boost',
            effect: { speedBoost: 1.3, qualityBoost: 2.5 },
            cost: 3 // Reduced from 300
          };
          break;
        case EquipmentType.Ventilation:
          newNextLevel = {
            name: 'Climate Control',
            effect: { speedBoost: 2.2, qualityBoost: 1.3 },
            cost: 4.5 // Reduced from 450
          };
          break;
        case EquipmentType.Automation:
          newNextLevel = {
            name: 'Smart Irrigation',
            effect: { speedBoost: 1.8, qualityBoost: 1.7 },
            cost: 4.2 // Reduced from 420
          };
          break;
      }
    }

    setEquipment({
      ...equipment,
      [type]: {
        ...itemToUpgrade,
        name: itemToUpgrade.nextLevel.name,
        level: itemToUpgrade.level + 1,
        effect: itemToUpgrade.nextLevel.effect,
        nextLevel: newNextLevel
      }
    });

    toast({
      title: "Equipment Upgraded!",
      description: `Your ${type} has been upgraded to ${itemToUpgrade.nextLevel.name}!`
    });

    setShowUpgradeModal(null);
  };

  // Upgrade grow room capacity
  const upgradeCapacity = async () => {
    const cost = plantCapacity * 2; // Reduced from 200
    
    if (thcAmount < cost) {
      toast({
        title: "Not Enough $THC",
        description: `You need ${cost} $THC to expand your grow room.`,
        variant: "destructive"
      });
      return;
    }
    
    // Process transaction
    const transactionSuccess = await handleTransaction(cost, "Expanding Grow Room");
    if (!transactionSuccess) return;
    
    setThcAmount(prev => prev - cost);
    setPlantCapacity(prev => prev + 1);
    
    toast({
      title: "Grow Room Expanded!",
      description: `Your grow room can now hold ${plantCapacity + 1} plants!`
    });
  };

  // Get color class based on growth stage
  const getGrowthColor = (stage: GrowthStage) => {
    switch (stage) {
      case GrowthStage.Seed: return 'bg-yellow-600';
      case GrowthStage.Sprout: return 'bg-green-300';
      case GrowthStage.Vegetative: return 'bg-green-500';
      case GrowthStage.Flowering: return 'bg-purple-500';
      case GrowthStage.Harvest: return 'bg-pink-600';
      default: return 'bg-gray-400';
    }
  };

  return {
    thcAmount,
    plants,
    equipment,
    plantCapacity,
    showUpgradeModal,
    setShowUpgradeModal,
    isLoading,
    pendingAction,
    calculateMultipliers,
    plantSeed,
    harvestPlant,
    upgradeEquipment,
    upgradeCapacity,
    getGrowthColor
  };
};
