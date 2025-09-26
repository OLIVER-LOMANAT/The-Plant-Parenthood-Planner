from flask import Flask, jsonify, request
from flask_cors import CORS
from model import db, User, Plants, Species, Care_Events
from datetime import datetime, date, timedelta
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
import jwt
import os

app = Flask(__name__)

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
migrate = Migrate(app, db)
CORS(app)
bcrypt = Bcrypt(app)

def verify_token():
    token = request.headers.get('Authorization')
    
    if not token:
        return None, jsonify({'message': 'Token is missing'}), 401
    
    try:
        if token.startswith('Bearer '):
            token = token[7:]
        
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        current_user = User.query.get(data['user_id'])
        
        if not current_user:
            return None, jsonify({'message': 'User not found'}), 401
            
        return current_user, None, None
        
    except jwt.ExpiredSignatureError:
        return None, jsonify({'message': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return None, jsonify({'message': 'Token is invalid'}), 401

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        if not data or 'username' not in data or 'email' not in data or 'password' not in data:
            return jsonify({"message": "Username, email, and password are required"}), 400
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({"message": "Username already exists"}), 409
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"message": "Email already exists"}), 409
        
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        user = User(
            username=data['username'], 
            email=data['email'],
            password_hash=hashed_password
        )
        
        db.session.add(user)
        db.session.commit()
        
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=7)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'message': 'User created successfully',
            'token': token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error creating user", "error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        if not data or 'username' not in data or 'password' not in data:
            return jsonify({"message": "Username and password are required"}), 400
        
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not bcrypt.check_password_hash(user.password_hash, data['password']):
            return jsonify({"message": "Invalid username or password"}), 401
        
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=7)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({"message": "Error during login", "error": str(e)}), 500

@app.route('/')
def home():
    return '<h1>Welcome to our homepage</h1>'

@app.route('/home')
def homePage():
    return '<h1>Welcome to our homepage</h1>'

@app.route('/users')
def get_users():
    current_user, error_response, status_code = verify_token()
    if error_response:
        return error_response, status_code
    
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

@app.route('/user/<int:id>')
def get_user(id):
    current_user, error_response, status_code = verify_token()
    if error_response:
        return error_response, status_code
    
    try:
        user = User.query.get_or_404(id)
        return jsonify(user.to_dict()), 200
    except:
        return jsonify({"message": "User does not exist"}), 404

@app.route('/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()

        if not data or 'username' not in data or 'email' not in data:
            return jsonify({"message": "Username and email are required"}), 400
        
        user = User(username=data['username'], email=data['email'])
        db.session.add(user)
        db.session.commit()
        return jsonify(user.to_dict()), 201
    except:
        return jsonify({"message": "Error creating user"}), 500

@app.route('/users/<int:user_id>/dashboard')
def user_dashboard(user_id):
    current_user, error_response, status_code = verify_token()
    if error_response:
        return error_response, status_code
    
    if current_user.id != user_id:
        return jsonify({"message": "Unauthorized access"}), 403
    
    try:
        user = User.query.get_or_404(user_id)
        plants_data = []
        
        for plant in user.plants:
            last_care = Care_Events.query.filter_by(plant_id=plant.id)\
                          .order_by(Care_Events.event_date.desc()).first()
            
            plant_info = plant.to_dict()
            plant_info['last_care_date'] = last_care.event_date if last_care else None
            plant_info['last_care_type'] = last_care.event_type if last_care else None
            
            plants_data.append(plant_info)
        
        return jsonify({
            'user': user.to_dict(),
            'plants': plants_data
        })
    except:
        return jsonify({"message": "Error loading dashboard"}), 500

@app.route('/users/<int:user_id>/plants', methods=['GET'])
def get_user_plants(user_id):
    current_user, error_response, status_code = verify_token()
    if error_response:
        return error_response, status_code
    
    if current_user.id != user_id:
        return jsonify({"message": "Unauthorized access"}), 403
    
    try:
        user = User.query.get_or_404(user_id)
        plants = user.plants
        
        if not plants:
            return jsonify({"message": "User has no plants"}), 200

        return jsonify([plant.to_dict() for plant in plants])
    except:
        return jsonify({"message": "Error retrieving plants"}), 500

@app.route('/plants', methods=['GET'])
def get_plants():
    current_user, error_response, status_code = verify_token()
    if error_response:
        return error_response, status_code
    
    try:
        user_id = request.args.get('user_id')
        
        if user_id:
            plants = Plants.query.filter(Plants.users.any(id=user_id)).all()
        else:
            plants = Plants.query.all()
        
        return jsonify([plant.to_dict() for plant in plants])
    except:
        return jsonify({"message": "Error retrieving plants"}), 500

@app.route('/plants', methods=['POST'])
def create_plant():
    current_user, error_response, status_code = verify_token()
    if error_response:
        return error_response, status_code
    
    try:
        data = request.get_json()
        
        if not data or 'nickname' not in data or 'species_id' not in data or 'user_id' not in data:
            return jsonify({"message": "Nickname, species_id, and user_id are required"}), 400
        
        if current_user.id != data['user_id']:
            return jsonify({"message": "Unauthorized access"}), 403
        
        plant = Plants(
            nickname=data['nickname'],
            species_id=data['species_id']
        )
        
        db.session.add(plant)
        db.session.flush()
        
        user = User.query.get(data['user_id'])
        if user:
            plant.users.append(user)
        
        db.session.commit()
        return jsonify(plant.to_dict()), 201
    except:
        db.session.rollback()
        return jsonify({"message": "Error creating plant"}), 500

@app.route('/plants/<int:plant_id>/care_events', methods=['POST'])
def add_care_event(plant_id):
    current_user, error_response, status_code = verify_token()
    if error_response:
        return error_response, status_code
    
    try:
        data = request.get_json()
        
        if not data or 'event_type' not in data or 'user_id' not in data:
            return jsonify({"message": "Event type and user_id are required"}), 400
        
        if current_user.id != data['user_id']:
            return jsonify({"message": "Unauthorized access"}), 403
        
        care_event = Care_Events(
            event_type=data['event_type'],
            event_date=datetime.now().date(),
            user_id=data['user_id'],
            plant_id=plant_id,
            notes=data.get('notes', '')
        )
        
        db.session.add(care_event)
        db.session.commit()
        return jsonify(care_event.to_dict()), 201
    except:
        db.session.rollback()
        return jsonify({"message": "Error adding care event"}), 500

@app.route('/plants/<int:id>', methods=['DELETE'])
def delete_plant(id):
    current_user, error_response, status_code = verify_token()
    if error_response:
        return error_response, status_code
    
    try:
        plant = Plants.query.get_or_404(id)
        db.session.delete(plant)
        db.session.commit()
        return jsonify({"message": "Plant deleted successfully"}), 200
    except:
        db.session.rollback()
        return jsonify({"message": "Error deleting plant"}), 500

@app.route('/species', methods=['GET'])
def get_all_species():
    current_user, error_response, status_code = verify_token()
    if error_response:
        return error_response, status_code
    
    try:
        species = Species.query.all()
        return jsonify([specie.to_dict() for specie in species]), 200
    except:
        return jsonify({"message": "Error retrieving species"}), 500

@app.route('/species', methods=['POST'])
def create_species():
    # Manual authentication check
    current_user, error_response, status_code = verify_token()
    if error_response:
        return error_response, status_code
    
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
    except:
        db.session.rollback()
        return jsonify({"message": "Error creating species"}), 500

@app.route('/species/<int:id>', methods=['GET'])
def get_species(id):
    
    current_user, error_response, status_code = verify_token()
    if error_response:
        return error_response, status_code
    
    try:
        species = Species.query.get_or_404(id)
        return jsonify(species.to_dict())
    except Exception as e:
        return jsonify({"message": "Species not found", "error": str(e)}), 404

if __name__ == '__main__':
    app.run(port=5555, debug=True)