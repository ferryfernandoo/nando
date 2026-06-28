import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testCORSHeaders() {
  console.log('🧪 Testing CORS Headers...\n');
  
  // Test OPTIONS preflight
  console.log('1️⃣ OPTIONS request to /auth/login');
  const preflight = await fetch(`${BASE_URL}/auth/login`, {
    method: 'OPTIONS',
    headers: {
      'Origin': 'http://localhost:5173',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type'
    }
  });
  
  console.log('   Response Headers:');
  for (const [key, value] of preflight.headers.entries()) {
    console.log(`   - ${key}: ${value.substring(0, 150)}${value.length > 150 ? '...' : ''}`);
  }
  
  // Test POST with valid login
  console.log('\n2️⃣ POST request to /auth/login (with valid credentials)');
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Origin': 'http://localhost:5173',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: 'testchat@deepmail.com', password: 'Test1234567' })
  });
  
  console.log(`   Status: ${response.status}`);
  console.log('   Response Headers:');
  for (const [key, value] of response.headers.entries()) {
    console.log(`   - ${key}: ${value.substring(0, 150)}${value.length > 150 ? '...' : ''}`);
  }
}

testCORSHeaders().catch(console.error);
