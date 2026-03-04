@echo off
:: Configuración de la ventana
title 🤖 BOT AUTOMATICO - GetInternet v2026
color 0b
cls

echo.
echo  ==========================================================
echo            INICIANDO BOT DE AUTOMATIZACION
echo  ==========================================================
echo.

:: 1. Verificar si Node.js existe
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado en este equipo.
    echo Por favor, descargalo en: https://nodejs.org/
    pause
    exit
)

:: 2. Verificar si las librerias estan instaladas
if not exist "node_modules\" (
    echo [INFO] No se encontraron las librerias. Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Hubo un problema instalando las dependencias.
        pause
        exit
    )
    echo [OK] Librerias instaladas correctamente.
    echo.
)

:: 3. Ejecutar el Bot
echo [STATUS] Ejecutando node index.js...
echo ----------------------------------------------------------
node index.js

:: 4. Finalización
echo.
echo ----------------------------------------------------------
echo  PROCESO FINALIZADO O DETENIDO.
echo  Presiona cualquier tecla para cerrar esta ventana.
echo  ==========================================================
pause >nul
