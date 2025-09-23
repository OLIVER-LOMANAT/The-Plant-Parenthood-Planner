from datetime import date
from app import app, db
from model import User, Species, Plants, Care_Events

def seed_data():
    with app.app_context():

        db.drop_all()
        db.create_all()

        users = [
            User(username='plant_lover', email='plantlover@email.com'),
            User(username='green_thumb', email='greenthumb@email.com'),
            User(username='urban_gardener', email='gardener@email.com')
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

        
        care_events = [
            Care_Events(
                event_type='watering',
                notes='First watering',
                event_date=date(2024, 1, 15), 
                user=users[0],
                plant=plants[0]
            ),
            Care_Events(
                event_type='fertilizing',
                notes='Organic fertilizer',
                event_date=date(2024, 1, 10), 
                user=users[1],
                plant=plants[1]
            )
        ]

        
        db.session.add_all(users + species + plants + care_events)
        db.session.commit()

        
        plants[0].users.append(users[0])
        plants[1].users.append(users[0]) 
        plants[2].users.append(users[1]) 
        plants[3].users.append(users[2])

        db.session.commit()

        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_data()