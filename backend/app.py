# init_db.py
import os
from app import app, db
from model import User, Species, Plants, Care_Events
from datetime import date
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

def init_database():
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Check if data already exists
        if User.query.first() is None:
            print("Seeding database...")
            
            # Create users with passwords
            users = [
                User(
                    username='plant_lover', 
                    email='plantlover@email.com',
                    password_hash=bcrypt.generate_password_hash('password123').decode('utf-8')
                ),
                User(
                    username='green_thumb', 
                    email='greenthumb@email.com',
                    password_hash=bcrypt.generate_password_hash('password123').decode('utf-8')
                ),
                User(
                    username='urban_gardener', 
                    email='gardener@email.com',
                    password_hash=bcrypt.generate_password_hash('password123').decode('utf-8')
                )
            ]

            species = [
                Species(
                    common_name='Snake Plant', 
                    scientific_name='Dracaena trifasciata', 
                    watering_frequency='Every 2-3 weeks'
                ),
                Species(
                    common_name='Peace Lily', 
                    scientific_name='Spathiphyllum', 
                    watering_frequency='Weekly'
                ),
                Species(
                    common_name='Spider Plant', 
                    scientific_name='Chlorophytum comosum', 
                    watering_frequency='Every 1-2 weeks'
                )
            ]

            plants = [
                Plants(nickname='Snakey', species=species[0]),
                Plants(nickname='Lily', species=species[1]),
                Plants(nickname='Spidey', species=species[2]),
                Plants(nickname='Green Giant', species=species[0])
            ]

            db.session.add_all(users + species + plants)
            db.session.commit()

            # Assign plants to users
            plants[0].users.append(users[0])
            plants[1].users.append(users[0]) 
            plants[2].users.append(users[1]) 
            plants[3].users.append(users[2])

            db.session.commit()
            print("Database seeded successfully!")
        else:
            print("Database already contains data.")

if __name__ == '__main__':
    init_database()