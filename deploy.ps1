# ============================================================
#  一键部署脚本 - Digital Garden
#  用法: .\deploy.ps1
# ============================================================

$SERVER = "root@120.77.201.34"
$REMOTE = "/var/www/blog/"
$ROOT   = "e:\data\blog-test"

# ---- 颜色定义 ----
$C_TITLE  = "Magenta"
$C_STEP   = "Cyan"
$C_OK     = "Green"
$C_WARN   = "Yellow"
$C_ERR    = "Red"
$C_DIM    = "DarkGray"

# ---- 进度条函数 ----
function Show-Progress($step, $total, $label) {
    $barLen = 30
    $filled = [math]::Floor($barLen * $step / $total)
    $empty  = $barLen - $filled
    $bar = ("#" * $filled) + ("-" * $empty)
    $pct = [math]::Floor(100 * $step / $total)
    Write-Host ""
    Write-Host "  [$bar] $pct%  ($step/$total)" -ForegroundColor $C_DIM
    Write-Host "  >>> $label" -ForegroundColor $C_STEP
    Write-Host ""
}

# ---- 错误处理 ----
function Stop-OnError($msg) {
    Write-Host ""
    Write-Host "  [X] $msg" -ForegroundColor $C_ERR
    Write-Host ""
    exit 1
}

# ============================================================
#  开始
# ============================================================

$totalSteps = 4
$startTime = Get-Date

Write-Host ""
Write-Host "  ============================================" -ForegroundColor $C_TITLE
Write-Host "       Digital Garden - Yi Jian Bu Shu" -ForegroundColor $C_TITLE
Write-Host "  ============================================" -ForegroundColor $C_TITLE
Write-Host "  Server: $SERVER" -ForegroundColor $C_DIM
Write-Host "  Remote: $REMOTE" -ForegroundColor $C_DIM
Write-Host "  Start:  $($startTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor $C_DIM
Write-Host ""

# ============================================================
#  Step 1/4 - Ben Di Gou Jian
# ============================================================
Show-Progress 1 $totalSteps "Build (frontend + backend)"

Write-Host "  [1/4] Build frontend..." -ForegroundColor $C_STEP
cd $ROOT\frontend
npm install 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor $C_DIM }
if ($LASTEXITCODE -ne 0) { Stop-OnError "frontend npm install failed" }
npm run build 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor $C_DIM }
if ($LASTEXITCODE -ne 0) { Stop-OnError "frontend build failed" }
Write-Host "  [OK] frontend build done" -ForegroundColor $C_OK

Write-Host ""
Write-Host "  [1/4] Build backend..." -ForegroundColor $C_STEP
cd $ROOT\backend
npm install 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor $C_DIM }
if ($LASTEXITCODE -ne 0) { Stop-OnError "backend npm install failed" }
npm run build 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor $C_DIM }
if ($LASTEXITCODE -ne 0) { Stop-OnError "backend build failed" }
Write-Host "  [OK] backend build done" -ForegroundColor $C_OK

# ============================================================
#  Step 2/4 - Da Bao Chan Wu
# ============================================================
Show-Progress 2 $totalSteps "Pack (tar.gz)"

cd $ROOT
Write-Host "  [2/4] Pack frontend..." -ForegroundColor $C_STEP
tar -czf frontend-deploy.tar.gz -C frontend .next package.json package-lock.json next.config.ts public
if ($LASTEXITCODE -ne 0) { Stop-OnError "frontend pack failed" }
$feSize = [math]::Round((Get-Item frontend-deploy.tar.gz).Length / 1MB, 1)
Write-Host "  [OK] frontend-deploy.tar.gz ($($feSize) MB)" -ForegroundColor $C_OK

Write-Host ""
Write-Host "  [2/4] Pack backend..." -ForegroundColor $C_STEP
tar -czf backend-deploy.tar.gz -C backend dist package.json package-lock.json
if ($LASTEXITCODE -ne 0) { Stop-OnError "backend pack failed" }
$beSize = [math]::Round((Get-Item backend-deploy.tar.gz).Length / 1MB, 1)
Write-Host "  [OK] backend-deploy.tar.gz ($($beSize) MB)" -ForegroundColor $C_OK

# ============================================================
#  Step 3/4 - Shang Chuan
# ============================================================
Show-Progress 3 $totalSteps "SCP upload"

cd $ROOT
Write-Host "  [3/4] Create remote dirs..." -ForegroundColor $C_STEP
ssh $SERVER "mkdir -p /var/www/blog/frontend /var/www/blog/backend /var/www/blog/backend/data" 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor $C_DIM }
Write-Host "  [OK] remote dirs ready" -ForegroundColor $C_OK

Write-Host ""
Write-Host "  [3/4] Upload files..." -ForegroundColor $C_STEP
scp frontend-deploy.tar.gz backend-deploy.tar.gz ${SERVER}:${REMOTE} 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor $C_DIM }
if ($LASTEXITCODE -ne 0) { Stop-OnError "upload failed, check SSH config" }
Write-Host "  [OK] 2 files uploaded to $REMOTE" -ForegroundColor $C_OK

# ============================================================
#  Step 4/4 - Fu Wu Qi Bu Shu
# ============================================================
Show-Progress 4 $totalSteps "Server deploy (extract + deps + PM2)"

Write-Host "  [4/4] Running remote deploy..." -ForegroundColor $C_STEP
Write-Host "  (running on server, output below:)" -ForegroundColor $C_DIM
Write-Host ""

$remoteScript = @'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
set -e
cd /var/www/blog

echo "===== extract frontend ====="
rm -rf frontend/.next
tar -xzf frontend-deploy.tar.gz -C frontend

echo "===== extract backend ====="
rm -rf backend/dist
tar -xzf backend-deploy.tar.gz -C backend

echo "===== install frontend deps ====="
cd frontend && npm install --omit=dev && cd ..

echo "===== install backend deps ====="
cd backend && npm install --omit=dev && cd ..

echo "===== restart services ====="
if pm2 list | grep -q blog-frontend; then
  pm2 restart blog-frontend blog-backend
  echo "pm2 restarted"
else
  echo "pm2 not found, first deploy..."
  npm i -g pm2
  pm2 start "npm --prefix /var/www/blog/frontend start" --name blog-frontend
  pm2 start "npm --prefix /var/www/blog/backend start" --name blog-backend
  pm2 save
  pm2 startup
  echo "pm2 first setup done"
fi

echo "===== deploy done ====="
'@

ssh $SERVER $remoteScript 2>&1 | ForEach-Object { Write-Host "    $_" }
if ($LASTEXITCODE -ne 0) { Stop-OnError "server deploy failed" }

# ============================================================
#  完成
# ============================================================
$endTime = Get-Date
$elapsed = ($endTime - $startTime).ToString("mm\:ss")

Write-Host ""
Write-Host "  ============================================" -ForegroundColor $C_OK
Write-Host "       Deploy Done! Time: $elapsed" -ForegroundColor $C_OK
Write-Host "  ============================================" -ForegroundColor $C_OK
Write-Host ""
Write-Host "  >> https://payours.me" -ForegroundColor $C_WARN
Write-Host ""
