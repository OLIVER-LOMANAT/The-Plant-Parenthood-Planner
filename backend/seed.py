import os
from app import app, db
from model import User, Species, Plants, Care_Events
from datetime import date

def seed_database():
    if os.path.exists('app.db'):
        os.remove('app.db')
        print("Removed old database")
    
    if os.path.exists('migrations'):
        import shutil
        shutil.rmtree('migrations')
        print("Removed migrations folder")
    
    with app.app_context():
        print("Creating all tables...")
        db.create_all()
        
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('user')]
        print("User table columns:", columns)
        
        if 'password_hash' not in columns:
            print("ERROR: password_hash column not found in User table!")
            return
        
        print("Creating seed data with passwords...")
        
        users = [
            User(username='plant_lover', email='plantlover@email.com'),
            User(username='green_thumb', email='greenthumb@email.com'),
            User(username='urban_gardener', email='gardener@email.com')
        ]

        for user in users:
            user.set_password('password123')
            print("Set password for", user.username)

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
        
        db.session.add_all(users)
        db.session.add_all(species)
        db.session.commit()
        print("Added users and species")
        
        plants = [
            Plants(nickname='Snakey', species_id=species[0].id),
            Plants(nickname='Lily', species_id=species[1].id),
            Plants(nickname='Spidey', species_id=species[2].id),
            Plants(nickname='Green Giant', species_id=species[0].id)
        ]
        
        care_events = [
            Care_Events(
                event_type='watering',
                notes='First watering',
                event_date=date(2024, 1, 15), 
                user_id=users[0].id,
                plant_id=1
            ),
            Care_Events(
                event_type='fertilizing',
                notes='Organic fertilizer',
                event_date=date(2024, 1, 10), 
                user_id=users[1].id,
                plant_id=2
            )
        ]
        
        db.session.add_all(plants)
        db.session.add_all(care_events)
        db.session.commit()
        print("Added plants and care events")
        
        plants[0].users.append(users[0])
        plants[1].users.append(users[0]) 
        plants[2].users.append(users[1]) 
        plants[3].users.append(users[2])

        db.session.commit()
        print("Set up plant ownership")
        
        print("Database reset and seeded successfully!")
        print("Test users created:")
        print("Username: plant_lover, Password: password123")
        print("Username: green_thumb, Password: password123")
        print("Username: urban_gardener, Password: password123")

if __name__ == '__main__':
    seed_database()