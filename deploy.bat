@echo off
echo ==========================================
echo      PLIMSOLL AI DEPLOYMENT
echo ==========================================

echo [1/3] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in PATH.
    echo Please install Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b
)

echo [2/3] Building and Launching Services...
docker-compose up --build -d

echo.
echo ==========================================
echo      SYSTEM DEPLOYED SUCCESSFULLY
echo ==========================================
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000/docs
echo.
pause
