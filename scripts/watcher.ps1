# Antigravity 日本語化 見張り役（バックグラウンド監視スクリプト）
# Google Antigravity の自動アップデート等で app.asar が更新された際、自動で日本語化パッチを再適用します。

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$distPatcher = Join-Path $projectDir "dist\patcher.js"
$dataDir = Join-Path $env:LOCALAPPDATA "antigravity-ja"
$exe = Join-Path $env:LOCALAPPDATA "Programs\antigravity\Antigravity.exe"
$asar = Join-Path $env:LOCALAPPDATA "Programs\antigravity\resources\app.asar"
$logFile = Join-Path $dataDir "watcher.log"

function Write-Log($msg) {
    if ((Test-Path $logFile) -and (Get-Item $logFile).Length -gt 512KB) {
        Move-Item $logFile "$logFile.old" -Force
    }
    $line = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $msg"
    Add-Content -Path $logFile -Value $line -Encoding UTF8
    Write-Host $line
}

Write-Log "Watcher launched (PID: $PID)"

# 二重起動の防止
$created = $false
$mutex = New-Object System.Threading.Mutex($true, "Local\AntigravityJaWatcherV2", [ref]$created)
if (-not $created) {
    Write-Log "Another watcher instance is already running; exiting."
    exit 0
}

function Test-Patched {
    if (-not (Test-Path $asar)) { return $false }
    $bytes = [System.IO.File]::ReadAllBytes($asar)
    $text = [System.Text.Encoding]::GetEncoding(28591).GetString($bytes)
    return $text.Contains("Antigravity UI Japanese Localization Mod v2.0.0")
}

function Test-Installing {
    [bool](Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*antigravity-updater*" })
}

function Invoke-Patch {
    $env:ELECTRON_RUN_AS_NODE = "1"
    try {
        $p = Start-Process $exe -ArgumentList "`"$distPatcher`"" -Wait -PassThru -WindowStyle Hidden
        $code = $p.ExitCode
    } finally {
        Remove-Item Env:\ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
    }
    Write-Log "Patch executed. ExitCode=$code"
    return ($code -eq 0)
}

Write-Log "Watcher monitoring active..."
$lastStamp = $null

while ($true) {
    try {
        if (Test-Path $asar) {
            $item = Get-Item $asar
            $currentStamp = "$($item.Length)-$($item.LastWriteTimeUtc.Ticks)"

            if ($currentStamp -ne $lastStamp) {
                if (Test-Installing) {
                    Write-Log "Antigravity updater running; waiting..."
                } else {
                    $isPatched = Test-Patched
                    if (-not $isPatched) {
                        Write-Log "app.asar change detected (unpatched). Applying v2.0.0 patch..."
                        # アプリが起動中なら安定するまで少し待機
                        Start-Sleep -Seconds 2
                        $success = Invoke-Patch
                        if ($success) {
                            $lastStamp = "$((Get-Item $asar).Length)-$((Get-Item $asar).LastWriteTimeUtc.Ticks)"
                            Write-Log "Auto-patch applied successfully."
                        }
                    } else {
                        $lastStamp = $currentStamp
                    }
                }
            }
        }
    } catch {
        Write-Log "Watcher loop error: $($_.Exception.Message)"
    }
    Start-Sleep -Seconds 5
}
