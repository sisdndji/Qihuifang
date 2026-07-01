#!/usr/bin/env bash
# 云服务器一键部署（单进程：页面 + API 同源，解决 /api 404）
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> 安装依赖..."
npm install --prefix backend
npm install --prefix frontend

echo "==> 构建前端..."
npm run build --prefix frontend

echo "==> 启动后端（托管 dist + API）..."
echo "    请确保 backend/.env 已配置 PUBLIC_BASE_URL 等变量"
echo "    生产环境建议: pm2 start backend/server.js --name heritage"
exec npm start --prefix backend
