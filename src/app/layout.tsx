// pages/_app.tsx or app/layout.tsx
import { SocketProvider } from '@/contexts/SocketProvider';
import { ChatProvider } from '@/contexts/ChatProvider';

export default function App({ Component, pageProps }) {
  return (
    <SocketProvider>
      <ChatProvider>
        <Component {...pageProps} />
      </ChatProvider>
    </SocketProvider>
  );
}