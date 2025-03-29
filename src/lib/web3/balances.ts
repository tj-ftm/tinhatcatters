
import { ethers } from 'ethers';
import { isWeb3Available } from './core';

// Function to get the current account balance
export const getBalance = async (address: string | null): Promise<string> => {
  try {
    if (!address) {
      console.warn('No address provided to getBalance');
      return '0';
    }

    if (typeof window.ethereum !== 'undefined') {
      // Update for ethers v6
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } else {
      console.error('MetaMask or compatible wallet not detected!');
      return '0';
    }
  } catch (error: any) {
    console.error('Error getting balance:', error);
    return '0';
  }
};

// Function to get the THC balance using the correct contract address
export const getTHCBalance = async (address: string | null): Promise<string> => {
  if (!address) {
    console.warn('No address provided to getTHCBalance');
    return '0';
  }

  if (!isWeb3Available()) {
    console.error('Web3 is not available');
    return '0';
  }

  // Log to check if we're getting here
  console.log('Getting THC balance for address:', address);

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Use the specific contract address provided
    const tokenAddress = '0x17Af1Df44444AB9091622e4Aa66dB5BB34E51aD5';
    
    console.log('Using token contract address:', tokenAddress);
    
    const abi = [
      "function balanceOf(address) view returns (uint)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)"
    ];
    
    const tokenContract = new ethers.Contract(
      tokenAddress,
      abi,
      provider
    );
    
    // Get token decimals - handle errors gracefully
    let decimals = 18; // Default to 18 if we can't fetch
    try {
      decimals = await tokenContract.decimals();
      console.log('Token decimals:', decimals);
    } catch (err) {
      console.warn('Failed to get decimals, using default of 18:', err);
    }
    
    // Get balance with timeout and retry logic
    console.log('Fetching balance for address:', address);
    
    let attempts = 0;
    const maxAttempts = 3;
    const retryDelay = 1000; // 1 second
    
    while (attempts < maxAttempts) {
      try {
        const balance = await tokenContract.balanceOf(address);
        console.log('Raw balance:', balance.toString());
        const formattedBalance = ethers.formatUnits(balance, decimals);
        console.log('Formatted THC balance:', formattedBalance);
        return formattedBalance;
      } catch (err) {
        attempts++;
        console.warn(`THC balance fetch attempt ${attempts} failed:`, err);
        
        if (attempts >= maxAttempts) {
          console.error('Max retries reached for THC balance fetch');
          return '0';
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    return '0'; // Should not reach here due to the while loop, but TypeScript wants a return
  } catch (error: any) {
    console.error('Error getting THC balance:', error);
    console.error('Error details:', error.message);
    return '0';
  }
};
