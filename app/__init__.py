from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate


db = SQLAlchemy()
login_manager = LoginManager()
bcrypt = Bcrypt()
migrate = Migrate()

def create_app():
    app = Flask(__name__)

    # basic config
    app.config['SECRET_KEY'] = 'your_secret_key' #used for sessions/security
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///planner.db' #database file
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    #update
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False

    #update
    CORS(app,
         supports_credentials=True,
         origins=[
             "http://localhost:8000",
             "http://127.0.0.1:8000",
             "https://cmsc495-group4-project.onrender.com"
         ])

    #"http://localhost:8000",  #python http.server
   # "http://127.0.0.1:8000"

    db.init_app(app)
    login_manager.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)

    login_manager.login_view = 'main.login'

    from .models import User

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    from .routes import main
    app.register_blueprint(main)

    with app.app_context():
        db.create_all()

    return app
