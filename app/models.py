from app import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id             = db.Column(db.Integer, primary_key=True)
    username       = db.Column(db.String(64), index=True, unique=True)
    password       = db.Column(db.String(128))
    level          = db.Column(db.Integer())
    exp            = db.Column(db.Integer())
    expNextLevel   = db.Column(db.Integer())
    energy         = db.Column(db.Integer())
    energyMax      = db.Column(db.Integer())
    currencyGold   = db.Column(db.Integer())
    currencySilver = db.Column(db.Integer())

    def __repr__(self):                 return '<User {}>'.format(self.username)

    def set_password(self, password):   self.password = generate_password_hash(password)

    def check_password(self, password): return check_password_hash(self.password, password)