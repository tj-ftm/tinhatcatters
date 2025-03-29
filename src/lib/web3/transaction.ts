
import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';

// THC token address
const THC_TOKEN_ADDRESS = '0x17Af1Df44444AB9091622e4Aa66dB5BB34E51aD5';

// Function to send THC tokens to a recipient address
export const sendTransaction = async (toAddress: string, amount: string): Promise<boolean> => {
  try {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: "No Wallet Detected",
        description: "Please install MetaMask or another compatible wallet to perform this action.",
        variant: "destructive",
      });
      return false;
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const fromAddress = accounts[0];
    
    if (!fromAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to send THC.",
        variant: "destructive",
      });
      return false;
    }

    // Get provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Create contract instance
    const tokenContract = new ethers.Contract(
      THC_TOKEN_ADDRESS,
      [
        "function transfer(address to, uint256 amount) returns (bool)",
        "function decimals() view returns (uint8)"
      ],
      signer
    );
    
    // Get token decimals
    const decimals = await tokenContract.decimals();
    
    // Convert amount to token units with decimals
    const amountInWei = ethers.parseUnits(amount, decimals);
    
    // Send transaction
    const tx = await tokenContract.transfer(toAddress, amountInWei);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    if (receipt && receipt.status === 1) {
      return true;
    } else {
      console.error('Transaction failed:', receipt);
      return false;
    }
  } catch (error: any) {
    console.error('Error sending transaction:', error);
    toast({
      title: "Transaction Failed",
      description: error.message || "Failed to send THC tokens. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};

// Function to purchase a snack NFT
export const purchaseSnack = async (snackId: number): Promise<boolean> => {
  try {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: "No Wallet Detected",
        description: "Please install MetaMask or another compatible wallet to purchase snacks.",
        variant: "destructive",
      });
      return false;
    }
    
    // In a real implementation, this would interact with a smart contract
    // Here we're just simulating a purchase with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Purchase Successful",
      description: `You have purchased snack #${snackId}!`,
    });
    
    return true;
  } catch (error: any) {
    console.error('Error purchasing snack:', error);
    toast({
      title: "Purchase Failed",
      description: error.message || "Failed to purchase snack. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};
