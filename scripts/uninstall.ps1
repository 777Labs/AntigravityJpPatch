# Google Antigravity 日本語化パッチ アンインストーラー (復元)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "Google Antigravity 日本語化パッチ 復元"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Google Antigravity 日本語化パッチ 復元 (Uninstall)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$distPatcher = Join-Path $projectDir "dist\patcher.js"
$exePath = Join-Path $env:LOCALAPPDATA "Programs\antigravity\Antigravity.exe"

# 1. Antigravity 本体の存在確認
if (-not (Test-Path $exePath)) {
    Write-Host "[エラー] Antigravity が見つかりません: $exePath" -ForegroundColor Red
    Read-Host "Enter キーを押して終了します..."
    exit 1
}

# 2. Antigravity が起動中か確認
$running = Get-Process Antigravity -ErrorAction SilentlyContinue
if ($running) {
    Write-Host "[注意] Antigravity が起動しています。復元前に終了してください。" -ForegroundColor Yellow
    Write-Host "Antigravity を完全に終了させてから、[Enter] キーを押してください..."
    Read-Host
    $runningAgain = Get-Process Antigravity -ErrorAction SilentlyContinue
    if ($runningAgain) {
        Write-Host "[警告] まだ Antigravity プロセスが残っています。強制終了を試みます..." -ForegroundColor Yellow
        Stop-Process -Name Antigravity -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
}

# 3. 復元処理の実行
Write-Host "[実行中] オリジナルの app.asar に復元しています..." -ForegroundColor Green
$env:ELECTRON_RUN_AS_NODE = "1"
try {
    $proc = Start-Process -FilePath $exePath -ArgumentList "`"$distPatcher`" --restore" -Wait -PassThru -NoNewWindow
    $exitCode = $proc.ExitCode
} finally {
    Remove-Item Env:\ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
}

Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "===================================================" -ForegroundColor Green
    Write-Host " [完了] 復元が正常に完了しました。（元の英語環境に戻りました）" -ForegroundColor Green
    Write-Host "===================================================" -ForegroundColor Green
} else {
    Write-Host "[エラー] 復元中にエラーが発生しました。(終了コード: $exitCode)" -ForegroundColor Red
}

Write-Host ""
Read-Host "Enter キーを押して終了します..."
exit $exitCode
