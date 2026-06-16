import axiosInstance from './axiosInstance';

export const heritageAPI = {
  getAll: (params) => {
    return axiosInstance.get('/heritage', { params });
  },
  getById: (id) => {
    return axiosInstance.get(`/heritage/${id}`);
  },
  create: (data) => {
    return axiosInstance.post('/heritage', data);
  },
  update: (id, data) => {
    return axiosInstance.put(`/heritage/${id}`, data);
  },
  delete: (id) => {
    return axiosInstance.delete(`/heritage/${id}`);
  },
  getRisk: () => {
    return axiosInstance.get('/heritage/risk');
  }
};


