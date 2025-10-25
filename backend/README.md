# MedResilient Backend

Python Flask backend for MedResilient climate-resilient medical supply routing system.

## Features

- RESTful API for hospital, provider, and order data management
- Google Earth Engine integration for live flood risk assessment
- FEMA flood zone data integration
- Google Maps API for route calculation and emission estimates
- Weighted scoring algorithm for supplier recommendations
- CSV file upload support

## Setup

1. Create virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Authenticate with Google Earth Engine (first time only):

```bash
earthengine authenticate
```

4. Run the server:

```bash
python app.py
```

Server runs on `http://localhost:5000`

## API Documentation

### Health Check

- `GET /api/health` - Check API and GEE status

### Data Management

- `GET /api/hospitals` - Get all hospitals
- `GET /api/providers` - Get all providers
- `GET /api/orders` - Get orders with optional filters

### Recommendations

- `POST /api/recommendations` - Get ranked supplier recommendations
  ```json
  {
    "hospital_id": "H001",
    "alpha": 0.6,
    "beta": 0.4,
    "limit": 5
  }
  ```

### Analysis

- `POST /api/analyze-provider` - Analyze specific provider
- `POST /api/flood-risk` - Get flood risk for location

### Upload

- `POST /api/upload` - Upload CSV file
  - Form data: `file` (CSV), `type` (hospitals/providers/orders)

## Testing

Run tests:

```bash
pytest tests/ -v
```

With coverage:

```bash
pytest tests/ --cov=. --cov-report=html
```

## Environment Variables

Required in `.env` file:

- `FEMA_API_KEY` - FEMA API key
- `FEMA_CLIENT_ID` - FEMA client ID
- `GEE_PROJECT_ID` - Google Earth Engine project ID
- `GOOGLE_MAPS_API_KEY` - Google Maps API key
