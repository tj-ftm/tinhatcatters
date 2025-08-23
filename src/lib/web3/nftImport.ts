
import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';

// The NFT contract ABI (updated to match actual contract)
const NFT_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function totalSupply() view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
];

// Contract address for the NFT collection
const NFT_CONTRACT_ADDRESS = '0x2dc1886d67001d5d6a80feaa51513f7bb5a591fd';

// Sonic Network RPC URL
const SONIC_RPC_URL = 'https://rpc.sonic.network';

// Interface for NFT metadata
export interface NFTMetadata {
  id: string;
  name: string;
  image: string;
  description?: string;
  attributes?: any[];
  [key: string]: any;
}

/**
 * Fetches NFTs owned by the provided wallet address using Transfer events
 */
export const fetchOwnedNFTs = async (walletAddress: string): Promise<NFTMetadata[]> => {
  try {
    if (!walletAddress) {
      console.warn('No wallet address provided');
      return [];
    }

    // Initialize provider and contract
    const provider = new ethers.JsonRpcProvider(SONIC_RPC_URL);
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);

    console.log(`Fetching NFTs for wallet: ${walletAddress}`);

    // Get total supply to know the range of token IDs
    const totalSupply = await contract.totalSupply();
    console.log(`Total supply: ${totalSupply.toString()}`);

    if (totalSupply.toString() === '0') {
      return [];
    }

    // Check ownership for each token ID
    const ownedTokenIds: string[] = [];
    const ownershipPromises = [];
    
    // Check tokens in batches to avoid overwhelming the RPC
    const batchSize = 50;
    for (let i = 1; i <= totalSupply; i += batchSize) {
      const batch = [];
      for (let j = i; j < Math.min(i + batchSize, Number(totalSupply) + 1); j++) {
        batch.push(checkTokenOwnership(contract, j, walletAddress));
      }
      const batchResults = await Promise.all(batch);
      ownedTokenIds.push(...batchResults.filter(tokenId => tokenId !== null) as string[]);
    }

    console.log(`Found ${ownedTokenIds.length} owned tokens:`, ownedTokenIds);

    if (ownedTokenIds.length === 0) {
      return [];
    }

    // Fetch metadata for owned tokens
    const metadataPromises = ownedTokenIds.map(tokenId => 
      fetchNFTMetadataById(contract, tokenId)
    );
    
    const nfts = await Promise.all(metadataPromises);
    
    // Filter out any null values (failed fetches)
    return nfts.filter(nft => nft !== null) as NFTMetadata[];
  } catch (error) {
    console.error('Error fetching owned NFTs:', error);
    toast({
      title: 'NFT Fetch Error',
      description: 'Failed to load your NFTs. Please try again later.',
      variant: 'destructive'
    });
    return [];
  }
};

/**
 * Checks if a specific token ID is owned by the given wallet address
 */
const checkTokenOwnership = async (
  contract: ethers.Contract,
  tokenId: number,
  walletAddress: string
): Promise<string | null> => {
  try {
    const owner = await contract.ownerOf(tokenId);
    if (owner.toLowerCase() === walletAddress.toLowerCase()) {
      return tokenId.toString();
    }
    return null;
  } catch (error) {
    // Token might not exist or other error
    return null;
  }
};

/**
 * Fetches metadata for a single NFT by its token ID
 */
const fetchNFTMetadataById = async (
  contract: ethers.Contract,
  tokenId: string
): Promise<NFTMetadata | null> => {
  try {
    console.log(`Fetching metadata for token ID ${tokenId}`);
    
    // Get the token URI
    const tokenURI = await contract.tokenURI(tokenId);
    console.log(`Token URI for ${tokenId}: ${tokenURI}`);
    
    // Clean the URI - some URIs come with ipfs:// prefix or other protocols
    const cleanedURI = tokenURI.replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/');
    console.log(`Cleaned URI: ${cleanedURI}`);
    
    // Fetch the metadata from the tokenURI
    const response = await fetch(cleanedURI);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const metadata = await response.json();
    console.log(`Metadata received for token ${tokenId}:`, metadata);
    
    // Clean the image URL if it's an IPFS URL
    if (metadata.image && metadata.image.startsWith('ipfs://')) {
      metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
      console.log(`Cleaned image URL: ${metadata.image}`);
    }
    
    return {
      id: tokenId,
      name: metadata.name || `NFT #${tokenId}`,
      image: metadata.image || '',
      description: metadata.description || '',
      attributes: metadata.attributes || [],
      ...metadata
    };
  } catch (error) {
    console.error(`Error fetching NFT metadata for token ${tokenId}:`, error);
    return null;
  }
};

/**
 * Fetch a single NFT by its token ID
 */
export const fetchNFTById = async (tokenId: string): Promise<NFTMetadata | null> => {
  try {
    // Initialize provider and contract
    const provider = new ethers.JsonRpcProvider(SONIC_RPC_URL);
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
    
    // Get the token URI
    const tokenURI = await contract.tokenURI(tokenId);
    console.log(`Token URI for ID ${tokenId}: ${tokenURI}`);
    
    // Clean the URI
    const cleanedURI = tokenURI.replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/');
    
    // Fetch the metadata
    const response = await fetch(cleanedURI);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const metadata = await response.json();
    
    // Clean the image URL if it's an IPFS URL
    if (metadata.image && metadata.image.startsWith('ipfs://')) {
      metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    
    return {
      id: tokenId,
      name: metadata.name || `NFT #${tokenId}`,
      image: metadata.image || '',
      description: metadata.description || '',
      attributes: metadata.attributes || [],
      ...metadata
    };
  } catch (error) {
    console.error(`Error fetching NFT with ID ${tokenId}:`, error);
    return null;
  }
};
