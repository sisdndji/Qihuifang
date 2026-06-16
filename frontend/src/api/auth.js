import axiosInstance from './axiosInstance';

export const authAPI = {
  login: (username, password) => {
    return axiosInstance.post('/auth/login', { username, password });
  }
};


