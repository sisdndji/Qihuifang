import axiosInstance from './axiosInstance';

export const platformAPI = {
  getStats: () => {
    return axiosInstance.get('/platform/stats');
  },
  trackVisit: () => {
    return axiosInstance.post('/platform/visit');
  }
};
