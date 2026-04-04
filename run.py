<<<<<<< HEAD
from app import create_app

app = create_app()

if __name__ == "__main__":
=======
from app import create_app, db

app = create_app()

with app.app_context():
    db.create_all()  #create database tables

if __name__ == '__main__':
>>>>>>> e85c7116ec52826ff1689e7bd0772ce2f80c448b
    app.run(debug=True)