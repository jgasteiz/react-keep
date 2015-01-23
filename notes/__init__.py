import os
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
if app.debug:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///notes.db'
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
db = SQLAlchemy(app)

from public import views
