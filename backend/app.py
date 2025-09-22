from flask import Flask
from flask_cors import CORS
from model import db
app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI']='sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONs']=False

db.init_app(app)

CORS(app)

@app.route('home')
def homePage():
    return '<h1>Wlcome to our homepage</h1>'
