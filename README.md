# 🏥 MedResilient

**Geo-AI Tool for Climate-Resilient & Low-Carbon Medical Supply Routing**

MedResilient is a comprehensive web-based dashboard that helps hospitals in Florida identify climate risks to their medical supply chain and automatically recommend low-carbon, flood-resilient routes from manufacturers or distributors to hospitals.

## 🎯 Features

### Frontend (React + Tailwind + Google Maps)

- **🌎 Interactive Map**: Display hospitals, manufacturers, and distributors with live flood risk overlay
- **📦 Order Dashboard**: View and filter medical device orders by device type or provider
- **⚙️ Weighted Model Recommender**: Re-rank suppliers based on customizable flood risk and carbon emission weights
- **🗺️ Route Visualization**: Show delivery routes with color-coded flood risk indicators
- **📤 Data Upload Panel**: Upload custom CSV files for hospitals, providers, or orders

### Backend (Python + Flask)

- **🧾 Data API**: Manage hospital orders, suppliers, and risk metrics
- **🌧️ Risk Data Integration**: Combine Google Earth Engine precipitation data with FEMA flood zone data
- **🚗 Route Calculator**: Calculate distances, travel times, and mode-based carbon emissions
- **⚖️ Weighted Scoring Engine**: Rank suppliers using the formula: `Score = α × FloodRisk + β × CarbonEmission`

## 🏗️ Architecture

```
┌───────────────────────────┐
│        FRONTEND           │
│  React + Tailwind         │
│  • Map Visualization      │
│  • Dashboard & Analytics  │
│  • Route Optimization UI  │
└───────────┬───────────────┘
            │ REST API
            ▼
┌───────────────────────────┐
│         BACKEND           │
│  Python + Flask           │
│  • Data Management        │
│  • Risk Scoring Engine    │
│  • Route & Emission Calc  │
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│       EXTERNAL APIs       │
│  • Google Earth Engine    │
│  • FEMA Flood Zones       │
│  • Google Maps Directions │
└───────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- Google Earth Engine account
- API keys for FEMA, Google Earth Engine, and Google Maps

### Backend Setup

1. **Navigate to backend directory**:

```bash
cd MedResilient/backend
```

2. **Create virtual environment**:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:

```bash
pip install -r requirements.txt
```

4. **Configure environment** (already set in `.env` file):

- FEMA_API_KEY
- FEMA_CLIENT_ID
- GEE_PROJECT_ID
- GOOGLE_MAPS_API_KEY

5. **Authenticate Google Earth Engine** (first time only):

```bash
earthengine authenticate
```

6. **Run the backend**:

```bash
python app.py
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**:

```bash
cd MedResilient/frontend
```

2. **Install dependencies**:

```bash
npm install
```

3. **Start development server**:

```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📊 Data Structure

### Hospitals CSV

```csv
hospital_id,name,address,city,state,zip,latitude,longitude
H001,Miami General Hospital,1611 NW 12th Ave,Miami,FL,33136,25.7907,-80.2108
```

### Providers CSV

```csv
provider_id,name,type,address,city,state,zip,latitude,longitude,transport_mode
P001,MedEquip Florida,Distributor,1500 NW 89th Ct,Miami,FL,33172,25.7860,-80.3370,truck
```

### Orders CSV

```csv
order_id,hospital_id,provider_id,device_name,quantity,order_date,delivery_date
O001,H001,P001,Ventilator,5,2024-01-15,2024-01-20
```

## 🔧 API Endpoints

### Data Endpoints

- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/:id` - Get specific hospital
- `GET /api/providers` - Get all providers
- `GET /api/providers/:id` - Get specific provider
- `GET /api/orders` - Get orders (with optional filters)

### Analysis Endpoints

- `POST /api/recommendations` - Get ranked supplier recommendations
- `POST /api/analyze-provider` - Analyze specific provider-hospital pair
- `POST /api/flood-risk` - Get flood risk for coordinates
- `GET /api/mapdata` - Get all map visualization data

### Upload Endpoint

- `POST /api/upload` - Upload CSV files (hospitals, providers, orders)

## 📐 Scoring Model

The weighted scoring model ranks suppliers based on:

```
Score = α × FloodRisk + β × CarbonEmission
```

Where:

- **FloodRisk** ∈ [0, 1]: Combined FEMA flood zone + GEE precipitation/elevation data
- **CarbonEmission**: Distance (km) × EmissionFactor (kg CO₂/km)
- **α** (alpha): Weight for flood risk (default: 0.6)
- **β** (beta): Weight for carbon emission (default: 0.4)

### Emission Factors (kg CO₂ per km)

- Truck: 0.21
- Van: 0.15
- Air: 1.13
- Rail: 0.03
- Ship: 0.01

## 🧪 Testing

Run backend tests:

```bash
cd backend
pytest tests/ -v
```

## 📝 Usage Guide

1. **View Orders**: See current medical supply orders in the dashboard
2. **Select Hospital**: Choose a hospital to analyze supplier options
3. **Adjust Weights**: Use sliders to prioritize flood risk vs. carbon emissions
4. **View Recommendations**: See ranked suppliers with risk and emission metrics
5. **Visualize Routes**: Click recommendations to see routes on the map
6. **Upload Data**: Add custom hospital, provider, or order data via CSV upload

## 🌟 Key Technologies

**Frontend**:

- React 18
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Google Maps JavaScript API
- Axios

**Backend**:

- Flask
- Pandas
- Google Earth Engine Python API
- Google Maps Python Client
- Python-dotenv

## 📄 License

MIT License

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built for rapid disaster response and climate-resilient healthcare supply chains.**
