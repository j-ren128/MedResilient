# MedResilient Demo Guide

Quick demonstration guide for showcasing MedResilient's capabilities.

## Demo Scenario: Hurricane Preparation in South Florida

### Setup (2 minutes)

1. **Start the application**:

```bash
./start.sh  # On Linux/Mac
# OR
start.bat   # On Windows
```

2. **Open browser**: Navigate to `http://localhost:3000`

### Demo Flow (10 minutes)

#### Part 1: System Overview (2 min)

**Show the map**:

- Point out hospitals (blue circles) across Florida
- Point out providers (green markers)
- Explain the color-coded legend for flood risk

**Highlight key locations**:

- Miami General Hospital (coastal, high risk)
- Tampa Bay Medical Center
- Orlando Health Medical Center

#### Part 2: Current Supply Chain Analysis (3 min)

**Navigate to Orders Dashboard**:

1. Click "Dashboard" tab
2. Show the orders table
3. **Key talking points**:
   - "Here we see current medical supply orders"
   - "Notice the Risk Level column - some providers are in high-risk zones"
   - "This hospital is receiving ventilators from a flood-prone area"

**Filter by device**:

1. Select "Ventilator" from dropdown
2. Show filtered results
3. Explain vulnerability during disasters

#### Part 3: Supplier Optimization (3 min)

**Switch to Recommendations**:

1. Click "Optimize" tab
2. Select "Miami General Hospital" from dropdown

**Show default recommendations**:

- Point out ranked suppliers
- Explain the scoring metrics:
  - Distance (logistics)
  - Carbon emission (sustainability)
  - Flood risk (resilience)
  - Weighted score (combined)

**Adjust priorities for hurricane scenario**:

1. Move α (Flood Risk) slider to 0.8
2. Move β (Carbon) slider to 0.2
3. Show how rankings change
4. **Key message**: "During hurricane season, we prioritize resilience over emissions"

**Click top recommendation**:

- Route appears on map
- Show green line = low risk route
- Point out the provider is inland, safer location

#### Part 4: Carbon Reduction Mode (2 min)

**Switch priorities**:

1. Move α (Flood Risk) slider to 0.3
2. Move β (Carbon) slider to 0.7
3. Show new rankings
4. **Key message**: "In normal conditions, we can prioritize sustainability"

**Compare emissions**:

- Point out emission differences (e.g., 25 kg vs 113 kg CO₂)
- Explain transport mode impact (truck vs air freight)
- Show how choosing nearby suppliers reduces emissions

### Demo Talking Points

#### Problem Statement

> "Climate disasters disrupt medical supply chains. During Hurricane Ian in 2022, Florida hospitals faced critical supply shortages. Traditional logistics planning doesn't account for flood risk or climate resilience."

#### Our Solution

> "MedResilient combines real-time satellite data from Google Earth Engine, FEMA flood zones, and carbon emission calculations to help hospitals make smarter supply chain decisions."

#### Key Innovation

> "Our weighted scoring model lets hospitals adjust their priorities. During hurricane season, prioritize resilience. In normal times, optimize for carbon reduction. It's flexible and data-driven."

#### Impact

> "Hospitals can:
>
> - Identify vulnerable suppliers before disasters strike
> - Pre-arrange alternative routes during emergencies
> - Reduce supply chain emissions by 20-30% through better planning
> - Ensure reliable medical device delivery when patients need it most"

### Q&A Preparation

**Q: How accurate is the flood risk data?**

> "We combine two sources: FEMA's official flood zone classifications (static) and Google Earth Engine's real-time precipitation and elevation data (dynamic). This gives us both historical patterns and current conditions."

**Q: Can this work outside Florida?**

> "Yes! Google Earth Engine covers the entire world. FEMA data is US-specific, but we can integrate other countries' flood risk databases. The system is designed to be location-agnostic."

**Q: How do you calculate carbon emissions?**

> "We use industry-standard emission factors per kilometer for each transport mode: truck (0.21 kg/km), air (1.13 kg/km), etc. These are based on EPA and European Environment Agency data."

**Q: What about cost optimization?**

> "Great question! We could easily add cost as a third factor. The weighted model is extensible - we can include delivery time, reliability score, or any other metric."

**Q: Is this production-ready?**

> "The core functionality is solid. For production, we'd add user authentication, database migration from CSV to PostgreSQL, more robust error handling, and potentially a mobile app for emergency responders."

### Advanced Demo Features

If time permits:

#### Upload Custom Data

1. Go to "Upload" tab
2. Show CSV format requirements
3. Explain how hospitals can add their own suppliers

#### API Demonstration

Open `http://localhost:5000/api/health` to show backend health check

#### Developer Console

Show network tab to demonstrate API calls and real-time data fetching

### Post-Demo Resources

**GitHub**: [Link to repository]
**Live Demo**: [If deployed to Vercel/Heroku]
**Documentation**: See README.md and SETUP_GUIDE.md

### Elevator Pitch (30 seconds)

> "MedResilient is like Google Maps for medical supply chains, but instead of avoiding traffic, we help hospitals avoid floods and reduce carbon emissions. We use satellite data and AI to rank suppliers by climate risk and sustainability, giving hospitals the data they need to keep patients safe during disasters while reducing their environmental impact."

## Demo Checklist

Before demo:

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Browser open to `http://localhost:3000`
- [ ] Sample data loaded (8 hospitals, 10 providers, 14 orders)
- [ ] Google Maps API working (markers visible)
- [ ] Tested recommendations endpoint
- [ ] Backup slides/screenshots ready (if live demo fails)

During demo:

- [ ] Explain the problem (30 sec)
- [ ] Show the map (1 min)
- [ ] Demo order dashboard (2 min)
- [ ] Demo recommendations with slider adjustments (3 min)
- [ ] Show route visualization (1 min)
- [ ] Explain impact and next steps (1 min)
- [ ] Q&A (2 min)

Total: ~10 minutes
