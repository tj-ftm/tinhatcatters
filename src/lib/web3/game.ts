
import { toast } from '@/hooks/use-toast';
import { isWeb3Available } from './core';

// Function to get owned snacks
export const getOwnedSnacks = async (address: string) => {
  // This would normally fetch snack NFTs from the blockchain
  // For now, return mock data
  try {
    // Mock implementation
    return [
      {
        id: 'donut1',
        name: 'Energy Donut',
        image: '/assets/snacks/donut.png',
        boost: { type: 'speed', value: 20, duration: 10 }
      }
    ];
  } catch (error) {
    console.error('Error getting owned snacks:', error);
    return [];
  }
};

// Function to purchase a snack
export const purchaseSnack = async (snackId: number): Promise<boolean> => {
  try {
    if (!isWeb3Available()) {
      toast({
        title: "No Wallet Detected",
        description: "Please install MetaMask or another compatible wallet to use this feature.",
        variant: "destructive",
      });
      return false;
    }
    
    // Mock successful purchase for now
    // In a real implementation, this would interact with a smart contract
    console.log(`Purchasing snack with ID: ${snackId}`);
    
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return true;
  } catch (error: any) {
    console.error('Error purchasing snack:', error);
    toast({
      title: "Purchase Failed",
      description: error.message || "Failed to purchase snack",
      variant: "destructive",
    });
    return false;
  }
};
