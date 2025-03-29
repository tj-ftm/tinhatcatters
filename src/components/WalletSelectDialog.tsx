import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, Shield, Chrome, Award, Smartphone, ArrowRight, Coins } from 'lucide-react';

interface WalletOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  primary?: boolean;
}

interface WalletSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectWallet: (walletId: string) => void;
}

const walletOptions: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: <Wallet className="h-6 w-6 text-orange-500" />,
    description: 'Connect to your MetaMask wallet',
    primary: true
  },
  {
    id: 'rabby',
    name: 'Rabby',
    icon: <Shield className="h-6 w-6 text-purple-500" />,
    description: 'Connect using Rabby wallet'
  },
  {
    id: 'brave',
    name: 'Brave',
    icon: <Chrome className="h-6 w-6 text-red-500" />,
    description: 'Use Brave browser wallet'
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: <Smartphone className="h-6 w-6 text-blue-500" />,
    description: 'Scan QR code with your mobile wallet',
    primary: true
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: <Coins className="h-6 w-6 text-blue-400" />,
    description: 'Connect via Coinbase Wallet'
  },
  {
    id: 'other',
    name: 'Other Wallet',
    icon: <Award className="h-6 w-6 text-blue-500" />,
    description: 'Connect with any other Web3 wallet'
  }
];

const WalletSelectDialog: React.FC<WalletSelectDialogProps> = ({
  open,
  onOpenChange,
  onSelectWallet
}) => {
  // Filter primary wallets for featured section
  const primaryWallets = walletOptions.filter(wallet => wallet.primary);
  const otherWallets = walletOptions.filter(wallet => !wallet.primary);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="win95-window border-2 border-gray-400 p-0 max-w-md rounded-none">
        <div className="win95-title-bar flex justify-between items-center">
          <DialogTitle className="text-white text-lg px-2">Select Wallet</DialogTitle>
          <DialogClose className="text-white hover:text-gray-300 px-2">x</DialogClose>
        </div>
        
        <div className="p-4 bg-[#c0c0c0]">
          <DialogDescription className="mb-6 text-black">
            Connect to the Sonic network with your preferred wallet:
          </DialogDescription>
          
          {/* Featured Wallets */}
          <div className="mb-4">
            <h3 className="font-bold mb-2 text-sm">Popular Wallets</h3>
            <div className="space-y-3">
              {primaryWallets.map((wallet) => (
                <Button
                  key={wallet.id}
                  className="win95-button w-full flex items-center justify-start gap-3 h-auto py-3 hover:bg-[#d2d2d2]"
                  onClick={() => {
                    onSelectWallet(wallet.id);
                    onOpenChange(false);
                  }}
                >
                  <div className="bg-white p-2 rounded">{wallet.icon}</div>
                  <div className="text-left flex-grow">
                    <h3 className="font-bold">{wallet.name}</h3>
                    <p className="text-xs opacity-75">{wallet.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-50" />
                </Button>
              ))}
            </div>
          </div>
          
          {/* Other Wallets */}
          <div>
            <h3 className="font-bold mb-2 text-sm">Other Wallets</h3>
            <div className="space-y-3">
              {otherWallets.map((wallet) => (
                <Button
                  key={wallet.id}
                  className="win95-button w-full flex items-center justify-start gap-3 h-auto py-3"
                  onClick={() => {
                    onSelectWallet(wallet.id);
                    onOpenChange(false);
                  }}
                >
                  <div className="bg-white p-2 rounded">{wallet.icon}</div>
                  <div className="text-left">
                    <h3 className="font-bold">{wallet.name}</h3>
                    <p className="text-xs opacity-75">{wallet.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletSelectDialog;
