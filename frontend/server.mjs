/**
 * 生产环境静态服务 + API 反向代理
 * Railway 前端服务只需设置 BACKEND_URL，无需在构建时注入 VITE_API_BASE_URL
 */
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4173;
const BACKEND_URL = (
  process.env.BACKEND_URL
  || process.env.VITE_API_ORIGIN
  || process.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '')
  || 'http://localhost:3001'
).replace(/\/$/, '');

const app = express();

app.get('/app-config.json', (_req, res) => {
  res.json({
    apiBaseUrl: '/api',
    apiOrigin: BACKEND_URL
  });
});

const proxyOptions = {
  target: BACKEND_URL,
  changeOrigin: true,
  onError(err, _req, res) {
    console.error('[proxy]', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: '后端服务暂不可用' });
    }
  }
};

app.use('/api', createProxyMiddleware(proxyOptions));
app.use('/uploads', createProxyMiddleware(proxyOptions));

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath, { index: false }));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`前端运行于端口 ${PORT}，API 代理至 ${BACKEND_URL}`);
});
