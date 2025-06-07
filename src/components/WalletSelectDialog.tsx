
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
import { Wallet, Smartphone, Brain } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface WalletOption {
  id: string;
  name: string;
  iconUrl: string;
  fallbackIcon: React.ReactNode;
  description: string;
}

interface WalletSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectWallet: (walletId: string) => void;
}

// Updated wallet options with Smart Wallet
const walletOptions: WalletOption[] = [
  {
    id: 'browser',
    name: 'Browser Wallet',
    iconUrl: '/assets/Icons/nftshop.ico',
    fallbackIcon: <Wallet className="h-5 w-5 text-orange-500" />,
    description: 'Connect using your browser wallet (MetaMask, Brave, Rabby, etc.)'
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    iconUrl: '/assets/Icons/nftshop.ico',
    fallbackIcon: <Smartphone className="h-5 w-5 text-blue-500" />,
    description: 'Scan QR code with your mobile wallet'
  },
  {
    id: 'smartwallet',
    name: 'Smart Login',
    iconUrl: '/assets/Icons/nftshop.ico',
    fallbackIcon: <Brain className="h-5 w-5 text-purple-500" />,
    description: 'Connect with email, Google, or social accounts'
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
        <div className="win95-title-bar flex justify-between items-center w-full">
          <DialogTitle className="text-white text-sm px-2">Select Wallet</DialogTitle>
          <DialogClose className="text-white hover:text-gray-300 px-2">x</DialogClose>
        </div>
        
        <div className="p-3 bg-[#c0c0c0] w-full">
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
                <div className="bg-white p-1 rounded">
                  <img 
                    src={wallet.iconUrl} 
                    alt={wallet.name} 
                    className="h-5 w-5 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      // Show fallback icon from wallet config
                      const iconContainer = target.parentElement;
                      if (iconContainer) {
                        const fallbackDiv = document.createElement('div');
                        fallbackDiv.className = "h-5 w-5 flex items-center justify-center";
                        iconContainer.appendChild(fallbackDiv);
                        // React icon will be rendered separately
                      }
                    }}
                  />
                  {wallet.fallbackIcon && <span style={{ display: 'none' }}></span>}
                </div>
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
