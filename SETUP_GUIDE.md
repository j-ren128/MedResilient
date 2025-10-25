# MedResilient Setup Guide

Complete step-by-step guide to set up and run MedResilient.

## Prerequisites

### Required Software

- **Python 3.9+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** (optional) - [Download](https://git-scm.com/)

### Required API Keys

You'll need the following API keys (already configured in the project):

1. **Google Earth Engine** - Project ID: `ee-practice-476102`
2. **FEMA API** - Key: `d4NyIxwf632nCvJcHUqU62KSTnwghIfO8xWIsWdC`
3. **Google Maps API** - Key: `AIzaSyCTDEGProhiHdmRzd93yUpjWXv8lTnJk6w`

## Installation

### Quick Start (Recommended)

**On Linux/Mac:**

```bash
cd MedResilient
./start.sh
```

**On Windows:**

```batch
cd MedResilient
start.bat
```

This will automatically:

1. Create Python virtual environment
2. Install all dependencies
3. Start backend server (port 5000)
4. Start frontend server (port 3000)

### Manual Setup

#### Backend Setup

1. **Navigate to backend:**

```bash
cd MedResilient/backend
```

2. **Create virtual environment:**

```bash
# On Linux/Mac
python3 -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
venv\Scripts\activate
```

3. **Install dependencies:**

```bash
pip install -r requirements.txt
```

4. **Authenticate Google Earth Engine (First Time Only):**

```bash
earthengine authenticate
```

This will:

- Open your browser
- Ask you to log in with Google account
- Generate authentication token
- Save credentials locally

5. **Run backend server:**

```bash
python app.py
```

Backend will be available at `http://localhost:5000`

#### Frontend Setup

1. **Navigate to frontend:**

```bash
cd MedResilient/frontend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start development server:**

```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Verification

### Check Backend

Open `http://localhost:5000/api/health` in your browser. You should see:

```json
{
  "status": "healthy",
  "gee_initialized": true
}
```

### Check Frontend

Open `http://localhost:3000` in your browser. You should see:

- MedResilient dashboard
- Interactive map with Florida centered
- Hospital and provider markers

## Troubleshooting

### Backend Issues

**Problem: `ModuleNotFoundError`**

```
Solution: Ensure virtual environment is activated and dependencies are installed
pip install -r requirements.txt
```

**Problem: Google Earth Engine authentication failed**

```
Solution: Run authentication command
earthengine authenticate
```

**Problem: Port 5000 already in use**

```
Solution: Kill the process using port 5000 or change port in app.py
# Linux/Mac
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Frontend Issues

**Problem: `npm install` fails**

```
Solution: Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Problem: Port 3000 already in use**

```
Solution: The dev server will automatically use the next available port (3001, 3002, etc.)
```

**Problem: Map not loading**

```
Solution: Check browser console for API key errors. Ensure Google Maps API key is valid.
```

### Common Issues

**Problem: CORS errors in browser console**

```
Solution: Ensure backend is running on port 5000 and frontend proxy is configured correctly
```

**Problem: No data displayed**

```
Solution: Check that CSV files exist in backend/data/ directory
ls backend/data/
```

## Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Test Coverage

```bash
cd backend
pytest tests/ --cov=. --cov-report=html
```

View coverage report: `open htmlcov/index.html`

## Production Deployment

### Backend

1. **Set environment to production:**

```bash
export FLASK_ENV=production
export FLASK_DEBUG=False
```

2. **Use production server (Gunicorn):**

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend

1. **Build for production:**

```bash
cd frontend
npm run build
```

2. **Serve with production server:**

```bash
npm install -g serve
serve -s dist -p 3000
```

## Database Migration (Future)

Currently using CSV files. To migrate to SQL database:

1. Install SQLAlchemy: `pip install sqlalchemy psycopg2-binary`
2. Create database models in `backend/database.py`
3. Migrate CSV data to database
4. Update data_service.py to use database queries

## Next Steps

1. **Customize Data**: Upload your own hospitals, providers, and orders via the Upload tab
2. **Adjust Weights**: Use the sliders to prioritize flood risk vs. carbon emissions
3. **Analyze Routes**: Select hospitals to view optimal supplier recommendations
4. **Visualize**: Click recommendations to see routes on the map

## Support

For issues or questions:

1. Check this guide first
2. Review the main README.md
3. Check backend logs for error messages
4. Open an issue on GitHub (if applicable)

## Additional Resources

- [Google Earth Engine Documentation](https://developers.google.com/earth-engine)
- [FEMA API Documentation](https://www.fema.gov/about/openfema/api)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
