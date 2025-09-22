from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_serializer import SerializerMixin

db = SQLAlchemy()


plant_owner = db.Table('plant_owner',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('plant_id', db.Integer, db.ForeignKey('plants.id'), primary_key=True)
)

class User(db.Model, SerializerMixin):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30), nullable=False, unique=True)
    email = db.Column(db.String(120), nullable=False, unique=True)

    plants = db.relationship('Plants', secondary=plant_owner, back_populates='users')
    care_events = db.relationship('Care_Events', back_populates='user')

    serialize_rules = ('-plants.users', '-care_events.user', '-plants.care_events')

    
class Species(db.Model, SerializerMixin):
    __tablename__ = 'species'
    
    id = db.Column(db.Integer, primary_key=True)
    common_name = db.Column(db.String(40), nullable=False)
    scientific_name = db.Column(db.String(40), nullable=False)
    watering_frequency = db.Column(db.String(40), nullable=False)
    
    plants = db.relationship('Plants', back_populates='species')
    
    serialize_rules = ('-plants.species',)
    


class Plants(db.Model, SerializerMixin):
    __tablename__ = 'plants'  
    
    id = db.Column(db.Integer, primary_key=True)
    nickname = db.Column(db.String(40), nullable=False)
    species_id = db.Column(db.Integer, db.ForeignKey('species.id')) 
    
    users = db.relationship('User', secondary=plant_owner, back_populates='plants')
    species = db.relationship('Species', back_populates='plants')
    care_events = db.relationship('Care_Events', back_populates='plant') 
    
    serialize_rules = ('-users.plants', '-species.plants', '-care_events.plant')


    

class Care_Events(db.Model, SerializerMixin):
    __tablename__ = 'care_events'
    
    id = db.Column(db.Integer, primary_key=True)
    event_type = db.Column(db.String(50), nullable=False)
    notes = db.Column(db.Text)
    event_date = db.Column(db.Date, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    plant_id = db.Column(db.Integer, db.ForeignKey('plants.id'))
    
    user = db.relationship('User', back_populates='care_events')
    plant = db.relationship('Plants', back_populates='care_events')  
    
    serialize_rules = ('-user.care_events', '-plant.care_events')
    