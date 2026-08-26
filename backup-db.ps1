# ============================================================
#  数据库备份脚本（调用 database/backup-db.cjs）
#  放在项目最外层，方便直接 .\backup-db.ps1 使用
#  用法：.\backup-db.ps1
#  产物：database/backups/blog_backup_YYYYMMDD-HHMMSS.sql
# ============================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

$ROOT = $PSScriptRoot
$CJS  = Join-Path $ROOT "database\backup-db.cjs"

Write-Host ""
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host "       Database Backup" -ForegroundColor Cyan
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $CJS)) {
    Write-Host "  [X] 找不到备份脚本: $CJS" -ForegroundColor Red
    exit 1
}

Write-Host "  [1/1] 调用 database/backup-db.cjs ..." -ForegroundColor Yellow
Write-Host ""

# 调用原有的备份脚本（在项目根目录下执行，保证路径正确）
Push-Location $ROOT
try {
    node $CJS
    $code = $LASTEXITCODE
} finally {
    Pop-Location
}

Write-Host ""
if ($code -eq 0) {
    Write-Host "  ============================================" -ForegroundColor Green
    Write-Host "       Backup Done!" -ForegroundColor Green
    Write-Host "  ============================================" -ForegroundColor Green
} else {
    Write-Host "  [X] 备份失败，退出码: $code" -ForegroundColor Red
    exit $code
}