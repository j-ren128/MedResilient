@echo off
REM MedResilient Backend Start Script for Windows

echo Starting MedResilient Backend...

REM Check if virtual environment exists
if exist venv\ (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo Installing dependencies...
    pip install -r requirements.txt
)

REM Check if .env file exists
if not exist .env (
    echo Warning: .env file not found. Please create one from .env.example
    exit /b 1
)

REM Run the application
echo Starting Flask server on http://localhost:5000
python app.py

pause

