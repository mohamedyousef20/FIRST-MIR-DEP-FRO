import apiClient from '../apiClient';

export interface Message {
  _id: string;
  sender: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Chat {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;
  product?: {
    _id: string;
    name: string;
    images: string[];
  };
  order?: string;
  messages: Message[];
  lastMessage?: string;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface GetChatsParams {
  page?: number;
  limit?: number;
}

export const chatService = {
  // Get all chats for the current user
  getChats: async (params?: GetChatsParams): Promise<{ chats: Chat[]; total: number }> => {
    const response = await apiClient.get('/chats', { params });
    return response.data;
  },

  // Get a specific chat by ID
  getChat: async (chatId: string): Promise<Chat> => {
    const response = await apiClient.get(`/chats/${chatId}`);
    return response.data;
  },

  // Start a new chat
  startChat: async (data: {
    participantId: string;
    orderId?: string;
    productId?: string;
    initialMessage?: string;
  }): Promise<Chat> => {
    const response = await apiClient.post('/chats', data);
    return response.data;
  },

  // Send a message in a chat
  sendMessage: async (chatId: string, content: string): Promise<Message> => {
    const response = await apiClient.post(`/chats/${chatId}/messages`, { content });
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (chatId: string, messageIds: string[]): Promise<void> => {
    await apiClient.patch(`/chats/${chatId}/messages/read`, { messageIds });
  },

  // Get chat messages with pagination
  getMessages: async (
    chatId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ messages: Message[]; total: number }> => {
    const response = await apiClient.get(`/chats/${chatId}/messages`, { params });
    return response.data;
  },
};
