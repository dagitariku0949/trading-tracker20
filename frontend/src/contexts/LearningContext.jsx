import React, { createContext, useContext, useState, useEffect } from 'react';

const LearningContext = createContext();

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

export const LearningProvider = ({ children }) => {
  const [learningContent, setLearningContent] = useState({
    courses: [],
    videos: [],
    liveStreams: [],
    resources: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load content from API on mount
  useEffect(() => {
    loadLearningContent();
  }, []);

  // Auto-refresh content every 30 seconds to sync changes across browsers
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing learning content...');
      loadLearningContent();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);



  const loadLearningContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try API first with cache busting to ensure fresh content
      try {
        const cacheBuster = `?v=${Date.now()}&force=true`;
        const apiUrl = `${API_BASE_URL}/api/learning${cacheBuster}`;
        console.log('API_BASE_URL:', API_BASE_URL);
        console.log('Fetching from API:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.success && result.data) {
          setLearningContent(result.data);
          localStorage.setItem('learningContent', JSON.stringify({
            ...result.data,
            _cached_at: new Date().toISOString(),
            _version: result.version || 'api'
          }));
          console.log('Learning content loaded from API successfully');
          return;
        } else {
          throw new Error('Invalid API response');
        }
      } catch (apiError) {
        console.error('API failed completely:', apiError.message);
        
        // Use fallback content to ensure the site works while API is being fixed
        const fallbackContent = {
          _version: '2024-12-11-fallback',
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
        };
        
        console.log('Using fallback content with 3 courses');
        setLearningContent(fallbackContent);
        setError(null); // Clear error since we have fallback content
        
        // Still try to reconnect to API in background, but don't block the UI
        setTimeout(() => {
          console.log('Background retry: Attempting to reconnect to API...');
          loadLearningContent();
        }, 10000); // Retry every 10 seconds in background
      }
    } catch (error) {
      console.error('Error loading learning content:', error);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Get only published content for public display
  const getPublishedContent = () => {
    const published = {
      courses: learningContent.courses.filter(course => course.status === 'Published'),
      videos: learningContent.videos.filter(video => video.status === 'Published'),
      liveStreams: learningContent.liveStreams.filter(stream => stream.status === 'Scheduled' || stream.status === 'Live'),
      resources: learningContent.resources.filter(resource => resource.status === 'Published')
    };
    console.log('Published content:', published);
    return published;
  };

  // Functions for managing content
  const addContent = async (type, content) => {
    try {
      console.log('Adding content:', { type, content });
      
      // For file uploads that are already processed, add directly to local state
      if (content.id && content.video_url && content.video_url.startsWith('/uploads/')) {
        console.log('Adding uploaded video directly to state');
        const contentType = type === 'stream' ? 'liveStreams' : `${type}s`;
        const newContent = {
          ...content,
          status: content.status || 'Published',
          views: content.views || 0,
          likes: content.likes || 0,
          upload_date: content.upload_date || new Date().toISOString(),
          created_at: content.created_at || new Date().toISOString(),
          updated_at: content.updated_at || new Date().toISOString()
        };

        const updatedContent = {
          ...learningContent,
          [contentType]: [...learningContent[contentType], newContent]
        };
        
        setLearningContent(updatedContent);
        localStorage.setItem('learningContent', JSON.stringify(updatedContent));
        console.log('Uploaded video added to state:', newContent);
        return newContent;
      }
      
      // Try API first for regular content
      try {
        const response = await fetch(`${API_BASE_URL}/api/learning`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ type, content })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Refresh all content to ensure consistency across browsers
            await loadLearningContent();
            console.log('Content added via API, refreshed all content');
            return result.data;
          }
        }
        throw new Error('API call failed');
      } catch (apiError) {
        console.log('API failed, adding locally:', apiError.message);
        
        // Fallback to local storage
        const contentType = type === 'stream' ? 'liveStreams' : `${type}s`;
        const newContent = {
          ...content,
          id: content.id || Date.now(),
          status: content.status || 'Published',
          createdAt: content.createdAt || new Date().toISOString(),
          students: type === 'course' ? 0 : undefined,
          views: type === 'video' ? 0 : undefined,
          likes: type === 'video' ? 0 : undefined,
          downloads: type === 'resource' ? 0 : undefined,
          registrations: type === 'stream' ? 0 : undefined
        };

        const updatedContent = {
          ...learningContent,
          [contentType]: [...learningContent[contentType], newContent]
        };
        
        setLearningContent(updatedContent);
        localStorage.setItem('learningContent', JSON.stringify(updatedContent));
        console.log('Content added locally:', newContent);
        return newContent;
      }
    } catch (error) {
      console.error('Error adding content:', error);
      throw error;
    }
  };

  const updateContent = async (type, id, updates) => {
    try {
      // Try API first
      try {
        const response = await fetch(`${API_BASE_URL}/api/learning`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ type, id, updates })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Refresh all content to ensure consistency across browsers
            await loadLearningContent();
            console.log('Content updated via API, refreshed all content');
            return;
          }
        }
        throw new Error('API call failed');
      } catch (apiError) {
        console.log('API failed, updating locally:', apiError.message);
        
        // Fallback to local update
        const contentType = type === 'stream' ? 'liveStreams' : `${type}s`;
        const updatedContent = {
          ...learningContent,
          [contentType]: learningContent[contentType].map(item =>
            item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
          )
        };
        
        setLearningContent(updatedContent);
        localStorage.setItem('learningContent', JSON.stringify(updatedContent));
        console.log('Content updated locally:', { type, id, updates });
      }
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  };

  const deleteContent = async (type, id) => {
    try {
      // Try API first
      try {
        const response = await fetch(`${API_BASE_URL}/api/learning?type=${type}&id=${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Refresh all content to ensure consistency across browsers
            await loadLearningContent();
            console.log('Content deleted via API, refreshed all content');
            return;
          }
        }
        throw new Error('API call failed');
      } catch (apiError) {
        console.log('API failed, deleting locally:', apiError.message);
        
        // Fallback to local delete
        const contentType = type === 'stream' ? 'liveStreams' : `${type}s`;
        const updatedContent = {
          ...learningContent,
          [contentType]: learningContent[contentType].filter(item => item.id !== id)
        };
        
        setLearningContent(updatedContent);
        localStorage.setItem('learningContent', JSON.stringify(updatedContent));
        console.log('Content deleted locally:', { type, id });
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  };

  const publishContent = async (type, id) => {
    await updateContent(type, id, { status: 'Published' });
  };

  const unpublishContent = async (type, id) => {
    await updateContent(type, id, { status: 'Draft' });
  };

  const resetToDefaults = async () => {
    await loadLearningContent();
  };

  const forceRefresh = async () => {
    console.log('FORCE REFRESH: Clearing all caches...');
    // Clear all possible caches
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any browser cache for the API endpoint
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('Browser caches cleared');
      } catch (error) {
        console.log('Cache clearing failed:', error);
      }
    }
    
    // Force reload content
    await loadLearningContent();
  };

  const value = {
    learningContent,
    publishedContent: getPublishedContent(),
    loading,
    error,
    addContent,
    updateContent,
    deleteContent,
    publishContent,
    unpublishContent,
    resetToDefaults,
    refreshContent: loadLearningContent,
    forceRefresh
  };

  // Add error boundary
  try {
    return (
      <LearningContext.Provider value={value}>
        {children}
      </LearningContext.Provider>
    );
  } catch (error) {
    console.error('LearningContext error:', error);
    return <div>Error loading learning content</div>;
  }
};