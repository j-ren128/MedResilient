"""Tests for backend services"""
import pytest
from data_service import DataService
from route_service import RouteService
from config import Config


def test_data_service_load():
    """Test that data service loads correctly"""
    service = DataService()
    
    assert len(service.get_all_hospitals()) > 0
    assert len(service.get_all_providers()) > 0
    assert len(service.get_all_orders()) > 0


def test_hospital_retrieval():
    """Test hospital retrieval"""
    service = DataService()
    
    # Test get all
    hospitals = service.get_all_hospitals()
    assert len(hospitals) > 0
    
    # Test get by ID
    first_hospital = hospitals[0]
    retrieved = service.get_hospital_by_id(first_hospital.hospital_id)
    assert retrieved is not None
    assert retrieved.hospital_id == first_hospital.hospital_id


def test_provider_retrieval():
    """Test provider retrieval"""
    service = DataService()
    
    providers = service.get_all_providers()
    assert len(providers) > 0
    
    first_provider = providers[0]
    retrieved = service.get_provider_by_id(first_provider.provider_id)
    assert retrieved is not None
    assert retrieved.provider_id == first_provider.provider_id


def test_haversine_distance():
    """Test haversine distance calculation"""
    route_service = RouteService()
    
    # Miami to Tampa (approximately 280 km)
    miami_lat, miami_lon = 25.7907, -80.2108
    tampa_lat, tampa_lon = 27.9444, -82.4619
    
    distance = route_service.calculate_haversine_distance(
        miami_lat, miami_lon, tampa_lat, tampa_lon
    )
    
    # Should be around 280 km
    assert 250 < distance < 300


def test_carbon_emission_calculation():
    """Test carbon emission calculation"""
    route_service = RouteService()
    
    distance_km = 100
    
    # Test truck emissions
    truck_emission = route_service.calculate_carbon_emission(distance_km, 'truck')
    assert truck_emission == 100 * Config.EMISSION_FACTORS['truck']
    
    # Test air emissions (should be higher)
    air_emission = route_service.calculate_carbon_emission(distance_km, 'air')
    assert air_emission > truck_emission


def test_orders_filtering():
    """Test order filtering"""
    service = DataService()
    
    all_orders = service.get_all_orders()
    assert len(all_orders) > 0
    
    # Test filter by hospital
    if all_orders:
        first_order = all_orders[0]
        hospital_orders = service.get_orders_by_hospital(first_order.hospital_id)
        assert len(hospital_orders) > 0
        assert all(o.hospital_id == first_order.hospital_id for o in hospital_orders)

