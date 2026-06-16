import axiosInstance from './axiosInstance';

export const worksAPI = {
  getAll: (params) => {
    return axiosInstance.get('/works', { params });
  },
  getStats: () => {
    return axiosInstance.get('/works/stats');
  },
  create: (data) => {
    return axiosInstance.post('/works', data);
  },
  update: (id, data) => {
    return axiosInstance.put(`/works/${id}`, data);
  },
  delete: (id) => {
    return axiosInstance.delete(`/works/${id}`);
  }
};


