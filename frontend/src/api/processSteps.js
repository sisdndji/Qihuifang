import axiosInstance from './axiosInstance';

export const processStepsAPI = {
  getAll: (params) => {
    return axiosInstance.get('/process-steps', { params });
  },
  getStats: () => {
    return axiosInstance.get('/process-steps/stats');
  },
  simulate: (data) => {
    return axiosInstance.post('/process-steps/simulate', data);
  }
};


