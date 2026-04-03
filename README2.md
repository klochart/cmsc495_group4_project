Group 4 READ ME

structure
app/
---__init__.py
---models.py
---routs.py
---utils.py
run.py
test_routes.py

- Flask
- Flask - Login (authentication)
- Flask-SQLAlchemy (database)
- FLask -Bcrypt (secure password hashing)
- SQLite (local database)

Set up 
1. clone repository: 
git clone https://github.com/klochart/cmsc495_group4_project.git 
cd cmsc495_group4_project

2. Create virtual environment
python -m venv venv

-activate it
venv\Scripts\activate

3. Install Flask
pip install flask flask_sqlalchemy flask_login flack_bcrypt

4. run app
python run.py

should run on server http://127.0.0.1:5000/

API endpoints
POST /register
POST /login
GET /logout
GET /me

Classes
POST /classes
GET /classes
PUT /classes/<id>
DELETE /classes/<id>

Assignments
POST /assignments
GET /assignments/<class_id>
PUT /assignments/<id>
DELETE /assignments/<id>

Tasks
GET /tasks

what are we using to front end framework? 
- React? 
- html/css/js? 


