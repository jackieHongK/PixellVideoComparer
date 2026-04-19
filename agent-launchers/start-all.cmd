@echo off
call "%~dp0start-dashboard.cmd"
timeout /t 1 /nobreak >nul
start "Pixell Codex PIXELL" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0start-codex-pixell.ps1"
timeout /t 1 /nobreak >nul
start "Pixell Codex Personal" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0start-codex-personal.ps1"
timeout /t 1 /nobreak >nul
start "Pixell Claude" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0start-claude.ps1"
echo.
echo Dashboard URL:
echo http://127.0.0.1:41731/
