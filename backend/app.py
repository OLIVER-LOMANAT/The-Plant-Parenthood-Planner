from flask import Flask, jsonify, request, session
from flask_cors import CORS
from model import db, User, Plants, Species, Care_Events
from datetime import datetime, date
from flask_migrate import Migrate
import os
import bcrypt
import jwt
import datetime
from functools import wraps

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///app.db').replace('postgres://', 'postgresql://')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-very-secret-key-here-for-jwt')

db.init_app(app)
migrate = Migrate(app, db)

CORS(app, origins=["https://the-plant-parenthood-planner.vercel.app", "http://localhost:3000"])

# JWT Functions
def create_jwt_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
        'iat': datetime.datetime.utcnow()
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def verify_jwt_token(token):
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# JWT Decorator for protected routes
def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            return jsonify({"message": "Token is missing"}), 401
        
        try:
            token = token[7:]  # Remove 'Bearer ' prefix
            user_id = verify_jwt_token(token)
            if not user_id:
                return jsonify({"message": "Invalid token"}), 401
            
            user = User.query.get(user_id)
            if not user:
                return jsonify({"message": "User not found"}), 401
                
            return f(user, *args, **kwargs)
        except Exception as e:
            return jsonify({"message": "Token is invalid"}), 401
    
    return decorated

@app.route('/check-data', methods=['GET'])
def check_data():
    try:
        users_count = User.query.count()
        species_count = Species.query.count()
        plants_count = Plants.query.count()
        
        return jsonify({
            'users_count': users_count,
            'species_count': species_count,
            'plants_count': plants_count,
        }), 200
    except Exception as e:
        return jsonify({"message": "Error checking data", "error": str(e)}), 500

@app.route('/')
def home():
    return jsonify({
        "message": "Welcome to Plant Parenthood Planner API",
        "status": "running",
        "version": "jwt-authentication"
    })

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        if not data or 'username' not in data or 'email' not in data or 'password' not in data:
            return jsonify({"message": "Username, email and password are required"}), 400
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({"message": "Username already exists"}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"message": "Email already exists"}), 400
        
        user = User(username=data['username'], email=data['email'])
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()

        # Create JWT token for new user
        token = create_jwt_token(user.id)
        
        return jsonify({
            "message": "User created successfully",
            "user": user.to_dict(),
            "token": token
        }), 201
    except Exception as e:
        return jsonify({"message": "Error creating user", "error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        if not data or 'username' not in data or 'password' not in data:
            return jsonify({"message": "Username and password are required"}), 400
        
        user = User.query.filter_by(username=data['username']).first()
        
        if user and user.check_password(data['password']):
            token = create_jwt_token(user.id)
            return jsonify({
                "message": "Login successful",
                "user": user.to_dict(),
                "token": token
            }), 200
        else:
            return jsonify({"message": "Invalid username or password"}), 401
    except Exception as e:
        return jsonify({"message": "Error during login", "error": str(e)}), 500

@app.route('/logout', methods=['POST'])
@jwt_required
def logout(user):
    # With JWT, logout is handled on the client side by removing the token
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/check-auth', methods=['GET'])
def check_auth():
    token = request.headers.get('Authorization')
    if token and token.startswith('Bearer '):
        token = token[7:]
        user_id = verify_jwt_token(token)
        if user_id:
            user = User.query.get(user_id)
            if user:
                return jsonify({
                    "authenticated": True,
                    "user": user.to_dict()
                }), 200
    
    return jsonify({"authenticated": False}), 200

# Protected routes with JWT
@app.route('/dashboard', methods=['GET'])
@jwt_required
def user_dashboard(user):
    try:
        plants_data = []
        
        for plant in user.plants:
            last_care = Care_Events.query.filter_by(plant_id=plant.id)\
                          .order_by(Care_Events.event_date.desc()).first()
            
            species_info = None
            if plant.species:
                species_info = {
                    'id': plant.species.id,
                    'common_name': plant.species.common_name,
                    'scientific_name': plant.species.scientific_name,
                    'watering_frequency': plant.species.watering_frequency
                }
            
            plant_info = {
                'id': plant.id,
                'nickname': plant.nickname,
                'species_id': plant.species_id,
                'species': species_info,
                'last_care_date': last_care.event_date.isoformat() if last_care else None,
                'last_care_type': last_care.event_type if last_care else None
            }
            
            plants_data.append(plant_info)
        
        return jsonify({
            'user': user.to_dict(),
            'plants': plants_data,
            'plants_count': len(plants_data)
        }), 200
    except Exception as e:
        return jsonify({"message": "Error loading dashboard", "error": str(e)}), 500

@app.route('/plants', methods=['GET'])
@jwt_required
def get_plants(user):
    try:
        plants = user.plants
        
        if not plants:
            return jsonify({"message": "User has no plants", "plants": []}), 200

        return jsonify([plant.to_dict() for plant in plants]), 200
    except Exception as e:
        return jsonify({"message": "Error retrieving plants", "error": str(e)}), 500

@app.route('/plants', methods=['POST'])
@jwt_required
def create_plant(user):
    try:
        data = request.get_json()
        
        if not data or 'nickname' not in data or 'species_id' not in data:
            return jsonify({"message": "Nickname and species_id are required"}), 400
        
        plant = Plants(
            nickname=data['nickname'],
            species_id=data['species_id']
        )
        
        db.session.add(plant)
        db.session.flush()
        
        plant.users.append(user)
        
        db.session.commit()
        return jsonify(plant.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error creating plant", "error": str(e)}), 500

@app.route('/plants/<int:plant_id>/care_events', methods=['POST'])
@jwt_required
def add_care_event(user, plant_id):
    try:
        data = request.get_json()
        
        if not data or 'event_type' not in data:
            return jsonify({"message": "Event type is required"}), 400
        
        care_event = Care_Events(
            event_type=data['event_type'],
            event_date=datetime.now().date(),
            user_id=user.id,
            plant_id=plant_id,
            notes=data.get('notes', '')
        )
        
        db.session.add(care_event)
        db.session.commit()
        return jsonify(care_event.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error adding care event", "error": str(e)}), 500

@app.route('/plants/<int:id>', methods=['DELETE'])
@jwt_required
def delete_plant(user, id):
    try:
        plant = Plants.query.get_or_404(id)
        
        if user not in plant.users:
            return jsonify({"message": "Not authorized to delete this plant"}), 403
            
        db.session.delete(plant)
        db.session.commit()
        return jsonify({"message": "Plant deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting plant", "error": str(e)}), 500

# Public routes (no JWT required)
@app.route('/species', methods=['GET'])
def get_all_species():
    try:
        species = Species.query.all()
        return jsonify([specie.to_dict() for specie in species]), 200
    except Exception as e:
        return jsonify({"message": "Error retrieving species", "error": str(e)}), 500

@app.route('/species', methods=['POST'])
def create_species():
    try:
        data = request.get_json()
        
        required_fields = ['common_name', 'scientific_name', 'watering_frequency']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"message": "Common name, scientific name, and watering frequency are required"}), 400
        
        existing_species = Species.query.filter_by(scientific_name=data['scientific_name']).first()
        if existing_species:
            return jsonify({"message": "Species with this scientific name already exists"}), 409
        
        species = Species(
            common_name=data['common_name'],
            scientific_name=data['scientific_name'],
            watering_frequency=data['watering_frequency']
        )
        
        db.session.add(species)
        db.session.commit()
        return jsonify(species.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error creating species", "error": str(e)}), 500

@app.route('/species/<int:id>', methods=['GET'])
def get_species(id):
    try:
        species = Species.query.get_or_404(id)
        return jsonify(species.to_dict()), 200
    except Exception as e:
        return jsonify({"message": "Species not found", "error": str(e)}), 404

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=False)