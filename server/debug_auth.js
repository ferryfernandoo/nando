import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function test() {
  console.log('🧪 Testing login flow with debugging...\n');
  
  // Login
  console.log('1️⃣ Logging in...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email: 'testchat@deepmail.com', password: 'Test1234567' })
  });
  
  const loginData = await loginRes.json();
  console.log(`   Status: ${loginRes.status}`);
  console.log(`   Response: ${JSON.stringify(loginData)}`);
  
  // Get cookies
  const setCookie = loginRes.headers.get('set-cookie');
  console.log(`   Set-Cookie: ${setCookie}`);
  
  // Extract cookie
  const cookieMatch = setCookie?.match(/connect\.sid=[^;]+/);
  const sessionCookie = cookieMatch ? cookieMatch[0] : '';
  console.log(`   Session Cookie: ${sessionCookie}\n`);
  
  // Test 2: Load conversations with cookie
  console.log('2️⃣ Fetching conversations with session cookie...');
  const getRes = await fetch(`${BASE_URL}/api/conversations`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie
    }
  });
  
  const getData = await getRes.json();
  console.log(`   Status: ${getRes.status}`);
  console.log(`   Response: ${JSON.stringify(getData).substring(0, 200)}...`);
  
  // Test 3: Save conversations
  console.log('\n3️⃣ Saving conversations with session cookie...');
  const saveRes = await fetch(`${BASE_URL}/api/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie
    },
    body: JSON.stringify({
      conversations: [{
        id: 'test-conv-' + Date.now(),
        title: 'Test Conversation',
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' }
        ]
      }]
    })
  });
  
  const saveData = await saveRes.json();
  console.log(`   Status: ${saveRes.status}`);
  console.log(`   Response: ${JSON.stringify(saveData)}`);
}

test().catch(console.error);
