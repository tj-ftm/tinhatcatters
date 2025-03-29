
interface Window {
  ethereum: {
    isMetaMask?: boolean;
    isBraveWallet?: boolean;
    isCoinbaseWallet?: boolean;
    isRabby?: boolean;
    request: (request: { method: string; params?: any[] }) => Promise<any>;
    on: (eventName: string, callback: (...args: any[]) => void) => void;
    removeListener: (eventName: string, callback: (...args: any[]) => void) => void;
  };
}
