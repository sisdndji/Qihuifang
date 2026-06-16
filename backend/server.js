const express = require('express');
const cors = require('cors');
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

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（用于上传的图片）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// 错误处理中间件
app.use(errorHandler);

// 初始化数据库并启动服务器
const startServer = async () => {
  try {
    await initDb();
    
    const server = app.listen(config.port, () => {
      console.log(`服务器运行在 http://localhost:${config.port}`);
      console.log(`API 基础路径: http://localhost:${config.port}/api`);
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


