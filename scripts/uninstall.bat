@echo off
chcp 65001 >nul
title Google Antigravity 日本語化パッチ アンインストーラー

echo ===================================================
echo  Google Antigravity 日本語化パッチ 復元・アンインストール
echo ===================================================
echo.

set "EXE_PATH=%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe"
set "DIST_PATCHER=%~dp0..\dist\patcher.js"

if not exist "%EXE_PATH%" (
    echo [エラー] Antigravity が見つかりません: %EXE_PATH%
    pause
    exit /b 1
)

:: Antigravity が起動中か確認
tasklist /FI "IMAGENAME eq Antigravity.exe" 2>nul | find /I /N "Antigravity.exe" >nul
if "%ERRORLEVEL%"=="0" (
    echo [注意] Antigravity が起動しています。復元前に終了してください。
    echo Antigravity を終了してから [Enter] キーを押してください...
    pause >nul
)

echo [実行中] オリジナルの app.asar に復元しています...
set "ELECTRON_RUN_AS_NODE=1"
"%EXE_PATH%" "%DIST_PATCHER%" --restore
set "EXIT_CODE=%ERRORLEVEL%"
set "ELECTRON_RUN_AS_NODE="

echo.
if "%EXIT_CODE%"=="0" (
    echo [完了] 復元が正常に完了しました。（元の英語環境に戻りました）
) else (
    echo [エラー] 復元中にエラーが発生しました。(終了コード: %EXIT_CODE%)
)

echo.
pause
