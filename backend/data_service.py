"""Service for loading and managing data"""
import pandas as pd
import json
from typing import List, Optional
from models import Hospital, Provider, Order
from config import Config


class DataService:
    """Service for managing hospitals, providers, and orders data"""
    
    def __init__(self):
        self.hospitals: List[Hospital] = []
        self.providers: List[Provider] = []
        self.orders: List[Order] = []
        self.load_data()
    
    def load_data(self):
        """Load data from CSV files"""
        try:
            # Load hospitals
            df_hospitals = pd.read_csv(Config.HOSPITALS_CSV)
            self.hospitals = [
                Hospital(
                    hospital_id=row['hospital_id'],
                    name=row['name'],
                    address=row['address'],
                    city=row['city'],
                    state=row['state'],
                    zip=row['zip'],
                    latitude=float(row['latitude']),
                    longitude=float(row['longitude'])
                )
                for _, row in df_hospitals.iterrows()
            ]
            
            # Load providers
            df_providers = pd.read_csv(Config.PROVIDERS_CSV)
            self.providers = []
            for _, row in df_providers.iterrows():
                # Parse devices_supplied JSON field
                devices_supplied = []
                if 'devices_supplied' in row and pd.notna(row['devices_supplied']):
                    try:
                        devices_str = str(row['devices_supplied']).strip()
                        devices_supplied = json.loads(devices_str)
                    except json.JSONDecodeError:
                        print(f"Warning: Could not parse devices for provider {row['provider_id']}")
                        devices_supplied = []
                
                provider = Provider(
                    provider_id=row['provider_id'],
                    name=row['name'],
                    type=row['type'],
                    address=row['address'],
                    city=row['city'],
                    state=row['state'],
                    zip=row['zip'],
                    latitude=float(row['latitude']),
                    longitude=float(row['longitude']),
                    transport_mode=row['transport_mode'],
                    devices_supplied=devices_supplied
                )
                self.providers.append(provider)
            
            # Load orders
            df_orders = pd.read_csv(Config.ORDERS_CSV)
            self.orders = [
                Order(
                    order_id=row['order_id'],
                    hospital_id=row['hospital_id'],
                    provider_id=row['provider_id'],
                    device_name=row['device_name'],
                    quantity=int(row['quantity']),
                    order_date=row['order_date'],
                    delivery_date=row['delivery_date']
                )
                for _, row in df_orders.iterrows()
            ]
            
            print(f"Loaded {len(self.hospitals)} hospitals, {len(self.providers)} providers, {len(self.orders)} orders")
            
        except Exception as e:
            print(f"Error loading data: {e}")
            raise
    
    def get_all_hospitals(self) -> List[Hospital]:
        """Get all hospitals"""
        return self.hospitals
    
    def get_hospital_by_id(self, hospital_id: str) -> Optional[Hospital]:
        """Get hospital by ID"""
        for hospital in self.hospitals:
            if hospital.hospital_id == hospital_id:
                return hospital
        return None
    
    def get_all_providers(self) -> List[Provider]:
        """Get all providers"""
        return self.providers
    
    def get_provider_by_id(self, provider_id: str) -> Optional[Provider]:
        """Get provider by ID"""
        for provider in self.providers:
            if provider.provider_id == provider_id:
                return provider
        return None
    
    def get_all_orders(self) -> List[Order]:
        """Get all orders"""
        return self.orders
    
    def get_orders_by_hospital(self, hospital_id: str) -> List[Order]:
        """Get orders for a specific hospital"""
        return [order for order in self.orders if order.hospital_id == hospital_id]
    
    def get_orders_by_device(self, device_name: str) -> List[Order]:
        """Get orders for a specific device"""
        return [order for order in self.orders if device_name.lower() in order.device_name.lower()]
    
    def add_hospital(self, hospital: Hospital):
        """Add a new hospital"""
        self.hospitals.append(hospital)
    
    def add_provider(self, provider: Provider):
        """Add a new provider"""
        self.providers.append(provider)
    
    def add_order(self, order: Order):
        """Add a new order"""
        self.orders.append(order)
    
    def update_from_csv(self, csv_type: str, file_path: str):
        """Update data from uploaded CSV file"""
        try:
            if csv_type == 'hospitals':
                df = pd.read_csv(file_path)
                self.hospitals = [
                    Hospital(
                        hospital_id=row['hospital_id'],
                        name=row['name'],
                        address=row['address'],
                        city=row['city'],
                        state=row['state'],
                        zip=row['zip'],
                        latitude=float(row['latitude']),
                        longitude=float(row['longitude'])
                    )
                    for _, row in df.iterrows()
                ]
            elif csv_type == 'providers':
                df = pd.read_csv(file_path)
                self.providers = []
                for _, row in df.iterrows():
                    # Parse devices_supplied JSON field
                    devices_supplied = []
                    if 'devices_supplied' in row and pd.notna(row['devices_supplied']):
                        try:
                            devices_str = str(row['devices_supplied']).strip()
                            devices_supplied = json.loads(devices_str)
                        except json.JSONDecodeError:
                            print(f"Warning: Could not parse devices for provider {row['provider_id']}")
                            devices_supplied = []
                    
                    provider = Provider(
                        provider_id=row['provider_id'],
                        name=row['name'],
                        type=row['type'],
                        address=row['address'],
                        city=row['city'],
                        state=row['state'],
                        zip=row['zip'],
                        latitude=float(row['latitude']),
                        longitude=float(row['longitude']),
                        transport_mode=row['transport_mode'],
                        devices_supplied=devices_supplied
                    )
                    self.providers.append(provider)
            elif csv_type == 'orders':
                df = pd.read_csv(file_path)
                self.orders = [
                    Order(
                        order_id=row['order_id'],
                        hospital_id=row['hospital_id'],
                        provider_id=row['provider_id'],
                        device_name=row['device_name'],
                        quantity=int(row['quantity']),
                        order_date=row['order_date'],
                        delivery_date=row['delivery_date']
                    )
                    for _, row in df.iterrows()
                ]
            return True
        except Exception as e:
            print(f"Error updating from CSV: {e}")
            return False

