# 国漆髹涂技艺 · 非遗数字馆

一个完整的非遗文化数字展示平台，包含前端展示系统和后端管理系统。

## 技术栈

### 后端
- Node.js v16
- Express
- SQLite3
- bcrypt (密码加密)
- jsonwebtoken (JWT认证)
- multer (文件上传)
- cors (跨域支持)

### 前端
- Vue 3 + Vite
- Composition API (`<script setup>`)
- Vue Router
- Pinia
- Axios
- Element Plus
- SCSS
- ECharts (数据可视化大屏)

## 项目结构

```
heritage-lacquer-museum/
├── backend/          # 后端服务
│   ├── server.js     # 服务器入口
│   ├── db.js         # 数据库连接
│   ├── config/       # 配置文件
│   ├── middleware/   # 中间件
│   ├── models/       # 数据模型
│   ├── routes/       # 路由
│   └── uploads/      # 上传文件目录
└── frontend/         # 前端应用
    ├── src/
    │   ├── api/      # API封装
    │   ├── components/  # 组件
    │   ├── router/  # 路由配置
    │   ├── store/    # 状态管理
    │   ├── styles/  # 样式文件
    │   └── views/   # 页面视图
    └── vite.config.js
```

## 快速开始

### 1. 安装后端依赖

```bash
cd backend
npm install
```

### 2. 启动后端服务

```bash
npm run dev
```

后端服务将在 `http://localhost:3000` 启动。

首次运行时会自动创建数据库并插入初始数据（包括管理员账号、非遗项目、36道工序、传承人、作品等）。

### 3. 安装前端依赖

```bash
cd frontend
npm install
```

### 4. 启动前端开发服务器

```bash
npm run dev
```

前端应用将在 `http://localhost:5173` 启动。

## 默认账号

- 用户名: `admin`
- 密码: `Admin@123`

## 功能特性

### 前端功能
- ✅ 用户登录认证
- ✅ 首页展示（Hero Banner、精选项目、匠人推荐、工艺预览）
- ✅ 非遗项目列表与详情（支持筛选）
- ✅ 传承人展示（支持地区、技能标签筛选）
- ✅ 数据可视化大屏（ECharts）
  - 工序难度与耗时分析
  - 工艺流程桑基图
  - 技艺传承风险雷达图
  - 传承人地区分布
  - 历年作品数量趋势
  - 技能标签分布
- ✅ 管理后台（CRUD操作、图片上传）

### 后端功能
- ✅ JWT认证系统
- ✅ 非遗项目管理
- ✅ 36道工序管理
- ✅ 传承人管理
- ✅ 作品管理
- ✅ 数据统计API
- ✅ 文件上传功能

## 数据库

项目使用 SQLite 数据库，数据库文件为 `backend/heritage.db`。

### 数据表
- `users` - 用户表
- `heritage_items` - 非遗项目表
- `process_steps` - 工序表（36道工序）
- `masters` - 传承人表
- `works` - 作品表

## API 接口

### 认证
- `POST /api/auth/login` - 用户登录

### 非遗项目
- `GET /api/heritage` - 获取项目列表
- `GET /api/heritage/:id` - 获取项目详情
- `GET /api/heritage/risk` - 获取风险指标
- `POST /api/heritage` - 创建项目（需管理员）
- `PUT /api/heritage/:id` - 更新项目（需管理员）
- `DELETE /api/heritage/:id` - 删除项目（需管理员）

### 工序
- `GET /api/process-steps` - 获取工序列表
- `GET /api/process-steps/stats` - 获取工序统计
- `POST /api/process-steps/simulate` - 工序路径模拟

### 传承人
- `GET /api/masters` - 获取传承人列表
- `GET /api/masters/:id` - 获取传承人详情
- `GET /api/masters/stats` - 获取传承人统计
- `GET /api/masters/lineage` - 获取传承谱系关系

### 作品
- `GET /api/works` - 获取作品列表
- `GET /api/works/stats` - 获取作品统计

### 文件上传
- `POST /api/upload` - 上传文件（需管理员）

### AI助手（Ollama）
- `POST /api/chatbot/chat` - 发送消息给AI助手
- `GET /api/chatbot/models` - 获取可用的Ollama模型列表
- `GET /api/chatbot/health` - 检查Ollama服务健康状态

## 主题色彩

项目采用国漆髹涂主题色彩：
- 朱砂漆红: `#A3262A`
- 深栗漆棕: `#4A2A20`
- 金箔线金: `#D8B877`
- 木胎原色: `#D7C0A5`
- 宣纸米白: `#F6F1E7`

## 开发说明

### 后端开发
- 使用 `nodemon` 实现热重载
- 配置文件位于 `backend/config/config.js`
- 数据库初始化在 `backend/models/initDb.js`

### 前端开发
- 使用 Vite 作为构建工具
- API 代理配置在 `frontend/vite.config.js`
- 样式使用 SCSS，主题变量在 `frontend/src/styles/theme.scss`

## AI助手配置（Ollama）

项目集成了Ollama本地大语言模型，为AI助手提供智能对话能力。

### 安装Ollama

1. 访问 [Ollama官网](https://ollama.ai/) 下载并安装Ollama
2. 启动Ollama服务（默认运行在 `http://localhost:11434`）

### 下载模型

推荐使用支持中文的模型，例如：

```bash
# 下载deepseek-r1:8b模型（推荐，中文支持好，推理能力强）
ollama pull deepseek-r1:8b

# 或下载其他模型
ollama pull qwen2.5:latest
ollama pull llama2:latest
ollama pull mistral:latest
```

### 配置模型

在 `backend` 目录下创建或修改 `.env` 文件：

```env
# Ollama配置（可选，有默认值）
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:8b
```

如果不配置，系统默认使用：
- Ollama地址：`http://localhost:11434`
- 模型名称：`deepseek-r1:8b`

### 使用说明

1. **启动Ollama服务**：确保Ollama服务正在运行
2. **启动后端服务**：`cd backend && npm run dev`
3. **启动前端服务**：`cd frontend && npm run dev`
4. **使用AI助手**：在网站右下角点击AI助手图标，开始对话

### 功能特性

- ✅ 智能对话：基于Ollama大语言模型，提供自然流畅的对话体验
- ✅ 知识库增强：系统提示词包含国漆髹涂技艺相关知识
- ✅ 自动降级：如果Ollama服务不可用，自动切换到本地关键词匹配模式
- ✅ 对话历史：支持上下文对话，保留最近10条消息历史

### 故障排除

**问题：AI助手提示"Ollama服务不可用"**

解决方案：
1. 检查Ollama服务是否运行：访问 `http://localhost:11434/api/tags`
2. 确认模型已下载：运行 `ollama list` 查看已安装的模型
3. 检查后端日志：查看是否有连接错误
4. 如果Ollama未安装，AI助手会自动使用本地知识库模式

**问题：AI回复速度慢**

解决方案：
1. 使用更小的模型（如 `deepseek-r1:7b` 而不是 `deepseek-r1:8b`）
2. 检查系统资源（CPU/内存）是否充足
3. 考虑使用GPU加速（如果支持）

## 注意事项

1. 首次运行后端时，会自动创建数据库和初始数据
2. 上传的图片保存在 `backend/uploads/` 目录
3. JWT token 有效期为 7 天
4. 管理后台需要管理员权限才能访问
5. AI助手需要Ollama服务支持，如果未安装Ollama，将自动使用本地知识库模式

## 许可证

本项目仅供学习与展示用途。


