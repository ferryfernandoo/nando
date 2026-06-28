import fetch from 'node-fetch';
import fs from 'fs';

// Small test image URL (1x1 pixel red PNG)
const testImageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

async function testImageEditing() {
  console.log('🎨 Testing image editing with qwen-image-edit-max\n');
  
  const payload = {
    prompt: 'ubah ke warna biru',
    size: '1024x1024',
    referenceImage: testImageUrl,  // This triggers edit mode in backend
  };
  
  console.log('Endpoint: http://localhost:3001/api/images/generate');
  console.log('Payload:', JSON.stringify(payload, null, 2));
  console.log('\nSending request...\n');
  
  try {
    const response = await fetch('http://localhost:3001/api/images/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      timeout: 60000,
    });

    console.log('Status:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('\nResponse:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('\n✅ SUCCESS!');
      console.log('Image URL:', data.image.url);
      console.log('Mode:', data.image.mode);
      console.log('Model:', data.image.model);
    } else {
      console.log('\n❌ FAILED');
      if (data.error) {
        console.log('Error:', data.error);
      }
    }
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }
}

testImageEditing();
