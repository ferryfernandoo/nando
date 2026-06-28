import fetch from 'node-fetch';

const apiKey = 'sk-tm-hy6dAKg1BXKDpBz0OmQgEa8Rd9brxNje12zDsIbzci9zdj3S';

async function listModels() {
  console.log('🔍 Fetching list of available models from TokenMix...\n');
  
  try {
    const response = await fetch('https://api.tokenmix.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      timeout: 10000,
    });

    const data = await response.json();
    
    if (data.data && Array.isArray(data.data)) {
      console.log(`✅ Found ${data.data.length} models total:\n`);
      
      // Filter for image-related models
      const imageModels = data.data.filter(m => 
        m.id.includes('image') || m.id.includes('flux') || m.id.includes('dall') || 
        m.id.includes('edit') || m.id.includes('generation') || m.id.includes('imagen')
      );
      
      if (imageModels.length > 0) {
        console.log('📸 IMAGE MODELS:');
        imageModels.forEach(m => {
          console.log(`  • ${m.id}`);
        });
      } else {
        console.log('❌ No image-specific models found');
      }
      
      console.log('\n📋 ALL MODELS:');
      data.data.forEach(m => {
        console.log(`  • ${m.id}`);
      });
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

listModels();
