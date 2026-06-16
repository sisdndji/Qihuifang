import axiosInstance from './axiosInstance';

export const commentsAPI = {
  getAll: (params) => {
    return axiosInstance.get('/comments', { params });
  },
  create: (data) => {
    return axiosInstance.post('/comments', data);
  },
  delete: (id) => {
    return axiosInstance.delete(`/comments/${id}`);
  }
};

