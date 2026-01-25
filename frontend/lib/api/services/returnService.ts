import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const returnService = {
  getReturnRequests() {
    return axios.get(`${API_URL}/api/returns`);
  },

  getReturnRequestsForAdmin() {
    return axios.get(`${API_URL}/api/returns/admin`);
  },

  createReturnRequest(data: any) {
    return axios.post(`${API_URL}/api/returns`, data);
  },

  updateReturnRequest(payload: { returnId: string; status: string }) {
    return axios.patch(`${API_URL}/api/returns`, payload);
  },

  deleteReturnRequest(returnId: string) {
    return axios.delete(`${API_URL}/api/returns`, {
      data: { returnId },
    });
  },
};

export default returnService;
