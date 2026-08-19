# ============================================================
#  Restore latest backup to blog.db
#  Usage: .\restore-db.ps1           -> auto restore (no confirm)
#         .\restore-db.ps1 -Confirm  -> ask before overwrite
# ============================================================
param(
    [switch]$Confirm = $false
)

$DB_DIR     = $PSScriptRoot
$BACKUP_DIR = Join-Path $DB_DIR "backups"
$LOCAL_DB   = Join-Path $DB_DIR "blog.db"

$C_OK   = "Green"
$C_WARN = "Yellow"
$C_ERR  = "Red"
$C_DIM  = "DarkGray"

function Stop-OnError($msg) {
    Write-Host ""
    Write-Host "  [X] $msg" -ForegroundColor $C_ERR
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "  ============================================" -ForegroundColor Magenta
Write-Host "       Restore Latest Backup -> blog.db" -ForegroundColor Magenta
Write-Host "  ============================================" -ForegroundColor Magenta
Write-Host "  Backup dir: $BACKUP_DIR" -ForegroundColor $C_DIM
Write-Host "  Target:     $LOCAL_DB" -ForegroundColor $C_DIM
Write-Host ""

# --- 1) find latest backup ---
Write-Host "  [1/2] Find latest backup..." -ForegroundColor Cyan
if (-not (Test-Path $BACKUP_DIR)) {
    Stop-OnError "Backup directory not found: $BACKUP_DIR"
}
$latest = Get-ChildItem -Path $BACKUP_DIR -Filter "blog-*.db" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $latest) {
    Stop-OnError "No backup (blog-*.db) found in $BACKUP_DIR"
}
$sizeMB = [math]::Round($latest.Length / 1MB, 2)
Write-Host "  [OK] Latest backup: $($latest.Name)  ($sizeMB MB, $($latest.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss')))" -ForegroundColor $C_OK

# --- 2) confirm if requested ---
if ($Confirm) {
    Write-Host ""
    $ans = Read-Host "  Overwrite blog.db with this backup? (y/N)"
    if ($ans -notmatch '^[Yy]$') {
        Write-Host "  (cancelled)" -ForegroundColor $C_DIM
        Write-Host ""
        exit 0
    }
}

# --- 3) overwrite blog.db ---
Write-Host ""
Write-Host "  [2/2] Overwrite blog.db..." -ForegroundColor Cyan
Copy-Item $latest.FullName $LOCAL_DB -Force

# verify
$dbExists = Test-Path $LOCAL_DB
$dbSizeOk = $dbExists -and ((Get-Item $LOCAL_DB).Length -eq $latest.Length)
if ($dbSizeOk) {
    $finalSizeMB = [math]::Round((Get-Item $LOCAL_DB).Length / 1MB, 2)
    Write-Host "  [OK] Restored: blog.db ($finalSizeMB MB)  from $($latest.Name)" -ForegroundColor $C_OK
} else {
    Stop-OnError "Restore failed, size mismatch. Please check manually."
}

Write-Host ""
