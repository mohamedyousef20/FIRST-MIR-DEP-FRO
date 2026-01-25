import { apiClient } from '../core/axios';
import { ApiResponse } from '../core/types';

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  lastMessage?: Message;
  unreadCount: number;
}

export const chatService = {
  // Get all chats for the current user
  getChats: async (): Promise<Chat[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Chat[]>>('/api/chats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching chats:', error);
      throw error;
    }
  },

  // Get a specific chat by ID
  getChat: async (chatId: string): Promise<Chat> => {
    try {
      const response = await apiClient.get<ApiResponse<Chat>>(`/api/chats/${chatId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching chat ${chatId}:`, error);
      throw error;
    }
  },

  // Send a message in a chat
  sendMessage: async (chatId: string, content: string): Promise<Message> => {
    try {
      const response = await apiClient.post<ApiResponse<Message>>(
        `/api/chats/${chatId}/messages`,
        { content }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Start a new chat
  startChat: async (participantId: string, initialMessage?: string): Promise<Chat> => {
    try {
      const response = await apiClient.post<ApiResponse<Chat>>('/api/chats', {
        participantId,
        initialMessage
      });
      return response.data.data;
    } catch (error) {
      console.error('Error starting chat:', error);
      throw error;
    }
  },

  // Mark messages as read
  markAsRead: async (chatId: string, messageIds: string[]): Promise<void> => {
    try {
      await apiClient.patch(`/api/chats/${chatId}/messages/read`, { messageIds });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }
};

export default chatService;
