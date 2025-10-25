"""FEMA API service for flood zone data"""
import requests
from typing import Optional, Dict
from config import Config


class FEMAService:
    """Service for interacting with FEMA API"""
    
    def __init__(self):
        self.api_key = Config.FEMA_API_KEY
        self.base_url = "https://www.fema.gov/api/open/v2"
    
    def get_flood_zone(self, latitude: float, longitude: float) -> Dict:
        """
        Get FEMA flood zone information for a location
        Returns flood zone classification and risk level
        """
        try:
            # FEMA National Flood Hazard Layer endpoint
            # Note: This is a simplified implementation
            # Real implementation would use FEMA's flood zone API or shapefile data
            
            headers = {
                'Authorization': f'Bearer {self.api_key}'
            }
            
            # For now, we'll use a heuristic based on Florida geography
            # In production, this would query actual FEMA flood zone data
            flood_zone = self._estimate_flood_zone(latitude, longitude)
            
            return flood_zone
            
        except Exception as e:
            print(f"Error getting FEMA flood zone: {e}")
            return {
                'zone': 'X',
                'risk_level': 'minimal',
                'risk_score': 0.1
            }
    
    def _estimate_flood_zone(self, latitude: float, longitude: float) -> Dict:
        """
        Estimate flood zone based on location in Florida
        This is a simplified heuristic - production would use actual FEMA data
        """
        # Coastal areas (higher risk)
        # Florida coastal cities typically have higher flood risk
        
        # Distance from coast (very rough estimate)
        # Florida spans roughly 24.5°N to 31°N, 80°W to 87.5°W
        
        # Coastal threshold (within ~20 miles of coast)
        is_coastal = (
            latitude < 25.5 or  # South Florida coast
            latitude > 30.0 or  # North Florida coast
            longitude < -86.5 or  # Panhandle coast
            (25.0 <= latitude <= 28.0 and longitude > -80.5)  # East coast
        )
        
        # Low elevation areas
        is_low_elevation = latitude < 26.0  # South Florida/Everglades
        
        if is_coastal and is_low_elevation:
            return {
                'zone': 'AE',
                'risk_level': 'high',
                'risk_score': 0.8,
                'description': 'High-risk flood zone (coastal, low elevation)'
            }
        elif is_coastal:
            return {
                'zone': 'A',
                'risk_level': 'moderate-high',
                'risk_score': 0.6,
                'description': 'Moderate to high flood risk (coastal)'
            }
        elif is_low_elevation:
            return {
                'zone': 'AO',
                'risk_level': 'moderate',
                'risk_score': 0.4,
                'description': 'Moderate flood risk (low elevation)'
            }
        else:
            return {
                'zone': 'X',
                'risk_level': 'minimal',
                'risk_score': 0.2,
                'description': 'Low flood risk'
            }
    
    def get_disaster_declarations(self, state: str = 'FL') -> list:
        """
        Get recent disaster declarations for a state
        """
        try:
            url = f"{self.base_url}/DisasterDeclarationsSummaries"
            params = {
                'state': state,
                '$top': 10,
                '$orderby': 'declarationDate desc'
            }
            
            headers = {
                'Authorization': f'Bearer {self.api_key}'
            }
            
            response = requests.get(url, params=params, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return data.get('DisasterDeclarationsSummaries', [])
            else:
                print(f"FEMA API error: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"Error getting disaster declarations: {e}")
            return []
    
    def combine_risk_score(self, fema_score: float, gee_score: float) -> float:
        """
        Combine FEMA and GEE risk scores into a single score
        FEMA provides static flood zone data
        GEE provides dynamic precipitation/elevation data
        """
        # Weight: 60% FEMA static zones, 40% GEE dynamic data
        combined_score = (0.6 * fema_score) + (0.4 * gee_score)
        return min(1.0, max(0.0, combined_score))

