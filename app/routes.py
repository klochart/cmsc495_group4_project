from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from datetime import datetime

from . import db, bcrypt
from .models import User, Class, Assignment
from .utils import parse_date

#blueprint to group all routes
main = Blueprint('main', __name__)

#HOME
@main.route('/')
def index():
    #just a test route to see if server is working
    return jsonify({'message': 'Study Planner API running'})

#AUTH

@main.route('/register', methods=['POST'])
def register():
    #get data from request
    data = request.get_json()

    #make sure user sent username + password
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing fields'}), 400

    #check if user already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'User exists'}), 400

    #hash password so we don't store plain text
    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    #create user and save
    user = User(username=data['username'], password=hashed_pw)
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User created'}), 201

@main.route('/login', methods=['POST'])
def login():
    #get login info
    data = request.get_json()

    if not data:
        return jsonify({'message': 'Missing data'}), 400

    #find user in database
    user = User.query.filter_by(username=data.get('username')).first()

    if not user:
        return jsonify({'message': 'Invalid username'}), 401  # Username does not exist

    #check password
    if bcrypt.check_password_hash(user.password, data.get('password')):
        login_user(user)  # Logs user in
        return jsonify({'message': 'Logged in'}), 200
    else:
        return jsonify({'message': 'Invalid password'}), 401  # Incorrect password

@main.route('/logout')
@login_required
def logout():
    #logs out current user
    logout_user()
    return jsonify({'message': 'Logged out'})

@main.route('/me')
@login_required
def me():
    #returns current logged-in user info
    return jsonify({'id': current_user.id, 'username': current_user.username})

#CLASSES

@main.route('/classes', methods=['POST'])
@login_required
def create_class():
    #create a new class
    data = request.get_json()

    if not data or not data.get('name'):
        return jsonify({'message': 'Name required'}), 400

    #tie class to current user
    new_class = Class(name=data['name'], user_id=current_user.id)
    db.session.add(new_class)
    db.session.commit()

    return jsonify({'message': 'Class created'}), 201

@main.route('/classes', methods=['GET'])
@login_required
def get_classes():
    #get all classes for this user
    classes = Class.query.filter_by(user_id=current_user.id).all()

    result = []
    for c in classes:
        result.append({'id': c.id, 'name': c.name})

    return jsonify(result)

@main.route('/classes/<int:id>', methods=['PUT'])
@login_required
def update_class(id):
    #update class name
    data = request.get_json()
    c = Class.query.get_or_404(id)

    #make sure user owns it
    if c.user_id != current_user.id:
        return jsonify({'message': 'Not allowed'}), 403

    #update name if given
    c.name = data.get('name', c.name)
    db.session.commit()

    return jsonify({'message': 'Updated'})

@main.route('/classes/<int:id>', methods=['DELETE'])
@login_required
def delete_class(id):
    #delete a class
    c = Class.query.get_or_404(id)

    if c.user_id != current_user.id:
        return jsonify({'message': 'Not allowed'}), 403

    db.session.delete(c)
    db.session.commit()

    return jsonify({'message': 'Deleted'})

#ASSIGNMENTS

@main.route('/assignments', methods=['POST'])
@login_required
def create_assignment():
    #create assignment for a class
    data = request.get_json()

    if not data:
        return jsonify({'message': 'Missing data'}), 400

    #find class
    class_obj = Class.query.get(data.get('class_id'))

    if not class_obj:
        return jsonify({'message': 'Class not found'}), 404

    #make sure it belongs to user
    if class_obj.user_id != current_user.id:
        return jsonify({'message': 'Not allowed'}), 403

    #convert date if given
    due_date = None
    if data.get('due_date'):
        due_date = parse_date(data['due_date'])

    #create assignment
    assignment = Assignment(
        title=data.get('title'),
        due_date=due_date,
        priority=data.get('priority', 'Medium'),
        class_id=class_obj.id
    )

    db.session.add(assignment)
    db.session.commit()

    return jsonify({'message': 'Assignment created'}), 201

@main.route('/assignments/<int:class_id>', methods=['GET'])
@login_required
def get_assignments(class_id):
    #get all assignments for a class
    class_obj = Class.query.get_or_404(class_id)

    if class_obj.user_id != current_user.id:
        return jsonify({'message': 'Not allowed'}), 403

    assignments = Assignment.query.filter_by(class_id=class_id).all()

    result = []
    for a in assignments:
        result.append({
            'id': a.id,
            'title': a.title,
            'due_date': a.due_date.strftime('%Y-%m-%d') if a.due_date else None,
            'priority': a.priority
        })

    return jsonify(result)

@main.route('/assignments/<int:id>', methods=['PUT'])
@login_required
def update_assignment(id):
    #update assignment
    data = request.get_json()
    a = Assignment.query.get_or_404(id)

    #check ownership
    if a.class_.user_id != current_user.id:
        return jsonify({'message': 'Not allowed'}), 403

    #update fields if they exist
    if data.get('title'):
        a.title = data['title']

    if data.get('due_date'):
        a.due_date = parse_date(data['due_date'])

    if data.get('priority'):
        a.priority = data['priority']

    db.session.commit()

    return jsonify({'message': 'Updated'})

@main.route('/assignments/<int:id>', methods=['DELETE'])
@login_required
def delete_assignment(id):
    #delete assignment
    a = Assignment.query.get_or_404(id)

    if a.class_.user_id != current_user.id:
        return jsonify({'message': 'Not allowed'}), 403

    db.session.delete(a)
    db.session.commit()

    return jsonify({'message': 'Deleted'})

#TASKS

@main.route('/tasks', methods=['GET'])
@login_required
def get_tasks():
    #det all assignments as tasks
    assignments = Assignment.query.join(Class).filter(
        Class.user_id == current_user.id
    ).all()

    result = []
    for a in assignments:
        result.append({
            'id': a.id,
            'title': a.title,
            'class': a.class_.name,
            'due_date': a.due_date.strftime('%Y-%m-%d') if a.due_date else None,
            'priority': a.priority
        })

    return jsonify(result)