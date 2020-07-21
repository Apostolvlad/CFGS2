from flask import render_template, jsonify, request, flash, redirect, url_for
from werkzeug.urls import url_parse
from app import app
from app.models import User
from datetime import datetime

from app import db

@app.route('/')
@app.route('/index')
def index():
    return render_template('game.html')#posts)

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

#http://127.0.0.1:5000/api/skillpoint?name=intPoints&count=1
@app.route('/api/skillpoint', methods = ["GET", "PUT"])
def setSkillPoint():
    user = User.query.filter_by(username = 'Vlad').first()
    hero = user.hero
    namePoints = request.args.get('name')
    count = int(request.args.get('count'))
    result = hero.setPoints(namePoints, count)
    return jsonify(result)
