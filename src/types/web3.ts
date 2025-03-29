
export interface Web3ContextType {
  address: string | null;
  balance: string;
  thcBalance: string | null;
  connecting: boolean;
  tinHatCatters: any[];
  snacks: any[];
  connect: (walletType?: string) => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  refreshNFTs: () => Promise<void>;
}
