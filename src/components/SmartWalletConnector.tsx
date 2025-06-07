
import React, { useState } from 'react';
import { ConnectWallet, useAddress, useDisconnect } from '@thirdweb-dev/react';
import { Button } from '@/components/ui/button';
import { Smartphone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SmartWalletConnectorProps {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

const SmartWalletConnector: React.FC<SmartWalletConnectorProps> = ({
  onConnect,
  onDisconnect
}) => {
  const address = useAddress();
  const disconnect = useDisconnect();
  const [isConnecting, setIsConnecting] = useState(false);

  React.useEffect(() => {
    if (address) {
      onConnect(address);
      toast({
        title: "Smart Wallet Connected",
        description: "Your Smart Wallet has been connected successfully.",
      });
    }
  }, [address, onConnect]);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      onDisconnect();
      toast({
        title: "Smart Wallet Disconnected",
        description: "Your Smart Wallet has been disconnected.",
      });
    } catch (error) {
      console.error('Error disconnecting Smart Wallet:', error);
    }
  };

  return (
    <div className="smart-wallet-connector">
      {!address ? (
        <ConnectWallet
          theme="light"
          btnTitle="Connect Smart Wallet"
          modalTitle="Connect with Smart Wallet"
          modalSize="wide"
          welcomeScreen={{
            title: "Welcome to Smart Login",
            subtitle: "Connect with your email, Google, or social accounts",
          }}
        />
      ) : (
        <Button
          onClick={handleDisconnect}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Smartphone className="h-4 w-4" />
          Disconnect Smart Wallet
        </Button>
      )}
    </div>
  );
};

export default SmartWalletConnector;
