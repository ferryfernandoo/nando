import fetch from 'node-fetch';

const apiKey = 'sk-tm-hy6dAKg1BXKDpBz0OmQgEa8Rd9brxNje12zDsIbzci9zdj3S';

// Test different API paths and request structures
const tests = [
  {
    name: 'TokenMix /v1/images (no model)',
    url: 'https://api.tokenmix.ai/v1/images',
    body: { prompt: 'a beautiful sunset', n: 1, size: '1024x1024' }
  },
  {
    name: 'TokenMix /v1/images with qwen model',
    url: 'https://api.tokenmix.ai/v1/images',
    body: { model: 'qwen-vl', prompt: 'a beautiful sunset', n: 1, size: '1024x1024' }
  },
  {
    name: 'Check available models endpoint',
    url: 'https://api.tokenmix.ai/v1/models',
    body: null
  },
  {
    name: 'TokenMix /v1/images/create',
    url: 'https://api.tokenmix.ai/v1/images/create',
    body: { prompt: 'a beautiful sunset', n: 1, size: '1024x1024' }
  },
];

async function runTest(test) {
  console.log(`\n🧪 ${test.name}`);
  console.log(`   URL: ${test.url}`);
  
  try {
    const options = {
      method: test.body ? 'POST' : 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    };
    
    if (test.body) {
      options.body = JSON.stringify(test.body);
    }

    const response = await fetch(test.url, options);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response (first 300 chars): ${JSON.stringify(data).substring(0, 300)}`);
    
    return response.ok;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Testing TokenMix Image API Different Approaches\n');
  console.log('='.repeat(60));
  
  for (const test of tests) {
    await runTest(test);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Tests complete\n');
}

main();
