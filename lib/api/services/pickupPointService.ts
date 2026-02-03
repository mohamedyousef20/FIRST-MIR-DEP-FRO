import { apiService } from '../apiService';
import { PickupPoint } from '@/types/pickup-point';

export const pickupPointService = {
  // Fetch all pickup points
  getPickupPoints: async (): Promise<PickupPoint[]> => {
    try {
      const response = await apiService.get<PickupPoint[]>('/pickup');
      return response.data as any;
    } catch (error) {
      console.error('Error fetching pickup points:', error);
      throw error;
    }
  },

  // Legacy alias for admin components
  getAll: async () => {
    return await pickupPointService.getPickupPoints();
  },

  // Create a new pickup point (admin)
  create: async (pickupPointData: Partial<PickupPoint>): Promise<PickupPoint> => {
    try {
      const response = await apiService.post<PickupPoint>('/pickup', pickupPointData);
      return response.data as any;
    } catch (error) {
      console.error('Error creating pickup point:', error);
      throw error;
    }
  },

  // Update existing pickup point (admin)
  update: async (id: string, updateData: Partial<PickupPoint>): Promise<PickupPoint> => {
    try {
      const response = await apiService.put<PickupPoint>(`/pickup/${id}`, updateData);
      return response.data as any;
    } catch (error) {
      console.error(`Error updating pickup point (ID: ${id}):`, error);
      throw error;
    }
  },

  // Delete pickup point (admin)
  delete: async (id: string): Promise<void> => {
    try {
      await apiService.delete(`/pickup/${id}`);
    } catch (error) {
      console.error(`Error deleting pickup point (ID: ${id}):`, error);
      throw error;
    }
  },
};
