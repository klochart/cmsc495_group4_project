import sqlite3
import os


def get_all_users():
    # Get the absolute path to the planner.db file
    db_path = os.path.join(os.path.dirname(__file__), '..', 'instance', 'planner.db')

    # Print the database path to verify it's correct
    print(f"Database path: {db_path}")

    # Connect to the SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Execute query to get all users
    cursor.execute("SELECT id, username, password FROM user")
    users = cursor.fetchall()

    # Print all the registered users
    for user in users:
        print(f'ID: {user[0]}, Username: {user[1]}, Password: {user[2]}')

    # Close the connection
    conn.close()


if __name__ == '__main__':
    get_all_users()