@echo off
echo Starting Apex Swarm Development Server...
cd /d "%~dp0apex-swarm-web"
call npm run dev
pause
