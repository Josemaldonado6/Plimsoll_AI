@echo off
:start
cls
echo ---------------------------------------------------
echo      PLIMSOLL AI - BACKEND SERVER (AUTO-PILOT)
echo ---------------------------------------------------
echo [INFO] Starting Uvicorn Server...
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
echo.
echo [WARNING] Server stopped/crashed. Restarting in 3 seconds...
timeout /t 3
goto start
