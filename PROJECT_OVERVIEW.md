# MedResilient - Project Overview

## Executive Summary

MedResilient is a web-based Geo-AI decision support system designed to help hospitals optimize their medical supply chains for climate resilience and carbon reduction. The system integrates real-time environmental data, flood risk assessments, and emission calculations to provide actionable route recommendations.

## Problem Statement

Climate disasters (floods, hurricanes, wildfires) increasingly disrupt medical supply chains, causing:

- Delivery delays during critical times
- Emergency rerouting with higher emissions
- Increased reliance on air transport (high carbon footprint)
- Uncertainty about supplier reliability during disasters

## Solution

MedResilient provides hospitals with:

1. **Real-time flood risk assessment** using Google Earth Engine and FEMA data
2. **Carbon emission calculations** for different transport modes
3. **Intelligent supplier ranking** based on customizable risk/emission priorities
4. **Visual route planning** with interactive maps
5. **Data management** for hospitals, suppliers, and orders

## Technical Architecture

### Frontend Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS for modern, responsive UI
- **State Management**: Zustand for lightweight, efficient state handling
- **Mapping**: Google Maps JavaScript API
- **HTTP Client**: Axios

### Backend Stack

- **Framework**: Flask (Python 3.9+)
- **Data Processing**: Pandas
- **Geospatial**: Google Earth Engine Python API
- **Routing**: Google Maps Python Client, Geopy
- **APIs**: FEMA, Google Earth Engine, Google Maps

### Data Flow

```
User Action (Select Hospital)
    ↓
Frontend sends request to /api/recommendations
    ↓
Backend processes:
    1. Gets hospital coordinates
    2. Queries all providers
    3. For each provider:
       - Calculates route distance (Google Maps or Haversine)
       - Calculates carbon emission (distance × mode factor)
       - Queries flood risk (GEE + FEMA)
       - Computes weighted score
    4. Ranks providers by score
    ↓
Frontend displays:
    - Ranked list of suppliers
    - Route visualization on map
    - Risk/emission metrics
```

## Scoring Algorithm

### Formula

```
Score = α × FloodRisk + β × NormalizedCarbon

Where:
- α (alpha) = flood risk weight (default: 0.6)
- β (beta) = carbon weight (default: 0.4)
- α + β = 1
```

### Flood Risk Calculation

```
FloodRisk = 0.6 × FEMA_Score + 0.4 × GEE_Score

FEMA_Score:
- High risk zone (AE, VE): 0.8
- Moderate zone (A, AO): 0.4-0.6
- Minimal zone (X): 0.2

GEE_Score:
- Elevation risk: max(0, 1 - elevation/100m)
- Precipitation risk: min(1, precip_30day/500mm)
- Combined: 0.6 × elevation + 0.4 × precipitation
```

### Carbon Emission

```
Emission = Distance_km × EmissionFactor[mode]

Emission Factors (kg CO₂/km):
- Truck: 0.21
- Van: 0.15
- Air: 1.13
- Rail: 0.03
- Ship: 0.01
```

## Key Features

### 1. Interactive Map

- Displays hospitals (blue circles) and providers (green arrows)
- Color-coded routes based on flood risk:
  - Green: Low risk (< 0.3)
  - Yellow: Medium risk (0.3 - 0.6)
  - Red: High risk (> 0.6)
- FEMA flood zone overlays
- Google Earth Engine precipitation data

### 2. Order Dashboard

- View all medical supply orders
- Filter by device type or provider
- See delivery dates and risk levels
- Identify high-risk current suppliers

### 3. Recommendation Engine

- Select hospital to analyze
- Adjust α/β weights with sliders
- View ranked supplier recommendations
- See detailed metrics:
  - Distance (km)
  - Carbon emission (kg CO₂)
  - Flood risk (0-1 scale)
  - Weighted score
  - Estimated travel time

### 4. Route Visualization

- Click recommendation to show route
- Color-coded by risk level
- Polyline from provider to hospital
- Auto-zoom to fit route

### 5. Data Upload

- Upload custom CSV files
- Support for:
  - Hospitals (locations, contact info)
  - Providers (suppliers, distributors, manufacturers)
  - Orders (current supply agreements)
- Instant integration with system

## Use Cases

### Use Case 1: Hurricane Preparation

**Scenario**: Hurricane approaching South Florida

**Actions**:

1. Select affected hospitals
2. Increase α (flood risk weight) to 0.8
3. View recommendations
4. Identify low-risk alternative suppliers
5. Pre-arrange emergency supply routes

### Use Case 2: Carbon Reduction Initiative

**Scenario**: Hospital wants to reduce supply chain emissions

**Actions**:

1. Increase β (carbon weight) to 0.7
2. Compare current providers to recommendations
3. Identify suppliers with lower emissions
4. Switch to rail/ship transport where possible
5. Track emission reductions over time

### Use Case 3: New Hospital Setup

**Scenario**: New hospital needs to establish supply chain

**Actions**:

1. Add hospital via upload
2. Review all available providers
3. Use balanced weights (α=0.5, β=0.5)
4. Select top 3 providers for each device category
5. Establish supply agreements

## Data Sources

### Sample Data Included

- **8 hospitals** across Florida (Miami, Tampa, Orlando, Jacksonville, etc.)
- **10 providers** (mix of distributors and manufacturers)
- **14 orders** for various medical devices
- Real coordinates and locations

### Custom Data

Users can upload CSV files with their own:

- Hospital locations
- Supplier network
- Current orders

## Performance Considerations

### Backend Optimization

- Haversine fallback for distance calculation (no API calls)
- Caching of flood risk data (to be implemented)
- Async API calls (to be implemented)
- Database migration for large datasets (planned)

### Frontend Optimization

- Zustand for efficient state management
- React memo for expensive components
- Lazy loading for large datasets
- Map marker clustering (to be implemented)

## Security

### API Keys

- Environment variables for all keys
- `.env` file excluded from version control
- Example `.env.example` provided

### Data Privacy

- No personal health information (PHI) stored
- Only logistics and location data
- HIPAA compliance considerations for production

### CORS

- Configured for development (localhost)
- Restrict origins in production

## Future Enhancements

### Phase 2 Features

1. **Database Migration**: PostgreSQL or MongoDB for scalability
2. **User Authentication**: Hospital-specific dashboards
3. **Real-time Alerts**: Notify hospitals of increased flood risk
4. **Historical Analysis**: Track supply chain performance over time
5. **Multi-hazard**: Include hurricanes, wildfires, extreme heat

### Phase 3 Features

1. **AI/ML Predictions**: Predict future flood risks
2. **Optimization Engine**: Automated route selection
3. **Mobile App**: iOS/Android for emergency responders
4. **Integration**: Connect with hospital inventory systems
5. **Reporting**: Generate compliance and sustainability reports

## Hackathon Context

Built for a 12-hour hackathon with focus on:

- **Speed**: Rapid development with modern frameworks
- **Impact**: Addresses real-world climate + healthcare challenge
- **Innovation**: Combines GEE, FEMA, and route optimization
- **Usability**: Clean UI with actionable insights
- **Scalability**: Architecture ready for production deployment

## Success Metrics

### Technical

- ✅ Full-stack application deployed
- ✅ API integration (GEE, FEMA, Google Maps)
- ✅ Interactive map visualization
- ✅ Weighted scoring algorithm
- ✅ CSV upload functionality

### User Impact

- **Hospitals**: Make data-driven supplier decisions
- **Supply Chain**: Reduce climate vulnerability
- **Environment**: Lower carbon emissions
- **Patients**: Ensure reliable medical supply during disasters

## Team & Credits

**APIs & Data Sources**:

- Google Earth Engine for satellite and climate data
- FEMA for flood zone classifications
- Google Maps for routing and visualization

**Technologies**:

- React, TypeScript, Tailwind CSS (Frontend)
- Python, Flask, Pandas (Backend)
- Zustand, Axios, Geopy (Libraries)

## Conclusion

MedResilient demonstrates how modern web technologies, geospatial AI, and climate data can be combined to create practical solutions for healthcare supply chain resilience. The system is production-ready with minor enhancements and addresses a critical need in disaster preparedness and climate adaptation.
