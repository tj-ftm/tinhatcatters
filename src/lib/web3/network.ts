
import { toast } from '@/hooks/use-toast';

// Function to switch to Sonic Network
export const switchToSonicNetwork = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Sonic Network Chain ID
      const chainId = '0x92'; // Chain ID for Sonic Network (decimal: 146)
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
      
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x92', // Chain ID for Sonic Network (decimal: 146)
                chainName: 'Sonic Network',
                nativeCurrency: {
                  name: 'Sonic',
                  symbol: 'S',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc.sonic.network'],
                blockExplorerUrls: ['https://sonicscan.io/'],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Error adding Sonic network:', addError);
          toast({
            title: "Network Error",
            description: "Failed to add Sonic network to your wallet",
            variant: "destructive",
          });
          return false;
        }
      }
      console.error('Error switching to Sonic network:', switchError);
      return false;
    }
  }
  return false;
};
