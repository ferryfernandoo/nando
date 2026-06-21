import requests
import json
import time

session = requests.Session()

# Step 1: Register
print("=" * 50)
print("STEP 1: REGISTER")
print("=" * 50)
register_data = {
    "name": "TestUser",
    "email": "testchat@deepmail.com",
    "password": "Test1234567",
    "confirmPassword": "Test1234567"
}
r = session.post('http://localhost:3001/auth/register', json=register_data)
print('Status:', r.status_code)
print('Response:', r.text[:500])

# Step 2: Login
print("\n" + "=" * 50)
print("STEP 2: LOGIN")
print("=" * 50)
login_data = {"email": "testchat@deepmail.com", "password": "Test1234567"}
r = session.post('http://localhost:3001/auth/login', json=login_data)
print('Status:', r.status_code)
print('Response:', r.text[:500])
print('Cookies:', dict(session.cookies))

# Step 3: Save conversation
print("\n" + "=" * 50)
print("STEP 3: SAVE CONVERSATION")
print("=" * 50)
conv_data = {
    "conversations": [
        {
            "id": "test_conv_" + str(int(time.time() * 1000)),
            "title": "Test Chat",
            "messages": [
                {"id": "msg1", "sender": "user", "text": "Hello", "timestamp": "2026-06-06T00:00:00Z"},
                {"id": "msg2", "sender": "bot", "text": "Hi there!", "timestamp": "2026-06-06T00:00:01Z"}
            ]
        }
    ]
}
r = session.post('http://localhost:3001/api/conversations', json=conv_data)
print('Status:', r.status_code)
print('Response:', r.text[:500])

# Step 4: Load conversations
print("\n" + "=" * 50)
print("STEP 4: LOAD CONVERSATIONS")
print("=" * 50)
r = session.get('http://localhost:3001/api/conversations')
print('Status:', r.status_code)
resp = json.loads(r.text) if r.text else {}
print('Conversations:', len(resp.get('conversations', [])))
if resp.get('conversations'):
    print('First conv:', resp['conversations'][0])
