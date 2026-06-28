#!/usr/bin/env node

// Direct test of image generation without all the complexity
const http = require('http');

const requestData = JSON.stringify({
  prompt: "a beautiful sunset",
  size: "1024x1024",
  model: "flux-1-kontext-pro"
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/images/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestData)
  }
};

console.log('[TEST] Sending request to /api/images/generate');
console.log('[TEST] Payload:', requestData);

const req = http.request(options, (res) => {
  console.log(`[TEST] Status Code: ${res.statusCode}`);
  console.log(`[TEST] Response Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`[TEST] Response Body (first 2000 chars):`);
    console.log(data.substring(0, 2000));
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`[TEST] Request failed:`, e);
  process.exit(1);
});

req.write(requestData);
req.end();
