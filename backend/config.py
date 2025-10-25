import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""
    
    # Flask
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    # API Keys
    FEMA_API_KEY = os.getenv('FEMA_API_KEY')
    FEMA_CLIENT_ID = os.getenv('FEMA_CLIENT_ID')
    GEE_PROJECT_ID = os.getenv('GEE_PROJECT_ID')
    GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')
    
    # Upload settings
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'csv'}
    
    # Data paths
    DATA_FOLDER = 'data'
    HOSPITALS_CSV = os.path.join(DATA_FOLDER, 'hospitals.csv')
    PROVIDERS_CSV = os.path.join(DATA_FOLDER, 'providers.csv')
    ORDERS_CSV = os.path.join(DATA_FOLDER, 'orders.csv')
    
    # Model parameters
    DEFAULT_ALPHA = 0.6  # Flood risk weight
    DEFAULT_BETA = 0.4   # Carbon emission weight
    
    # Emission factors (kg CO2 per km)
    EMISSION_FACTORS = {
        'truck': 0.21,      # Heavy-duty truck
        'van': 0.15,        # Light commercial vehicle
        'air': 1.13,        # Air freight
        'rail': 0.03,       # Rail freight
        'ship': 0.01        # Sea freight
    }
    
    @staticmethod
    def init_app(app):
        """Initialize application with config"""
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        os.makedirs(Config.DATA_FOLDER, exist_ok=True)

