
import { createThirdwebClient, defineChain } from "thirdweb";
import { inAppWallet, createWallet } from "thirdweb/wallets";

// Your provided client ID
const CLIENT_ID = "0f1fb27b329bdbfe39c8d507a4f33967";

// Create the Thirdweb client
export const client = createThirdwebClient({
  clientId: CLIENT_ID,
});

// Define Sonic chain
export const sonicChain = defineChain({
  id: 146,
  name: "Sonic",
  nativeCurrency: {
    name: "Sonic",
    symbol: "S", 
    decimals: 18,
  },
  rpc: "https://rpc.soniclabs.com",
  blockExplorers: [
    {
      name: "Sonic Explorer",
      url: "https://explorer.soniclabs.com",
    },
  ],
});

// Configure smart wallet
export const smartWallet = createWallet("smart", {
  chain: sonicChain,
  factoryAddress: "0x9Bb60d360932171292Ad2b80839080fb6F5aBD97", // Thirdweb's default factory for Sonic
  gasless: true,
});

// Configure in-app wallet (email/social login)
export const inAppWalletConfig = inAppWallet({
  auth: {
    options: ["email", "google", "apple", "facebook"],
  },
});
