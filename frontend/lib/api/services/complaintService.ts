import apiServices from '@/lib/api';

const { api } = apiServices;

export interface ComplaintPayload {
  title: string;
  message: string;
  orderId?: string;
  images?: File[];
}

export const complaintService = {
  async createComplaint(data: ComplaintPayload) {
    const form = new FormData();
    form.append('title', data.title);
    form.append('message', data.message);
    if (data.orderId) form.append('orderId', data.orderId);
    data.images?.forEach(img => form.append('images', img));

    const res = await api.post('/api/complaints', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  async getComplaints() {
    const res = await api.get('/api/complaints');
    return res.data.data;
  },

  async deleteComplaint(id: string) {
    await api.delete(`/api/complaints/${id}`);
  },
};
