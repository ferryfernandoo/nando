import fetch from 'node-fetch';

const apiKey = 'sk-tm-hy6dAKg1BXKDpBz0OmQgEa8Rd9brxNje12zDsIbzci9zdj3S';

// Models to try for image generation
const modelsToTest = [
  'qwen-image-generate',
  'qwen-vl',
  'qwen-vl-plus',
  'flux',
  'flux-pro',
  'dall-e-3',
  'dall-e-2',
  'gpt-4-vision',
  'stable-diffusion-xl',
  'sd-xl',
  'qwen',
  'qwen-plus',
];

async function testModel(model) {
  console.log(`\n🧪 Testing model: ${model}`);
  
  try {
    const response = await fetch('https://api.tokenmix.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: 'a beautiful sunset over the ocean',
        n: 1,
        size: '1024x1024',
      }),
      timeout: 10000,
    });

    const data = await response.json();
    console.log(`  Status: ${response.status}`);
    
    if (response.ok) {
      console.log(`  ✅ SUCCESS!`);
      console.log(`  Response:`, JSON.stringify(data).substring(0, 200));
      return true;
    } else {
      console.log(`  ❌ Error: ${data.error?.message || JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Exception: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Testing TokenMix Image Models\n');
  console.log('='.repeat(50));
  
  for (const model of modelsToTest) {
    await testModel(model);
    // Add a small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('\n✅ Test complete\n');
}

main();
