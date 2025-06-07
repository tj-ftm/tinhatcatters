
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ThirdwebProviderWrapper from './contexts/ThirdwebProvider'

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThirdwebProviderWrapper>
      <App />
    </ThirdwebProviderWrapper>
  </React.StrictMode>
);
