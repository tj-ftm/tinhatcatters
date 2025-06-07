
import React from 'react';
import { ThirdwebProvider } from "thirdweb/react";
import { client } from "@/lib/thirdweb/config";

interface ThirdwebProviderWrapperProps {
  children: React.ReactNode;
}

const ThirdwebProviderWrapper: React.FC<ThirdwebProviderWrapperProps> = ({ children }) => {
  return (
    <ThirdwebProvider>
      {children}
    </ThirdwebProvider>
  );
};

export default ThirdwebProviderWrapper;
