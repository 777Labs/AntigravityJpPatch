@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0uninstall.ps1"
if %errorlevel% neq 0 (
    echo.
    echo An error occurred. Press any key to exit.
    pause >nul
)
endlocal
