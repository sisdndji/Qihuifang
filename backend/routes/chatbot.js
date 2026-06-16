const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config/config');

const { llm } = config;

const SYSTEM_PROMPT = `你是小毛，一个专门解答关于"国漆髹涂技艺"非遗文化的AI助手。你的任务是：

1. 回答用户关于国漆髹涂技艺、36道工序、传承人、作品等相关问题
2. 提供准确、专业、友好的回答
3. 如果遇到不确定的问题，可以引导用户查看网站相关页面

重要知识库：
- 国漆髹涂技艺是中华传统工艺的瑰宝，以天然大漆为原料，经过三十六道精细工序
- 李囡是省级非物质文化遗产"国漆髹涂技艺"代表性传承人，黑龙江省哈尔滨市人
- 代表作品：《尔滨的雪》（2025年亚冬会官方礼物）、"叠彩漆艺"技法（国家专利认证）、《青铜盾牌》
- 刘浩亮是哈尔滨理工大学学生，负责"漆创兴龙"项目，参与漆艺传承工作

请用友好、专业的语气回答用户问题，尽量提供详细准确的信息。`;

function normalizeHistoryRole(role) {
  if (role === 'bot') return 'assistant';
  if (role === 'user') return 'user';
  return role === 'assistant' ? 'assistant' : 'user';
}

/**
 * 调用 OpenAI 兼容 API（DeepSeek / OpenAI / 通义等）
 */
async function callLlmApi(messages) {
  if (!llm.apiKey) {
    const err = new Error('未配置 LLM_API_KEY');
    err.code = 'LLM_NOT_CONFIGURED';
    throw err;
  }

  const url = `${llm.baseUrl}/v1/chat/completions`;
  const response = await axios.post(
    url,
    {
      model: llm.model,
      messages,
      stream: false,
      temperature: 0.7
    },
    {
      timeout: llm.timeout,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${llm.apiKey}`
      }
    }
  );

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('API 返回内容为空');
  }

  return {
    message: content.trim(),
    model: response.data?.model || llm.model,
    provider: 'api'
  };
}

/**
 * 调用本地 Ollama（默认关闭，需 LLM_USE_OLLAMA=true）
 */
async function callOllamaApi(messages) {
  const response = await axios.post(
    `${llm.ollamaBaseUrl}/api/chat`,
    {
      model: llm.ollamaModel,
      messages,
      stream: false
    },
    {
      timeout: llm.timeout,
      headers: { 'Content-Type': 'application/json' }
    }
  );

  const content = response.data.message?.content;
  if (!content) {
    throw new Error('Ollama 返回内容为空');
  }

  return {
    message: content.trim(),
    model: llm.ollamaModel,
    provider: 'ollama'
  };
}

/**
 * POST /api/chatbot/chat
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map((msg) => ({
        role: normalizeHistoryRole(msg.role),
        content: msg.content
      })),
      { role: 'user', content: message.trim() }
    ];

    let result;
    if (llm.useOllama) {
      result = await callOllamaApi(messages);
    } else {
      result = await callLlmApi(messages);
    }

    res.json({
      success: true,
      message: result.message,
      model: result.model,
      provider: result.provider
    });
  } catch (error) {
    console.error('LLM API 调用失败:', error.message);

    if (error.code === 'LLM_NOT_CONFIGURED') {
      return res.status(503).json({
        error: 'AI 服务未配置',
        message: '请在 backend/.env 中配置 LLM_API_KEY 等参数',
        code: 'LLM_NOT_CONFIGURED'
      });
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        error: 'AI 服务连接失败',
        message: llm.useOllama
          ? '无法连接到 Ollama 服务'
          : '无法连接到大语言模型 API，请检查网络与 API 地址',
        details: error.message
      });
    }

    if (error.response) {
      const apiError = error.response.data?.error;
      return res.status(error.response.status || 500).json({
        error: 'AI 服务错误',
        message: apiError?.message || apiError || '模型处理失败',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: '服务器内部错误',
      message: error.message || '处理请求时发生未知错误'
    });
  }
});

/**
 * GET /api/chatbot/models
 */
router.get('/models', async (req, res) => {
  if (llm.useOllama) {
    try {
      const response = await axios.get(`${llm.ollamaBaseUrl}/api/tags`, { timeout: 10000 });
      const models = response.data.models || [];
      return res.json({
        success: true,
        provider: 'ollama',
        models: models.map((m) => ({ name: m.name, size: m.size, modified_at: m.modified_at }))
      });
    } catch (error) {
      return res.status(503).json({ error: '无法连接到 Ollama 服务', message: error.message });
    }
  }

  res.json({
    success: true,
    provider: 'api',
    models: [{ name: llm.model, configured: true }],
    baseUrl: llm.baseUrl
  });
});

/**
 * GET /api/chatbot/health
 */
router.get('/health', async (req, res) => {
  if (llm.useOllama) {
    try {
      await axios.get(`${llm.ollamaBaseUrl}/api/tags`, { timeout: 5000 });
      return res.json({
        success: true,
        status: 'connected',
        provider: 'ollama',
        baseUrl: llm.ollamaBaseUrl,
        model: llm.ollamaModel
      });
    } catch (error) {
      return res.status(503).json({
        success: false,
        status: 'disconnected',
        provider: 'ollama',
        error: error.message
      });
    }
  }

  const configured = Boolean(llm.apiKey);
  res.json({
    success: configured,
    status: configured ? 'configured' : 'not_configured',
    provider: 'api',
    baseUrl: llm.baseUrl,
    model: llm.model,
    ollamaEnabled: false
  });
});

module.exports = router;
