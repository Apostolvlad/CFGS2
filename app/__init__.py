from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

from config import Config
db = SQLAlchemy()
migrate = Migrate()





#from app import routes, models, errors

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
migrate.init_app(app, db)

from app import models, routes
