@echo off
REM Double-click to run the KGSO site locally. Close this window to stop it.
cd /d "%~dp0"
echo.
echo   KGSO site running at http://localhost:8000
echo   Close this window to stop it.
echo.
start "" cmd /c "timeout /t 2 >nul & start http://localhost:8000"
python -m http.server 8000 2>nul || py -m http.server 8000 2>nul || (echo Python was not found, opening the page directly instead. & start "" index.html & pause)
