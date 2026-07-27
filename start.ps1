[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

$frontendPath = Join-Path $PSScriptRoot "frontend"
$backendPath = Join-Path $PSScriptRoot "backend"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting blog project..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Starting backend..." -ForegroundColor Yellow
Set-Location $backendPath
$backendProcess = Start-Process -FilePath "cmd" -ArgumentList "/c", "npm run dev" -WindowStyle Minimized -PassThru
Write-Host "  Backend PID: $($backendProcess.Id)" -ForegroundColor Green

Write-Host ""
Write-Host "[2/2] Starting frontend..." -ForegroundColor Yellow
Set-Location $frontendPath
$frontendProcess = Start-Process -FilePath "cmd" -ArgumentList "/c", "npm run dev" -WindowStyle Minimized -PassThru
Write-Host "  Frontend PID: $($frontendProcess.Id)" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Project is starting..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "  Press Ctrl+C or run stop.ps1 to stop" -ForegroundColor Gray
Write-Host ""

try {
    $backendProcess.WaitForExit()
} finally {
    Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "Services stopped" -ForegroundColor Red
}
