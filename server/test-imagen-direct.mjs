import fetch from 'node-fetch';

const apiKey = 'sk-tm-hy6dAKg1BXKDpBz0OmQgEa8Rd9brxNje12zDsIbzci9zdj3S';

async function testImageGeneration() {
  console.log('🧪 Testing imagen-4-fast directly with TokenMix API\n');
  
  const payload = {
    model: 'imagen-4-fast',
    prompt: 'a beautiful sunset over the ocean',
    n: 1,
    size: '1024x1024',
  };
  
  console.log('Request payload:', JSON.stringify(payload, null, 2));
  console.log('\nSending request to TokenMix API...\n');
  
  try {
    const response = await fetch('https://api.tokenmix.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      timeout: 30000,
    });

    console.log('Status:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('\nResponse:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.data && data.data[0]?.url) {
      console.log('\n✅ SUCCESS!');
      console.log('Image URL:', data.data[0].url);
    } else {
      console.log('\n❌ FAILED');
      if (data.error) {
        console.log('Error message:', data.error.message);
      }
    }
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }
}

testImageGeneration();
