#!/bin/bash
# 第 4 步: 服务器上执行（解压 + 装依赖 + 重启）
# 用法: ssh root@120.77.201.34 'bash /var/www/blog/deploy-4-server.sh'
# 或:   先 scp 上去再 ssh 执行

set -e
cd /var/www/blog

echo "===== 解压前端 ====="
rm -rf frontend/.next
tar -xzf frontend-deploy.tar.gz -C frontend

echo "===== 解压后端 ====="
rm -rf backend/dist
tar -xzf backend-deploy.tar.gz -C backend

echo "===== 安装前端依赖 ====="
cd frontend && npm install --omit=dev && cd ..

echo "===== 安装后端依赖 ====="
cd backend && npm install --omit=dev && cd ..

echo "===== 重启服务 ====="
if pm2 list | grep -q blog-frontend; then
  pm2 restart blog-frontend blog-backend
  echo "pm2 进程已重启"
else
  echo "未检测到 pm2 进程，首次部署中..."
  npm i -g pm2
  pm2 start "npm --prefix /var/www/blog/frontend start" --name blog-frontend
  pm2 start "npm --prefix /var/www/blog/backend start" --name blog-backend
  pm2 save
  pm2 startup
  echo "pm2 首次配置完成"
fi

echo "===== 部署完成 ====="
