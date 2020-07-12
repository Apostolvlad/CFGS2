from flask import render_template, flash, redirect, url_for, request
from werkzeug.urls import url_parse
from app import app
from datetime import datetime

@app.route('/')
@app.route('/index')
def index():
    return render_template('game.html')#posts)


