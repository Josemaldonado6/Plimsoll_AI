@echo off
:: -----------------------------------------------------------------------------
:: PLIMSOLL AI - NETWORK AUTHORIZATION UTILITY
:: -----------------------------------------------------------------------------
echo.
echo [SYSTEM] Autorizando acceso LAN para Plimsoll AI...
echo.

:: Check for Administrative Privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Privilegios de administrador detectados.
) else (
    echo [ERROR] Por favor, ejecuta este archivo como ADMINISTRADOR.
    echo (Clic derecho -> Ejecutar como administrador)
    echo.
    pause
    exit /B
)

:: Add Firewall Rules for Backend (8000) and Frontend (3000) and Expo (8081)
echo [1/3] Abriendo puerto 8000 (Backend)...
netsh advfirewall firewall add rule name="Plimsoll Backend" dir=in action=allow protocol=TCP localport=8000 profile=any >nul
echo [2/3] Abriendo puerto 3000 (Frontend)...
netsh advfirewall firewall add rule name="Plimsoll Frontend" dir=in action=allow protocol=TCP localport=3000 profile=any >nul
echo [3/3] Abriendo puerto 8081 (Expo/Metro)...
netsh advfirewall firewall add rule name="Plimsoll Expo" dir=in action=allow protocol=TCP localport=8081 profile=any >nul

echo.
echo ===================================================
echo   CONFIGURACION COMPLETADA EXITOSAMENTE
echo ===================================================
echo Tu iPhone ahora deberia poder conectarse al PC.
echo.
echo Pasos finales:
echo 1. Asegurate que el iPhone este en la misma WiFi.
echo 2. Reinicia la app en Expo Go.
echo ===================================================
echo.
pause
