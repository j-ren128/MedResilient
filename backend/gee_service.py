"""Google Earth Engine service for flood risk assessment"""
import ee
from typing import Tuple, Optional
from config import Config
import time


class GEEService:
    """Service for interacting with Google Earth Engine"""
    
    def __init__(self):
        self.initialized = False
        self.initialize()
    
    def initialize(self):
        """Initialize Google Earth Engine"""
        try:
            # Try to initialize with project ID
            ee.Initialize(project=Config.GEE_PROJECT_ID)
            self.initialized = True
            print("Google Earth Engine initialized successfully")
        except Exception as e:
            print(f"Error initializing GEE: {e}")
            print("Attempting authentication...")
            try:
                ee.Authenticate()
                ee.Initialize(project=Config.GEE_PROJECT_ID)
                self.initialized = True
                print("Google Earth Engine authenticated and initialized")
            except Exception as auth_error:
                print(f"Failed to authenticate GEE: {auth_error}")
                self.initialized = False
    
    def get_precipitation_data(self, latitude: float, longitude: float, 
                               days_back: int = 30) -> float:
        """
        Get precipitation data for a location over the past N days
        Returns total precipitation in mm
        """
        if not self.initialized:
            return 0.0
        
        try:
            # Define point of interest
            point = ee.Geometry.Point([longitude, latitude])
            
            # Get current date and date N days ago
            start_date = ee.Date(time.strftime('%Y-%m-%d')).advance(-7, 'day')
            end_date = start_date.advance(5, 'day')
            
            # Use CHIRPS precipitation dataset (daily, global)
            chirps = ee.ImageCollection('NOAA/CPC/Precipitation') \
                .filterDate(start_date, end_date) \
                .select('precipitation')
            
            # Calculate total precipitation
            total_precip = chirps.sum()
            
            # Get value at point
            precip_value = total_precip.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=point,
                scale=5000
            ).getInfo()
            
            return float(precip_value.get('precipitation', 0.0))
            
        except Exception as e:
            print(f"Error getting precipitation data: {e}")
            return 0.0
    
    def get_flood_susceptibility(self, latitude: float, longitude: float) -> float:
        """
        Calculate flood susceptibility based on terrain and precipitation
        Returns a score between 0-1 (higher = more risk)
        """
        if not self.initialized:
            # Return moderate risk if GEE not available
            return 0.3
        
        try:
            elev = self.get_elevation(latitude, longitude)
            
            # Get precipitation (30-day)
            precip = self.get_precipitation_data(latitude, longitude, 30)
            
            # Calculate flood risk score
            # Lower elevation = higher risk
            # Higher precipitation = higher risk
            elev_risk = max(0, 1 - (elev / 100))  # Normalize by 100m
            precip_risk = min(1, precip / 500)  # Normalize by 500mm
            
            # Combine factors (60% elevation, 40% precipitation)
            flood_risk = (0.6 * elev_risk) + (0.4 * precip_risk)
            
            return min(1.0, max(0.0, flood_risk))
            
        except Exception as e:
            print(f"Error calculating flood susceptibility: {e}")
            # Return moderate risk on error
            return 0.3
    
    def get_flood_risk_for_route(self, start_lat: float, start_lon: float,
                                  end_lat: float, end_lon: float) -> float:
        """
        Calculate flood risk along a route (average of start and end points)
        """
        start_risk = self.get_flood_susceptibility(start_lat, start_lon)
        end_risk = self.get_flood_susceptibility(end_lat, end_lon)
        
        # Return average risk
        return (start_risk + end_risk) / 2.0
    
    def get_elevation(self, latitude: float, longitude: float) -> Optional[float]:
        """Get elevation at a specific location"""
        if not self.initialized:
            return None
        
        try:
            point = ee.Geometry.Point([longitude, latitude])
            elevation = ee.Image('USGS/SRTMGL1_003')
            elev_value = elevation.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=point,
                scale=30
            ).getInfo()
            
            return float(elev_value.get('elevation', 0))
            
        except Exception as e:
            print(f"Error getting elevation: {e}")
            return None

