#!/bin/bash

# ========================================
# 博客自动更新脚本 (Ubuntu)
# 使用方式: ./deploy.sh
# ========================================

# 配置项
PROJECT_DIR="/var/www/blog/blog-test"
APP_NAME="blog"

echo "========================================"
echo "          开始更新博客..."
echo "========================================"

# 进入项目目录
cd $PROJECT_DIR || { echo "❌ 目录不存在: $PROJECT_DIR"; exit 1; }

# 1. 拉取最新代码
echo ""
echo "1. 拉取最新代码..."
git pull origin master

if [ $? -eq 0 ]; then
    echo "   ✓ 代码拉取成功"
else
    echo "   ✗ 代码拉取失败"
    exit 1
fi

# 2. 构建项目
echo ""
echo "2. 构建项目..."
npm run build

if [ $? -eq 0 ]; then
    echo "   ✓ 项目构建成功"
else
    echo "   ✗ 项目构建失败"
    exit 1
fi

# 3. 重启 PM2 服务
echo ""
echo "3. 重启服务..."
pm2 restart $APP_NAME

if [ $? -eq 0 ]; then
    echo "   ✓ 服务重启成功"
else
    echo "   ✗ 服务重启失败"
fi

# 4. 显示状态
echo ""
echo "4. 服务状态:"
pm2 status $APP_NAME

echo ""
echo "========================================"
echo "          更新完成！"
echo "========================================"
echo "访问地址: http://120.77.201.34"