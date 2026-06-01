@echo off
setlocal enabledelayedexpansion

echo ==================================================
echo         HOSPITAL EHR - ULTIMATE LAUNCHER
echo ==================================================
echo.

# 1. Disable BuildKit (Fixes 502/RPC errors on Windows)
set DOCKER_BUILDKIT=0
set COMPOSE_DOCKER_CLI_BUILD=0

echo [1/4] Checking Docker Status...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Docker is not responding or crashed.
    echo PLEASE RESTART DOCKER DESKTOP AND TRY AGAIN.
    pause
    exit /b
)

echo [2/4] Cleaning up existing containers...
docker-compose down --remove-orphans >nul 2>&1

echo [3/4] Building services ONE BY ONE (Saves RAM)...
echo Building Database...
docker-compose build db redis
echo Building Backend (This may take a while)...
docker-compose build backend_api
echo Building Frontend (Heaviest part)...
docker-compose build frontend
echo Building Nginx...
docker-compose build nginx

echo.
echo [4/4] Starting Hospital EHR...
docker-compose up -d

echo.
echo ==================================================
echo EHR IS STARTING UP!
echo Browser: http://localhost
echo ==================================================
echo.

echo Launching Windows Desktop App...
cd windows_app
if not exist node_modules (
    echo Installing Desktop App dependencies...
    call npm install --no-audit --no-fund
)
npm start
