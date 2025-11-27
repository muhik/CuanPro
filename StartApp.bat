@echo off
cd /d "%~dp0"
title WebHppZ Launcher
echo ====================================================
echo        Starting WebHppZ Application
echo ====================================================
echo.
echo [1/2] Opening Default Browser...
start "" "http://localhost:30001"
echo.
echo [2/2] Starting Development Server...
echo       Please wait for the server to initialize...
echo.
npm run dev
pause
