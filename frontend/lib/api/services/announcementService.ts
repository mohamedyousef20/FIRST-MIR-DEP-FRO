import apiServices from '@/lib/api';
import { toast } from 'sonner';

const { api } = apiServices;

export const announcementService = {
    // Get all announcements
    async getAnnouncements() {
        try {
            const response = await api.get('/api/announcements');
            return response;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch announcements');
        }
    },

    // Get active announcements
    async getActiveAnnouncements() {
        try {
            const response = await api.get('/api/announcements/active');
            return response;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch active announcements');
        }
    },

    // Get announcement by ID
    async getAnnouncementById(id: string) {
        try {
            const response = await api.get(`/api/announcements/${id}`);
            return response;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch announcement');
        }
    },

    // Create new announcement with file upload support
    async createAnnouncement(formData: FormData) {
        try {
            const response = await api.post('/api/announcements', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Announcement created successfully');
            return response;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create announcement');
            throw error;
        }
    },

    // Update announcement with file upload support
    async updateAnnouncement(id: string, formData: FormData) {
        try {
            const response = await api.put(`/api/announcements/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Announcement updated successfully');
            return response;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update announcement');
            throw error;
        }
    },

    // Delete announcement
    async deleteAnnouncement(id: string) {
        try {
            const response = await api.delete(`/api/announcements/${id}`);
            toast.success('Announcement deleted successfully');
            return response;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete announcement');
            throw error;
        }
    },

    // Toggle announcement status
    async toggleAnnouncementStatus(id: string) {
        try {
            const response = await api.patch(`/api/announcements/${id}/toggle-status`);
            toast.success('Announcement status updated');
            return response;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to toggle announcement status');
            throw error;
        }
    }
};

