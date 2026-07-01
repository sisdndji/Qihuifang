require('dotenv').config();
const path = require('path');

const frontendDistPath = process.env.FRONTEND_DIST
  ? path.resolve(process.env.FRONTEND_DIST)
  : path.resolve(__dirname, '../frontend/dist');

module.exports = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'heritage-lacquer-museum-secret-key-2024',
  jwtExpiresIn: '7d',
  dbPath: process.env.DB_PATH || './heritage.db',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  /** 后端公网地址（不含 /api），用于返回上传文件的完整 URL */
  publicBaseUrl: (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, ''),
  frontendUrl: process.env.FRONTEND_URL || '',
  /** 云服务器单进程部署：托管 frontend/dist，/api 与页面同源，避免 Nginx 未代理导致 404 */
  frontendDistPath,
  serveFrontend: process.env.SERVE_FRONTEND !== 'false',
  platformStats: {
    userBase: parseInt(process.env.PLATFORM_USER_BASE, 10) || 1560,
    pageViewBase: parseInt(process.env.PLATFORM_PAGEVIEW_BASE, 10) || 246000
  },
  // 大语言模型 API（OpenAI 兼容格式，如 DeepSeek / OpenAI / 通义等）
  llm: {
    apiKey: process.env.LLM_API_KEY || 'sk-5c891350d6ce453ab1fc1f2b41fa9eef',
    baseUrl: (process.env.LLM_API_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, ''),
    model: process.env.LLM_MODEL || 'deepseek-chat',
    timeout: parseInt(process.env.LLM_TIMEOUT, 10) || 60000,
    // 本地 Ollama 已暂停，仅当显式设为 true 时才启用
    useOllama: process.env.LLM_USE_OLLAMA === 'true',
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    ollamaModel: process.env.OLLAMA_MODEL || 'deepseek-r1:8b'
  }
};


