
import { toast } from '@/hooks/use-toast';

// Handle upgrading grow room capacity
export const handleUpgradeCapacity = async (
  plantCapacity: number,
  thcAmount: number,
  handleTransaction: (amount: number, actionType: string) => Promise<boolean>,
  setThcAmount: React.Dispatch<React.SetStateAction<number>>,
  setPlantCapacity: React.Dispatch<React.SetStateAction<number>>,
  toast: any
) => {
  // Calculate upgrade cost based on current capacity - must match what's shown in the UI
  const upgradeCost = plantCapacity * 15;
  
  // Check if player has enough THC
  if (thcAmount < upgradeCost) {
    toast({
      title: "Not Enough THC",
      description: `You need ${upgradeCost} THC to upgrade your grow room capacity.`,
      variant: "destructive"
    });
    return;
  }
  
  // Process transaction
  const success = await handleTransaction(upgradeCost, "Upgrading Capacity");
  
  if (success) {
    // Update state
    setPlantCapacity(prevCapacity => prevCapacity + 1);
    setThcAmount(prevAmount => prevAmount - upgradeCost);
    
    toast({
      title: "Capacity Upgraded",
      description: `Your grow room capacity has been increased to ${plantCapacity + 1}!`,
    });
  }
};
