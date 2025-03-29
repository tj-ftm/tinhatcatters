
import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';

// Check if Web3 is available
export const isWeb3Available = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

// Function to switch to Sonic Network
export const switchToSonicNetwork = async () => {
  if (!isWeb3Available()) return false;
  
  const sonicChainId = '0x8274'; // Chain ID for Sonic (33396 in decimal)
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: sonicChainId }],
    });
    return true;
  } catch (error: any) {
    // If the chain hasn't been added to MetaMask
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: sonicChainId,
              chainName: 'Sonic',
              nativeCurrency: {
                name: 'Sonic',
                symbol: 'SON',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.sonic.game/'],
              blockExplorerUrls: ['https://sonicscan.io/'],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Error adding Sonic network:', addError);
        return false;
      }
    }
    console.error('Error switching to Sonic network:', error);
    return false;
  }
};

// Connect wallet function
export const connectWallet = async (walletType?: string) => {
  if (!isWeb3Available()) {
    throw new Error('No Web3 wallet detected');
  }
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error: any) {
    console.error('Error connecting wallet:', error);
    throw new Error(error.message || 'Failed to connect wallet');
  }
};

// Disconnect WalletConnect
export const disconnectWalletConnect = async () => {
  // If using WalletConnect, we would implement disconnect logic here
  // This is a placeholder for now
  console.log('Disconnecting WalletConnect provider');
  return true;
};

// Function to request access to the user's wallet
export const requestAccount = async () => {
  try {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      return accounts[0];
    } else {
      toast({
        title: "No Wallet Detected",
        description: "Please install MetaMask or another compatible wallet to use this feature.",
        variant: "destructive",
      });
      console.error('MetaMask or compatible wallet not detected!');
      return null;
    }
  } catch (error: any) {
    toast({
      title: "Wallet Access Denied",
      description: error.message || "Failed to connect to wallet. Please try again.",
      variant: "destructive",
    });
    console.error('Error requesting account:', error);
    return null;
  }
};

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

// Function to get the THC balance (assuming it's a ERC-20 token)
export const getTHCBalance = async (address: string | null): Promise<string> => {
  try {
    if (!address) {
      console.warn('No address provided to getTHCBalance');
      return '0';
    }

    if (typeof window.ethereum !== 'undefined') {
      // Update for ethers v6
      const provider = new ethers.BrowserProvider(window.ethereum);
      const tokenAddress = process.env.NEXT_PUBLIC_THC_CONTRACT_ADDRESS; // Ensure this is set in your environment variables
      if (!tokenAddress) {
        console.error('THC token address not set in environment variables!');
        return '0';
      }
      
      const abi = [
        "function balanceOf(address) view returns (uint)",
        "function decimals() view returns (uint8)"
      ];
      
      const tokenContract = new ethers.Contract(
        tokenAddress,
        abi,
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

// Etherscan API key
const ETHERSCAN_API_KEY = '5YNXI6EBCV3E1IZANWBC13V1ABXEVG9YFK';
// Sonic API URL - change to Sonic's Etherscan-compatible API if different
const SONIC_API_URL = 'https://api-sonic.etherscan.io/api';
// TinHatCatter contract address on Sonic network
const TIN_HAT_CATTER_CONTRACT = '0x2DC1886d67001d5d6A80FEaa51513f7BB5a591FD';

// Function to fetch NFTs from the specified contract for an address
export const fetchNFTsFromContract = async (address: string) => {
  try {
    console.log(`Fetching NFTs for address ${address} from contract ${TIN_HAT_CATTER_CONTRACT}`);
    
    // First, get all NFT transfers for this address
    const response = await fetch(
      `${SONIC_API_URL}?module=account&action=tokennfttx&address=${address}&contractaddress=${TIN_HAT_CATTER_CONTRACT}&startblock=0&endblock=999999999&sort=asc&apikey=${ETHERSCAN_API_KEY}`
    );
    
    const data = await response.json();
    console.log('API Response:', data);
    
    if (data.status === '1' && data.result && Array.isArray(data.result)) {
      // Process the results to get unique token IDs owned by this address
      const ownedTokens = new Map();
      
      // Process transfers to determine current ownership
      data.result.forEach((tx: any) => {
        const tokenId = tx.tokenID;
        const from = tx.from.toLowerCase();
        const to = tx.to.toLowerCase();
        const userAddress = address.toLowerCase();
        
        // If token was sent from user, they no longer own it
        if (from === userAddress) {
          ownedTokens.delete(tokenId);
        }
        // If token was sent to user, they now own it
        if (to === userAddress) {
          ownedTokens.set(tokenId, {
            id: tokenId,
            contractAddress: tx.contractAddress,
            name: `Tin Hat Catter #${tokenId}`,
            // Using Sonic's block explorer for image URL if available
            image: `https://sonicscan.io/token/${TIN_HAT_CATTER_CONTRACT}/${tokenId}/image`,
            // Fallback image construction
            fallbackImage: `/assets/tinhats/${tokenId}.png`
          });
        }
      });
      
      console.log('Owned NFTs:', Array.from(ownedTokens.values()));
      return Array.from(ownedTokens.values());
    }
    
    // If no results or error
    console.log('No NFTs found or API error:', data.message || 'Unknown error');
    return [];
  } catch (error) {
    console.error('Error fetching NFT data from Sonic network:', error);
    return [];
  }
};

// Function to fetch metadata for a specific token ID
export const fetchNFTMetadata = async (tokenId: string) => {
  try {
    // Some contract APIs expose a tokenURI method to get metadata
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      const abi = [
        "function tokenURI(uint256 tokenId) view returns (string)"
      ];
      
      const contract = new ethers.Contract(
        TIN_HAT_CATTER_CONTRACT,
        abi,
        provider
      );
      
      try {
        // Try to get the token URI
        const tokenURI = await contract.tokenURI(tokenId);
        console.log('Token URI:', tokenURI);
        
        // Fetch metadata from the URI
        if (tokenURI) {
          let metadataUrl = tokenURI;
          // Handle ipfs:// URIs
          if (tokenURI.startsWith('ipfs://')) {
            metadataUrl = tokenURI.replace('ipfs://', 'https://gateway.ipfs.io/ipfs/');
          }
          
          const response = await fetch(metadataUrl);
          const metadata = await response.json();
          return metadata;
        }
      } catch (error) {
        console.warn('Error fetching tokenURI, falling back to default metadata:', error);
      }
    }
    
    // Fallback: return basic metadata
    return {
      name: `Tin Hat Catter #${tokenId}`,
      description: "A Tin Hat Catter NFT from the Sonic network",
      image: `https://sonicscan.io/token/${TIN_HAT_CATTER_CONTRACT}/${tokenId}/image`,
      attributes: []
    };
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    return null;
  }
};

// Main function to get owned Tin Hat Catters
export const getOwnedTinHatCatters = async (address: string) => {
  try {
    console.log(`Getting owned Tin Hat Catters for ${address}`);
    // Retrieve NFTs from contract
    const nfts = await fetchNFTsFromContract(address);
    
    // For each NFT, try to fetch its metadata
    const nftsWithMetadata = await Promise.all(
      nfts.map(async (nft: any) => {
        try {
          const metadata = await fetchNFTMetadata(nft.id);
          if (metadata) {
            return {
              ...nft,
              name: metadata.name || nft.name,
              description: metadata.description,
              image: metadata.image || nft.image,
              attributes: metadata.attributes || []
            };
          }
        } catch (error) {
          console.warn(`Error fetching metadata for token #${nft.id}:`, error);
        }
        return nft;
      })
    );
    
    console.log('NFTs with metadata:', nftsWithMetadata);
    return nftsWithMetadata;
  } catch (error) {
    console.error('Error getting owned THC tokens:', error);
    return [];
  }
};

// Function to fetch from Etherscan for backward compatibility
export const fetchTinHatCattersFromSonicscan = async (address: string) => {
  return getOwnedTinHatCatters(address);
};

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
