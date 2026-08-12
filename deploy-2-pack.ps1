# 第 2 步: 打包产物（不含 node_modules、data、.env）
Write-Host "===== 打包前端 =====" -ForegroundColor Cyan
cd e:\data\blog-test
tar -czf frontend-deploy.tar.gz -C frontend .next package.json package-lock.json next.config.mjs public

Write-Host "===== 打包后端 =====" -ForegroundColor Cyan
tar -czf backend-deploy.tar.gz -C backend dist package.json package-lock.json

Write-Host "`n===== 打包完成 =====" -ForegroundColor Green
Write-Host "  frontend-deploy.tar.gz" -ForegroundColor Yellow
Write-Host "  backend-deploy.tar.gz"  -ForegroundColor Yellow
