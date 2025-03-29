
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/contexts/Web3Context';
import { 
  Leaf, 
  Droplets, 
  Sun, 
  Fan, 
  Sprout, 
  CircleDollarSign, 
  Plus
} from 'lucide-react';

// Plant growth stages
enum GrowthStage {
  Seed = 'seed',
  Sprout = 'sprout',
  Vegetative = 'vegetative',
  Flowering = 'flowering',
  Harvest = 'harvest'
}

// Equipment types
enum EquipmentType {
  Light = 'light',
  Pot = 'pot',
  Nutrients = 'nutrients',
  Ventilation = 'ventilation',
  Automation = 'automation'
}

// Plant interface
interface Plant {
  id: number;
  stage: GrowthStage;
  progress: number;
  totalGrowthTime: number;
  isGrowing: boolean;
  quality: number;
}

// Equipment interface
interface Equipment {
  type: EquipmentType;
  level: number;
  name: string;
  effect: {
    speedBoost: number;
    qualityBoost: number;
  };
  cost: number;
  nextLevel?: {
    name: string;
    effect: {
      speedBoost: number;
      qualityBoost: number;
    };
    cost: number;
  };
}

// Initial equipment setup
const initialEquipment: Record<EquipmentType, Equipment> = {
  [EquipmentType.Light]: {
    type: EquipmentType.Light,
    level: 1,
    name: 'Basic Lamp',
    effect: { speedBoost: 1, qualityBoost: 1 },
    cost: 0,
    nextLevel: {
      name: 'LED Grow Light',
      effect: { speedBoost: 1.5, qualityBoost: 1.2 },
      cost: 100
    }
  },
  [EquipmentType.Pot]: {
    type: EquipmentType.Pot,
    level: 1,
    name: 'Clay Pot',
    effect: { speedBoost: 1, qualityBoost: 1 },
    cost: 0,
    nextLevel: {
      name: 'Smart Pot',
      effect: { speedBoost: 1.2, qualityBoost: 1.5 },
      cost: 150
    }
  },
  [EquipmentType.Nutrients]: {
    type: EquipmentType.Nutrients,
    level: 1,
    name: 'Basic Fertilizer',
    effect: { speedBoost: 1, qualityBoost: 1 },
    cost: 0,
    nextLevel: {
      name: 'Organic Mix',
      effect: { speedBoost: 1.1, qualityBoost: 1.8 },
      cost: 120
    }
  },
  [EquipmentType.Ventilation]: {
    type: EquipmentType.Ventilation,
    level: 1,
    name: 'Small Fan',
    effect: { speedBoost: 1, qualityBoost: 1 },
    cost: 0,
    nextLevel: {
      name: 'Exhaust System',
      effect: { speedBoost: 1.6, qualityBoost: 1.1 },
      cost: 200
    }
  },
  [EquipmentType.Automation]: {
    type: EquipmentType.Automation,
    level: 1,
    name: 'Manual Watering',
    effect: { speedBoost: 1, qualityBoost: 1 },
    cost: 0,
    nextLevel: {
      name: 'Auto-Waterer',
      effect: { speedBoost: 1.3, qualityBoost: 1.3 },
      cost: 180
    }
  }
};

const GrowRoom: React.FC = () => {
  const { thcBalance, address } = useWeb3();
  const [thcAmount, setThcAmount] = useState<number>(50); // Starting with 50 $THC
  const [plants, setPlants] = useState<Plant[]>([]);
  const [equipment, setEquipment] = useState<Record<EquipmentType, Equipment>>(initialEquipment);
  const [plantCapacity, setPlantCapacity] = useState<number>(1);
  const [showUpgradeModal, setShowUpgradeModal] = useState<EquipmentType | null>(null);
  const { toast } = useToast();
  
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
  const calculateMultipliers = () => {
    let speedMultiplier = 1;
    let qualityMultiplier = 1;

    Object.values(equipment).forEach(item => {
      speedMultiplier *= item.effect.speedBoost;
      qualityMultiplier *= item.effect.qualityBoost;
    });

    return { speedMultiplier, qualityMultiplier };
  };

  // Handle plant growing process
  useEffect(() => {
    const { speedMultiplier } = calculateMultipliers();
    const growthInterval = setInterval(() => {
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
                  totalGrowthTime: 30000 / speedMultiplier // 30 seconds for sprout stage
                };
              case GrowthStage.Sprout:
                return {
                  ...plant,
                  stage: GrowthStage.Vegetative,
                  progress: 0,
                  totalGrowthTime: 45000 / speedMultiplier // 45 seconds for vegetative stage
                };
              case GrowthStage.Vegetative:
                return {
                  ...plant,
                  stage: GrowthStage.Flowering,
                  progress: 0,
                  totalGrowthTime: 60000 / speedMultiplier // 60 seconds for flowering stage
                };
              case GrowthStage.Flowering:
                return {
                  ...plant,
                  stage: GrowthStage.Harvest,
                  progress: 100,
                  isGrowing: false
                };
              default:
                return plant;
            }
          }
          
          return {
            ...plant,
            progress: newProgress
          };
        })
      );
    }, 1000);

    return () => clearInterval(growthInterval);
  }, [equipment]);

  // Plant a new seed
  const plantSeed = () => {
    if (plants.length >= plantCapacity) {
      toast({
        title: "Maximum Capacity Reached",
        description: "Upgrade your grow room to plant more seeds!",
        variant: "destructive"
      });
      return;
    }

    if (thcAmount < 10) {
      toast({
        title: "Not Enough $THC",
        description: "You need 10 $THC to plant a new seed.",
        variant: "destructive"
      });
      return;
    }

    const { speedMultiplier } = calculateMultipliers();
    const newPlant: Plant = {
      id: Date.now(),
      stage: GrowthStage.Seed,
      progress: 0,
      totalGrowthTime: 15000 / speedMultiplier, // 15 seconds for seed stage
      isGrowing: true,
      quality: 1
    };

    setPlants([...plants, newPlant]);
    setThcAmount(prev => prev - 10); // Seeds cost 10 $THC

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
  const upgradeEquipment = (type: EquipmentType) => {
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

    setThcAmount(prev => prev - itemToUpgrade.nextLevel!.cost);
    
    // Create the next level for the advanced equipment
    let newNextLevel = null;
    if (itemToUpgrade.level === 1) {
      // Set up the third tier
      switch (type) {
        case EquipmentType.Light:
          newNextLevel = {
            name: 'Full-Spectrum Quantum Board',
            effect: { speedBoost: 2, qualityBoost: 1.5 },
            cost: 350
          };
          break;
        case EquipmentType.Pot:
          newNextLevel = {
            name: 'Hydroponic Tray',
            effect: { speedBoost: 1.5, qualityBoost: 2 },
            cost: 400
          };
          break;
        case EquipmentType.Nutrients:
          newNextLevel = {
            name: 'Premium Boost',
            effect: { speedBoost: 1.3, qualityBoost: 2.5 },
            cost: 300
          };
          break;
        case EquipmentType.Ventilation:
          newNextLevel = {
            name: 'Climate Control',
            effect: { speedBoost: 2.2, qualityBoost: 1.3 },
            cost: 450
          };
          break;
        case EquipmentType.Automation:
          newNextLevel = {
            name: 'Smart Irrigation',
            effect: { speedBoost: 1.8, qualityBoost: 1.7 },
            cost: 420
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
  const upgradeCapacity = () => {
    const cost = plantCapacity * 200;
    
    if (thcAmount < cost) {
      toast({
        title: "Not Enough $THC",
        description: `You need ${cost} $THC to expand your grow room.`,
        variant: "destructive"
      });
      return;
    }
    
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

  // Get plant icon based on stage
  const getPlantIcon = (stage: GrowthStage) => {
    switch (stage) {
      case GrowthStage.Seed:
        return <div className="w-10 h-10 bg-brown-600 rounded-full flex items-center justify-center">🌱</div>;
      case GrowthStage.Sprout:
        return <Sprout className="w-10 h-10 text-green-400" />;
      case GrowthStage.Vegetative:
        return <Leaf className="w-10 h-10 text-green-600" />;
      case GrowthStage.Flowering:
        return <div className="w-10 h-10 text-purple-500 flex items-center justify-center">🌿</div>;
      case GrowthStage.Harvest:
        return <div className="w-10 h-10 text-pink-600 flex items-center justify-center">☘️</div>;
      default:
        return <Sprout className="w-10 h-10" />;
    }
  };

  // Equipment upgrade modal
  const renderUpgradeModal = () => {
    if (!showUpgradeModal) return null;
    
    const item = equipment[showUpgradeModal];
    if (!item.nextLevel) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="win95-window p-4 max-w-md w-full">
          <div className="win95-title-bar mb-2 flex justify-between">
            <span>Upgrade {item.name}</span>
            <button onClick={() => setShowUpgradeModal(null)} className="px-2">✖</button>
          </div>
          
          <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Upgrade to {item.nextLevel.name}</h3>
            
            <div className="mb-4">
              <p className="mb-2">Current Effects:</p>
              <ul className="list-disc pl-5 mb-2">
                <li>Growth Speed: +{Math.round((item.effect.speedBoost - 1) * 100)}%</li>
                <li>Quality Boost: +{Math.round((item.effect.qualityBoost - 1) * 100)}%</li>
              </ul>
              
              <p className="mb-2">New Effects:</p>
              <ul className="list-disc pl-5">
                <li>Growth Speed: +{Math.round((item.nextLevel.effect.speedBoost - 1) * 100)}%</li>
                <li>Quality Boost: +{Math.round((item.nextLevel.effect.qualityBoost - 1) * 100)}%</li>
              </ul>
            </div>
            
            <div className="flex justify-between">
              <span className="win95-button cursor-pointer" onClick={() => setShowUpgradeModal(null)}>Cancel</span>
              <Button 
                className="win95-button flex items-center"
                onClick={() => upgradeEquipment(showUpgradeModal)}
                disabled={thcAmount < item.nextLevel.cost}
              >
                <CircleDollarSign className="w-4 h-4 mr-1" />
                Upgrade ({item.nextLevel.cost} $THC)
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar with Stats */}
      <div className="win95-window p-2 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <CircleDollarSign className="w-5 h-5 mr-1 text-green-600" />
            <span className="font-bold">{thcAmount} $THC</span>
          </div>
          <div className="flex items-center">
            <Leaf className="w-5 h-5 mr-1 text-green-600" />
            <span className="font-bold">{plants.length}/{plantCapacity} Plants</span>
          </div>
          <Button 
            className="win95-button flex items-center px-2 py-1"
            onClick={plantSeed}
            disabled={plants.length >= plantCapacity || thcAmount < 10}
          >
            <Sprout className="w-4 h-4 mr-1" />
            <span>Plant Seed (10 $THC)</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4">
        {/* Growing Area */}
        <div className="win95-window p-2 flex-1">
          <div className="win95-title-bar mb-2">
            <span>Grow Room ({plants.length}/{plantCapacity})</span>
          </div>
          
          <div className="p-2 win95-inset h-[calc(100%-40px)] overflow-auto">
            {plants.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Sprout className="w-12 h-12 mb-2 text-green-600" />
                <p className="mb-4">Your grow room is empty!</p>
                <Button 
                  className="win95-button flex items-center"
                  onClick={plantSeed}
                  disabled={thcAmount < 10}
                >
                  <Sprout className="w-4 h-4 mr-1" />
                  Plant Seed (10 $THC)
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plants.map(plant => (
                  <div key={plant.id} className="win95-window p-2">
                    <div className="flex flex-col items-center">
                      <div className="mb-2">
                        {getPlantIcon(plant.stage)}
                      </div>
                      <div className="font-bold mb-1">
                        {plant.stage.charAt(0).toUpperCase() + plant.stage.slice(1)}
                      </div>
                      
                      {plant.stage !== GrowthStage.Harvest ? (
                        <>
                          <Progress 
                            value={plant.progress} 
                            className={`h-2 mb-2 ${getGrowthColor(plant.stage)}`} 
                          />
                          <div className="text-xs mb-2">
                            {Math.round(plant.progress)}% Complete
                          </div>
                        </>
                      ) : (
                        <Button
                          className="win95-button flex items-center mt-2"
                          onClick={() => harvestPlant(plant.id)}
                        >
                          <CircleDollarSign className="w-4 h-4 mr-1" />
                          Harvest Plant
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Equipment Area */}
        <div className="win95-window p-2 w-full md:w-1/3">
          <div className="win95-title-bar mb-2">
            <span>Equipment</span>
          </div>
          
          <div className="p-2 space-y-4">
            {/* Light */}
            <div className="win95-window p-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Sun className="w-5 h-5 mr-2 text-yellow-500" />
                  <div>
                    <div className="font-bold">{equipment[EquipmentType.Light].name}</div>
                    <div className="text-xs">
                      Speed: +{Math.round((equipment[EquipmentType.Light].effect.speedBoost - 1) * 100)}%
                    </div>
                  </div>
                </div>
                {equipment[EquipmentType.Light].nextLevel && (
                  <Button
                    className="win95-button px-2 py-1 text-xs"
                    onClick={() => setShowUpgradeModal(EquipmentType.Light)}
                  >
                    Upgrade
                  </Button>
                )}
              </div>
            </div>
            
            {/* Pot */}
            <div className="win95-window p-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-5 h-5 mr-2 flex items-center justify-center">🪴</div>
                  <div>
                    <div className="font-bold">{equipment[EquipmentType.Pot].name}</div>
                    <div className="text-xs">
                      Quality: +{Math.round((equipment[EquipmentType.Pot].effect.qualityBoost - 1) * 100)}%
                    </div>
                  </div>
                </div>
                {equipment[EquipmentType.Pot].nextLevel && (
                  <Button
                    className="win95-button px-2 py-1 text-xs"
                    onClick={() => setShowUpgradeModal(EquipmentType.Pot)}
                  >
                    Upgrade
                  </Button>
                )}
              </div>
            </div>
            
            {/* Nutrients */}
            <div className="win95-window p-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Droplets className="w-5 h-5 mr-2 text-blue-500" />
                  <div>
                    <div className="font-bold">{equipment[EquipmentType.Nutrients].name}</div>
                    <div className="text-xs">
                      Quality: +{Math.round((equipment[EquipmentType.Nutrients].effect.qualityBoost - 1) * 100)}%
                    </div>
                  </div>
                </div>
                {equipment[EquipmentType.Nutrients].nextLevel && (
                  <Button
                    className="win95-button px-2 py-1 text-xs"
                    onClick={() => setShowUpgradeModal(EquipmentType.Nutrients)}
                  >
                    Upgrade
                  </Button>
                )}
              </div>
            </div>
            
            {/* Ventilation */}
            <div className="win95-window p-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Fan className="w-5 h-5 mr-2 text-gray-500" />
                  <div>
                    <div className="font-bold">{equipment[EquipmentType.Ventilation].name}</div>
                    <div className="text-xs">
                      Speed: +{Math.round((equipment[EquipmentType.Ventilation].effect.speedBoost - 1) * 100)}%
                    </div>
                  </div>
                </div>
                {equipment[EquipmentType.Ventilation].nextLevel && (
                  <Button
                    className="win95-button px-2 py-1 text-xs"
                    onClick={() => setShowUpgradeModal(EquipmentType.Ventilation)}
                  >
                    Upgrade
                  </Button>
                )}
              </div>
            </div>
            
            {/* Automation */}
            <div className="win95-window p-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-5 h-5 mr-2 flex items-center justify-center">💧</div>
                  <div>
                    <div className="font-bold">{equipment[EquipmentType.Automation].name}</div>
                    <div className="text-xs">
                      Overall: +{Math.round((equipment[EquipmentType.Automation].effect.speedBoost - 1) * 100)}%
                    </div>
                  </div>
                </div>
                {equipment[EquipmentType.Automation].nextLevel && (
                  <Button
                    className="win95-button px-2 py-1 text-xs"
                    onClick={() => setShowUpgradeModal(EquipmentType.Automation)}
                  >
                    Upgrade
                  </Button>
                )}
              </div>
            </div>
            
            {/* Capacity Upgrade */}
            <div className="win95-window p-2 mt-4">
              <Button
                className="win95-button flex items-center justify-center w-full"
                onClick={upgradeCapacity}
              >
                <Plus className="w-4 h-4 mr-1" />
                Expand Room ({plantCapacity * 200} $THC)
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {renderUpgradeModal()}
    </div>
  );
};

export default GrowRoom;
