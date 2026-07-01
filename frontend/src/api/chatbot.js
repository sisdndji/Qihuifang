import axiosInstance from './axiosInstance';

/**
 * 发送消息给 AI 助手（后端转发至云端 LLM API）
 */
export const sendChatMessage = async (message, history = []) => {
  try {
    const response = await axiosInstance.post(
      '/chatbot/chat',
      { message, history },
      { timeout: 120000 }
    );
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
  const response = await axiosInstance.get('/chatbot/models', { timeout: 10000 });
  return response.data;
};

/**
 * 检查 AI 服务状态
 */
export const checkHealth = async () => {
  const response = await axiosInstance.get('/chatbot/health', { timeout: 5000 });
  return response.data;
};
