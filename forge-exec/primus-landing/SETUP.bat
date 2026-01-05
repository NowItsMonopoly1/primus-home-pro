@echo off
echo ============================================
echo Primus Insights Landing Page - Setup
echo ============================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download from: https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js found

echo.
echo [2/3] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo [3/3] Starting development server...
echo.
echo ============================================
echo Landing page will open at:
echo http://localhost:3000
echo ============================================
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
