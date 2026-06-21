import axios from 'axios';
import { useAuthStore } from '../store/auth';
import router from '../router';
import { API_BASE_URL } from '../config/api';

const chatbotAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json'
  }
});

chatbotAxios.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

chatbotAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      const isAdminArea = router.currentRoute.value.path.startsWith('/admin');
      router.push(isAdminArea ? '/admin/login' : '/login');
    }
    return Promise.reject(error);
  }
);

/**
 * 发送消息给 AI 助手（后端转发至云端 LLM API）
 */
export const sendChatMessage = async (message, history = []) => {
  try {
    const response = await chatbotAxios.post('/chatbot/chat', { message, history });
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('请求超时，AI 响应时间过长，请稍后重试。');
    }
    throw error;
  }
};

/**
 * 获取当前配置的模型信息
 */
export const getModels = async () => {
  const response = await chatbotAxios.get('/chatbot/models', { timeout: 10000 });
  return response.data;
};

/**
 * 检查 AI 服务状态
 */
export const checkHealth = async () => {
  const response = await chatbotAxios.get('/chatbot/health', { timeout: 5000 });
  return response.data;
};
