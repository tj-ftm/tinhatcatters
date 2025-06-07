
import { useConnect, useActiveAccount, useDisconnect } from "thirdweb/react";
import { client, smartWallet, inAppWalletConfig, sonicChain } from "@/lib/thirdweb/config";
import { toast } from "@/hooks/use-toast";

export const useThirdwebWallet = () => {
  const { connect } = useConnect();
  const account = useActiveAccount();
  const { disconnect } = useDisconnect();

  const connectSmartWallet = async () => {
    try {
      await connect(async () => {
        // Connect to in-app wallet first (for authentication)
        const personalWallet = await inAppWalletConfig.connect({
          client,
          chain: sonicChain,
        });

        // Then connect to smart wallet using the personal wallet
        const wallet = await smartWallet.connect({
          client,
          personalWallet,
        });

        return wallet;
      });

      toast({
        title: "Smart Wallet Connected",
        description: "Your smart wallet has been connected successfully.",
      });
    } catch (error) {
      console.error("Smart wallet connection error:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect smart wallet. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const disconnectWallet = () => {
    disconnect();
    toast({
      title: "Wallet Disconnected",
      description: "Your smart wallet has been disconnected.",
    });
  };

  return {
    account,
    connectSmartWallet,
    disconnectWallet,
    isConnected: !!account,
    address: account?.address,
  };
};
