import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import WalletConnectionProvider from './providers/WalletConnectionProvider';
import { Web3Provider } from './providers/Web3Provider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletConnectionProvider>
      <Web3Provider>
        <App />
      </Web3Provider>
    </WalletConnectionProvider>
  </StrictMode>
);
