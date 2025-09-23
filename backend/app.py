from flask import Flask, jsonify, request
from flask_cors import CORS
from model import db, User, Plants, Species
app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI']='sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS']=False

db.init_app(app)

CORS(app)

@app.route('/home')
def homePage():
    return '<h1>Wlcome to our homepage</h1>'

@app.route('/users')
def get_users():
    users = User.query.all()

    return jsonify([user.to_dict() for user in users]), 201

@app.route('/user/<int:id>')
def get_user(id):
    try:
        user = User.query.get_or_404(id)
        return jsonify(user.to_dict()), 201
    except:
        return jsonify({"message": "User does not exist"}), 404
    
@app.route('/users' , methods=['POST'])
def create_user():
    
    try:
        data = request.get_json()

        if not data or 'username' not in data or 'email' not in data:
            return jsonify({"message": "Username and email"})
        user = User(username=data['username'], email=data['email'])

        db.session.add(user)
        db.session.commit()

        return jsonify(user.to_dict()), 201
    except:
        return jsonify({"message": "Error creating user"}), 404
    
@app.route('/users/<int:user_id>/plants', methods=['GET'])
def get_user_plants(user_id):
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
    try:
        data = request.get_json()
        
        if not data or 'nickname' not in data or 'species_id' not in data:
            return jsonify({"message": "Nickname and species_id are required"}), 400
        
        plant = Plants(
            nickname=data['nickname'],
            species_id=data['species_id']
        )
        
        db.session.add(plant)
        db.session.commit()
        
        return jsonify(plant.to_dict()), 201
        
    except:
        db.session.rollback()
        return jsonify({"message": "Error creating plant"}), 500

@app.route('/plants/<int:id>', methods=['DELETE'])
def delete_plant(id):
    try:
        plant = Plants.query.get_or_404(id)
        
        db.session.delete(plant)
        db.session.commit()
        
        return jsonify({"message": "Plant deleted successfully"}), 200
        
    except:
        db.session.rollback()
        return jsonify({"message": "Error deleting plant"}), 500
    
    # Saved

@app.route('/species', methods=['GET'])
def get_all_species():
    try:
        species = Species.query.all()
        return jsonify([specie.to_dict() for specie in species]), 201
    except:
        return jsonify({"message": "Error retrieveing species"}), 500


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
        
    except:
        db.session.rollback()
        return jsonify({"message": "Error creating species"}), 500
    
@app.route('/species/<int:id>', methods=['GET'])
def get_species(id):
    try:
        species = Species.query.get_or_404(id)
        return jsonify(species.to_dict())
    except Exception as e:
        return jsonify({"message": "Species not found", "error": str(e)}), 404
if __name__ == '__main__':
    app.run(port=5555, debug=True)