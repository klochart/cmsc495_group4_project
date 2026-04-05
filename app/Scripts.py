import sqlite3
import os

##get all the registered users by running this script
def get_all_users():
    #get the absolute path to the planner.db file
    db_path = os.path.join(os.path.dirname(__file__), '..', 'instance', 'planner.db')

    #print the database path to verify it's correct
    print(f"Database path: {db_path}")

    #connect to the SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    #execute query to get all users
    cursor.execute("SELECT id, username, password FROM user")
    users = cursor.fetchall()

    #print all the registered users
    for user in users:
        print(f'ID: {user[0]}, Username: {user[1]}, Password: {user[2]}')

    #close the connection
    conn.close()


if __name__ == '__main__':
    get_all_users()