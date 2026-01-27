'use client';

import { store } from '../../redux/store';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}
