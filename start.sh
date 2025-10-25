#!/bin/bash

# MedResilient Full Stack Start Script

echo "========================================="
echo "   MedResilient Startup Script"
echo "========================================="
echo ""

# Function to check if a port is in use
port_in_use() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Start Backend
echo "[1/2] Starting Backend Server..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

if [ ! -f ".env" ]; then
    echo "Error: .env file not found in backend/"
    echo "Please create .env file with required API keys"
    exit 1
fi

echo "Installing/updating Python dependencies..."
pip install -q -r requirements.txt

echo "Starting Flask server on http://localhost:5000"
python app.py &
BACKEND_PID=$!

cd ..

# Start Frontend
echo ""
echo "[2/2] Starting Frontend Server..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

echo "Starting Vite dev server on http://localhost:3000"
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "========================================="
echo "   MedResilient is now running!"
echo "========================================="
echo ""
echo "🏥 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait

