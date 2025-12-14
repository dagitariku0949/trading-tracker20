// Netlify function for learning content

// Default content
const defaultContent = {
  _version: '2024-12-11-netlify',
  _updated: new Date().toISOString(),
  courses: [
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
  ],
  videos: [
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
    },
    {
      id: 2,
      title: "Risk Management: The Key to Long-term Success",
      description: "Master the art of risk management and position sizing",
      duration: "22:15",
      views: 8900,
      category: "Risk Management",
      thumbnail: "⚖️",
      video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      status: "Published",
      likes: 654,
      upload_date: "2024-03-05T00:00:00Z",
      created_at: "2024-03-05T00:00:00Z",
      updated_at: "2024-03-05T00:00:00Z"
    }
  ],
  liveStreams: [
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
  ],
  resources: [
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
}

// In-memory storage for current session
let currentContent = null

async function getContent() {
  if (currentContent) {
    console.log('Using in-memory content')
    return { ...currentContent }
  }

  console.log('Using default content with 3 courses')
  currentContent = { ...defaultContent }
  return currentContent
}

async function saveContent(content) {
  currentContent = { ...content }
  console.log('Content saved to in-memory storage')
  return true
}

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
  
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  const { httpMethod } = event

  try {
    if (httpMethod === 'GET') {
      const content = await getContent()
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: content,
          version: '2024-12-11-netlify',
          timestamp: new Date().toISOString()
        })
      }
    }

    if (httpMethod === 'POST') {
      const { type, content } = JSON.parse(event.body)
      const contentType = type === 'stream' ? 'liveStreams' : `${type}s`
      
      const currentContent = await getContent()
      const newContent = {
        ...content,
        id: Date.now(),
        status: content.status || 'Published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(type === 'course' && { students: 0 }),
        ...(type === 'video' && { views: 0, likes: 0, upload_date: new Date().toISOString() }),
        ...(type === 'stream' && { registrations: 0 }),
        ...(type === 'resource' && { downloads: 0, upload_date: new Date().toISOString() })
      }

      currentContent[contentType].push(newContent)
      await saveContent(currentContent)

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          data: newContent
        })
      }
    }

    if (httpMethod === 'PUT') {
      const { type, id, updates } = JSON.parse(event.body)
      const contentType = type === 'stream' ? 'liveStreams' : `${type}s`
      
      const currentContent = await getContent()
      const index = currentContent[contentType].findIndex(item => item.id === id)
      
      if (index !== -1) {
        currentContent[contentType][index] = {
          ...currentContent[contentType][index],
          ...updates,
          updated_at: new Date().toISOString()
        }
        
        await saveContent(currentContent)
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: currentContent[contentType][index]
          })
        }
      }
      
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Content not found'
        })
      }
    }

    if (httpMethod === 'DELETE') {
      const { type, id } = event.queryStringParameters
      const contentType = type === 'stream' ? 'liveStreams' : `${type}s`
      
      const currentContent = await getContent()
      const initialLength = currentContent[contentType].length
      currentContent[contentType] = currentContent[contentType].filter(item => item.id !== parseInt(id))
      
      if (currentContent[contentType].length < initialLength) {
        await saveContent(currentContent)
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Content deleted'
          })
        }
      }
      
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Content not found'
        })
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Method not allowed'
      })
    }
  } catch (error) {
    console.error('API Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error'
      })
    }
  }
}