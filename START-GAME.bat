@echo off
setlocal
title Cockroach Survival - Safe Zone Panic
cd /d "%~dp0"

echo ==========================================
echo    Cockroach Survival: Safe Zone Panic
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 goto nonode

for /f "tokens=1 delims=v." %%a in ('node -v') do set NODEMAJOR=%%a
if %NODEMAJOR% LSS 20 goto oldnode

if exist "node_modules\vite" goto run

echo Pehli baar run ho raha hai - game files install ho rahi hain.
echo Internet chahiye, 1-3 minute lagenge. Please wait...
echo.
call npm install --no-audit --no-fund
if errorlevel 1 goto installfail

:run
echo.
echo Game start ho raha hai - browser khud khul jayega.
echo Game band karne ke liye ye window close kar dein.
echo.
call npx vite --port 3000 --open
goto end

:nonode
echo Node.js installed nahi hai.
where winget >nul 2>nul
if errorlevel 1 goto manualnode
echo Node.js LTS install kiya ja raha hai...
winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
echo.
echo Install complete. Ye window close karein aur START-GAME.bat dobara double-click karein.
pause
exit /b

:manualnode
echo nodejs.org khul raha hai. LTS version download karke install karein,
echo phir START-GAME.bat dobara double-click karein.
start https://nodejs.org/en/download
pause
exit /b

:oldnode
echo Aapka Node.js purana hai - version 20 ya usse naya chahiye.
echo nodejs.org se LTS version install karein, phir dobara run karein.
start https://nodejs.org/en/download
pause
exit /b

:installfail
echo.
echo Install fail ho gaya. Internet check karein aur dobara try karein.
pause
exit /b

:end
pause
