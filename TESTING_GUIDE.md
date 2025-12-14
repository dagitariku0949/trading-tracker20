# 🧪 Video Upload Testing Guide

## Quick Test Steps

### 1. Start the Backend Server
```bash
cd backend
npm start
```
**Expected**: Server should start on port 4000

### 2. Start the Frontend
```bash
cd frontend  
npm run dev
```
**Expected**: Frontend should start on port 5173

### 3. Test Backend Upload Endpoint
```bash
node test-backend-upload.js
```
**Expected**: Should show backend connectivity and upload endpoint status

### 4. Access Admin Panel
1. Go to the dashboard
2. Press `Ctrl+Alt+dagi..`
3. Enter password: `LEAP2024Admin!`
4. Go to "Learning Management" tab

### 5. Test URL Upload (YouTube Fix)

#### Test with Regular YouTube URL:
1. Click "+ Upload Video"
2. Select "🔗 Upload via URL" (default)
3. Enter title: "Test YouTube Video"
4. Enter description: "Testing YouTube URL conversion"
5. Enter duration: "3:30"
6. Select category: "Technical Analysis"
7. **Enter this YouTube URL**: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
8. Click "Create Video"

**Expected Results**:
- ✅ URL should auto-convert to: `https://www.youtube.com/embed/dQw4w9WgXcQ`
- ✅ Video should appear in Learning Hub
- ✅ Video should play when clicked (YouTube embed)

### 6. Test File Upload

#### Test with Video File:
1. Click "+ Upload Video" again
2. Select "💻 Upload from Computer"
3. Enter title: "Test File Upload"
4. Enter description: "Testing file upload functionality"
5. Enter duration: "2:00"
6. Select category: "Testing"
7. **Click the file upload area**
8. **Select a video file** (MP4, AVI, MOV, etc. - max 500MB)
9. Click "Create Video"

**Expected Results**:
- ✅ File should be validated (type and size)
- ✅ Upload progress should show
- ✅ Video should appear in Learning Hub
- ✅ Video should play when clicked (HTML5 player)

## Debugging Tools

### Admin Panel Debug Features
1. **🧪 Test Upload Button**: Click to test backend connectivity
2. **🔍 Debug Info Panel**: Expand to see upload status details
3. **📋 Logs Panel**: Check the "Logs" tab for detailed messages

### Console Debugging
Open browser console (F12) to see:
- File selection details
- Upload progress
- API responses
- Error messages

### Backend Logs
Check backend terminal for:
- File upload requests
- Multer processing
- File storage location
- Error details

## Common Issues & Solutions

### Issue: "YouTube refused to connect"
**Solution**: 
- Use the auto-conversion feature
- Paste regular YouTube URLs like: `https://www.youtube.com/watch?v=VIDEO_ID`
- System will auto-convert to embed format

### Issue: "File upload not working"
**Solutions**:
1. Check backend is running on port 4000
2. Verify file is a video type (MP4, AVI, MOV, etc.)
3. Ensure file is under 500MB
4. Check browser console for errors
5. Use "🧪 Test Upload" button to check connectivity

### Issue: "Video not showing in Learning Hub"
**Solutions**:
1. Click "🔄 Refresh" button in Learning Hub
2. Check video status is "Published"
3. Verify video was added successfully in admin logs
4. Check browser console for loading errors

### Issue: "Backend connection failed"
**Solutions**:
1. Ensure backend server is running: `cd backend && npm start`
2. Check port 4000 is not blocked
3. Verify no other services using port 4000
4. Check backend terminal for error messages

## Test Files

### Available Test Scripts:
- `test-backend-upload.js` - Test backend upload endpoint
- `test-upload-fix.js` - Test both upload methods
- `test-video-upload-enhanced.js` - Comprehensive upload testing

### Run Tests:
```bash
# Test backend connectivity and upload
node test-backend-upload.js

# Test both upload methods
node test-upload-fix.js
```

## Success Indicators

### ✅ URL Upload Working:
- YouTube URLs auto-convert to embed format
- Videos appear in Learning Hub immediately
- Videos play in iframe player
- No "refused to connect" errors

### ✅ File Upload Working:
- Files upload with progress indication
- Files stored in `backend/uploads/videos/`
- Videos appear in Learning Hub immediately
- Videos play in HTML5 player
- File info shows in admin panel

### ✅ Both Methods Working:
- Admin panel shows both options
- Debug panel shows correct status
- Learning Hub displays all videos
- Both video types play correctly
- No console errors

## Next Steps

If tests pass:
- ✅ Both upload methods are working
- ✅ Videos display properly in Learning Hub
- ✅ System is ready for production use

If tests fail:
- Check specific error messages in logs
- Use debug tools to identify issues
- Follow troubleshooting steps above
- Check backend/frontend connectivity