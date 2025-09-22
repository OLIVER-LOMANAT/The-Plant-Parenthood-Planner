from flask import Flask, jsonify, request
from flask_cors import CORS
from model import db, User
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