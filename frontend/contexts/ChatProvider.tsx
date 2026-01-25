// frontend/contexts/ChatProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSocket } from './SocketProvider';
import { chatService, Chat, Message } from '@/lib/api/services/chat.service';
import { useAuth } from './RootLayout';

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  unreadCount: number;
  sendMessage: (content: string) => Promise<void>;
  setCurrentChat: (chatId: string) => Promise<void>;
  markAsRead: (messageIds: string[]) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChatState] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket();
  const { user } = useAuth();

  // Load chats on mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true);
        const data = await chatService.getChats();
        setChats(data);
      } catch (err) {
        setError('Failed to load chats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, []);

  // Set up socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
      // Update last message in chats list
      setChats(prev =>
        prev.map(chat =>
          chat.id === message.chatId
            ? { ...chat, lastMessage: message }
            : chat
        )
      );
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket]);

  const setCurrentChat = async (chatId: string) => {
    try {
      setLoading(true);
      const chat = await chatService.getChat(chatId);
      setCurrentChatState(chat);
      setMessages(chat.messages || []);
      // Mark messages as read
      const unreadMessages = chat.messages
        .filter(m => !m.read && m.sender !== user?.id)
        .map(m => m.id);
      if (unreadMessages.length > 0) {
        await chatService.markAsRead(chatId, unreadMessages);
      }
    } catch (err) {
      setError('Failed to load chat');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentChat) return;
    try {
      const message = await chatService.sendMessage(currentChat.id, content);
      setMessages(prev => [...prev, message]);
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
      throw err;
    }
  };

  const markAsRead = async (messageIds: string[]) => {
    if (!currentChat) return;
    try {
      await chatService.markAsRead(currentChat.id, messageIds);
      setMessages(prev =>
        prev.map(msg =>
          messageIds.includes(msg.id) ? { ...msg, read: true } : msg
        )
      );
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  };

  const unreadCount = chats.reduce(
    (count, chat) => count + (chat.unreadCount || 0),
    0
  );

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        messages,
        unreadCount,
        sendMessage,
        setCurrentChat,
        markAsRead,
        loading,
        error,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};