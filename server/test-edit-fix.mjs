import fetch from 'node-fetch';

const sessionId = 'test-session-123';
const imageFileName = '1780800881595_Screenshot 2026-05-11 030044.jpg';
const referenceImageUrl = `http://localhost:3001/download/uploads/${encodeURIComponent(imageFileName)}`;

console.log('Testing image edit with reference image:', referenceImageUrl);

const payload = {
  prompt: 'ubah gambar menjadi lebih cerah dan tambahkan warna-warna pastel',
  referenceImage: referenceImageUrl,
  sessionId: sessionId,
  size: '1024x1024'
};

console.log('\nPayload:', JSON.stringify(payload, null, 2));

try {
  const response = await fetch('http://localhost:3001/api/images/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  
  console.log('\nResponse Status:', response.status);
  console.log('\nResponse:', JSON.stringify(data, null, 2));

  if (data.success && data.image?.url) {
    console.log('\n✅ EDIT SUCCESS! Generated image:', data.image.url);
  } else {
    console.log('\n❌ EDIT FAILED:', data.error || 'Unknown error');
  }
} catch (error) {
  console.error('\n❌ Request failed:', error.message);
}
