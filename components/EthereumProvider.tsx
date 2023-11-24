'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
  darkTheme,
  midnightTheme,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import {
  trustWallet,
  bitKeepWallet,
  okxWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig, Chain } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { polygonMumbai } from 'wagmi/chains'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygonMumbai],
  [publicProvider()]
);

const projectId = '7d4991410483a2f943cd0f3e9bcf3c0d';

const { wallets } = getDefaultWallets({
  appName: 'Blockto',
  projectId,
  chains,
});

const demoAppInfo = {
  appName: 'Blockto',
};

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Other',
    wallets: [
      trustWallet({ projectId, chains }),
      bitKeepWallet({ projectId, chains }),
      okxWallet({ projectId, chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export function EthereumProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        appInfo={demoAppInfo}
        modalSize="compact"
        theme={darkTheme({
          borderRadius: 'small',
          accentColor: '#603285',
          fontStack: 'system',
        })}
        coolMode
      >
        {mounted && children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
