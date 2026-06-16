import axiosInstance from './axiosInstance';

export const statsAPI = {
  getWorksStats: () => {
    return axiosInstance.get('/works/stats');
  }
};


