# 国漆髹涂技艺非遗数字馆 - 后端服务

## 技术栈

- Node.js v16
- Express
- SQLite3
- bcrypt (密码加密)
- jsonwebtoken (JWT认证)
- multer (文件上传)
- cors (跨域支持)
- nodemon (开发环境自动重启)

## 安装依赖

```bash
cd backend
npm install
```

## 运行项目

### 开发环境

```bash
npm run dev
```

开发环境使用 nodemon，代码修改后会自动重启服务器。

### 生产环境

```bash
npm start
```

## 数据库

项目使用 SQLite 数据库，数据库文件为 `heritage.db`。

首次运行时会自动：
1. 创建所有数据表
2. 插入初始 seed 数据（包括管理员用户、非遗项目、36道工序、传承人、作品等）

### 默认管理员账号

- 用户名: `admin`
- 密码: `Admin@123`

## API 接口

### 认证相关

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册

### 非遗项目

- `GET /api/heritage` - 获取非遗项目列表（支持筛选）
- `GET /api/heritage/:id` - 获取项目详情
- `POST /api/heritage` - 创建项目（需管理员权限）
- `PUT /api/heritage/:id` - 更新项目（需管理员权限）
- `DELETE /api/heritage/:id` - 删除项目（需管理员权限）
- `GET /api/heritage/risk` - 获取技艺风险指标

### 工序

- `GET /api/process-steps` - 获取工序列表
- `GET /api/process-steps/stats` - 获取工序统计
- `POST /api/process-steps/simulate` - 工序路径模拟

### 传承人

- `GET /api/masters` - 获取传承人列表（支持筛选）
- `GET /api/masters/:id` - 获取传承人详情
- `POST /api/masters` - 创建传承人（需管理员权限）
- `PUT /api/masters/:id` - 更新传承人（需管理员权限）
- `DELETE /api/masters/:id` - 删除传承人（需管理员权限）
- `GET /api/masters/stats` - 获取传承人统计
- `GET /api/masters/lineage` - 获取传承谱系关系

### 作品

- `GET /api/works` - 获取作品列表（支持筛选）
- `GET /api/works/stats` - 获取作品统计
- `POST /api/works` - 创建作品（需管理员权限）
- `PUT /api/works/:id` - 更新作品（需管理员权限）
- `DELETE /api/works/:id` - 删除作品（需管理员权限）

### 文件上传

- `POST /api/upload` - 上传文件（需管理员权限）

## 配置

配置文件位于 `config/config.js`，可以设置：

- 端口号（默认 3001）
- JWT 密钥
- 数据库路径
- 上传目录

## 项目结构

```
backend/
├── server.js              # 服务器入口
├── db.js                  # 数据库连接
├── config/
│   └── config.js          # 配置文件
├── middleware/
│   ├── auth.js            # 认证中间件
│   └── errorHandler.js    # 错误处理中间件
├── models/
│   └── initDb.js          # 数据库初始化
├── routes/
│   ├── auth.js            # 认证路由
│   ├── heritage.js        # 非遗项目路由
│   ├── processSteps.js    # 工序路由
│   ├── masters.js         # 传承人路由
│   ├── works.js           # 作品路由
│   └── upload.js          # 上传路由
├── uploads/               # 上传文件目录
└── package.json
```


