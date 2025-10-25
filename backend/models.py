"""Data models for MedResilient"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class Hospital:
    """Hospital model"""
    hospital_id: str
    name: str
    address: str
    city: str
    state: str
    zip: str
    latitude: float
    longitude: float
    
    def to_dict(self):
        return {
            'hospital_id': self.hospital_id,
            'name': self.name,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'zip': self.zip,
            'latitude': self.latitude,
            'longitude': self.longitude
        }


@dataclass
class Provider:
    """Medical supply provider model"""
    provider_id: str
    name: str
    type: str  # 'Distributor' or 'Manufacturer'
    address: str
    city: str
    state: str
    zip: str
    latitude: float
    longitude: float
    transport_mode: str  # truck, van, air, rail, ship
    devices_supplied: list = None  # List of devices this provider supplies
    
    def to_dict(self):
        return {
            'provider_id': self.provider_id,
            'name': self.name,
            'type': self.type,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'zip': self.zip,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'transport_mode': self.transport_mode,
            'devices_supplied': self.devices_supplied or []
        }


@dataclass
class Order:
    """Medical supply order model"""
    order_id: str
    hospital_id: str
    provider_id: str
    device_name: str
    quantity: int
    order_date: str
    delivery_date: str
    
    def to_dict(self):
        return {
            'order_id': self.order_id,
            'hospital_id': self.hospital_id,
            'provider_id': self.provider_id,
            'device_name': self.device_name,
            'quantity': self.quantity,
            'order_date': self.order_date,
            'delivery_date': self.delivery_date
        }


@dataclass
class RouteRecommendation:
    """Route recommendation with risk and emission data"""
    provider: Provider
    hospital: Hospital
    distance_km: float
    transport_mode: str
    carbon_emission_kg: float
    flood_risk: float  # 0-1 scale
    weighted_score: float
    route_polyline: Optional[str] = None
    estimated_time: Optional[str] = None
    
    def to_dict(self):
        return {
            'provider': self.provider.to_dict(),
            'hospital': self.hospital.to_dict(),
            'distance_km': round(self.distance_km, 2),
            'transport_mode': self.transport_mode,
            'carbon_emission_kg': round(self.carbon_emission_kg, 2),
            'flood_risk': round(self.flood_risk, 3),
            'weighted_score': round(self.weighted_score, 3),
            'route_polyline': self.route_polyline,
            'estimated_time': self.estimated_time
        }

