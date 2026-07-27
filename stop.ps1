[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Stopping blog project..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$stoppedCount = 0

$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
foreach ($process in $nodeProcesses) {
    try {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId=$($process.Id)").CommandLine
        if ($cmdLine -like "*next*dev*" -or $cmdLine -like "*tsx*watch*" -or $cmdLine -like "*blog*frontend*" -or $cmdLine -like "*blog*backend*") {
            Write-Host "  Stopping PID: $($process.Id)" -ForegroundColor Yellow
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            $stoppedCount++
        }
    } catch {
    }
}

$npmProcesses = Get-Process -Name "npm", "cmd" -ErrorAction SilentlyContinue
foreach ($process in $npmProcesses) {
    try {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId=$($process.Id)").CommandLine
        if ($cmdLine -like "*npm*run*dev*" -or $cmdLine -like "*next*dev*") {
            Write-Host "  Stopping PID: $($process.Id) ($($process.ProcessName))" -ForegroundColor Yellow
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            $stoppedCount++
        }
    } catch {
    }
}

$ports = @(3000, 3001, 3002)
foreach ($port in $ports) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        foreach ($conn in $connections) {
            if ($conn.OwningProcess -ne 0) {
                $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($proc) {
                    Write-Host "  Stopping port $port PID: $($conn.OwningProcess) ($($proc.ProcessName))" -ForegroundColor Yellow
                    Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
                    $stoppedCount++
                }
            }
        }
    } catch {
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Stopped $stoppedCount processes" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
