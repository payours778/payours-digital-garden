# 第 3 步: 上传到服务器（SSH 密钥免密）
$SERVER = "root@120.77.201.34"
$REMOTE = "/var/www/blog/"

Write-Host "===== 上传打包文件 =====" -ForegroundColor Cyan
scp frontend-deploy.tar.gz backend-deploy.tar.gz ${SERVER}:${REMOTE}
scp deploy-4-server.sh ${SERVER}:${REMOTE}

Write-Host "`n===== 上传完成 =====" -ForegroundColor Green
Write-Host "  接下来执行: ssh root@120.77.201.34 'bash /var/www/blog/deploy-4-server.sh'" -ForegroundColor Yellow
