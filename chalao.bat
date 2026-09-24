@echo off
title Hide and Seek Game Launcher
color 0A

echo ===================================================
echo        10-Player Hide & Seek Game Launcher
echo ===================================================
echo.

:: Check if Node.js is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js install nahi hai! 
    echo Please pehle Node.js download karke install karein: https://nodejs.org/
    echo.
    pause
    exit
)

echo [1/3] Checking dependencies...
if not exist "node_modules\" (
    echo [2/3] Installing npm packages (pehli baar thoda time lag sakta hai)...
    call npm install
) else (
    echo [2/3] Node modules already present. Skipping install.
)

echo.
echo [3/3] Starting Local Game Server...
echo.
echo Server start hone ke baad browser mein local URL khul jayega!
echo Press Ctrl + C in this window to stop the game.
echo ===================================================
echo.

call npm run dev

pause