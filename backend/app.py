"""Main Flask application for MedResilient backend"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename

from config import Config
from data_service import DataService
from recommendation_service import RecommendationService
from gee_service import GEEService
from fema_service import FEMAService


app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Initialize services
data_service = DataService()
recommendation_service = RecommendationService()
gee_service = GEEService()
fema_service = FEMAService()

# Ensure upload folder exists
os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'gee_initialized': gee_service.initialized
    })


@app.route('/api/hospitals', methods=['GET'])
def get_hospitals():
    """Get all hospitals"""
    try:
        hospitals = data_service.get_all_hospitals()
        return jsonify({
            'success': True,
            'count': len(hospitals),
            'hospitals': [h.to_dict() for h in hospitals]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/hospitals/<hospital_id>', methods=['GET'])
def get_hospital(hospital_id):
    """Get specific hospital by ID"""
    try:
        hospital = data_service.get_hospital_by_id(hospital_id)
        if hospital:
            return jsonify({
                'success': True,
                'hospital': hospital.to_dict()
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Hospital not found'
            }), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/providers', methods=['GET'])
def get_providers():
    """Get all providers"""
    try:
        providers = data_service.get_all_providers()
        return jsonify({
            'success': True,
            'count': len(providers),
            'providers': [p.to_dict() for p in providers]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/providers/<provider_id>', methods=['GET'])
def get_provider(provider_id):
    """Get specific provider by ID"""
    try:
        provider = data_service.get_provider_by_id(provider_id)
        if provider:
            return jsonify({
                'success': True,
                'provider': provider.to_dict()
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Provider not found'
            }), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/orders', methods=['GET'])
def get_orders():
    """Get all orders or filter by hospital/device"""
    try:
        hospital_id = request.args.get('hospital_id')
        device_name = request.args.get('device_name')
        
        if hospital_id:
            orders = data_service.get_orders_by_hospital(hospital_id)
        elif device_name:
            orders = data_service.get_orders_by_device(device_name)
        else:
            orders = data_service.get_all_orders()
        
        # Enrich orders with hospital and provider info
        enriched_orders = []
        for order in orders:
            hospital = data_service.get_hospital_by_id(order.hospital_id)
            provider = data_service.get_provider_by_id(order.provider_id)
            
            enriched_order = order.to_dict()
            if hospital:
                enriched_order['hospital'] = hospital.to_dict()
            if provider:
                enriched_order['provider'] = provider.to_dict()
            
            enriched_orders.append(enriched_order)
        
        return jsonify({
            'success': True,
            'count': len(enriched_orders),
            'orders': enriched_orders
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """
    Get supplier recommendations for a hospital
    Request body: {
        "hospital_id": "H001",
        "alpha": 0.6,  // optional
        "beta": 0.4,   // optional
        "limit": 5     // optional
    }
    """
    try:
        data = request.json
        hospital_id = data.get('hospital_id')
        alpha = data.get('alpha')
        beta = data.get('beta')
        limit = data.get('limit')
        
        if not hospital_id:
            return jsonify({
                'success': False,
                'error': 'hospital_id is required'
            }), 400
        
        hospital = data_service.get_hospital_by_id(hospital_id)
        if not hospital:
            return jsonify({
                'success': False,
                'error': 'Hospital not found'
            }), 404
        
        providers = data_service.get_all_providers()
        
        recommendations = recommendation_service.generate_recommendations(
            hospital, providers, alpha, beta, limit
        )
        
        return jsonify({
            'success': True,
            'hospital': hospital.to_dict(),
            'count': len(recommendations),
            'recommendations': [r.to_dict() for r in recommendations]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/analyze-provider', methods=['POST'])
def analyze_provider():
    """
    Analyze a specific provider-hospital combination
    Request body: {
        "hospital_id": "H001",
        "provider_id": "P001"
    }
    """
    try:
        data = request.json
        hospital_id = data.get('hospital_id')
        provider_id = data.get('provider_id')
        
        if not hospital_id or not provider_id:
            return jsonify({
                'success': False,
                'error': 'hospital_id and provider_id are required'
            }), 400
        
        hospital = data_service.get_hospital_by_id(hospital_id)
        provider = data_service.get_provider_by_id(provider_id)
        
        if not hospital or not provider:
            return jsonify({
                'success': False,
                'error': 'Hospital or provider not found'
            }), 404
        
        analysis = recommendation_service.analyze_current_provider(
            hospital, provider
        )
        
        return jsonify({
            'success': True,
            'hospital': hospital.to_dict(),
            'provider': provider.to_dict(),
            'analysis': analysis
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/mapdata', methods=['GET'])
def get_map_data():
    """Get all data needed for map visualization"""
    try:
        hospitals = data_service.get_all_hospitals()
        providers = data_service.get_all_providers()
        
        # Get flood risk for each location
        hospital_markers = []
        for hospital in hospitals:
            fema_data = fema_service.get_flood_zone(
                hospital.latitude, hospital.longitude
            )
            marker = hospital.to_dict()
            marker['flood_zone'] = fema_data['zone']
            marker['risk_level'] = fema_data['risk_level']
            hospital_markers.append(marker)
        
        provider_markers = []
        for provider in providers:
            fema_data = fema_service.get_flood_zone(
                provider.latitude, provider.longitude
            )
            marker = provider.to_dict()
            marker['flood_zone'] = fema_data['zone']
            marker['risk_level'] = fema_data['risk_level']
            provider_markers.append(marker)
        
        return jsonify({
            'success': True,
            'hospitals': hospital_markers,
            'providers': provider_markers
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/flood-risk', methods=['POST'])
def get_flood_risk():
    """
    Get flood risk for a specific location
    Request body: {
        "latitude": 25.7907,
        "longitude": -80.2108
    }
    """
    try:
        data = request.json
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        if latitude is None or longitude is None:
            return jsonify({
                'success': False,
                'error': 'latitude and longitude are required'
            }), 400
        
        # Get FEMA data
        fema_data = fema_service.get_flood_zone(latitude, longitude)
        
        # Get GEE data
        gee_risk = gee_service.get_flood_susceptibility(latitude, longitude)
        precipitation = gee_service.get_precipitation_data(latitude, longitude)
        elevation = gee_service.get_elevation(latitude, longitude)
        
        # Combine scores
        combined_risk = fema_service.combine_risk_score(
            fema_data['risk_score'], gee_risk
        )
        
        return jsonify({
            'success': True,
            'location': {
                'latitude': latitude,
                'longitude': longitude
            },
            'fema': fema_data,
            'gee': {
                'flood_susceptibility': gee_risk,
                'precipitation_30day_mm': precipitation,
                'elevation_m': elevation
            },
            'combined_risk_score': combined_risk
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/upload', methods=['POST'])
def upload_file():
    """
    Upload CSV file to update data
    Form data:
        - file: CSV file
        - type: 'hospitals', 'providers', or 'orders'
    """
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400
        
        file = request.files['file']
        csv_type = request.form.get('type')
        
        if not csv_type or csv_type not in ['hospitals', 'providers', 'orders']:
            return jsonify({
                'success': False,
                'error': 'Invalid type. Must be hospitals, providers, or orders'
            }), 400
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
            file.save(filepath)
            
            # Update data from CSV
            success = data_service.update_from_csv(csv_type, filepath)
            
            if success:
                return jsonify({
                    'success': True,
                    'message': f'{csv_type} data updated successfully'
                })
            else:
                return jsonify({
                    'success': False,
                    'error': 'Failed to parse CSV file'
                }), 400
        else:
            return jsonify({
                'success': False,
                'error': 'Invalid file type. Only CSV files are allowed'
            }), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    Config.init_app(app)
    print("Starting MedResilient Backend API...")
    print(f"GEE Initialized: {gee_service.initialized}")
    app.run(debug=Config.DEBUG, host='0.0.0.0', port=5000)

