@echo off
title NOVA COMMAND Launcher
setlocal EnableDelayedExpansion

echo ========================================
echo  NOVA COMMAND
echo  Starting application...
echo ========================================
echo.

set "PROJECT_DIR=%~dp0"
if "%PROJECT_DIR:~-1%"=="\" set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"
set "BACKEND_DIR=%PROJECT_DIR%\backend"
set "FRONTEND_DIR=%PROJECT_DIR%"

echo Project Directory:  %PROJECT_DIR%
echo Backend Directory:  %BACKEND_DIR%
echo Frontend Directory: %FRONTEND_DIR%
echo.

:: 1. Check Port 5000 (Backend)
netstat -ano | findstr :5000 | findstr LISTENING >nul 2>&1
if not errorlevel 1 (
    echo [INFO] Backend is already running on port 5000.
) else (
    echo Starting backend...
    start "NOVA COMMAND - Backend (Port 5000)" cmd /k "cd /d "%BACKEND_DIR%" && npm run dev"
)

:: 2. Check Port 3000 (Frontend)
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1
if not errorlevel 1 (
    echo [INFO] Frontend is already running on port 3000.
) else (
    echo Starting frontend...
    start "NOVA COMMAND - Frontend (Port 3000)" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"
)

echo.
echo ========================================
echo  NOVA COMMAND is running
echo.
echo  Application:
echo  http://localhost:3000
echo.
echo  Backend:
echo  http://localhost:5000
echo ========================================
echo.

:: Wait briefly and open browser safely
echo Opening application in default browser...
timeout /t 3 /nobreak >nul 2>&1 || ping 127.0.0.1 -n 4 >nul
start "" "http://localhost:3000"

echo.
echo Startup complete. Both CMD windows remain open for logging.
echo You may minimize or close this launcher window.
echo.
pause
