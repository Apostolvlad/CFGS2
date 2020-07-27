from flask import render_template, jsonify, request, flash, redirect, url_for
from werkzeug.urls import url_parse
from app import app
from datetime import datetime

from app import db
from app.models import User, Hero, Enemies, Battle, PullEnemies

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
    if not command is None: getattr(hero, command)()
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
    result = hero.setPoints(namePoints, count)
    db.session.commit()
    return jsonify(result)

####################################################################################################################################
####################################################################################################################################
####################################################################################################################################
####################################################################################################################################
####################################################################################################################################
#http://127.0.0.1:5000/api/battle/create?mode=0
@app.route('/api/battle/create', methods = ["GET", "PUT"])
def createBattle():
    mode = int(request.args.get('mode')) #0-4
    user = User.query.filter_by(username = 'Vlad').first()
    hero = user.hero
    battle = Battle()
    enemies = PullEnemies.newEnemies(id = mode, level = hero.level)
    battle.hero.append(hero)
    battle.enemies.append(enemies)
    hero.initHealth()
    enemies.initHealth()
    db.session.commit()
    return jsonify(battle.getInfo())
#http://127.0.0.1:5000/api/battle/get?skill=
@app.route('/api/battle/get', methods = ["GET", "PUT"])
def getBattle():
    user = User.query.filter_by(username = 'Vlad').first()
    hero = user.hero
    battle = hero.battle
    enemies = battle.enemies
    result = battle.checkCommand(request.args)
    return jsonify(result)    
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
    hero.setLevel(10)
    db.session.commit()
    return jsonify({'result':'ok'})