import unittest
from app import create_app, db
from app.models import User, Class, Assignment
from datetime import datetime

class TestRoutes(unittest.TestCase):

    #SETUP & TEARDOWN
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    #HELPER FUNCTIONS
    def register_user(self, username='john', password='1234'):
        return self.client.post('/register', json={
            'username': username,
            'password': password
        })

    def login_user(self, username='john', password='1234'):
        return self.client.post('/login', json={
            'username': username,
            'password': password
        })

    def logout_user(self):
        return self.client.get('/logout')

    #AUTH TESTS
    def test_register_login_logout(self):
        res = self.register_user()
        self.assertEqual(res.status_code, 201)
        self.assertIn('User created', res.get_data(as_text=True))

        res = self.login_user()
        self.assertEqual(res.status_code, 200)
        self.assertIn('Logged in', res.get_data(as_text=True))

        res = self.logout_user()
        self.assertEqual(res.status_code, 200)
        self.assertIn('Logged out', res.get_data(as_text=True))

    #CLASS CRUD
    def test_class_crud(self):
        self.register_user()
        self.login_user()

        res = self.client.post('/classes', json={'name': 'Math'})
        self.assertEqual(res.status_code, 201)

        res = self.client.get('/classes')
        data = res.get_json()
        self.assertEqual(len(data), 1)

        class_id = data[0]['id']

        res = self.client.put(f'/classes/{class_id}', json={'name': 'Advanced Math'})
        self.assertEqual(res.status_code, 200)
        self.assertIn('Updated', res.get_data(as_text=True))

        res = self.client.delete(f'/classes/{class_id}')
        self.assertEqual(res.status_code, 200)
        self.assertIn('Deleted', res.get_data(as_text=True))

    #ASSIGNMENTS
    def test_assignment_crud(self):
        self.register_user()
        self.login_user()

        # create class first
        self.client.post('/classes', json={'name': 'Math'})
        class_id = self.client.get('/classes').get_json()[0]['id']

        #create assignments
        assignments = [
            {'title': 'HW1', 'due_date': '2026-04-05', 'priority': 'High', 'class_id': class_id},
            {'title': 'HW2', 'due_date': '2026-04-03', 'priority': 'Low', 'class_id': class_id}
        ]

        for a in assignments:
            res = self.client.post('/assignments', json=a)
            self.assertEqual(res.status_code, 201)

        #get assignments
        res = self.client.get(f'/assignments/{class_id}')
        data = res.get_json()
        self.assertEqual(len(data), 2)

        #update assignment
        res = self.client.put('/assignments/1', json={'title': 'HW1 Updated'})
        self.assertEqual(res.status_code, 200)
        self.assertIn('Updated', res.get_data(as_text=True))

        #delete assignment
        res = self.client.delete('/assignments/2')
        self.assertEqual(res.status_code, 200)
        self.assertIn('Deleted', res.get_data(as_text=True))

    #TASK VIEW
    def test_get_tasks(self):
        self.register_user()
        self.login_user()

        #create class
        self.client.post('/classes', json={'name': 'Science'})
        class_id = self.client.get('/classes').get_json()[0]['id']

        #create assignments (used as tasks)
        self.client.post('/assignments', json={
            'title': 'Lab1',
            'due_date': '2026-04-07',
            'priority': 'High',
            'class_id': class_id
        })

        self.client.post('/assignments', json={
            'title': 'Lab2',
            'due_date': '2026-04-08',
            'priority': 'Low',
            'class_id': class_id
        })

        #get tasks
        res = self.client.get('/tasks')
        data = res.get_json()

        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['class'], 'Science')


#RUN TESTS
if __name__ == '__main__':
    unittest.main()