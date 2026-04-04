from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_bcrypt import Bcrypt

#create extensions
db = SQLAlchemy()
login_manager = LoginManager()
bcrypt = Bcrypt()

def create_app():
    #create the Flask app
    app = Flask(__name__)
    CORS(app, supports_credentials=True)

    #basic config
    app.config['SECRET_KEY'] = 'your_secret_key'  #used for sessions/security
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///planner.db'  #database file

    #connect extensions to app
    db.init_app(app)
    login_manager.init_app(app)
    bcrypt.init_app(app)

    #tells Flask-Login where to send users if not logged in
    login_manager.login_view = 'main.login'

    #import User model
    from .models import User

    #this function loads a user from their ID
    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    #register routes...connect routes.py
    from .routes import main
    app.register_blueprint(main)

    return app