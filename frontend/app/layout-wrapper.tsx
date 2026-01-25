// frontend/app/layout-wrapper.tsx
'use client'

import dynamic from 'next/dynamic'

const SocketProvider = dynamic(() => import('@/contexts/SocketProvider').then((m) => m.SocketProvider), {
  ssr: false,
})

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  return <SocketProvider>{children}</SocketProvider>
}