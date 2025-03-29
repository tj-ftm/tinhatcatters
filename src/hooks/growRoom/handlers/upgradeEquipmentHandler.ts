
import { toast } from '@/hooks/use-toast';
import { 
  Equipment, 
  EquipmentType 
} from '@/types/growRoom';

// Handle upgrading equipment
export const handleUpgradeEquipment = async (
  type: EquipmentType,
  equipment: Record<EquipmentType, Equipment>,
  thcAmount: number,
  handleTransaction: (amount: number, actionType: string) => Promise<boolean>,
  setThcAmount: React.Dispatch<React.SetStateAction<number>>,
  setEquipment: React.Dispatch<React.SetStateAction<Record<EquipmentType, Equipment>>>,
  setShowUpgradeModal: React.Dispatch<React.SetStateAction<EquipmentType | null>>,
  toast: any
) => {
  const item = equipment[type];
  
  // Check if upgrade is available
  if (!item.nextLevel) {
    toast({
      title: "Max Level Reached",
      description: "This equipment is already at maximum level.",
      variant: "destructive"
    });
    return;
  }
  
  // Check if player has enough THC
  if (thcAmount < item.nextLevel.cost) {
    toast({
      title: "Not Enough THC",
      description: `You need ${item.nextLevel.cost} THC to upgrade this equipment.`,
      variant: "destructive"
    });
    return;
  }
  
  // Process transaction
  const success = await handleTransaction(item.nextLevel.cost, `Upgrading ${type}`);
  
  if (success) {
    // Update equipment
    const updatedEquipment = {
      ...equipment,
      [type]: {
        ...item,
        level: item.level + 1,
        name: item.nextLevel.name,
        effect: item.nextLevel.effect,
        nextLevel: null, // Remove next level for simplicity (in a real game, you'd fetch the next upgrade)
      }
    };
    
    // Update state
    setEquipment(updatedEquipment);
    setThcAmount(prevAmount => prevAmount - item.nextLevel!.cost);
    setShowUpgradeModal(null);
    
    toast({
      title: "Equipment Upgraded",
      description: `Your ${type} has been upgraded to ${item.nextLevel.name}!`,
    });
  }
};
