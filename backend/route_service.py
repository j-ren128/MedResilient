"""Route and emission calculation service"""
import googlemaps
from math import radians, cos, sin, asin, sqrt
from typing import Tuple, Optional, Dict
from config import Config


class RouteService:
    """Service for calculating routes and emissions"""
    
    def __init__(self):
        self.gmaps = googlemaps.Client(key=Config.GOOGLE_MAPS_API_KEY)
        self.emission_factors = Config.EMISSION_FACTORS
    
    def calculate_haversine_distance(self, lat1: float, lon1: float, 
                                     lat2: float, lon2: float) -> float:
        """
        Calculate the great circle distance between two points 
        on the earth (specified in decimal degrees)
        Returns distance in kilometers
        """
        # Convert decimal degrees to radians
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
        
        # Haversine formula
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        
        # Radius of earth in kilometers
        r = 6371
        
        return c * r
    
    def get_route_with_directions(self, origin_lat: float, origin_lon: float,
                                  dest_lat: float, dest_lon: float,
                                  mode: str = 'driving') -> Optional[Dict]:
        """
        Get route information using Google Maps Directions API
        Returns distance, duration, and polyline
        """
        try:
            origin = f"{origin_lat},{origin_lon}"
            destination = f"{dest_lat},{dest_lon}"
            
            # Request directions
            directions_result = self.gmaps.directions(
                origin,
                destination,
                mode=mode,
                departure_time='now',
                alternatives=True
            )
            
            if not directions_result:
                return None
            
            # Get the first (best) route
            route = directions_result[0]
            leg = route['legs'][0]
            
            # Extract information
            distance_meters = leg['distance']['value']
            distance_km = distance_meters / 1000.0
            duration_seconds = leg['duration']['value']
            duration_text = leg['duration']['text']
            polyline = route['overview_polyline']['points']
            

            return {
                'distance_km': distance_km,
                'duration_seconds': duration_seconds,
                'duration_text': duration_text,
                'polyline': polyline,
                'start_address': leg['start_address'],
                'end_address': leg['end_address']
            }
            
        except Exception as e:
            print(f"Error getting route directions: {e}")
            # Fallback to haversine distance
            distance_km = self.calculate_haversine_distance(
                origin_lat, origin_lon, dest_lat, dest_lon
            )
            return {
                'distance_km': distance_km,
                'duration_seconds': None,
                'duration_text': 'Estimated',
                'polyline': None,
                'start_address': f"{origin_lat},{origin_lon}",
                'end_address': f"{dest_lat},{dest_lon}"
            }
    
    def calculate_carbon_emission(self, distance_km: float, 
                                  transport_mode: str) -> float:
        """
        Calculate carbon emission for a route
        Returns kg CO2
        """
        # Get emission factor for transport mode
        emission_factor = self.emission_factors.get(
            transport_mode.lower(), 
            self.emission_factors['truck']  # Default to truck
        )
        
        # Calculate total emission
        emission_kg = distance_km * emission_factor
        
        return emission_kg
    
    def get_route_details(self, origin_lat: float, origin_lon: float,
                         dest_lat: float, dest_lon: float,
                         transport_mode: str) -> Dict:
        """
        Get complete route details including distance, emissions, and polyline
        """
        # Try to get route from Google Maps API
        route_info = self.get_route_with_directions(
            origin_lat, origin_lon, dest_lat, dest_lon
        )
        
        if route_info:
            distance_km = route_info['distance_km']
            polyline = route_info['polyline']
            duration = route_info['duration_text']
        else:
            # Fallback to haversine
            distance_km = self.calculate_haversine_distance(
                origin_lat, origin_lon, dest_lat, dest_lon
            )
            polyline = None
            duration = 'Estimated'
        
        # Calculate emissions
        carbon_emission = self.calculate_carbon_emission(distance_km, transport_mode)
        
        return {
            'distance_km': distance_km,
            'carbon_emission_kg': carbon_emission,
            'transport_mode': transport_mode,
            'polyline': polyline,
            'estimated_time': duration
        }
    
    def compare_transport_modes(self, distance_km: float) -> Dict[str, float]:
        """
        Compare carbon emissions across different transport modes
        """
        comparisons = {}
        
        for mode, factor in self.emission_factors.items():
            comparisons[mode] = {
                'emission_kg': distance_km * factor,
                'emission_factor': factor
            }
        
        return comparisons

