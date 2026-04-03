Group 4 READ ME

structure
app/
---__init__.py
---models.py
---routes.py
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

List of functions() in routes.py
register()
login()
logout()
get_current_user()

Class routes
create_class()
get_classes()
update_class(class_id)
delete_class(class_id)

Assignment Routes
create_assignment()
get_assignments(class_id)
update_assignment(assignment_id)
delete_assignment(assignment_id)

Task Routes
create_tasks()
get_calendar_tasks()
get_priority_tasks()
get_upcomning_tasks()


what are we using to front end framework? 
- React? 
- html/css/js?




