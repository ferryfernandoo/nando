const fetch = require('node-fetch');

async function testImageGeneration() {
  const apiKey = 'sk-tm-hy6dAKg1BXKDpBz0OmQgEa8Rd9brxNje12zDsIbzci9zdj3S';
  const url = 'https://api.tokenmix.ai/v1/images/generations';

  try {
    console.log('[TEST] Calling TokenMix API...');
    console.log('[TEST] API Key:', apiKey.substring(0, 20) + '...');
    console.log('[TEST] URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'flux-1-kontext-pro',
        prompt: 'a beautiful sunset',
        n: 1,
        size: '1024x1024'
      })
    });

    console.log('[TEST] Response Status:', response.status);
    console.log('[TEST] Response Headers:', Object.fromEntries(response.headers));

    const text = await response.text();
    console.log('[TEST] Response Body:', text.substring(0, 1000));

    if (response.ok) {
      try {
        const json = JSON.parse(text);
        console.log('[TEST] ✅ Success! Keys:', Object.keys(json));
      } catch (e) {
        console.log('[TEST] Response is not JSON');
      }
    }
  } catch (error) {
    console.error('[TEST] ❌ Error:', error.message);
  }
}

testImageGeneration();
