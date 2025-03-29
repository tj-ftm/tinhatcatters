
import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';

// THC token address
const THC_TOKEN_ADDRESS = '0x17Af1Df44444AB9091622e4Aa66dB5BB34E51aD5';

// Function to get the THC balance (assuming it's a ERC-20 token)
export const getTHCBalance = async (address: string | null): Promise<string> => {
  try {
    if (!address) {
      console.warn('No address provided to getTHCBalance');
      return '0';
    }

    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      // Using the THC token address for Sonic network
      const tokenAddress = THC_TOKEN_ADDRESS;
      
      if (!tokenAddress) {
        console.error('THC token address not set!');
        return '0';
      }
      
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          "function balanceOf(address) view returns (uint)",
          "function decimals() view returns (uint8)"
        ],
        provider
      );
      
      const decimals = await tokenContract.decimals();
      const balance = await tokenContract.balanceOf(address);
      return ethers.formatUnits(balance, decimals);
    } else {
      console.error('MetaMask or compatible wallet not detected!');
      return '0';
    }
  } catch (error: any) {
    console.error('Error getting THC balance:', error);
    return '0';
  }
};

// Function to get THC token balance (alias for backward compatibility)
export const getThcBalance = getTHCBalance;
