
import React from 'react';
import { ThirdwebProvider, embeddedWallet, smartWallet } from '@thirdweb-dev/react';
import { Sonic } from '@thirdweb-dev/chains';

// You'll need to set this in your environment variables
const CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || 'your_client_id_here';

const ThirdwebProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThirdwebProvider
      clientId={CLIENT_ID}
      activeChain={Sonic}
      supportedWallets={[
        smartWallet(embeddedWallet(), {
          factoryAddress: "0x15C8D84d83D02E2f039d2bA7d3C4E4EB73d5c520", // Thirdweb's default factory
          gasless: true,
        }),
        embeddedWallet({
          auth: {
            options: ["email", "google", "apple", "facebook"],
          },
        }),
      ]}
    >
      {children}
    </ThirdwebProvider>
  );
};

export default ThirdwebProviderWrapper;
