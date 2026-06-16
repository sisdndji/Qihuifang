import axiosInstance from './axiosInstance';

export const mastersAPI = {
  getAll: (params) => {
    return axiosInstance.get('/masters', { params });
  },
  getById: (id) => {
    return axiosInstance.get(`/masters/${id}`);
  },
  create: (data) => {
    return axiosInstance.post('/masters', data);
  },
  update: (id, data) => {
    return axiosInstance.put(`/masters/${id}`, data);
  },
  delete: (id) => {
    return axiosInstance.delete(`/masters/${id}`);
  },
  getStats: () => {
    return axiosInstance.get('/masters/stats');
  },
  getDistribution: () => {
    return axiosInstance.get('/masters/distribution');
  },
  refreshDistribution: () => {
    return axiosInstance.post('/masters/distribution/refresh');
  },
  getLineage: () => {
    return axiosInstance.get('/masters/lineage');
  }
};


