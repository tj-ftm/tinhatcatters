
// Re-export all functions from the separate modules
// This maintains backward compatibility with existing imports

// Core functionality
export {
  isWeb3Available,
  switchToSonicNetwork,
  connectWallet,
  disconnectWalletConnect,
  requestAccount
} from './core';

// Balance related functions
export {
  getBalance,
  getTHCBalance
} from './balances';

// NFT related functions
export {
  fetchNFTsFromContract,
  fetchNFTMetadata,
  getOwnedTinHatCatters,
  fetchTinHatCattersFromSonicscan
} from './nfts';

// Game related functions
export {
  getOwnedSnacks,
  purchaseSnack
} from './game';
