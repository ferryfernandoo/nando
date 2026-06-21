import requests
import json

# Start session
session = requests.Session()

# Test login
login_data = {
    "email": "testchat@deepmail.com",
    "password": "Test1234567"
}

print("Logging in to /auth/login...")
r = session.post('http://localhost:3001/auth/login', json=login_data)
print('Login Status:', r.status_code)
print('Login Response:', r.text[:500])
print('Cookies:', dict(session.cookies))

# Check if we can now get conversations
print("\nGetting conversations...")
r2 = session.get('http://localhost:3001/api/conversations')
print('Conversations Status:', r2.status_code)
print('Conversations Response:', r2.text[:500])
