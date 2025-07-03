import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import WalletConnectionProvider from './providers/WalletConnectionProvider';
import { Web3Provider } from './providers/Web3Provider';
import { Buffer } from 'buffer';
import { MusicProvider } from './providers/MusicProvider';

if (!(window as any).Buffer) {
  (window as any).Buffer = Buffer;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletConnectionProvider>
      <Web3Provider>
        <MusicProvider>
          <App />
        </MusicProvider>
      </Web3Provider>
    </WalletConnectionProvider>
  </StrictMode>
);
