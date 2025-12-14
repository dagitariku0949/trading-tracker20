// Simple test to check if backend upload endpoint works
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function testBackendUpload() {
  console.log('🧪 Testing Backend Upload Endpoint...\n');
  
  try {
    // 1. Check if backend is running
    console.log('1. Checking if backend is running...');
    try {
      const healthResponse = await fetch('http://localhost:4000/');
      const healthData = await healthResponse.json();
      console.log('   ✅ Backend is running:', healthData.message);
    } catch (error) {
      console.log('   ❌ Backend not running:', error.message);
      console.log('   💡 Start backend with: cd backend && npm start');
      return;
    }
    
    // 2. Check if learning endpoint exists
    console.log('\n2. Checking learning endpoint...');
    try {
      const learningResponse = await fetch('http://localhost:4000/api/learning');
      const learningData = await learningResponse.json();
      console.log('   ✅ Learning endpoint working, videos:', learningData.data?.videos?.length || 0);
    } catch (error) {
      console.log('   ❌ Learning endpoint error:', error.message);
    }
    
    // 3. Test file upload endpoint
    console.log('\n3. Testing file upload endpoint...');
    
    // Create a small test video file
    const testVideoContent = Buffer.from('FAKE_VIDEO_DATA_FOR_TESTING');
    const testFileName = 'test-upload.mp4';
    fs.writeFileSync(testFileName, testVideoContent);
    
    const formData = new FormData();
    formData.append('video', fs.createReadStream(testFileName), {
      filename: testFileName,
      contentType: 'video/mp4'
    });
    formData.append('title', 'Backend Test Video');
    formData.append('description', 'Testing backend upload functionality');
    formData.append('duration', '1:00');
    formData.append('category', 'Testing');
    formData.append('thumbnail', '🧪');
    
    try {
      console.log('   Uploading test file...');
      const uploadResponse = await fetch('http://localhost:4000/api/learning/upload-video', {
        method: 'POST',
        body: formData
      });
      
      console.log('   Response status:', uploadResponse.status);
      console.log('   Response headers:', Object.fromEntries(uploadResponse.headers.entries()));
      
      const uploadResult = await uploadResponse.json();
      console.log('   Response body:', uploadResult);
      
      if (uploadResult.success) {
        console.log('   ✅ File upload successful!');
        console.log('   - Video ID:', uploadResult.data.id);
        console.log('   - Video URL:', uploadResult.data.video_url);
        console.log('   - File info:', uploadResult.data.file_info);
      } else {
        console.log('   ❌ File upload failed:', uploadResult.message);
      }
      
    } catch (uploadError) {
      console.log('   ❌ Upload request failed:', uploadError.message);
    }
    
    // Clean up test file
    if (fs.existsSync(testFileName)) {
      fs.unlinkSync(testFileName);
    }
    
    // 4. Check if uploaded video appears in learning endpoint
    console.log('\n4. Checking if video appears in learning endpoint...');
    try {
      const finalResponse = await fetch('http://localhost:4000/api/learning');
      const finalData = await finalResponse.json();
      const videos = finalData.data?.videos || [];
      console.log('   Total videos now:', videos.length);
      
      const uploadedVideos = videos.filter(v => v.video_url?.startsWith('/uploads/'));
      console.log('   Uploaded file videos:', uploadedVideos.length);
      
      if (uploadedVideos.length > 0) {
        console.log('   ✅ Uploaded videos found:');
        uploadedVideos.forEach((video, index) => {
          console.log(`     ${index + 1}. ${video.title} - ${video.video_url}`);
        });
      }
      
    } catch (error) {
      console.log('   ❌ Error checking videos:', error.message);
    }
    
    console.log('\n🎯 Test Summary:');
    console.log('   - Backend running: Check above');
    console.log('   - Learning endpoint: Check above');
    console.log('   - Upload endpoint: Check above');
    console.log('   - File storage: Check backend/uploads/videos/ directory');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBackendUpload();