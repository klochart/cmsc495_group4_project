import requests

url = "http://127.0.0.1:5000/login"

username = "testuser"

passwords = [
    "123456",
    "password",
    "admin",
    "letmein",
    "password123"  #correct password
]

for pwd in passwords:
    response = requests.post(url, json={
        "username": username,
        "password": pwd
    })

    print(f"Trying: {pwd} -> {response.status_code} {response.text}")