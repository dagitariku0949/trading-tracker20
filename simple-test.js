// Simple test without external dependencies
console.log('🧪 Simple Video Upload Test\n');

// Test 1: Check if backend is accessible
console.log('1. Testing backend connection...');
fetch('http://localhost:4000/')
  .then(response => response.json())
  .then(data => {
    console.log('   ✅ Backend connected:', data.message);
    
    // Test 2: Check learning endpoint
    console.log('\n2. Testing learning endpoint...');
    return fetch('http://localhost:4000/api/learning');
  })
  .then(response => response.json())
  .then(data => {
    console.log('   ✅ Learning endpoint working');
    console.log('   📊 Current videos:', data.data?.videos?.length || 0);
    
    if (data.data?.videos?.length > 0) {
      console.log('\n   📹 Existing videos:');
      data.data.videos.forEach((video, index) => {
        console.log(`     ${index + 1}. ${video.title}`);
        console.log(`        URL: ${video.video_url}`);
        console.log(`        Status: ${video.status}`);
      });
    }
    
    // Test 3: Try creating a URL video
    console.log('\n3. Testing URL video creation...');
    const testVideo = {
      type: 'video',
      content: {
        title: 'Test Video - Simple Setup',
        description: 'Testing video creation functionality',
        duration: '5:00',
        category: 'Technical Analysis',
        thumbnail: '🎯',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        status: 'Published'
      }
    };
    
    return fetch('http://localhost:4000/api/learning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testVideo)
    });
  })
  .then(response => response.json())
  .then(result => {
    console.log('   📤 Video creation result:', result.success ? '✅ SUCCESS' : '❌ FAILED');
    if (result.data) {
      console.log('     - ID:', result.data.id);
      console.log('     - Title:', result.data.title);
      console.log('     - URL:', result.data.video_url);
      console.log('     - Status:', result.data.status);
    } else {
      console.log('     - Error:', result.message);
    }
    
    // Test 4: Verify video was added
    console.log('\n4. Verifying video was added...');
    return fetch('http://localhost:4000/api/learning');
  })
  .then(response => response.json())
  .then(data => {
    console.log('   📊 Total videos now:', data.data?.videos?.length || 0);
    
    const newVideo = data.data?.videos?.find(v => v.title === 'Test Video - Simple Setup');
    if (newVideo) {
      console.log('   ✅ Test video found in system!');
      console.log('     - Title:', newVideo.title);
      console.log('     - URL:', newVideo.video_url);
      console.log('     - Status:', newVideo.status);
    } else {
      console.log('   ❌ Test video not found in system');
    }
    
    console.log('\n🎯 Test completed! Check the Learning Hub to see if videos appear.');
  })
  .catch(error => {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure backend is running: cd backend && npm start');
    console.log('   2. Make sure frontend is running: cd frontend && npm run dev');
    console.log('   3. Check browser console for errors');
    console.log('   4. Try refreshing the Learning Hub page');
  });