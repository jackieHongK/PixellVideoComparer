@echo off
cd /d "%~dp0.."
echo Pixell Dashboard Server starting in %cd%
node .\dashboard-server.js
