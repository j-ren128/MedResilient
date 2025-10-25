#!/bin/bash

# MedResilient Backend Start Script

echo "Starting MedResilient Backend..."

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
else
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found. Please create one from .env.example"
    exit 1
fi

# Run the application
echo "Starting Flask server on http://localhost:5000"
python app.py

