import requests

url = "https://cmsc495-group4-project.onrender.com/login"

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