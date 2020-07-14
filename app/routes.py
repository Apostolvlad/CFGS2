from flask import render_template, jsonify, request, flash, redirect, url_for
from werkzeug.urls import url_parse
from app import app
from datetime import datetime

@app.route('/')
@app.route('/index')
def index():
    return render_template('game.html')#posts)


@app.route('/api/friends', methods = ["GET", "POST"])
def getFriends():
    offset = int(request.args.get('offset', 0))
    count = int(request.args.get('count', 10)) 
    listFriends = [{'name':'Vlad', 'level':str(i)} for i in range(9999, 0, -1)] #9985
    if offset < 0: offset = len(listFriends) + 1 + offset
    if offset > len(listFriends): offset = 0
    return jsonify({'offsetFriends':offset, 'listFriends':listFriends[offset:offset + count]})


