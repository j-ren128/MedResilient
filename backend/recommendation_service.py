"""Recommendation service for optimal supplier selection"""
from typing import List, Optional
from models import Hospital, Provider, RouteRecommendation
from gee_service import GEEService
from fema_service import FEMAService
from route_service import RouteService
from config import Config


class RecommendationService:
    """Service for generating supplier recommendations based on risk and emissions"""
    
    def __init__(self):
        self.gee_service = GEEService()
        self.fema_service = FEMAService()
        self.route_service = RouteService()
    
    def calculate_flood_risk(self, provider: Provider, hospital: Hospital) -> float:
        """
        Calculate combined flood risk for a route
        Combines FEMA static data and GEE dynamic data
        """
        # Get FEMA risk for both locations
        provider_fema = self.fema_service.get_flood_zone(
            provider.latitude, provider.longitude
        )
        hospital_fema = self.fema_service.get_flood_zone(
            hospital.latitude, hospital.longitude
        )
        
        # Get GEE risk for both locations
        provider_gee = self.gee_service.get_flood_susceptibility(
            provider.latitude, provider.longitude
        )
        hospital_gee = self.gee_service.get_flood_susceptibility(
            hospital.latitude, hospital.longitude
        )
        
        # Combine FEMA and GEE scores for each location
        provider_risk = self.fema_service.combine_risk_score(
            provider_fema['risk_score'], provider_gee
        )
        hospital_risk = self.fema_service.combine_risk_score(
            hospital_fema['risk_score'], hospital_gee
        )
        
        # Route risk is the maximum of the two endpoints
        # (weakest link in the chain)
        route_risk = max(provider_risk, hospital_risk)
        
        return route_risk
    
    def calculate_weighted_score(self, flood_risk: float, 
                                 carbon_emission: float,
                                 alpha: float = None,
                                 beta: float = None) -> float:
        """
        Calculate weighted score based on flood risk and carbon emission
        Score = α * flood_risk + β * normalized_carbon_emission
        Lower score is better
        """
        if alpha is None:
            alpha = Config.DEFAULT_ALPHA
        if beta is None:
            beta = Config.DEFAULT_BETA
        
        # Normalize carbon emission (assuming max reasonable emission is 500 kg CO2)
        normalized_carbon = min(carbon_emission / 500.0, 1.0)
        
        # Calculate weighted score
        score = (alpha * flood_risk) + (beta * normalized_carbon)
        
        return score
    
    def generate_recommendations(self, hospital: Hospital, 
                                providers: List[Provider],
                                alpha: float = None,
                                beta: float = None,
                                limit: int = None) -> List[RouteRecommendation]:
        """
        Generate ranked recommendations for suppliers to a hospital
        """
        recommendations = []
        
        for provider in providers:
            # Get route details
            route_details = self.route_service.get_route_details(
                provider.latitude,
                provider.longitude,
                hospital.latitude,
                hospital.longitude,
                provider.transport_mode
            )
            
            # Calculate flood risk
            flood_risk = self.calculate_flood_risk(provider, hospital)
            
            # Calculate weighted score
            weighted_score = self.calculate_weighted_score(
                flood_risk,
                route_details['carbon_emission_kg'],
                alpha,
                beta
            )
            
            # Create recommendation
            recommendation = RouteRecommendation(
                provider=provider,
                hospital=hospital,
                distance_km=route_details['distance_km'],
                transport_mode=route_details['transport_mode'],
                carbon_emission_kg=route_details['carbon_emission_kg'],
                flood_risk=flood_risk,
                weighted_score=weighted_score,
                route_polyline=route_details['polyline'],
                estimated_time=route_details['estimated_time']
            )
            
            recommendations.append(recommendation)
        
        # Sort by weighted score (lower is better)
        recommendations.sort(key=lambda x: x.weighted_score)
        
        # Return top N recommendations if limit specified
        if limit:
            return recommendations[:limit]
        
        return recommendations
    
    def get_best_provider(self, hospital: Hospital, 
                         providers: List[Provider],
                         alpha: float = None,
                         beta: float = None) -> Optional[RouteRecommendation]:
        """
        Get the single best provider recommendation
        """
        recommendations = self.generate_recommendations(
            hospital, providers, alpha, beta, limit=1
        )
        
        if recommendations:
            return recommendations[0]
        
        return None
    
    def analyze_current_provider(self, hospital: Hospital,
                                provider: Provider) -> dict:
        """
        Analyze risk and emissions for current provider
        """
        route_details = self.route_service.get_route_details(
            provider.latitude,
            provider.longitude,
            hospital.latitude,
            hospital.longitude,
            provider.transport_mode
        )
        
        flood_risk = self.calculate_flood_risk(provider, hospital)
        
        # Get FEMA zones for context
        provider_fema = self.fema_service.get_flood_zone(
            provider.latitude, provider.longitude
        )
        hospital_fema = self.fema_service.get_flood_zone(
            hospital.latitude, hospital.longitude
        )
        
        return {
            'distance_km': route_details['distance_km'],
            'carbon_emission_kg': route_details['carbon_emission_kg'],
            'flood_risk': flood_risk,
            'provider_flood_zone': provider_fema['zone'],
            'hospital_flood_zone': hospital_fema['zone'],
            'transport_mode': provider.transport_mode,
            'estimated_time': route_details['estimated_time']
        }

