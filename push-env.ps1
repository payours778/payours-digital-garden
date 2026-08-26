# ============================================================
#  Push backend/.env to server
#  Usage: .\push-env.ps1
# ============================================================

$SERVER      = "root@database.payours.me"
$ROOT        = "e:\data\blog-test"
$LOCAL_ENV   = Join-Path $ROOT "backend\.env"
$REMOTE_ROOT = "/var/www/blog"
$REMOTE_ENV  = "$REMOTE_ROOT/backend/.env"

$C_TITLE  = "Magenta"
$C_STEP   = "Cyan"
$C_OK     = "Green"
$C_WARN   = "Yellow"
$C_ERR    = "Red"
$C_DIM    = "DarkGray"

function Stop-OnError($msg) {
    Write-Host ""
    Write-Host "  [X] $msg" -ForegroundColor $C_ERR
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "  ============================================" -ForegroundColor $C_TITLE
Write-Host "       Push backend/.env to server" -ForegroundColor $C_TITLE
Write-Host "  ============================================" -ForegroundColor $C_TITLE
Write-Host "  Server:     $SERVER" -ForegroundColor $C_DIM
Write-Host "  Local:      $LOCAL_ENV" -ForegroundColor $C_DIM
Write-Host "  Remote:     $REMOTE_ENV" -ForegroundColor $C_DIM
Write-Host ""

# --- [1/5] Check local .env ---
Write-Host "  [1/5] Check local .env file..." -ForegroundColor $C_STEP
if (-not (Test-Path $LOCAL_ENV)) {
    Stop-OnError "Local .env not found: $LOCAL_ENV"
}
$localSize = (Get-Item $LOCAL_ENV).Length
Write-Host "  [OK] Found, $localSize bytes" -ForegroundColor $C_OK

# --- [2/4] Check & create remote directory structure ---
Write-Host ""
Write-Host "  [2/4] Verify remote directory structure..." -ForegroundColor $C_STEP
$requiredDirs = @(
    "/var/www/blog",
    "/var/www/blog/backend",
    "/var/www/blog/frontend",
    "/var/www/blog/database"
)
$createCmds = @()
foreach ($d in $requiredDirs) {
    $exists = ssh $SERVER "test -d $d && echo YES || echo NO" 2>&1 | Select-Object -Last 1
    if ($exists -eq "YES") {
        Write-Host "    [OK] $d  (exists)" -ForegroundColor $C_OK
    } else {
        $createCmds += "mkdir -p $d"
        Write-Host "    [+] $d  (will create)" -ForegroundColor $C_WARN
    }
}
if ($createCmds.Count -gt 0) {
    ssh $SERVER ($createCmds -join " && ") 2>&1 |
        ForEach-Object { Write-Host "    $_" -ForegroundColor $C_DIM }
    if ($LASTEXITCODE -ne 0) {
        Stop-OnError "Failed to create remote directories"
    }
    Write-Host "  [OK] Directory structure created" -ForegroundColor $C_OK
} else {
    Write-Host "  [OK] Directory structure already in place" -ForegroundColor $C_OK
}

# --- [3/5] SCP upload ---
Write-Host ""
Write-Host "  [3/5] Upload .env to server..." -ForegroundColor $C_STEP
scp $LOCAL_ENV "${SERVER}:${REMOTE_ENV}" 2>&1 |
    ForEach-Object { Write-Host "    $_" -ForegroundColor $C_DIM }
if ($LASTEXITCODE -ne 0) {
    Stop-OnError "SCP upload failed, check SSH connection"
}
Write-Host "  [OK] Uploaded to $REMOTE_ENV" -ForegroundColor $C_OK

# --- [4/4] Verify ---
Write-Host ""
Write-Host "  [4/4] Verify remote file..." -ForegroundColor $C_STEP
$remoteSize = ssh $SERVER "stat -c %s $REMOTE_ENV 2>/dev/null || stat -f %z $REMOTE_ENV 2>/dev/null" 2>&1 | Select-Object -Last 1
try {
    $remoteSizeInt = [int64]$remoteSize
    $diff = [math]::Abs($remoteSizeInt - $localSize)
    if ($diff -gt 1024) {
        Write-Host "  [!] Warning: remote size ($remoteSizeInt B) differs from local ($localSize B)" -ForegroundColor $C_WARN
    } else {
        Write-Host "  [OK] Verified: $remoteSizeInt bytes" -ForegroundColor $C_OK
    }
} catch {
    Write-Host "  [!] Cannot verify remote size, please check manually" -ForegroundColor $C_WARN
}

# --- [5/5] Restart backend ---
Write-Host ""
Write-Host "  [5/5] Restart backend (pm2 restart blog-backend)..." -ForegroundColor $C_STEP
ssh $SERVER "pm2 restart blog-backend" 2>&1 |
    ForEach-Object { Write-Host "    $_" -ForegroundColor $C_DIM }
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [!] PM2 restart failed, please restart manually on server" -ForegroundColor $C_WARN
} else {
    Write-Host "  [OK] blog-backend restarted, env reloaded" -ForegroundColor $C_OK
}

Write-Host ""
Write-Host "  ============================================" -ForegroundColor $C_OK
Write-Host "  Done! .env pushed & backend restarted." -ForegroundColor $C_OK
Write-Host "  ============================================" -ForegroundColor $C_OK
Write-Host ""
