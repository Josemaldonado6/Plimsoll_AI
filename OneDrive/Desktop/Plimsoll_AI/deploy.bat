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

echo [2/3] Building Containers...
docker-compose build

echo [3/3] Launching Services...
docker-compose up -d

echo.
echo ==========================================
echo      SYSTEM DEPLOYED SUCCESSFULLY
echo ==========================================
echo Frontend: http://localhost
echo Backend:  http://localhost:8000/docs
echo.
pause
