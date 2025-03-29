
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
import { Wallet, Smartphone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface WalletOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface WalletSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectWallet: (walletId: string) => void;
}

const walletOptions: WalletOption[] = [
  {
    id: 'browser',
    name: 'Browser Wallet',
    icon: <Wallet className="h-5 w-5 text-orange-500" />,
    description: 'Connect using your browser wallet (MetaMask, Brave, Rabby, etc.)'
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: <Smartphone className="h-5 w-5 text-blue-500" />,
    description: 'Scan QR code with your mobile wallet'
  }
];

const WalletSelectDialog: React.FC<WalletSelectDialogProps> = ({
  open,
  onOpenChange,
  onSelectWallet
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="win95-window border-2 border-gray-400 p-0 max-w-[280px] md:max-w-md rounded-none" style={{ zIndex: 9999 }}>
        <div className="win95-title-bar flex justify-between items-center">
          <DialogTitle className="text-white text-sm px-2">Select Wallet</DialogTitle>
          <DialogClose className="text-white hover:text-gray-300 px-2">x</DialogClose>
        </div>
        
        <div className="p-3 bg-[#c0c0c0]">
          <DialogDescription className="mb-3 text-black text-xs md:text-sm">
            Connect to the Sonic network with your preferred wallet:
          </DialogDescription>
          
          <div className="space-y-2">
            {walletOptions.map((wallet) => (
              <Button
                key={wallet.id}
                className="win95-button w-full flex items-center justify-start gap-2 h-auto py-2 hover:bg-[#d2d2d2]"
                onClick={() => {
                  onSelectWallet(wallet.id);
                  onOpenChange(false);
                }}
              >
                <div className="bg-white p-1 rounded">{wallet.icon}</div>
                <div className="text-left flex-grow">
                  <h3 className={`font-bold ${isMobile ? 'text-xs' : 'text-sm'}`}>{wallet.name}</h3>
                  <p className={`${isMobile ? 'text-[9px]' : 'text-xs'} opacity-75`}>{wallet.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletSelectDialog;
