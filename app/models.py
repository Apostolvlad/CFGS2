from app import db
from werkzeug.security import generate_password_hash, check_password_hash
import random

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
#####################################################################################################################
class Skills:
    skills = ()
    def useSkills(self, id):
        skills = getattr(self, 'skills' + id, None)
        if skills is None: return False
        return skills
    
    # self - тот кто применяет скилл, obj - к кому применяется скилл.
    def skills0(self, obj):
        damage = self.strPoints * random.randint(80, 100)
        obj.health -= damage
        return {'damage':damage, 'target':str(self)}
##################################################################################################################### 
class Hero(db.Model):
    id        = db.Column(db.Integer(), primary_key = True)
    type      = db.Column(db.Integer(), default = 0) # тип героя
    level     = db.Column(db.Integer(), default = 1) # уровень героя
    user_id   = db.Column(db.Integer(), db.ForeignKey('user.id'))
    battle_id = db.Column(db.Integer(), db.ForeignKey('battle.id'))
    battle    = db.relationship("Battle", backref = 'hero')
#####################################################################################################################
    intPoints = db.Column(db.Integer(), default = 1) # Интеллект
    strPoints = db.Column(db.Integer(), default = 1) # Сила
    staPoints = db.Column(db.Integer(), default = 1) # Выносливость
    agiPoints = db.Column(db.Integer(), default = 1) # Ловкость
    lucPoints = db.Column(db.Integer(), default = 1) # Удача
    ergPoints = db.Column(db.Integer(), default = 1) # энергия
    perPointNames = ('intPoints', 'strPoints', 'staPoints', 'agiPoints', 'lucPoints', 'ergPoints')
#####################################################################################################################
    perPointsFree   = db.Column(db.Integer(), default = 5) # свободные очки характеристик performance points
    perPointsMax    = db.Column(db.Integer(), default = 5) # максимально доступное количество
    skillPointsFree = db.Column(db.Integer(), default = 1) # свободные очки навыков
    skillPointsMax  = db.Column(db.Integer(), default = 1) # максимально доступное количество
#####################################################################################################################
    exp    = db.Column(db.Integer(), default = 0) # текущее количество опыта
    energy = db.Column(db.Integer(), default = 30) # текущая энергия
    health = db.Column(db.Integer(), default = 100) # текущее здоровье
    @property
    def expMax(self): return 10 * 1.5 ** self.level # опыт до следующего уровня.
    @property
    def energyMax(self): return self.ergPoints * 5 # максимальная энергия
    @property
    def healthMax(self): return self.staPoints * 100 # максимальное здоровье
#####################################################################################################################   
    def __repr__(self): return f'HERO battle_id = {self.battle_id}, type = {self.type}, lvl = {self.level}.'
#####################################################################################################################
    def upLevel(self):
        self.level += 1
        self.perPointsMax += 5
        self.perPointsFree += 5
        self.skillPointsMax += 1
        self.skillPointsFree += 1
    
    def setExp(self, exp):
        self.exp += exp
        while 1:
            expMax = self.expMax
            if self.exp < expMax:break
            self.exp = self.exp - expMax
            self.upLevel()
#####################################################################################################################       
    def resetPerPoints(self):
        self.perPointsFree = self.perPointsMax
        for name in Hero.perPointNames:setattr(self, name, 1)
        return True
    
    def upPerPoints(self, perPointName, count):
        if not perPointName in Hero.perPointNames: return None
        value = getattr(self, perPointName)
        if value is None: value = 1
        if self.perPointsFree > count:
            self.perPointsFree -= count
        else:
            count = self.perPointsFree
            self.perPointsFree = 0
        value_new = value + count
        setattr(self, perPointName, value_new)
        return True
#####################################################################################################################
class Enemies(db.Model):
    id        = db.Column(db.Integer(), primary_key = True)
    type      = db.Column(db.Integer(), default = 0) # тип героя
    level     = db.Column(db.Integer(), default = 1) # уровень героя
    user_id   = db.Column(db.Integer(), db.ForeignKey('user.id'))
    battle_id = db.Column(db.Integer(), db.ForeignKey('battle.id'))
    battle = db.relationship("Battle", backref = 'enemies')
#####################################################################################################################
    intPoints = db.Column(db.Integer(), default = 1) # Интеллект
    strPoints = db.Column(db.Integer(), default = 1) # Сила
    staPoints = db.Column(db.Integer(), default = 1) # Выносливость
    agiPoints = db.Column(db.Integer(), default = 1) # Ловкость
    lucPoints = db.Column(db.Integer(), default = 1) # Удача
    perPointNames = ('intPoints', 'strPoints', 'staPoints', 'agiPoints', 'lucPoints')
#####################################################################################################################
    perPointsMax    = db.Column(db.Integer(), default = 5) # максимально доступное количество
    skillPointsMax  = db.Column(db.Integer(), default = 1) # максимально доступное количество
#####################################################################################################################
    def __repr__(self): return f'ENEMIES battle_id = {self.battle_id}, type = {self.type}, lvl = {self.level}.'

    def __init__(self, type, level):
        self.type = type
        self.setLevel(level)
        self.setRandomPoints()
#####################################################################################################################
    def setLevel(self, level):
        self.level = level
        self.perPointsMax = 5 * level
        self.skillPointsMax = level
    
    def setPerPoints(self, perPointName, count):
        if not perPointName in Enemies.perPointNames: return None
        value = getattr(self, perPointName)
        if value is None: value = 1
        if self.perPointsFree > count:
            self.perPointsFree -= count
        else:
            count = self.perPointsFree
            self.perPointsFree = 0
        value_new = value + count
        setattr(self, perPointName, value_new)
        return True

    def setRandomPoints(self):
        maxPoint = round(self.perPointsMax / 5)
        minPoint = round(maxPoint / 2)
        for p in Enemies.perPointNames.paramSet: self.setPerPoints(p, random.randint(minPoint, maxPoint))
        self.setPerPoints(random.choice(Enemies.perPointNames), self.perPointsFree)
#####################################################################################################################
class Battle(db.Model):
    id = db.Column(db.Integer(), primary_key = True)

    def close(self):
        self.hero.battle_id = None
        for e in self.enemies: db.session.delete(e)
        #db.session.delete(self)
#####################################################################################################################