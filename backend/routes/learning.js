const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const router = express.Router()

// Configure multer for video file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/videos')
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check if file is a video
    if (file.mimetype.startsWith('video/')) {
      cb(null, true)
    } else {
      cb(new Error('Only video files are allowed!'), false)
    }
  }
})
// Database connection (using in-memory for now, but structured for easy PostgreSQL migration)
class LearningDatabase {
  constructor() {
    // Initialize with sample data
    this.courses = [
      {
        id: 1,
        title: "Complete Forex Trading Mastery",
        description: "Master the fundamentals of forex trading from beginner to advanced level",
        duration: "12 hours",
        lessons: 24,
        level: "Beginner to Advanced",
        price: "Free",
        thumbnail: "🎓",
        topics: ["Market Analysis", "Risk Management", "Trading Psychology", "Technical Analysis"],
        status: "Published",
        students: 156,
        created_at: "2024-01-15T00:00:00Z",
        updated_at: "2024-01-15T00:00:00Z"
      },
      {
        id: 2,
        title: "Advanced Price Action Strategies",
        description: "Learn professional price action techniques used by institutional traders",
        duration: "8 hours",
        lessons: 16,
        level: "Intermediate",
        price: "$99",
        thumbnail: "📊",
        topics: ["Support & Resistance", "Candlestick Patterns", "Market Structure", "Entry Strategies"],
        status: "Published",
        students: 89,
        created_at: "2024-02-10T00:00:00Z",
        updated_at: "2024-02-10T00:00:00Z"
      },
      {
        id: 3,
        title: "Trading Psychology Mastery",
        description: "Develop the mental discipline required for consistent trading success",
        duration: "6 hours",
        lessons: 12,
        level: "All Levels",
        price: "$79",
        thumbnail: "🧠",
        topics: ["Emotional Control", "Discipline", "Risk Psychology", "Mindset Development"],
        status: "Published",
        students: 67,
        created_at: "2024-03-01T00:00:00Z",
        updated_at: "2024-03-01T00:00:00Z"
      }
    ]
    
    this.videos = [
      {
        id: 1,
        title: "How to Identify High Probability Setups",
        description: "Learn the key factors that make a trading setup high probability",
        duration: "15:30",
        views: 12500,
        category: "Technical Analysis",
        thumbnail: "🎯",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        status: "Published",
        likes: 890,
        upload_date: "2024-03-01T00:00:00Z",
        created_at: "2024-03-01T00:00:00Z",
        updated_at: "2024-03-01T00:00:00Z"
      }
    ]
    
    this.streams = [
      {
        id: 1,
        title: "Weekly Market Analysis",
        description: "Live analysis of current market conditions",
        scheduled_date: "2024-12-15T15:00:00Z",
        duration: "60 minutes",
        registrations: 45,
        status: "Scheduled",
        created_at: "2024-12-01T00:00:00Z",
        updated_at: "2024-12-01T00:00:00Z"
      }
    ]
    
    this.resources = [
      {
        id: 1,
        title: "Trading Journal Template",
        description: "Professional Excel template for tracking your trades",
        type: "Download",
        format: "Excel (.xlsx)",
        size: "2.5 MB",
        icon: "📊",
        status: "Published",
        downloads: 234,
        upload_date: "2024-02-20T00:00:00Z",
        created_at: "2024-02-20T00:00:00Z",
        updated_at: "2024-02-20T00:00:00Z"
      }
    ]
    
    this.idCounters = {
      courses: 4,
      videos: 2,
      streams: 2,
      resources: 2
    }
  }

  // Courses
  async getAllCourses() {
    return this.courses
  }

  async getPublishedCourses() {
    return this.courses.filter(course => course.status === 'Published')
  }

  async createCourse(courseData) {
    const newCourse = {
      id: this.idCounters.courses++,
      ...courseData,
      students: 0,
      status: courseData.status || 'Draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    this.courses.push(newCourse)
    return newCourse
  }

  async updateCourse(id, updates) {
    const index = this.courses.findIndex(c => c.id === parseInt(id))
    if (index === -1) return null
    
    this.courses[index] = {
      ...this.courses[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    return this.courses[index]
  }

  async deleteCourse(id) {
    const index = this.courses.findIndex(c => c.id === parseInt(id))
    if (index === -1) return false
    this.courses.splice(index, 1)
    return true
  }

  // Videos
  async getAllVideos() {
    return this.videos
  }

  async getPublishedVideos() {
    return this.videos.filter(video => video.status === 'Published')
  }

  async createVideo(videoData) {
    const newVideo = {
      id: this.idCounters.videos++,
      ...videoData,
      views: 0,
      likes: 0,
      status: videoData.status || 'Draft',
      upload_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    this.videos.push(newVideo)
    return newVideo
  }

  async updateVideo(id, updates) {
    const index = this.videos.findIndex(v => v.id === parseInt(id))
    if (index === -1) return null
    
    this.videos[index] = {
      ...this.videos[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    return this.videos[index]
  }

  async deleteVideo(id) {
    const index = this.videos.findIndex(v => v.id === parseInt(id))
    if (index === -1) return false
    this.videos.splice(index, 1)
    return true
  }

  // Streams
  async getAllStreams() {
    return this.streams
  }

  async getScheduledStreams() {
    return this.streams.filter(stream => stream.status === 'Scheduled' || stream.status === 'Live')
  }

  async createStream(streamData) {
    const newStream = {
      id: this.idCounters.streams++,
      ...streamData,
      registrations: 0,
      status: streamData.status || 'Scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    this.streams.push(newStream)
    return newStream
  }

  async updateStream(id, updates) {
    const index = this.streams.findIndex(s => s.id === parseInt(id))
    if (index === -1) return null
    
    this.streams[index] = {
      ...this.streams[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    return this.streams[index]
  }

  async deleteStream(id) {
    const index = this.streams.findIndex(s => s.id === parseInt(id))
    if (index === -1) return false
    this.streams.splice(index, 1)
    return true
  }

  // Resources
  async getAllResources() {
    return this.resources
  }

  async getPublishedResources() {
    return this.resources.filter(resource => resource.status === 'Published')
  }

  async createResource(resourceData) {
    const newResource = {
      id: this.idCounters.resources++,
      ...resourceData,
      downloads: 0,
      status: resourceData.status || 'Draft',
      upload_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    this.resources.push(newResource)
    return newResource
  }

  async updateResource(id, updates) {
    const index = this.resources.findIndex(r => r.id === parseInt(id))
    if (index === -1) return null
    
    this.resources[index] = {
      ...this.resources[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    return this.resources[index]
  }

  async deleteResource(id) {
    const index = this.resources.findIndex(r => r.id === parseInt(id))
    if (index === -1) return false
    this.resources.splice(index, 1)
    return true
  }
}

const learningDb = new LearningDatabase()

// Get all learning content (public) - Main endpoint the frontend expects
router.get('/', async (req, res) => {
  try {
    const [courses, videos, liveStreams, resources] = await Promise.all([
      learningDb.getAllCourses(),
      learningDb.getAllVideos(),
      learningDb.getAllStreams(),
      learningDb.getAllResources()
    ])

    res.json({
      success: true,
      data: {
        courses,
        videos,
        liveStreams,
        resources
      },
      version: 'api-v1',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching learning content:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch learning content' 
    })
  }
})

// Get all learning content (public) - Alternative endpoint
router.get('/content', async (req, res) => {
  try {
    const [courses, videos, liveStreams, resources] = await Promise.all([
      learningDb.getAllCourses(),
      learningDb.getAllVideos(),
      learningDb.getAllStreams(),
      learningDb.getAllResources()
    ])

    res.json({
      success: true,
      data: {
        courses,
        videos,
        liveStreams,
        resources
      }
    })
  } catch (error) {
    console.error('Error fetching learning content:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch learning content' 
    })
  }
})

// Get only published content (public)
router.get('/published', async (req, res) => {
  try {
    const [courses, videos, liveStreams, resources] = await Promise.all([
      learningDb.getPublishedCourses(),
      learningDb.getPublishedVideos(),
      learningDb.getScheduledStreams(),
      learningDb.getPublishedResources()
    ])

    res.json({
      success: true,
      data: {
        courses,
        videos,
        liveStreams,
        resources
      }
    })
  } catch (error) {
    console.error('Error fetching published content:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch published content' 
    })
  }
})

// Video file upload endpoint
router.post('/upload-video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      })
    }

    // Generate video URL for the uploaded file
    const videoUrl = `/uploads/videos/${req.file.filename}`
    
    // Get video metadata from request body
    const { title, description, duration, category, thumbnail } = req.body
    
    // Create video entry
    const newVideo = {
      title: title || req.file.originalname,
      description: description || 'Uploaded video',
      duration: duration || '0:00',
      category: category || 'General',
      thumbnail: thumbnail || '🎥',
      video_url: videoUrl,
      file_info: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    }
    
    const createdVideo = await learningDb.createVideo(newVideo)
    
    res.status(201).json({
      success: true,
      data: createdVideo,
      message: 'Video uploaded successfully'
    })
  } catch (error) {
    console.error('Error uploading video:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to upload video: ' + error.message
    })
  }
})

// Create new content - Main endpoint the frontend expects
router.post('/', async (req, res) => {
  try {
    const { type, content } = req.body
    let newContent

    switch (type) {
      case 'course':
        newContent = await learningDb.createCourse(content)
        break
      case 'video':
        newContent = await learningDb.createVideo(content)
        break
      case 'stream':
        newContent = await learningDb.createStream(content)
        break
      case 'resource':
        newContent = await learningDb.createResource(content)
        break
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid content type'
        })
    }

    res.status(201).json({
      success: true,
      data: newContent,
      message: `${type} created successfully`
    })
  } catch (error) {
    console.error(`Error creating ${req.body.type}:`, error)
    res.status(500).json({ 
      success: false, 
      message: `Failed to create ${req.body.type}` 
    })
  }
})

// Create new content - Alternative endpoint
router.post('/content/:type', async (req, res) => {
  try {
    const { type } = req.params
    let newContent

    switch (type) {
      case 'course':
        newContent = await learningDb.createCourse(req.body)
        break
      case 'video':
        newContent = await learningDb.createVideo(req.body)
        break
      case 'stream':
        newContent = await learningDb.createStream(req.body)
        break
      case 'resource':
        newContent = await learningDb.createResource(req.body)
        break
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid content type'
        })
    }

    res.status(201).json({
      success: true,
      data: newContent,
      message: `${type} created successfully`
    })
  } catch (error) {
    console.error(`Error creating ${req.params.type}:`, error)
    res.status(500).json({ 
      success: false, 
      message: `Failed to create ${req.params.type}` 
    })
  }
})

// Update content - Main endpoint the frontend expects
router.put('/', async (req, res) => {
  try {
    const { type, id, updates } = req.body
    let updatedContent

    switch (type) {
      case 'course':
        updatedContent = await learningDb.updateCourse(id, updates)
        break
      case 'video':
        updatedContent = await learningDb.updateVideo(id, updates)
        break
      case 'stream':
        updatedContent = await learningDb.updateStream(id, updates)
        break
      case 'resource':
        updatedContent = await learningDb.updateResource(id, updates)
        break
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid content type'
        })
    }

    if (!updatedContent) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`
      })
    }

    res.json({
      success: true,
      data: updatedContent,
      message: `${type} updated successfully`
    })
  } catch (error) {
    console.error(`Error updating ${req.body.type}:`, error)
    res.status(500).json({ 
      success: false, 
      message: `Failed to update ${req.body.type}` 
    })
  }
})

// Update content - Alternative endpoint
router.put('/content/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params
    let updatedContent

    switch (type) {
      case 'course':
        updatedContent = await learningDb.updateCourse(id, req.body)
        break
      case 'video':
        updatedContent = await learningDb.updateVideo(id, req.body)
        break
      case 'stream':
        updatedContent = await learningDb.updateStream(id, req.body)
        break
      case 'resource':
        updatedContent = await learningDb.updateResource(id, req.body)
        break
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid content type'
        })
    }

    if (!updatedContent) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`
      })
    }

    res.json({
      success: true,
      data: updatedContent,
      message: `${type} updated successfully`
    })
  } catch (error) {
    console.error(`Error updating ${req.params.type}:`, error)
    res.status(500).json({ 
      success: false, 
      message: `Failed to update ${req.params.type}` 
    })
  }
})

// Delete content - Main endpoint the frontend expects
router.delete('/', async (req, res) => {
  try {
    const { type, id } = req.query
    let deleted

    switch (type) {
      case 'course':
        deleted = await learningDb.deleteCourse(id)
        break
      case 'video':
        deleted = await learningDb.deleteVideo(id)
        break
      case 'stream':
        deleted = await learningDb.deleteStream(id)
        break
      case 'resource':
        deleted = await learningDb.deleteResource(id)
        break
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid content type'
        })
    }

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`
      })
    }

    res.json({
      success: true,
      message: `${type} deleted successfully`
    })
  } catch (error) {
    console.error(`Error deleting ${req.query.type}:`, error)
    res.status(500).json({ 
      success: false, 
      message: `Failed to delete ${req.query.type}` 
    })
  }
})

// Delete content - Alternative endpoint
router.delete('/content/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params
    let deleted

    switch (type) {
      case 'course':
        deleted = await learningDb.deleteCourse(id)
        break
      case 'video':
        deleted = await learningDb.deleteVideo(id)
        break
      case 'stream':
        deleted = await learningDb.deleteStream(id)
        break
      case 'resource':
        deleted = await learningDb.deleteResource(id)
        break
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid content type'
        })
    }

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`
      })
    }

    res.json({
      success: true,
      message: `${type} deleted successfully`
    })
  } catch (error) {
    console.error(`Error deleting ${req.params.type}:`, error)
    res.status(500).json({ 
      success: false, 
      message: `Failed to delete ${req.params.type}` 
    })
  }
})

module.exports = router