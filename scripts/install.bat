@echo off
chcp 65001 >nul
title Google Antigravity 日本語化パッチャー (v2.0.0)

echo ===================================================
echo  Google Antigravity 日本語化パッチ インストーラー
echo ===================================================
echo.

set "EXE_PATH=%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe"
set "ASAR_PATH=%LOCALAPPDATA%\Programs\antigravity\resources\app.asar"
set "DIST_PATCHER=%~dp0..\dist\patcher.js"

if not exist "%EXE_PATH%" (
    echo [エラー] Antigravity が見つかりません: %EXE_PATH%
    pause
    exit /b 1
)

if not exist "%DIST_PATCHER%" (
    echo [情報] 配布用ファイルをビルドしています...
    where node >nul 2>nul
    if %errorlevel% equ 0 (
        cd /d "%~dp0.."
        node tools/build.js
    ) else (
        echo [エラー] dist/patcher.js が見つかりません。ビルドを実行してください。
        pause
        exit /b 1
    )
)

:: Antigravity が起動中か確認
tasklist /FI "IMAGENAME eq Antigravity.exe" 2>nul | find /I /N "Antigravity.exe" >nul
if "%ERRORLEVEL%"=="0" (
    echo [注意] Antigravity が起動しています。パッチを当てる前に終了してください。
    echo Antigravity を終了してから [Enter] キーを押してください...
    pause >nul
)

echo [実行中] 日本語化パッチを適用しています...
set "ELECTRON_RUN_AS_NODE=1"
"%EXE_PATH%" "%DIST_PATCHER%"
set "EXIT_CODE=%ERRORLEVEL%"
set "ELECTRON_RUN_AS_NODE="

echo.
if "%EXIT_CODE%"=="0" (
    echo [完了] 日本語化パッチの適用が正常に完了しました！
    echo Antigravity を起動して日本語表示をご確認ください。
) else (
    echo [エラー] パッチ適用中にエラーが発生しました。(終了コード: %EXIT_CODE%)
)

echo.
pause
