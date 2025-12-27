@echo off
echo Starting GearGuard...

:: 1. Start Backend Server
echo Starting Backend (Port 8000)...
start "GearGuard Backend" cmd /k "uvicorn backend.main:app --host 127.0.0.1 --port 8000"

:: 2. Start Frontend Server
echo Starting Frontend (Port 5500)...
start "GearGuard Frontend" cmd /k "python -m http.server 5500"

:: 3. Wait a moment for servers to spin up
timeout /t 3 /nobreak >nul

:: 4. Open in Default Browser
echo Opening Application...
start http://localhost:5500/

echo Done! You can close this window, but keep the other two server windows open.
pause
