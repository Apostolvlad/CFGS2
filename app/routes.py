from flask import render_template, jsonify, request, flash, redirect, url_for
from werkzeug.urls import url_parse
from app import app
from datetime import datetime

from app import db
from app.models import User, Hero, Enemies, Battle

@app.route('/')
@app.route('/index')
def index():
    return render_template('game.html')#posts)

####################################################################################################################################
####################################################################################################################################
####################################################################################################################################
####################################################################################################################################
####################################################################################################################################

#http://127.0.0.1:5000/api/friends?count=10&offset=-10
@app.route('/api/friends', methods = ["GET", "POST"])
def getFriends():
    offset = int(request.args.get('offset', 0))
    count = int(request.args.get('count', 10)) 
    listFriends = [{'name':'Vlad', 'level':str(i)} for i in range(9999, 0, -1)] #9985
    if offset < 0: offset = len(listFriends) + 1 + offset
    if offset > len(listFriends): offset = 0
    return jsonify({'offsetFriends':offset, 'listFriends':listFriends[offset:offset + count]})

#http://127.0.0.1:5000/api/hero?params=username,level,exp,expNextLevel,energy,energyMax,currencyGold,currencySilver
@app.route('/api/hero', methods = ["GET", "POST"])
def getHeroInfo():
    command = request.args.get('command')
    user = User.query.filter_by(username = 'Vlad').first()
    hero = user.hero
    if command: 
        getattr(hero, command)()
        db.session.commit()
    result = dict() 
    for name in request.args.get('params').split(','): result.update({name:getattr(hero, name, getattr(user, name, None))})
    return jsonify(result)

####################################################################################################################################
####################################################################################################################################
####################################################################################################################################
####################################################################################################################################
####################################################################################################################################

#http://127.0.0.1:5000/api/skillpoint?name=intPoints&count=1
@app.route('/api/skillpoint', methods = ["GET", "PUT"])
def setSkillPoint():
    user = User.query.filter_by(username = 'Vlad').first()
    hero = user.hero
    namePoints = request.args.get('name')
    count = int(request.args.get('count'))
    result = hero.upPerPoints(namePoints, count)
    db.session.commit()
    return jsonify({"perPointsFree":hero.perPointsFree, namePoints:result})

####################################################################################################################################
####################################################################################################################################
####################################################################################################################################
####################################################################################################################################
####################################################################################################################################
def getBattleState(battle, tern = 0):
    return {
        "hero":{
            "health":battle.hero.health,
            "healthMax":battle.hero.healthMax,
            "rage":battle.hero.rage
        },
        "enemy":{
            "health":battle.enemy.health,
            "healthMax":battle.enemy.healthMax,
            "rage":battle.enemy.rage
        },
        "tern":tern,
        "status":battle.status,
    }

#http://127.0.0.1:5000/api/battle/create?mode=0
@app.route('/api/battle/create', methods = ["GET", "PUT"])
def createBattle():
    mode = int(request.args.get('mode')) #0-4
    user = User.query.filter_by(username = 'Vlad').first()
    hero = user.hero
    battle = hero.battle
    if battle: 
        if battle.status: 
            battle.close()
        else:
            return jsonify([getBattleState(battle),])
        
    enemies = Enemies(0, hero.level)
    hero.health = hero.healthMax
    enemies.health = enemies.healthMax
    battle = Battle()
    battle.heros.append(hero)
    battle.enemies.append(enemies)
    db.session.commit()
    return jsonify([getBattleState(battle),])
#http://127.0.0.1:5000/api/battle/get?skill=0&auto=1
@app.route('/api/battle/get', methods = ["GET", "PUT"])
def getBattle():
    user = User.query.filter_by(username = 'Vlad').first()
    battle = user.hero.battle
    # автобой.
    if request.args.get('auto'):
        result = []
        for i in range(999999): 
            if i % 2 == 1:
                battle.autoStep(True)
                result.append(getBattleState(battle, tern = 2))
            else:
                battle.autoStep(False)
                result.append(getBattleState(battle, tern = 1))
            if battle.status: break
        result.reverse()
        db.session.commit()
        return jsonify(result)
    # если используется способность.
    skill = request.args.get('skill')
    if skill:
        result = []
        if battle.heroStep(skill):
            result.append(getBattleState(battle, tern = 1))
            for i in range(999999): 
                if not battle.autoStep(True): continue# автоход врага ОПТИМИЗИРОВАТЬ!!!!
                result.append(getBattleState(battle, tern = 2))
                break # если герой находится в стане, значит цикл должен продолжаться, пока он не выйдет из стана.
            result.reverse()
            db.session.commit()
            return jsonify(result)
        
    return jsonify([getBattleState(battle),])    
#http://127.0.0.1:5000/api/battle/quit
@app.route('/api/battle/quit', methods = ["GET", "PUT"])
def quitBattle():
    user = User.query.filter_by(username = 'Vlad').first()
    hero = user.hero
    battle = hero.battle
    battle.close()
    db.session.commit()
    return jsonify({"result":"ok"})



####################################################################################################################################
####################################################################################################################################
####################################################################################################################################
####################################################################################################################################
####################################################################################################################################
#http://127.0.0.1:5000/api/create
@app.route('/api/create', methods = ["GET",])
def create():
    user = User(username = "Vlad", currencyGold = 100, currencySilver = 1000)
    hero = Hero()
    user.heros.append(hero)
    db.session.add(user)
    db.session.commit()
    for _ in range(100): hero.upLevel()
    db.session.commit()
    return jsonify({'result':'ok'})
# http://127.0.0.1:5000/api/uplevel
@app.route('/api/uplevel', methods = ["GET",])
def upLevel():
    user = User.query.filter_by(username = 'Vlad').first()
    hero = user.hero
    result = []
    for _ in range(10000): 
        result.append({'level':hero.level, 'exp':hero.expMax})
        hero.upLevel()
    db.session.commit()
    return jsonify(result)