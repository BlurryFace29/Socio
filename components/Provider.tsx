'use client';

import { SessionProvider } from 'next-auth/react';
import { EthereumProvider } from '@/components/EthereumProvider';

type ProviderProps = {
  children: React.ReactNode;
  session?: any;
};

export function Provider({ children, session }: ProviderProps) {
  return (
    <SessionProvider session={session} refetchInterval={0}>
      <EthereumProvider>{children}</EthereumProvider>
    </SessionProvider>
  );
}
