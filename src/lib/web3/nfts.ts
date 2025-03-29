
import { ethers } from 'ethers';

// TinHatCatter contract address on Sonic network
const TIN_HAT_CATTER_CONTRACT = '0x2DC1886d67001d5d6A80FEaa51513f7BB5a591FD';

// Function to get NFTs directly from the contract
export const getOwnedTinHatCatters = async (address: string) => {
  try {
    console.log(`Getting owned Tin Hat Catters for ${address}`);
    
    if (!address || typeof window.ethereum === 'undefined') {
      console.error('No address provided or Web3 not available');
      return [];
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // NFT contract ABI - minimal for balance and token ownership
    const abi = [
      "function balanceOf(address) view returns (uint256)",
      "function tokenOfOwnerByIndex(address,uint256) view returns (uint256)",
      "function tokenURI(uint256) view returns (string)"
    ];
    
    // Create contract instance
    const nftContract = new ethers.Contract(
      TIN_HAT_CATTER_CONTRACT,
      abi,
      provider
    );
    
    // Get number of NFTs owned by the address
    const balance = await nftContract.balanceOf(address);
    console.log(`Address owns ${balance.toString()} TinHatCatter NFTs`);
    
    if (balance == 0) {
      return [];
    }
    
    // Get token IDs owned by the address
    const tokenIds = [];
    for (let i = 0; i < balance; i++) {
      try {
        const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
        tokenIds.push(tokenId.toString());
      } catch (error) {
        console.error(`Error getting token at index ${i}:`, error);
      }
    }
    
    console.log('Token IDs owned:', tokenIds);
    
    // Map token IDs to NFT objects with metadata
    const nfts = tokenIds.map(id => ({
      id: id,
      contractAddress: TIN_HAT_CATTER_CONTRACT,
      name: `Tin Hat Catter #${id}`,
      // Using multiple image sources for better reliability
      image: `https://sonicscan.io/token/${TIN_HAT_CATTER_CONTRACT}/${id}/image`,
      fallbackImage: `/assets/tinhats/${id}.png`,
      secondaryFallback: `https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/${id}`,
      description: "A unique Tin Hat Catter NFT from the TinHatCatter collection"
    }));
    
    return nfts;
  } catch (error) {
    console.error('Error getting owned THC tokens:', error);
    
    // Return empty array on error
    return [];
  }
};

// Legacy function for backward compatibility
export const fetchNFTsFromContract = async (address: string) => {
  return getOwnedTinHatCatters(address);
};

// Legacy function for backward compatibility
export const fetchTinHatCattersFromSonicscan = async (address: string) => {
  return getOwnedTinHatCatters(address);
};

// Function to fetch metadata for a specific token ID
export const fetchNFTMetadata = async (tokenId: string) => {
  try {
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
