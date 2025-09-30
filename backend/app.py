from flask import Flask, jsonify, request, session
from flask_cors import CORS
from model import db, User, Plants, Species, Care_Events
from datetime import datetime, date
from flask_migrate import Migrate
import os
import bcrypt

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///app.db').replace('postgres://', 'postgresql://')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')

db.init_app(app)
migrate = Migrate(app, db)

CORS(app, supports_credentials=True)

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
        "version": "with-authentication"
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

        session['user_id'] = user.id
        
        return jsonify({
            "message": "User created successfully",
            "user": user.to_dict()
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
            session['user_id'] = user.id
            return jsonify({
                "message": "Login successful",
                "user": user.to_dict()
            }), 200
        else:
            return jsonify({"message": "Invalid username or password"}), 401
    except Exception as e:
        return jsonify({"message": "Error during login", "error": str(e)}), 500

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/check-auth', methods=['GET'])
def check_auth():
    user_id = session.get('user_id')
    if user_id:
        user = User.query.get(user_id)
        if user:
            return jsonify({
                "authenticated": True,
                "user": user.to_dict()
            }), 200
    
    return jsonify({"authenticated": False}), 200

def get_current_user():
    user_id = session.get('user_id')
    if user_id:
        return User.query.get(user_id)
    return None

@app.route('/users', methods=['GET'])
def get_users():
    try:
        users = User.query.all()
        return jsonify([user.to_dict() for user in users]), 200
    except Exception as e:
        return jsonify({"message": "Error retrieving users", "error": str(e)}), 500

@app.route('/user/<int:id>', methods=['GET'])
def get_user(id):
    try:
        user = User.query.get_or_404(id)
        return jsonify(user.to_dict()), 200
    except:
        return jsonify({"message": "User does not exist"}), 404

@app.route('/dashboard', methods=['GET'])
def user_dashboard():
    try:
        user = get_current_user()
        if not user:
            return jsonify({"message": "Not authenticated"}), 401
            
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
def get_plants():
    try:
        user = get_current_user()
        if not user:
            return jsonify({"message": "Not authenticated"}), 401
            
        plants = user.plants
        
        if not plants:
            return jsonify({"message": "User has no plants", "plants": []}), 200

        return jsonify([plant.to_dict() for plant in plants]), 200
    except Exception as e:
        return jsonify({"message": "Error retrieving plants", "error": str(e)}), 500

@app.route('/plants', methods=['POST'])
def create_plant():
    try:
        user = get_current_user()
        if not user:
            return jsonify({"message": "Not authenticated"}), 401
            
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
def add_care_event(plant_id):
    try:
        user = get_current_user()
        if not user:
            return jsonify({"message": "Not authenticated"}), 401
            
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
def delete_plant(id):
    try:
        user = get_current_user()
        if not user:
            return jsonify({"message": "Not authenticated"}), 401
            
        plant = Plants.query.get_or_404(id)
        
        if user not in plant.users:
            return jsonify({"message": "Not authorized to delete this plant"}), 403
            
        db.session.delete(plant)
        db.session.commit()
        return jsonify({"message": "Plant deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting plant", "error": str(e)}), 500

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