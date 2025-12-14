// Test script to verify video upload functionality
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:4000/api/learning';

async function testVideoUpload() {
  console.log('🎬 Testing Video Upload Functionality...\n');
  
  try {
    // 1. Get current videos
    console.log('1. Fetching current videos...');
    const currentResponse = await fetch(API_BASE);
    const currentData = await currentResponse.json();
    const currentVideoCount = currentData.data.videos.length;
    console.log(`   Current videos: ${currentVideoCount}`);
    
    // 2. Create a new video
    console.log('\n2. Creating new video...');
    const newVideo = {
      type: 'video',
      content: {
        title: 'Advanced Trading Strategies',
        description: 'Learn advanced trading strategies used by professional traders',
        duration: '25:45',
        category: 'Strategy Development',
        thumbnail: '🚀',
        video_url: 'https://www.youtube.com/embed/example123'
      }
    };
    
    const createResponse = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVideo)
    });
    
    const createResult = await createResponse.json();
    console.log(`   Video created: ${createResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (createResult.data) {
      console.log(`   Video ID: ${createResult.data.id}`);
      console.log(`   Title: ${createResult.data.title}`);
    }
    
    // 3. Verify video was added
    console.log('\n3. Verifying video was added...');
    const verifyResponse = await fetch(API_BASE);
    const verifyData = await verifyResponse.json();
    const newVideoCount = verifyData.data.videos.length;
    console.log(`   New video count: ${newVideoCount}`);
    console.log(`   Videos added: ${newVideoCount - currentVideoCount}`);
    
    // 4. List all videos
    console.log('\n4. Current videos in system:');
    verifyData.data.videos.forEach((video, index) => {
      console.log(`   ${index + 1}. ${video.title} (${video.duration}) - ${video.category}`);
    });
    
    console.log('\n🎉 Video upload test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testVideoUpload();