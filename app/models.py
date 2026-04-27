from flask_login import UserMixin
from . import db


#USER TABLE

#stores login info for each user
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)  #unique user ID
    username = db.Column(db.String(50), unique=True, nullable=False)  #username
    password = db.Column(db.String(100), nullable=False)  #hashed password
    email = db.Column(db.String(120), unique=True, nullable=False) #email

    reset_token = db.Column(db.String(100), nullable=True)
    #one user can have many classes
    #if user is deleted, their classes also get deleted
    classes = db.relationship(
        'Class',
        backref='owner',  #lets us do class.owner to get the user
        lazy=True,
        cascade='all, delete-orphan'
    )

#CLASS TABLE

#represents a class like "Math", "CS", etc.
class Class(db.Model):
    id = db.Column(db.Integer, primary_key=True)  #unique class ID
    name = db.Column(db.String(100), nullable=False)  #class name

    #connects class to a user
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    #one class has many assignments
    #deleting a class deletes its assignments too
    assignments = db.relationship(
        'Assignment',
        backref='class_',  #lets us do assignment.class_ to get its class
        lazy=True,
        cascade='all, delete-orphan'
    )

#ASSIGNMENT TABLE

#represents a task/homework
class Assignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)  #unique assignment ID

    title = db.Column(db.String(100), nullable=False)  #name of assignment

    due_date = db.Column(db.DateTime)
    #when it's due (can be empty if no due date)

    #priority level (High, Medium, Low)
    #default is Medium if not provided
    priority = db.Column(db.String(10), nullable=False, default='Medium')

    #connects assignment to a class
    class_id = db.Column(db.Integer, db.ForeignKey('class.id'), nullable=False)