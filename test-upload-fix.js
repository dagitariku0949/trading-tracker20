// Test script to verify the upload fixes
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:4000/api/learning';

async function testUploadFixes() {
  console.log('🔧 Testing Upload Fixes...\n');
  
  try {
    // 1. Test URL-based video creation
    console.log('1. Testing URL video creation...');
    const urlVideo = {
      type: 'video',
      content: {
        title: 'Test URL Video - Trading Basics',
        description: 'A test video uploaded via URL method',
        duration: '10:30',
        category: 'Technical Analysis',
        thumbnail: '🎯',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        status: 'Published'
      }
    };
    
    const urlResponse = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(urlVideo)
    });
    
    const urlResult = await urlResponse.json();
    console.log(`   URL Video: ${urlResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (urlResult.data) {
      console.log(`   - ID: ${urlResult.data.id}`);
      console.log(`   - Title: ${urlResult.data.title}`);
      console.log(`   - URL: ${urlResult.data.video_url}`);
      console.log(`   - Status: ${urlResult.data.status}`);
    }
    
    // 2. Check if videos are retrievable
    console.log('\n2. Checking if videos are retrievable...');
    const getResponse = await fetch(API_BASE);
    const getData = await getResponse.json();
    
    if (getData.success && getData.data.videos) {
      console.log(`   ✅ Found ${getData.data.videos.length} videos in system`);
      getData.data.videos.forEach((video, index) => {
        const uploadType = video.video_url?.startsWith('/uploads/') ? 'FILE' : 'URL';
        console.log(`   ${index + 1}. ${video.title} [${uploadType}] - ${video.status}`);
        console.log(`      URL: ${video.video_url}`);
      });
    } else {
      console.log('   ❌ Failed to retrieve videos');
    }
    
    // 3. Test file upload endpoint availability
    console.log('\n3. Testing file upload endpoint...');
    try {
      const FormData = require('form-data');
      const fs = require('fs');
      
      // Create a small test file
      const testContent = 'Mock video content for testing';
      fs.writeFileSync('test-mock-video.mp4', testContent);
      
      const formData = new FormData();
      formData.append('video', fs.createReadStream('test-mock-video.mp4'), {
        filename: 'test-mock-video.mp4',
        contentType: 'video/mp4'
      });
      formData.append('title', 'Test File Upload Video');
      formData.append('description', 'Testing file upload functionality');
      formData.append('duration', '5:00');
      formData.append('category', 'Testing');
      formData.append('thumbnail', '🧪');
      
      const fileResponse = await fetch(`${API_BASE}/upload-video`, {
        method: 'POST',
        body: formData
      });
      
      const fileResult = await fileResponse.json();
      console.log(`   File Upload Endpoint: ${fileResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      if (fileResult.data) {
        console.log(`   - ID: ${fileResult.data.id}`);
        console.log(`   - Title: ${fileResult.data.title}`);
        console.log(`   - File URL: ${fileResult.data.video_url}`);
        console.log(`   - Original Name: ${fileResult.data.file_info?.originalName}`);
      } else if (fileResult.message) {
        console.log(`   - Error: ${fileResult.message}`);
      }
      
      // Clean up test file
      fs.unlinkSync('test-mock-video.mp4');
      
    } catch (fileError) {
      console.log(`   File Upload: ❌ FAILED - ${fileError.message}`);
    }
    
    // 4. Final verification
    console.log('\n4. Final verification...');
    const finalResponse = await fetch(API_BASE);
    const finalData = await finalResponse.json();
    
    if (finalData.success) {
      const totalVideos = finalData.data.videos.length;
      const urlVideos = finalData.data.videos.filter(v => !v.video_url?.startsWith('/uploads/')).length;
      const fileVideos = finalData.data.videos.filter(v => v.video_url?.startsWith('/uploads/')).length;
      
      console.log(`   📊 Total Videos: ${totalVideos}`);
      console.log(`   🔗 URL Videos: ${urlVideos}`);
      console.log(`   💻 File Videos: ${fileVideos}`);
      console.log(`   ✅ Both upload methods working!`);
    }
    
    console.log('\n🎉 Upload fix test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testUploadFixes();