
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

// Function to get the THC balance using direct contract interaction
export const getTHCBalance = async (address: string | null): Promise<string> => {
  if (!address) {
    console.warn('No address provided to getTHCBalance');
    return '0';
  }

  if (!isWeb3Available()) {
    console.error('Web3 is not available');
    return '0';
  }

  console.log('Getting THC balance for address:', address);

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // THC token contract address
    const tokenAddress = '0x17Af1Df44444AB9091622e4Aa66dB5BB34E51aD5';
    
    console.log('Using token contract address:', tokenAddress);
    
    // Standard ERC20 ABI for the functions we need
    const abi = [
      "function balanceOf(address) view returns (uint)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)"
    ];
    
    // Create contract instance
    const tokenContract = new ethers.Contract(
      tokenAddress,
      abi,
      provider
    );
    
    // Get token decimals - default to 18 if we can't fetch
    let decimals = 18;
    try {
      decimals = await tokenContract.decimals();
      console.log('Token decimals:', decimals);
    } catch (err) {
      console.warn('Failed to get decimals, using default of 18:', err);
    }
    
    // Get balance directly from the contract
    const balance = await tokenContract.balanceOf(address);
    console.log('Raw balance:', balance.toString());
    
    // Format the balance with proper decimals
    const formattedBalance = ethers.formatUnits(balance, decimals);
    console.log('Formatted THC balance:', formattedBalance);
    
    return formattedBalance;
  } catch (error: any) {
    console.error('Error getting THC balance:', error);
    console.error('Error details:', error.message);
    return '0';
  }
};
