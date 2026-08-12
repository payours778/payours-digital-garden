# 第 1 步: 本地构建前端 + 后端
Write-Host "===== 构建前端 =====" -ForegroundColor Cyan
cd e:\data\blog-test\frontend
npm install
npm run build

Write-Host "`n===== 构建后端 =====" -ForegroundColor Cyan
cd e:\data\blog-test\backend
npm install
npm run build

Write-Host "`n===== 构建完成 =====" -ForegroundColor Green
