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

class Characteristic:
    # ВЛОЖЕННЫЕ ОЧКИ ХАРАКТЕРИСТИК!!!
    intPoints = db.Column(db.Integer(), default = 1) # Интеллект
    strPoints = db.Column(db.Integer(), default = 1) # Сила
    staPoints = db.Column(db.Integer(), default = 1) # Выносливость
    agiPoints = db.Column(db.Integer(), default = 1) # Ловкость
    lucPoints = db.Column(db.Integer(), default = 1) # Удача
    ergPoints = db.Column(db.Integer(), default = 1) # энергия

    pointParams = ('intPoints', 'strPoints', 'staPoints', 'agiPoints', 'lucPoints', 'ergPoints')
    
    def setPoints(self, namePoints, count):
        if not namePoints in Characteristic.pointParams: return 123
        value = getattr(self, namePoints)
        if value is None: value = 1
        if self.perPointsFree > count:
            self.perPointsFree -= count
        else:
            count = self.perPointsFree
            self.perPointsFree = 0
        value_new = value + count
        setattr(self, namePoints, value_new)
        return {namePoints:value_new, 'perPointsFree':self.perPointsFree}

    def resetPoints(self):
        self.perPointsFree = self.perPointsMax
        for name in Characteristic.pointParams:setattr(self, name, 1)
        return True

class Skills:
    skills = (

    )
    def useSkills(self, id):
        skills = getattr(self, 'skills' + id, None)
        if skills is None: return False
        return skills
    
    # self - тот кто применяет скилл, obj - к кому применяется скилл.
    def skills0(self, obj):
        damage = self.strPoints * random.randint(80, 100)
        obj.health -= damage
        return {'damage':damage, 'target':str(self)}
    


class Person(Characteristic, Skills):
    type      = db.Column(db.Integer(), default = 0) # тип героя
    level     = db.Column(db.Integer(), default = 1) # уровень героя
    health    = db.Column(db.Integer(), default = 100) # текущее здоровье
    maxHealth = db.Column(db.Integer(), default = 100) # максимальное здоровье

    perPointsFree = db.Column(db.Integer(), default = 5) # свободные очки характеристик performance points
    perPointsMax  = db.Column(db.Integer(), default = 5) # максимально доступное количество
    skillPointsFree = db.Column(db.Integer(), default = 1) # свободные очки навыков
    skillPointsMax = db.Column(db.Integer(), default = 1) # максимально доступное количество
    
    def __init__(self):
        super().__init__()
    
    # устанавливает ЛВЛ, и характеристики которые ему приемлют.
    def setLevel(self, level):
        o = level * 5
        self.level = level
        self.perPointsMax = o
        self.perPointsFree = o
        self.skillPointsMax = level
        self.skillPointsFree = level
    
    def initHealth(self):
        self.maxHealth = self.level * self.staPoints * 100
        self.health = self.maxHealth

class Hero(db.Model, Person):
    id           = db.Column(db.Integer(), primary_key=True)
    user_id      = db.Column(db.Integer(), db.ForeignKey('user.id'))
    exp          = db.Column(db.Integer(), default = 0) # текущее количество опыта
    expNextLevel = db.Column(db.Integer(), default = 10) # опыта до следующего уровня, так то по идеи можно и убрать... но не, не стоит:)
    energy    = db.Column(db.Integer(), default = 30) # текущее количество энергии
    energyMax = db.Column(db.Integer(), default = 30) # максимальное количество энергии

    battle_id = db.Column(db.Integer(), db.ForeignKey('battle.id'))
    battle = db.relationship("Battle", backref='hero')

    def __repr__(self): return f'hero'

    def getBattleInfo(self):
        result = dict()
        result.update({'health':self.health})
        result.update({'maxHealth':self.maxHealth})
        return result

class Enemies(db.Model, Person):
    id = db.Column(db.Integer, primary_key=True)

    battle_id = db.Column(db.Integer(), db.ForeignKey('battle.id'))
    battle = db.relationship("Battle", backref='enemies')

    def __repr__(self): return f'enemies'

    def getBattleInfo(self):
        result = dict()
        result.update({'health':self.health})
        result.update({'maxHealth':self.maxHealth})
        return result

class Battle(db.Model):
    id = db.Column(db.Integer(), primary_key = True)


    def close(self):
        self.hero.battle_id = None
        for e in self.enemies: db.session.delete(e)
        #db.session.delete(self)
    
    def getInfo(self):
        result = dict()
        result.update({'hero':self.hero[0].getBattleInfo()})
        result.update({'enemies':self.enemies[0].getBattleInfo()})
        return result
    
    def checkCommand(self, command):
        skills = command.get('skills')
        if not skills is None:
            result = list()
            use1 = self.hero[0].useSkills(skills)
            use2 = self.enemies[0].useSkills(skills)
            if use1 is False or use2 is False: return self.getInfo()
            resultUse = use1(self.enemies[0]) # герой атакует хз пусть возвращает инфу о уроне и кого атакует
            result.append({
                'skills':skills,
                'target':resultUse['target'], # почему так? потому что целью может является как и сам герой, когда хилит себя например...
                'info':self.getInfo()
            })
            db.session.commit()

            resultUse = use2(self.hero[0]) # враг атакует
            result.append({
                'skills':skills,
                'target':resultUse['target'], # почему так? потому что целью может является как и сам герой, когда хилит себя например...
                'info':self.getInfo()
            })
            db.session.commit()
            return result
        return self.getInfo()



class PullEnemies:
    paramSet = ('intPoints', 'strPoints', 'staPoints', 'agiPoints', 'lucPoints')

    @classmethod
    def createEnemies(cls, id, level):
        if id == 0: level += random.randint(0, 5)
        if id == 1: level += random.randint(5, 20)
        if id == 2: level += random.randint(20, 50)
        if id == 3: level += random.randint(50, 100)
        e = Enemies()
        e.setLevel(level = level)
        return e

    @classmethod
    def newEnemies(cls, id, level = 1):
        newEnemies = cls.createEnemies(id, level)
        cls.setRandomPerPoints(newEnemies)
        return newEnemies

    @classmethod
    def setRandomPerPoints(cls, o):
        maxPoint = round(o.perPointsMax / 5)
        minPoint = round(maxPoint / 2)
        for p in cls.paramSet: o.setPoints(p, random.randint(minPoint, maxPoint))
        o.setPoints(random.choice(cls.paramSet), o.perPointsFree)