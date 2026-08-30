# ============================================================
#  一键部署脚本 - Digital Garden
#  用法: .\deploy.ps1
# ============================================================

param(
    [string]$Server = "root@database.payours.me",
    [string]$Remote = "/var/www/blog"
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

$SERVER = $Server
$REMOTE = $Remote.TrimEnd('/')
$ROOT   = $PSScriptRoot

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
    throw $msg
}

# ---- 清理本地部署包（无论成功失败都会执行）----
function Cleanup-Packages {
    Write-Host ""
    Write-Host "  [Cleanup] Removing local packages..." -ForegroundColor $C_STEP
    $cleaned = 0
    foreach ($pkg in @("frontend-deploy.tar.gz", "backend-deploy.tar.gz")) {
        $pkgPath = Join-Path $ROOT $pkg
        if (Test-Path $pkgPath) {
            Remove-Item $pkgPath -Force -ErrorAction SilentlyContinue
            if (-not (Test-Path $pkgPath)) {
                Write-Host "    - $pkg" -ForegroundColor $C_DIM
                $cleaned++
            }
        }
    }
    if ($cleaned -gt 0) {
        Write-Host "  [OK] Removed $cleaned package(s)" -ForegroundColor $C_OK
    } else {
        Write-Host "  [OK] No packages to clean" -ForegroundColor $C_DIM
    }
}

# ============================================================
#  开始
# ============================================================

$totalSteps = 4
$startTime = Get-Date

try {
Write-Host ""
Write-Host "  ============================================" -ForegroundColor $C_TITLE
Write-Host "       Digital Garden - Yi Jian Bu Shu" -ForegroundColor $C_TITLE
Write-Host "  ============================================" -ForegroundColor $C_TITLE
Write-Host "  Server: $SERVER" -ForegroundColor $C_DIM
Write-Host "  Remote: $REMOTE" -ForegroundColor $C_DIM
Write-Host "  Start:  $($startTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor $C_DIM
Write-Host ""

# ---- 本地环境预检 ----
foreach ($command in @("npm", "tar", "ssh", "scp")) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        Stop-OnError "required command not found: $command"
    }
}
foreach ($lockFile in @("frontend\package-lock.json", "backend\package-lock.json")) {
    if (-not (Test-Path (Join-Path $ROOT $lockFile))) {
        Stop-OnError "$lockFile not found"
    }
}

# ============================================================
#  Step 1/4 - Ben Di Gou Jian
# ============================================================
Show-Progress 1 $totalSteps "Build (frontend + backend)"

Write-Host "  [1/4] Build frontend..." -ForegroundColor $C_STEP
Set-Location (Join-Path $ROOT "frontend")
npm ci 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor $C_DIM }
if ($LASTEXITCODE -ne 0) { Stop-OnError "frontend npm ci failed" }
npm run build 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor $C_DIM }
if ($LASTEXITCODE -ne 0) { Stop-OnError "frontend build failed" }
Write-Host "  [OK] frontend build done" -ForegroundColor $C_OK

Write-Host ""
Write-Host "  [1/4] Build backend..." -ForegroundColor $C_STEP
Set-Location (Join-Path $ROOT "backend")
npm ci 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor $C_DIM }
if ($LASTEXITCODE -ne 0) { Stop-OnError "backend npm ci failed" }
npm run build 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor $C_DIM }
if ($LASTEXITCODE -ne 0) { Stop-OnError "backend build failed" }
Write-Host "  [OK] backend build done" -ForegroundColor $C_OK

# ============================================================
#  Step 2/4 - Da Bao Chan Wu
# ============================================================
Show-Progress 2 $totalSteps "Pack (tar.gz)"

Set-Location $ROOT
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
#  Step 3/4 - SCP upload (+ first-deploy DB bootstrap)
# ============================================================
Show-Progress 3 $totalSteps "SCP upload"

Set-Location $ROOT
Write-Host "  [3/4] Create remote dirs..." -ForegroundColor $C_STEP
ssh $SERVER "mkdir -p '$REMOTE/frontend' '$REMOTE/backend'" 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor $C_DIM }
if ($LASTEXITCODE -ne 0) { Stop-OnError "failed to create remote directories" }
Write-Host "  [OK] remote dirs ready" -ForegroundColor $C_OK

Write-Host ""
Write-Host "  [3/4] Upload packages..." -ForegroundColor $C_STEP
scp frontend-deploy.tar.gz backend-deploy.tar.gz "${SERVER}:${REMOTE}/" 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor $C_DIM }
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
set -Eeuo pipefail
cd '__REMOTE__'

command -v node >/dev/null 2>&1 || { echo "ERROR: node not found"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "ERROR: npm not found"; exit 1; }

echo "===== extract frontend ====="
rm -rf frontend/.next
tar -xzf frontend-deploy.tar.gz -C frontend

echo "===== extract backend ====="
rm -rf backend/dist
tar -xzf backend-deploy.tar.gz -C backend

echo "===== install frontend deps ====="
cd frontend && npm ci --omit=dev && cd ..

echo "===== install backend deps ====="
cd backend && npm ci --omit=dev && cd ..

if [ ! -f backend/.env ]; then
  echo "ERROR: __REMOTE__/backend/.env missing"
  exit 1
fi

echo "===== restart services ====="
if ! command -v pm2 >/dev/null 2>&1; then
  echo "PM2 not found, installing..."
  npm i -g pm2
fi

if pm2 describe blog-frontend >/dev/null 2>&1; then
  pm2 restart blog-frontend
else
  pm2 start npm --name blog-frontend --cwd '__REMOTE__/frontend' -- start
fi

if pm2 describe blog-backend >/dev/null 2>&1; then
  pm2 restart blog-backend
else
  pm2 start npm --name blog-backend --cwd '__REMOTE__/backend' -- start
fi
pm2 save

echo "===== health checks ====="
curl --fail --silent --show-error --retry 10 --retry-delay 2 --retry-connrefused \
  http://127.0.0.1:3001/api/health >/dev/null
curl --fail --silent --show-error --retry 10 --retry-delay 2 --retry-connrefused \
  http://127.0.0.1:3000/ >/dev/null

echo "===== cleanup uploaded packages ====="
rm -f frontend-deploy.tar.gz backend-deploy.tar.gz

echo "===== deploy done ====="
'@

$remoteScript = $remoteScript.Replace('__REMOTE__', $REMOTE)

ssh $SERVER $remoteScript 2>&1 | ForEach-Object { Write-Host "    $_" }
if ($LASTEXITCODE -ne 0) { Stop-OnError "server deploy failed" }

# ============================================================
#  完成
# ============================================================
} finally {
    # 无论部署成功或失败，都清理本地部署包，避免大文件残留
    Cleanup-Packages
}

$endTime = Get-Date
$elapsed = ($endTime - $startTime).ToString("mm\:ss")

Write-Host ""
Write-Host "  ============================================" -ForegroundColor $C_OK
Write-Host "       Deploy Done! Time: $elapsed" -ForegroundColor $C_OK
Write-Host "  ============================================" -ForegroundColor $C_OK
Write-Host ""
Write-Host "  >> https://payours.me" -ForegroundColor $C_WARN
Write-Host ""
