@echo off
REM MedResilient Full Stack Start Script for Windows

echo =========================================
echo    MedResilient Startup Script
echo =========================================
echo.

REM Start Backend
echo [1/2] Starting Backend Server...
cd backend

if not exist venv\ (
    echo Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat

if not exist .env (
    echo Error: .env file not found in backend/
    echo Please create .env file with required API keys
    pause
    exit /b 1
)

echo Installing/updating Python dependencies...
pip install -q -r requirements.txt

echo Starting Flask server on http://localhost:5000
start /B python app.py

cd ..

REM Start Frontend
echo.
echo [2/2] Starting Frontend Server...
cd frontend

if not exist node_modules\ (
    echo Installing Node.js dependencies...
    call npm install
)

echo Starting Vite dev server on http://localhost:3000
start cmd /k npm run dev

cd ..

echo.
echo =========================================
echo    MedResilient is now running!
echo =========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Press any key to stop...
pause >nul

REM Kill processes
taskkill /F /IM python.exe /T >nul 2>&1
taskkill /F /IM node.exe /T >nul 2>&1

