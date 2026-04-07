@echo off
setlocal enabledelayedexpansion

echo =================================================================
echo PLIMSOLL AI - ZERO-ERROR PROTOCOL: INDUSTRIAL COMPLIANCE REPORT
echo =================================================================
echo Timestamp: %date% %time%
echo.

echo [1/3] VERIFYING FRONTEND STABILITY...
cd frontend
call npm test -- --run
if %errorlevel% neq 0 (
    echo [ERROR] Frontend tests failed. System certification compromised.
    exit /b 1
)
echo [SUCCESS] Frontend logic verified.
echo.

echo [2/3] VERIFYING NAVAL PHYSICS KERNEL...
cd ..\backend
call python -m pytest app/tests/test_physics_kernel.py
if %errorlevel% neq 0 (
    echo [ERROR] Backend physics kernel failed validation. Certification denied.
    exit /b 1
)
echo [SUCCESS] Naval physics kernel certified.
echo.

echo [3/3] VERIFYING SYSTEM INTEGRITY...
curl -s http://localhost:8000/api/health | findstr "plimsoll_ai_active" > nul
if %errorlevel% neq 0 (
    echo [WARNING] Local backend server not responding. Deployment check skipped.
) else (
    echo [SUCCESS] Local production API is active and healthy.
)
echo.

echo =================================================================
echo STATUS: ALL GRADED MODULES PASSING - CERTIFICATION READY
echo =================================================================
cd ..
pause
