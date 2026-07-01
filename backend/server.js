const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { initDb } = require('./models/initDb');
const errorHandler = require('./middleware/errorHandler');
const config = require('./config/config');

// 导入路由
const authRoutes = require('./routes/auth');
const heritageRoutes = require('./routes/heritage');
const processStepsRoutes = require('./routes/processSteps');
const mastersRoutes = require('./routes/masters');
const worksRoutes = require('./routes/works');
const uploadRoutes = require('./routes/upload');
const chatbotRoutes = require('./routes/chatbot');
const platformRoutes = require('./routes/platform');

const app = express();

// CORS：生产环境可设置 FRONTEND_URL 限制来源
const corsOptions = config.frontendUrl
  ? { origin: [config.frontendUrl], credentials: true }
  : undefined;
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（用于上传的图片）
const uploadStaticDir = path.isAbsolute(config.uploadDir)
  ? config.uploadDir
  : path.resolve(__dirname, config.uploadDir.replace(/^\.\//, ''));
app.use('/uploads', express.static(uploadStaticDir));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/heritage', heritageRoutes);
app.use('/api/process-steps', processStepsRoutes);
app.use('/api/masters', mastersRoutes);
app.use('/api/works', worksRoutes);
app.use('/api/comments', require('./routes/comments'));
app.use('/api/upload', uploadRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/platform', platformRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务运行正常' });
});

// 未匹配的 API 路由返回 JSON 404（避免被 SPA fallback 吞掉）
app.use('/api', (req, res) => {
  res.status(404).json({ error: `接口不存在: ${req.method} ${req.originalUrl}` });
});

// 生产环境：托管前端静态资源（云服务器单进程部署，/api 与页面同源）
const frontendIndex = path.join(config.frontendDistPath, 'index.html');
const canServeFrontend = config.serveFrontend && fs.existsSync(frontendIndex);

if (canServeFrontend) {
  app.get('/app-config.json', (req, res) => {
    const apiOrigin = config.publicBaseUrl
      || `${req.protocol}://${req.get('host')}`;
    res.json({ apiBaseUrl: '/api', apiOrigin });
  });

  app.use(express.static(config.frontendDistPath, { index: false }));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(frontendIndex);
  });

  console.log(`✓ 前端静态资源: ${config.frontendDistPath}`);
} else if (process.env.NODE_ENV === 'production') {
  console.warn(
    '⚠ 未找到 frontend/dist，仅提供 API。云服务器请执行: cd frontend && npm run build'
  );
}

// 错误处理中间件
app.use(errorHandler);

// 初始化数据库并启动服务器
const startServer = async () => {
  try {
    await initDb();
    
    const server = app.listen(config.port, () => {
      console.log(`服务器运行在 http://localhost:${config.port}`);
      console.log(`API 基础路径: http://localhost:${config.port}/api`);
      if (canServeFrontend) {
        console.log('部署模式: 单进程（页面 + API 同源，适用于云服务器 + Nginx 反代）');
      }
    });

    // 处理端口占用错误
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error('\n❌ 错误: 端口', config.port, '已被占用');
        console.error('\n解决方案:');
        console.error('1. 运行 "停止服务.bat" 停止所有服务');
        console.error('2. 或者手动停止占用端口的进程:');
        console.error('   Windows: netstat -ano | findstr :' + config.port);
        console.error('   然后: taskkill /PID <进程ID> /F');
        console.error('\n3. 或者修改 backend/config/config.js 中的端口号\n');
        process.exit(1);
      } else {
        console.error('服务器启动失败:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();


