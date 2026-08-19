# ============================================================
#  数据库管理脚本 - Digital Garden
#  用法: .\backup-db.ps1    然后按菜单选择
# ============================================================

$SERVER     = "root@120.77.201.34"
$REMOTE_DB  = "/var/www/blog/database/blog.db"
$ROOT       = "e:\data\blog-test"
$BACKUP_DIR = Join-Path $ROOT "database\backups"
$LOCAL_DB   = Join-Path $ROOT "database\blog.db"

# ---- 颜色定义 ----
$C_TITLE  = "Magenta"
$C_MENU   = "Cyan"
$C_OK     = "Green"
$C_WARN   = "Yellow"
$C_ERR    = "Red"
$C_DIM    = "DarkGray"
$C_HINT   = "Gray"

# ---- 工具函数 ----
function Stop-OnError($msg) {
    Write-Host ""
    Write-Host "  [X] $msg" -ForegroundColor $C_ERR
    Write-Host ""
}

function Write-Header {
    Write-Host ""
    Write-Host "  ============================================" -ForegroundColor $C_TITLE
    Write-Host "       Digital Garden - DB Manager" -ForegroundColor $C_TITLE
    Write-Host "  ============================================" -ForegroundColor $C_TITLE
    Write-Host "  Server:   $SERVER" -ForegroundColor $C_DIM
    Write-Host "  Remote:   $REMOTE_DB" -ForegroundColor $C_DIM
    Write-Host "  Local:    $LOCAL_DB" -ForegroundColor $C_DIM
    Write-Host "  Backup:   $BACKUP_DIR" -ForegroundColor $C_DIM
    Write-Host ""
}

function Ensure-BackupDir {
    if (-not (Test-Path $BACKUP_DIR)) {
        New-Item -ItemType Directory -Path $BACKUP_DIR -Force | Out-Null
    }
}

function Get-BackupList {
    if (-not (Test-Path $BACKUP_DIR)) { return @() }
    return Get-ChildItem -Path $BACKUP_DIR -Filter "blog-*.db" |
        Sort-Object LastWriteTime -Descending
}

# ---- 核心操作: 检查远程数据库 ----
function Test-RemoteDB {
    param([ref]$RemoteSizeRef)
    try {
        $result = ssh $SERVER "test -f $REMOTE_DB && echo EXISTS || echo MISSING" 2>&1 | Select-Object -Last 1
        if ($result -ne "EXISTS") { return $false }
        if ($RemoteSizeRef) {
            $size = ssh $SERVER "stat -c %s $REMOTE_DB 2>/dev/null || stat -f %z $REMOTE_DB 2>/dev/null" 2>&1 | Select-Object -Last 1
            $RemoteSizeRef.Value = [int64]$size
        }
        return $true
    } catch {
        return $false
    }
}

# ---- 核心操作: 拉取备份 ----
function Invoke-BackupPull {
    param(
        [int]$Keep = 20,
        [bool]$DoCleanup = $true,
        [bool]$DoVerify = $true
    )
    $startTime = Get-Date
    $TIMESTAMP  = Get-Date -Format "yyyyMMdd-HHmmss"
    $BACKUP_FILE = Join-Path $BACKUP_DIR "blog-$TIMESTAMP.db"

    Write-Host ""
    Write-Host "  --- 拉取数据库备份 ---" -ForegroundColor $C_MENU
    Write-Host "  保留份数: $Keep  |  清理旧备份: $(if($DoCleanup){'是'}else{'否'})  |  完整性校验: $(if($DoVerify){'是'}else{'否'})" -ForegroundColor $C_HINT
    Write-Host ""

    # Step 1
    Write-Host "  [1/4] 检查远程数据库..." -ForegroundColor $C_STEP
    $remoteSize = 0
    if (-not (Test-RemoteDB -RemoteSizeRef ([ref]$remoteSize))) {
        Stop-OnError "远程数据库不存在或 SSH 连接失败"
        return
    }
    $remoteSizeMB = [math]::Round($remoteSize / 1MB, 2)
    Write-Host "  [OK] 远程数据库存在, 大小 $remoteSizeMB MB" -ForegroundColor $C_OK

    # Step 2
    Write-Host ""
    Write-Host "  [2/4] 准备本地备份目录..." -ForegroundColor $C_STEP
    Ensure-BackupDir
    Write-Host "  [OK] 备份目录: $BACKUP_DIR" -ForegroundColor $C_OK

    # Step 3
    Write-Host ""
    Write-Host "  [3/4] 拉取数据库到本地..." -ForegroundColor $C_STEP
    Write-Host "  -> $BACKUP_FILE" -ForegroundColor $C_DIM
    scp "${SERVER}:${REMOTE_DB}" $BACKUP_FILE 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor $C_DIM }
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path $BACKUP_FILE)) {
        if (Test-Path $BACKUP_FILE) { Remove-Item $BACKUP_FILE -Force -ErrorAction SilentlyContinue }
        Stop-OnError "SCP 下载失败, 请检查 SSH 连接和权限"
        return
    }
    $localSize = (Get-Item $BACKUP_FILE).Length
    $localSizeMB = [math]::Round($localSize / 1MB, 2)

    if ($DoVerify) {
        if ([math]::Abs($localSize - $remoteSize) -gt 4096) {
            Write-Host "  [!] 警告: 本地文件大小 ($localSizeMB MB) 与远程 ($remoteSizeMB MB) 差异较大" -ForegroundColor $C_WARN
        } else {
            Write-Host "  [OK] 校验通过, 本地大小 $localSizeMB MB" -ForegroundColor $C_OK
        }
    } else {
        Write-Host "  [OK] 已下载 $localSizeMB MB (跳过校验)" -ForegroundColor $C_OK
    }

    # Step 4
    Write-Host ""
    $totalBackups = (Get-BackupList).Count
    if ($DoCleanup) {
        Write-Host "  [4/4] 清理旧备份 (保留最近 $Keep 份)..." -ForegroundColor $C_STEP
        $existing = Get-BackupList
        if ($existing.Count -gt $Keep) {
            $toDelete = $existing | Select-Object -Skip $Keep
            $deletedCount = 0
            foreach ($f in $toDelete) {
                Remove-Item $f.FullName -Force -ErrorAction SilentlyContinue
                if (-not (Test-Path $f.FullName)) {
                    $deletedCount++
                    Write-Host "    - $($f.Name)" -ForegroundColor $C_DIM
                }
            }
            $totalBackups = (Get-BackupList).Count
            Write-Host "  [OK] 已清理 $deletedCount 份, 剩余 $totalBackups 份" -ForegroundColor $C_OK
        } else {
            Write-Host "  [OK] 当前 $($existing.Count) 份, 无需清理" -ForegroundColor $C_DIM
        }
    } else {
        Write-Host "  [4/4] 跳过旧备份清理" -ForegroundColor $C_DIM
    }

    $endTime = Get-Date
    $elapsed = ($endTime - $startTime).ToString("mm\:ss")
    Write-Host ""
    Write-Host "  完成! 用时 $elapsed" -ForegroundColor $C_OK
    Write-Host "  文件: $BACKUP_FILE  ($localSizeMB MB)" -ForegroundColor $C_WARN
}

# ---- 核心操作: 查看备份列表 ----
function Show-BackupList {
    Write-Host ""
    Write-Host "  --- 本地备份列表 ---" -ForegroundColor $C_MENU
    $list = Get-BackupList
    if ($list.Count -eq 0) {
        Write-Host "  (暂无备份)" -ForegroundColor $C_DIM
        Write-Host ""
        return
    }
    $totalSize = 0
    $i = 1
    Write-Host ("  {0,3}  {1,-21}  {2,10}  {3}" -f "#", "文件名", "大小", "修改时间") -ForegroundColor $C_HINT
    Write-Host "  " + ("-" * 78) -ForegroundColor $C_DIM
    foreach ($f in $list) {
        $sizeMB = [math]::Round($f.Length / 1MB, 2)
        $totalSize += $f.Length
        $tag = if ($i -eq 1) { "  (最新)" } else { "" }
        Write-Host ("  {0,3}. {1,-21}  {2,8} MB  {3}{4}" -f $i, $f.Name, $sizeMB, $f.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'), $tag) -ForegroundColor $(if($i -eq 1){$C_OK}else{$C_DIM})
        $i++
    }
    Write-Host "  " + ("-" * 78) -ForegroundColor $C_DIM
    $totalMB = [math]::Round($totalSize / 1MB, 2)
    Write-Host ("  共 {0} 份, 总计 {1} MB" -f $list.Count, $totalMB) -ForegroundColor $C_WARN
    Write-Host ""
}

# ---- 核心操作: 清理旧备份 ----
function Invoke-Cleanup {
    param([int]$Keep = 20)
    Write-Host ""
    Write-Host "  --- 清理旧备份 (保留最近 $Keep 份) ---" -ForegroundColor $C_MENU
    $existing = Get-BackupList
    if ($existing.Count -eq 0) {
        Write-Host "  (暂无备份)" -ForegroundColor $C_DIM
        Write-Host ""
        return
    }
    if ($existing.Count -le $Keep) {
        Write-Host "  当前 $($existing.Count) 份, 未超过 $Keep 份上限, 无需清理" -ForegroundColor $C_DIM
        Write-Host ""
        return
    }
    $toDelete = $existing | Select-Object -Skip $Keep
    Write-Host "  将删除以下 $($toDelete.Count) 份备份:" -ForegroundColor $C_WARN
    foreach ($f in $toDelete) {
        $sizeMB = [math]::Round($f.Length / 1MB, 2)
        Write-Host "    - $($f.Name)  ($sizeMB MB)" -ForegroundColor $C_DIM
    }
    $confirm = Read-Host "  确认删除? (y/N)"
    if ($confirm -match '^[Yy]$') {
        $deletedCount = 0
        foreach ($f in $toDelete) {
            Remove-Item $f.FullName -Force -ErrorAction SilentlyContinue
            if (-not (Test-Path $f.FullName)) { $deletedCount++ }
        }
        Write-Host "  [OK] 已删除 $deletedCount 份" -ForegroundColor $C_OK
    } else {
        Write-Host "  (已取消)" -ForegroundColor $C_DIM
    }
    Write-Host ""
}

# ---- 核心操作: 恢复到本地开发环境 ----
function Invoke-RestoreLocal {
    Write-Host ""
    Write-Host "  --- 将备份恢复到本地 database/blog.db ---" -ForegroundColor $C_MENU
    $list = Get-BackupList
    if ($list.Count -eq 0) {
        Write-Host "  (暂无备份, 请先拉取)" -ForegroundColor $C_DIM
        Write-Host ""
        return
    }
    Show-BackupList
    $pick = Read-Host "  输入编号选择要恢复的备份 (1=最新, q=取消)"
    if ($pick -match '^[Qq]$') { Write-Host "  (已取消)" -ForegroundColor $C_DIM; Write-Host ""; return }
    if (-not [int]::TryParse($pick, [ref]$null) -or [int]$pick -lt 1 -or [int]$pick -gt $list.Count) {
        Stop-OnError "无效的编号"
        return
    }
    $selected = $list[[int]$pick - 1]
    $sizeMB = [math]::Round($selected.Length / 1MB, 2)
    Write-Host ""
    Write-Host "  选中: $($selected.Name)  ($sizeMB MB)" -ForegroundColor $C_WARN
    $confirm = Read-Host "  覆盖本地 database/blog.db ? 此操作不可撤销 (y/N)"
    if ($confirm -notmatch '^[Yy]$') {
        Write-Host "  (已取消)" -ForegroundColor $C_DIM
        Write-Host ""
        return
    }
    Ensure-BackupDir
    if (Test-Path $LOCAL_DB) {
        $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $preRestore = Join-Path $BACKUP_DIR "pre-restore-local-$stamp.db"
        Copy-Item $LOCAL_DB $preRestore -Force
        Write-Host "  已自动备份当前本地库 -> $preRestore" -ForegroundColor $C_DIM
    }
    Copy-Item $selected.FullName $LOCAL_DB -Force
    if (Test-Path $LOCAL_DB -and (Get-Item $LOCAL_DB).Length -eq $selected.Length) {
        Write-Host "  [OK] 恢复成功: $LOCAL_DB" -ForegroundColor $C_OK
    } else {
        Stop-OnError "恢复后文件异常, 请手动检查"
    }
    Write-Host ""
}

# ---- 核心操作: 推送本地数据库到服务器 ----
function Invoke-PushRemote {
    Write-Host ""
    Write-Host "  --- 推送本地数据库到服务器 (会覆盖服务器上的 blog.db) ---" -ForegroundColor $C_MENU
    if (-not (Test-Path $LOCAL_DB)) {
        Stop-OnError "本地数据库不存在: $LOCAL_DB"
        Write-Host ""
        return
    }
    $localSize = (Get-Item $LOCAL_DB).Length
    $localSizeMB = [math]::Round($localSize / 1MB, 2)

    Write-Host "  本地文件: $LOCAL_DB" -ForegroundColor $C_WARN
    Write-Host "  文件大小: $localSizeMB MB" -ForegroundColor $C_WARN
    Write-Host ""

    $remoteSize = 0
    $remoteOK = Test-RemoteDB -RemoteSizeRef ([ref]$remoteSize)
    if ($remoteOK) {
        $remoteSizeMB = [math]::Round($remoteSize / 1MB, 2)
        Write-Host "  服务器上现有数据库: $remoteSizeMB MB" -ForegroundColor $C_DIM
    } else {
        Write-Host "  服务器上暂无数据库, 将首次上传" -ForegroundColor $C_DIM
    }

    Write-Host ""
    $confirm = Read-Host "  确认覆盖服务器数据库? 此操作不可撤销! (输入 YES 确认, 其他取消)"
    if ($confirm -ne "YES") {
        Write-Host "  (已取消)" -ForegroundColor $C_DIM
        Write-Host ""
        return
    }

    Write-Host ""
    Write-Host "  [1/2] 在服务器上备份当前数据库..." -ForegroundColor $C_STEP
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    ssh $SERVER "mkdir -p /var/www/blog/database/backups && if [ -f $REMOTE_DB ]; then cp $REMOTE_DB /var/www/blog/database/backups/blog-pre-push-$stamp.db && echo BACKUP_OK; else echo NO_REMOTE; fi" 2>&1 |
        ForEach-Object { Write-Host "    $_" -ForegroundColor $C_DIM }
    Write-Host "  [OK] 服务器端预备份已完成" -ForegroundColor $C_OK

    Write-Host ""
    Write-Host "  [2/2] SCP 上传到服务器..." -ForegroundColor $C_STEP
    scp $LOCAL_DB "${SERVER}:${REMOTE_DB}" 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor $C_DIM }
    if ($LASTEXITCODE -ne 0) {
        Stop-OnError "SCP 上传失败"
        Write-Host ""
        return
    }

    $verifySize = ssh $SERVER "stat -c %s $REMOTE_DB 2>/dev/null || stat -f %z $REMOTE_DB 2>/dev/null" 2>&1 | Select-Object -Last 1
    if ([math]::Abs([int64]$verifySize - $localSize) -gt 4096) {
        Write-Host "  [!] 警告: 服务器端大小与本地差异较大, 建议检查" -ForegroundColor $C_WARN
    } else {
        Write-Host "  [OK] 推送并校验成功" -ForegroundColor $C_OK
    }
    Write-Host ""
}

# ============================================================
#  主循环: 菜单
# ============================================================
while ($true) {
    Clear-Host
    Write-Header

    $backups = Get-BackupList
    $remoteSize = 0
    $remoteOK = Test-RemoteDB -RemoteSizeRef ([ref]$remoteSize)
    $remoteInfo = if ($remoteOK) { "$([math]::Round($remoteSize/1MB,2)) MB" } else { "未检测到" }
    $localInfo  = if (Test-Path $LOCAL_DB) { "$([math]::Round((Get-Item $LOCAL_DB).Length/1MB,2)) MB" } else { "未检测到" }

    Write-Host "  [状态]" -ForegroundColor $C_HINT
    Write-Host "    远程服务器 DB : $remoteInfo" -ForegroundColor $(if($remoteOK){$C_OK}else{$C_WARN})
    Write-Host "    本地开发 DB   : $localInfo" -ForegroundColor $(if(Test-Path $LOCAL_DB){$C_OK}else{$C_WARN})
    Write-Host "    本地备份数量  : $($backups.Count) 份" -ForegroundColor $C_WARN
    Write-Host ""

    Write-Host "  [请选择操作]" -ForegroundColor $C_MENU
    Write-Host ""
    Write-Host "    1) 快速备份     — 拉取服务器 DB, 默认保留20份, 自动清理校验" -ForegroundColor $C_DIM
    Write-Host "    2) 自定义备份   — 手动选择保留份数 / 是否清理 / 是否校验" -ForegroundColor $C_DIM
    Write-Host "    3) 只拉取备份   — 仅下载, 不清理旧备份" -ForegroundColor $C_DIM
    Write-Host ""
    Write-Host "    4) 查看备份列表" -ForegroundColor $C_DIM
    Write-Host "    5) 手动清理旧备份" -ForegroundColor $C_DIM
    Write-Host ""
    Write-Host "    6) 恢复到本地   — 选一份备份覆盖 database/blog.db (用于开发调试)" -ForegroundColor $C_DIM
    Write-Host "    7) 推送到服务器 — 本地 database/blog.db 覆盖服务器 (危险!)" -ForegroundColor $C_DIM
    Write-Host ""
    Write-Host "    0) 退出" -ForegroundColor $C_DIM
    Write-Host ""

    $choice = Read-Host "  输入编号"

    switch ($choice) {
        '1' { Invoke-BackupPull -Keep 20 -DoCleanup $true -DoVerify $true }
        '2' {
            $k = Read-Host "  保留最近多少份? (回车=20)"
            if ([string]::IsNullOrWhiteSpace($k)) { $k = 20 }
            $c = Read-Host "  超出后清理旧备份? (Y/n)"
            $v = Read-Host "  下载后校验文件大小? (Y/n)"
            Invoke-BackupPull `
                -Keep (if([int]::TryParse($k,[ref]$null)){[int]$k}else{20}) `
                -DoCleanup ($c -notmatch '^[Nn]$') `
                -DoVerify  ($v -notmatch '^[Nn]$')
        }
        '3' { Invoke-BackupPull -Keep 20 -DoCleanup $false -DoVerify $true }
        '4' { Show-BackupList }
        '5' {
            $k = Read-Host "  保留最近多少份? (回车=20)"
            Invoke-Cleanup -Keep (if([int]::TryParse($k,[ref]$null)){[int]$k}else{20})
        }
        '6' { Invoke-RestoreLocal }
        '7' { Invoke-PushRemote }
        '0' {
            Write-Host ""
            Write-Host "  再见~" -ForegroundColor $C_OK
            Write-Host ""
            exit 0
        }
        default {
            Write-Host ""
            Write-Host "  无效选择, 按回车返回菜单..." -ForegroundColor $C_WARN
        }
    }

    Write-Host "  按回车返回菜单..."
    [void][Console]::ReadKey($true)
}
