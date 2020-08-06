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
    battle    = db.relationship("Battle", backref = 'heros')
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
    energy = db.Column(db.Integer(), default = 30) # текущая энергия которая тратиться на участие в боях.
    health = db.Column(db.Integer(), default = 100) # текущее здоровье
    rage   = db.Column(db.Integer(), default = 0) # текущая ярость, тратиться для использования способностей., накапливается при ударах.
    @property
    def expMax(self): return 100 + (self.level * (self.level - 1)) # опыт до следующего уровня.
    @property
    def energyMax(self): return 25 + self.ergPoints * 5 # максимальная энергия
    @property
    def healthMax(self): return self.staPoints * 100 # максимальное здоровье
#####################################################################################################################  
    def checkRage(self, count):
        rage = self.rage - count
        if rage < 0: return self.rage, False
        return rage, True

    def upRage(self, count): 
        self.rage += count 
        if self.rage > 100: self.rage = 100

    def downRage(self, count): 
        self.rage, status = self.checkRage(count)
        return status
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
        return value_new
#####################################################################################################################

#####################################################################################################################

#####################################################################################################################
class Enemies(db.Model):
    id        = db.Column(db.Integer(), primary_key = True)
    type      = db.Column(db.Integer(), default = 0) # тип героя
    level     = db.Column(db.Integer(), default = 1) # уровень героя
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
    health = db.Column(db.Integer(), default = 100) # текущее здоровье
    rage   = db.Column(db.Integer(), default = 0) # текущая ярость, тратиться для использования способностей., накапливается при ударах.
    @property
    def healthMax(self): return self.staPoints * 100 # максимальное здоровье
##################################################################################################################### 
    def checkRage(self, count):
        rage = self.rage - count
        if rage < 0: return self.rage, False
        return rage, True

    def upRage(self, count): 
        self.rage += count 
        if self.rage > 100: self.rage = 100

    def downRage(self, count): 
        self.rage, status = self.checkRage(count)
        return status
#####################################################################################################################   
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
        if self.perPointsMax > count:
            self.perPointsMax -= count
        else:
            count = self.perPointsMax
            self.perPointsMax = 0
        value_new = value + count
        setattr(self, perPointName, value_new)
        return True

    def setRandomPoints(self):
        maxPoint = round(self.perPointsMax / 5)
        minPoint = round(maxPoint / 2)
        for p in Enemies.perPointNames: self.setPerPoints(p, random.randint(minPoint, maxPoint))
        self.setPerPoints(random.choice(Enemies.perPointNames), self.perPointsMax)
#####################################################################################################################
from skills import useSkill
from random import randint
class Battle(db.Model):
    id = db.Column(db.Integer(), primary_key = True)

    def close(self):
        self.hero.battle_id = None
        for e in self.enemies: db.session.delete(e)
        #db.session.delete(self)
    
    @property
    def hero(self): return self.heros[0]

    @property
    def enemy(self): return self.enemies[0]

    @property
    def status(self):
        if self.hero.health <= 0: return 1
        if self.enemy.health <= 0: return 2
        return 0

    # Автобой, если mode = False, значит идёт ход игрока.
    def autoStep(self, mode):
        if mode:
            return useSkill(randint(0, 1), self.enemy, self.hero)
        else:
            return useSkill(randint(0, 1), self.hero, self.enemy)

    # ход героя.
    def heroStep(self, mode): # номер скилла
        return useSkill(mode, self.hero, self.enemy) # кто юзает, враг, номер скилла. 


#####################################################################################################################