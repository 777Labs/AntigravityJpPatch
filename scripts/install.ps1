# Google Antigravity 日本語化パッチ インストーラー (v2.0.0)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "Google Antigravity 日本語化パッチャー (v2.0.0)"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Google Antigravity 日本語化パッチ インストーラー" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$distPatcher = Join-Path $projectDir "dist\patcher.js"
$exePath = Join-Path $env:LOCALAPPDATA "Programs\antigravity\Antigravity.exe"
$asarPath = Join-Path $env:LOCALAPPDATA "Programs\antigravity\resources\app.asar"

# 1. Antigravity 本体の存在確認
if (-not (Test-Path $exePath)) {
    Write-Host "[エラー] Antigravity が見つかりません: $exePath" -ForegroundColor Red
    Write-Host "Antigravity がインストールされているかご確認ください。" -ForegroundColor Yellow
    Read-Host "Enter キーを押して終了します..."
    exit 1
}

# 2. ビルド成果物の確認（無ければ自動ビルド）
if (-not (Test-Path $distPatcher)) {
    Write-Host "[情報] 配布用ファイルをビルドしています..." -ForegroundColor Yellow
    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if ($nodeCmd) {
        Push-Location $projectDir
        try {
            & node tools/build.js
        } finally {
            Pop-Location
        }
    } else {
        Write-Host "[エラー] dist/patcher.js が存在せず、Node.js も見つかりません。" -ForegroundColor Red
        Write-Host "プロジェクトをビルドしてから再実行してください。" -ForegroundColor Yellow
        Read-Host "Enter キーを押して終了します..."
        exit 1
    }
}

# 3. Antigravity が起動中か確認
$running = Get-Process Antigravity -ErrorAction SilentlyContinue
if ($running) {
    Write-Host "[注意] Antigravity が起動しています。パッチを当てる前に終了してください。" -ForegroundColor Yellow
    Write-Host "Antigravity を完全に終了させてから、[Enter] キーを押してください..."
    Read-Host
    # 再度確認
    $runningAgain = Get-Process Antigravity -ErrorAction SilentlyContinue
    if ($runningAgain) {
        Write-Host "[警告] まだ Antigravity プロセスが残っています。強制終了を試みます..." -ForegroundColor Yellow
        Stop-Process -Name Antigravity -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
}

# 4. パッチ適用
Write-Host "[実行中] 日本語化パッチを適用しています..." -ForegroundColor Green
$env:ELECTRON_RUN_AS_NODE = "1"
try {
    $proc = Start-Process -FilePath $exePath -ArgumentList "`"$distPatcher`"" -Wait -PassThru -NoNewWindow
    $exitCode = $proc.ExitCode
} finally {
    Remove-Item Env:\ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
}

Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "===================================================" -ForegroundColor Green
    Write-Host " [完了] 日本語化パッチの適用が正常に完了しました！" -ForegroundColor Green
    Write-Host " Antigravity を起動して日本語表示をご確認ください。" -ForegroundColor Green
    Write-Host "===================================================" -ForegroundColor Green
} else {
    Write-Host "[エラー] パッチ適用中にエラーが発生しました。(終了コード: $exitCode)" -ForegroundColor Red
}

Write-Host ""
Read-Host "Enter キーを押して終了します..."
exit $exitCode
