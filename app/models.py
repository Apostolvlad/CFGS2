from app import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id             = db.Column(db.Integer, primary_key=True)
    heros          = db.relationship('Hero', backref='user', lazy='dynamic')
    hero_type      = db.Column(db.Integer(), default = 0)
    username       = db.Column(db.String(64), index=True, unique=True)
    password       = db.Column(db.String(128))
    currencyGold   = db.Column(db.Integer(), default = 10)
    currencySilver = db.Column(db.Integer(), default = 1000)

    def __repr__(self): return '<User {}>'.format(self.username)

    def set_password(self, password):   self.password = generate_password_hash(password)

    def check_password(self, password): return check_password_hash(self.password, password)

    #username, level, exp, expNextLevel, energy, energyMax, currencyGold, currencySilver
    @property
    def hero(self): return self.heros.filter_by(type = self.hero_type).one()


class Hero(db.Model):
    id           = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    type         = db.Column(db.Integer(), default = 0) # тип героя
    level        = db.Column(db.Integer(), default = 1) # уровень героя
    exp          = db.Column(db.Integer(), default = 0) # текущее количество опыта
    expNextLevel = db.Column(db.Integer(), default = 10) # опыта до следующего уровня, так то по идеи можно и убрать... но не, не стоит:)

    energy       = db.Column(db.Integer(), default = 30) # текущее количество энергии
    energyMax    = db.Column(db.Integer(), default = 30) # максимальное количество энергии

    perPointsFree = db.Column(db.Integer(), default = 5) # свободные очки характеристик performance points
    perPointsMax = db.Column(db.Integer(), default = 5) # максимально доступное количество 
    
    # ВЛОЖЕННЫЕ ОЧКИ ХАРАКТЕРИСТИК!!!
    intPoints = db.Column(db.Integer(), default = 1) # Интеллект
    strPoints = db.Column(db.Integer(), default = 1) # Сила
    staPoints = db.Column(db.Integer(), default = 1) # Выносливость
    agiPoints = db.Column(db.Integer(), default = 1) # Ловкость
    lucPoints = db.Column(db.Integer(), default = 1) # Удача  
    energyPoints = db.Column(db.Integer(), default = 1) # Удача  

    skillPointsFree = db.Column(db.Integer(), default = 1) # свободные очки навыков
    skillPointsMax = db.Column(db.Integer(), default = 1) # максимально доступное количество

    pointParams = ('intPoints', 'strPoints', 'staPoints', 'agiPoints', 'lucPoints', 'energyPoints')

    def __repr__(self): return f'<Hero = {self.type} lvl = {self.level}>'

    def setPoints(self, namePoints, count):
        if not namePoints in Hero.pointParams: return False
        value = getattr(self, namePoints)
        if value is None: return False
        if self.perPointsFree > count:
            self.perPointsFree -= count
        else:
            count = self.perPointsFree
            self.perPointsFree = 0
        value_new = value + count
        setattr(self, namePoints, value_new)
        db.session.commit()
        return {namePoints:value_new, 'perPointsFree':self.perPointsFree}

    def resetPoints(self):
        self.perPointsFree = self.perPointsMax
        for name in Hero.pointParams:setattr(self, name, 1)
        db.session.commit()
        return True