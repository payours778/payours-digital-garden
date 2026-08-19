# ============================================================
#  DB Management Script - Digital Garden
#  Default: .\backup-db.ps1            -> Quick backup (pull, keep 1)
#  With menu: .\backup-db.ps1 -Menu    -> Interactive menu
# ============================================================
param(
    [switch]$Menu = $false
)

$SERVER     = "root@120.77.201.34"
$REMOTE_DB  = "/var/www/blog/database/blog.db"
$DB_DIR     = $PSScriptRoot                                # e:\data\blog-test\database
$BACKUP_DIR = Join-Path $DB_DIR "backups"                  # e:\data\blog-test\database\backups
$LOCAL_DB   = Join-Path $DB_DIR "blog.db"                  # e:\data\blog-test\database\blog.db

# ---- Colors ----
$C_TITLE  = "Magenta"
$C_MENU   = "Cyan"
$C_STEP   = "Cyan"
$C_OK     = "Green"
$C_WARN   = "Yellow"
$C_ERR    = "Red"
$C_DIM    = "DarkGray"
$C_HINT   = "Gray"

# ---- Utils ----
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

# ---- Core: Check remote DB ----
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

# ---- Core: Pull backup ----
function Invoke-BackupPull {
    param(
        [int]$Keep = 20,
        [bool]$DoCleanup = $true,
        [bool]$DoVerify = $true
    )
    $startTime = Get-Date
    $TIMESTAMP   = Get-Date -Format "yyyyMMdd-HHmmss"
    $BACKUP_FILE = Join-Path $BACKUP_DIR "blog-$TIMESTAMP.db"

    Write-Host ""
    Write-Host "  --- Pull DB from server ---" -ForegroundColor $C_MENU
    Write-Host "  Keep: $Keep  |  Cleanup: $(if($DoCleanup){'Yes'}else{'No'})  |  Verify: $(if($DoVerify){'Yes'}else{'No'})" -ForegroundColor $C_HINT
    Write-Host ""

    Write-Host "  [1/4] Check remote database..." -ForegroundColor $C_STEP
    $remoteSize = 0
    if (-not (Test-RemoteDB -RemoteSizeRef ([ref]$remoteSize))) {
        Stop-OnError "Remote DB not found or SSH failed"
        return
    }
    $remoteSizeMB = [math]::Round($remoteSize / 1MB, 2)
    Write-Host "  [OK] Remote DB exists, $remoteSizeMB MB" -ForegroundColor $C_OK

    Write-Host ""
    Write-Host "  [2/4] Prepare backup directory..." -ForegroundColor $C_STEP
    Ensure-BackupDir
    Write-Host "  [OK] Backup dir: $BACKUP_DIR" -ForegroundColor $C_OK

    Write-Host ""
    Write-Host "  [3/4] Pull database to local..." -ForegroundColor $C_STEP
    Write-Host "  -> $BACKUP_FILE" -ForegroundColor $C_DIM
    scp "${SERVER}:${REMOTE_DB}" $BACKUP_FILE 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor $C_DIM }
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path $BACKUP_FILE)) {
        if (Test-Path $BACKUP_FILE) { Remove-Item $BACKUP_FILE -Force -ErrorAction SilentlyContinue }
        Stop-OnError "SCP download failed, check SSH connection"
        return
    }
    $localSize = (Get-Item $BACKUP_FILE).Length
    $localSizeMB = [math]::Round($localSize / 1MB, 2)

    if ($DoVerify) {
        if ([math]::Abs($localSize - $remoteSize) -gt 4096) {
            Write-Host "  [!] Warning: local size ($localSizeMB MB) differs from remote ($remoteSizeMB MB)" -ForegroundColor $C_WARN
        } else {
            Write-Host "  [OK] Verified, local size $localSizeMB MB" -ForegroundColor $C_OK
        }
    } else {
        Write-Host "  [OK] Downloaded $localSizeMB MB (verify skipped)" -ForegroundColor $C_OK
    }

    Write-Host ""
    $totalBackups = (Get-BackupList).Count
    if ($DoCleanup) {
        Write-Host "  [4/4] Cleanup old backups (keep latest $Keep)..." -ForegroundColor $C_STEP
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
            Write-Host "  [OK] Removed $deletedCount file(s), $totalBackups remaining" -ForegroundColor $C_OK
        } else {
            Write-Host "  [OK] $($existing.Count) backup(s), nothing to clean" -ForegroundColor $C_DIM
        }
    } else {
        Write-Host "  [4/4] Skipped cleanup" -ForegroundColor $C_DIM
    }

    $endTime = Get-Date
    $elapsed = ($endTime - $startTime).ToString("mm\:ss")
    Write-Host ""
    Write-Host "  Done! Time: $elapsed" -ForegroundColor $C_OK
    Write-Host "  File: $BACKUP_FILE  ($localSizeMB MB)" -ForegroundColor $C_WARN
}

# ---- Core: List backups ----
function Show-BackupList {
    Write-Host ""
    Write-Host "  --- Local Backup List ---" -ForegroundColor $C_MENU
    $list = Get-BackupList
    if ($list.Count -eq 0) {
        Write-Host "  (no backups yet)" -ForegroundColor $C_DIM
        Write-Host ""
        return
    }
    $totalSize = 0
    $i = 1
    Write-Host ("  {0,3}  {1,-21}  {2,10}  {3}" -f "#", "File", "Size", "Modified") -ForegroundColor $C_HINT
    Write-Host "  " + ("-" * 78) -ForegroundColor $C_DIM
    foreach ($f in $list) {
        $sizeMB = [math]::Round($f.Length / 1MB, 2)
        $totalSize += $f.Length
        $tag = if ($i -eq 1) { "  (latest)" } else { "" }
        Write-Host ("  {0,3}. {1,-21}  {2,8} MB  {3}{4}" -f $i, $f.Name, $sizeMB, $f.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'), $tag) -ForegroundColor $(if($i -eq 1){$C_OK}else{$C_DIM})
        $i++
    }
    Write-Host "  " + ("-" * 78) -ForegroundColor $C_DIM
    $totalMB = [math]::Round($totalSize / 1MB, 2)
    Write-Host ("  Total: {0} file(s), {1} MB" -f $list.Count, $totalMB) -ForegroundColor $C_WARN
    Write-Host ""
}

# ---- Core: Cleanup old backups ----
function Invoke-Cleanup {
    param([int]$Keep = 20)
    Write-Host ""
    Write-Host "  --- Cleanup Old Backups (keep latest $Keep) ---" -ForegroundColor $C_MENU
    $existing = Get-BackupList
    if ($existing.Count -eq 0) {
        Write-Host "  (no backups yet)" -ForegroundColor $C_DIM
        Write-Host ""
        return
    }
    if ($existing.Count -le $Keep) {
        Write-Host "  $($existing.Count) backup(s), under $Keep limit, nothing to do" -ForegroundColor $C_DIM
        Write-Host ""
        return
    }
    $toDelete = $existing | Select-Object -Skip $Keep
    Write-Host "  $($toDelete.Count) backup(s) will be deleted:" -ForegroundColor $C_WARN
    foreach ($f in $toDelete) {
        $sizeMB = [math]::Round($f.Length / 1MB, 2)
        Write-Host "    - $($f.Name)  ($sizeMB MB)" -ForegroundColor $C_DIM
    }
    $confirm = Read-Host "  Confirm delete? (y/N)"
    if ($confirm -match '^[Yy]$') {
        $deletedCount = 0
        foreach ($f in $toDelete) {
            Remove-Item $f.FullName -Force -ErrorAction SilentlyContinue
            if (-not (Test-Path $f.FullName)) { $deletedCount++ }
        }
        Write-Host "  [OK] Deleted $deletedCount file(s)" -ForegroundColor $C_OK
    } else {
        Write-Host "  (cancelled)" -ForegroundColor $C_DIM
    }
    Write-Host ""
}

# ---- Core: Restore backup to local blog.db ----
function Invoke-RestoreLocal {
    Write-Host ""
    Write-Host "  --- Restore Backup to Local blog.db ---" -ForegroundColor $C_MENU
    $list = Get-BackupList
    if ($list.Count -eq 0) {
        Write-Host "  (no backups, pull first)" -ForegroundColor $C_DIM
        Write-Host ""
        return
    }
    Show-BackupList
    $pick = Read-Host "  Enter # to restore (1=latest, q=cancel)"
    if ($pick -match '^[Qq]$') { Write-Host "  (cancelled)" -ForegroundColor $C_DIM; Write-Host ""; return }
    if (-not [int]::TryParse($pick, [ref]$null) -or [int]$pick -lt 1 -or [int]$pick -gt $list.Count) {
        Stop-OnError "Invalid selection"
        return
    }
    $selected = $list[[int]$pick - 1]
    $sizeMB = [math]::Round($selected.Length / 1MB, 2)
    Write-Host ""
    Write-Host "  Selected: $($selected.Name)  ($sizeMB MB)" -ForegroundColor $C_WARN
    $confirm = Read-Host "  Overwrite local blog.db? Cannot undo (y/N)"
    if ($confirm -notmatch '^[Yy]$') {
        Write-Host "  (cancelled)" -ForegroundColor $C_DIM
        Write-Host ""
        return
    }
    Ensure-BackupDir
    if (Test-Path $LOCAL_DB) {
        $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $preRestore = Join-Path $BACKUP_DIR "pre-restore-local-$stamp.db"
        Copy-Item $LOCAL_DB $preRestore -Force
        Write-Host "  Auto-backed up current local DB -> $preRestore" -ForegroundColor $C_DIM
    }
    Copy-Item $selected.FullName $LOCAL_DB -Force
    if (Test-Path $LOCAL_DB -and (Get-Item $LOCAL_DB).Length -eq $selected.Length) {
        Write-Host "  [OK] Restored: $LOCAL_DB" -ForegroundColor $C_OK
    } else {
        Stop-OnError "Restore failed, please check manually"
    }
    Write-Host ""
}

# ---- Core: Push local blog.db to server ----
function Invoke-PushRemote {
    Write-Host ""
    Write-Host "  --- Push Local DB to Server (overwrites server blog.db) ---" -ForegroundColor $C_MENU
    if (-not (Test-Path $LOCAL_DB)) {
        Stop-OnError "Local DB not found: $LOCAL_DB"
        Write-Host ""
        return
    }
    $localSize = (Get-Item $LOCAL_DB).Length
    $localSizeMB = [math]::Round($localSize / 1MB, 2)

    Write-Host "  Local file: $LOCAL_DB" -ForegroundColor $C_WARN
    Write-Host "  Size: $localSizeMB MB" -ForegroundColor $C_WARN
    Write-Host ""

    $remoteSize = 0
    $remoteOK = Test-RemoteDB -RemoteSizeRef ([ref]$remoteSize)
    if ($remoteOK) {
        $remoteSizeMB = [math]::Round($remoteSize / 1MB, 2)
        Write-Host "  Server has existing DB: $remoteSizeMB MB" -ForegroundColor $C_DIM
    } else {
        Write-Host "  Server has no DB, first upload" -ForegroundColor $C_DIM
    }

    Write-Host ""
    $confirm = Read-Host "  Confirm overwrite server DB? CANNOT UNDO! (type YES to confirm)"
    if ($confirm -ne "YES") {
        Write-Host "  (cancelled)" -ForegroundColor $C_DIM
        Write-Host ""
        return
    }

    Write-Host ""
    Write-Host "  [1/2] Backup server DB first..." -ForegroundColor $C_STEP
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    ssh $SERVER "mkdir -p /var/www/blog/database/backups && if [ -f $REMOTE_DB ]; then cp $REMOTE_DB /var/www/blog/database/backups/blog-pre-push-$stamp.db && echo BACKUP_OK; else echo NO_REMOTE; fi" 2>&1 |
        ForEach-Object { Write-Host "    $_" -ForegroundColor $C_DIM }
    Write-Host "  [OK] Server pre-push backup done" -ForegroundColor $C_OK

    Write-Host ""
    Write-Host "  [2/2] SCP upload to server..." -ForegroundColor $C_STEP
    scp $LOCAL_DB "${SERVER}:${REMOTE_DB}" 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor $C_DIM }
    if ($LASTEXITCODE -ne 0) {
        Stop-OnError "SCP upload failed"
        Write-Host ""
        return
    }

    $verifySize = ssh $SERVER "stat -c %s $REMOTE_DB 2>/dev/null || stat -f %z $REMOTE_DB 2>/dev/null" 2>&1 | Select-Object -Last 1
    if ([math]::Abs([int64]$verifySize - $localSize) -gt 4096) {
        Write-Host "  [!] Warning: server size differs from local, please verify" -ForegroundColor $C_WARN
    } else {
        Write-Host "  [OK] Push & verify success" -ForegroundColor $C_OK
    }
    Write-Host ""
}

# ============================================================
#  Entry point
# ============================================================
if (-not $Menu) {
    # Default behavior: run quick backup and exit
    Write-Header
    Invoke-BackupPull -Keep 20 -DoCleanup $true -DoVerify $true
    exit 0
}

# ============================================================
#  Main loop: Menu
# ============================================================
while ($true) {
    Clear-Host
    Write-Header

    $backups = Get-BackupList
    $remoteSize = 0
    $remoteOK = Test-RemoteDB -RemoteSizeRef ([ref]$remoteSize)
    $remoteInfo = if ($remoteOK) { "$([math]::Round($remoteSize/1MB,2)) MB" } else { "not detected" }
    $localInfo  = if (Test-Path $LOCAL_DB) { "$([math]::Round((Get-Item $LOCAL_DB).Length/1MB,2)) MB" } else { "not detected" }

    Write-Host "  [Status]" -ForegroundColor $C_HINT
    Write-Host "    Remote server DB : $remoteInfo" -ForegroundColor $(if($remoteOK){$C_OK}else{$C_WARN})
    Write-Host "    Local dev DB     : $localInfo" -ForegroundColor $(if(Test-Path $LOCAL_DB){$C_OK}else{$C_WARN})
    Write-Host "    Local backups    : $($backups.Count) file(s)" -ForegroundColor $C_WARN
    Write-Host ""

    Write-Host "  [Select action]" -ForegroundColor $C_MENU
    Write-Host ""
    Write-Host "    1) Quick backup   | Pull server DB, keep latest 20, auto clean + verify" -ForegroundColor $C_DIM
    Write-Host "    2) Custom backup  | Choose keep count / clean / verify" -ForegroundColor $C_DIM
    Write-Host "    3) Pull only      | Download only, no cleanup" -ForegroundColor $C_DIM
    Write-Host ""
    Write-Host "    4) List backups" -ForegroundColor $C_DIM
    Write-Host "    5) Manual cleanup" -ForegroundColor $C_DIM
    Write-Host ""
    Write-Host "    6) Restore local  | Overwrite blog.db with a backup (dev debug)" -ForegroundColor $C_DIM
    Write-Host "    7) Push to server | Overwrite server blog.db (DANGER!)" -ForegroundColor $C_DIM
    Write-Host ""
    Write-Host "    0) Exit" -ForegroundColor $C_DIM
    Write-Host ""

    $choice = Read-Host "  Enter #"

    switch ($choice) {
        '1' { Invoke-BackupPull -Keep 20 -DoCleanup $true -DoVerify $true }
        '2' {
            $k = Read-Host "  Keep how many? (Enter=20)"
            if ([string]::IsNullOrWhiteSpace($k)) { $k = 20 }
            $c = Read-Host "  Cleanup old ones? (Y/n)"
            $v = Read-Host "  Verify size after download? (Y/n)"
            Invoke-BackupPull `
                -Keep (if([int]::TryParse($k,[ref]$null)){[int]$k}else{20}) `
                -DoCleanup ($c -notmatch '^[Nn]$') `
                -DoVerify  ($v -notmatch '^[Nn]$')
        }
        '3' { Invoke-BackupPull -Keep 20 -DoCleanup $false -DoVerify $true }
        '4' { Show-BackupList }
        '5' {
            $k = Read-Host "  Keep how many? (Enter=20)"
            Invoke-Cleanup -Keep (if([int]::TryParse($k,[ref]$null)){[int]$k}else{20})
        }
        '6' { Invoke-RestoreLocal }
        '7' { Invoke-PushRemote }
        '0' {
            Write-Host ""
            Write-Host "  Bye~" -ForegroundColor $C_OK
            Write-Host ""
            exit 0
        }
        default {
            Write-Host ""
            Write-Host "  Invalid choice, press Enter to return..." -ForegroundColor $C_WARN
        }
    }

    Write-Host "  Press Enter to return to menu..."
    [void][Console]::ReadKey($true)
}
