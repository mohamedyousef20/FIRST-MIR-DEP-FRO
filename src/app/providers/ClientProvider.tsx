'use client';

import { ReactNode } from 'react';
import { StoreProvider } from './StoreProvider';

interface ClientProviderProps {
  children: ReactNode;
}

export function ClientProvider({ children }: ClientProviderProps) {
  return <StoreProvider>{children}</StoreProvider>;
}

export default ClientProvider;
