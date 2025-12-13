import React, { useState } from 'react';
import { useLearning } from '../contexts/LearningContext';

const LearningHubSimple = ({ onBack }) => {
  console.log('LearningHubSimple component is rendering!', new Date().toISOString());
  
  const [activeCategory, setActiveCategory] = useState('courses');
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Get learning content from context (connected to backend API)
  const { publishedContent, loading, error } = useLearning();
  const learningContent = publishedContent || {
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

  const categories = [
    { id: 'courses', label: 'Courses', icon: '🎓' },
    { id: 'videos', label: 'Videos', icon: '🎥' },
    { id: 'resources', label: 'Resources', icon: '📚' }
  ];

  console.log('🎬 LearningHubSimple rendering:', {
    courses: learningContent.courses.length,
    videos: learningContent.videos.length,
    videoTitles: learningContent.videos.map(v => v.title),
    videoUrls: learningContent.videos.map(v => v.video_url),
    loading,
    error,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={async () => {
                  console.log('🔄 Force refreshing learning content...');
                  
                  // Try to fetch fresh data from API
                  try {
                    const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;
                    const response = await fetch(`${API_BASE_URL}/api/learning?t=${Date.now()}`);
                    const data = await response.json();
                    console.log('📊 Fresh data from API:', data.data?.videos?.length, 'videos');
                    
                    // Force page reload to ensure fresh data
                    window.location.reload();
                  } catch (error) {
                    console.error('❌ Refresh failed:', error);
                    // Still reload the page
                    window.location.reload();
                  }
                }}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                title="Force refresh videos from server"
              >
                🔄 Force Refresh
              </button>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Learn with</div>
              <div className="text-2xl font-bold">Dagim Tariku</div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-6xl mb-4">👨‍🏫</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Master Trading with Expert Guidance
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Learn from a professional trader with years of experience in forex markets. 
              Get access to courses, tutorials, and resources designed to accelerate your trading journey.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* API STATUS BANNER */}
        <div className={`text-white p-4 rounded-lg mb-6 text-center ${
          loading ? 'bg-blue-600' : error ? 'bg-red-600' : 'bg-green-600'
        }`}>
          <div className="text-xl font-bold">
            {loading ? '🔄 LOADING CONTENT...' : 
             error ? '❌ API ERROR - USING FALLBACK' : 
             '✅ LIVE API CONNECTED'}
          </div>
          <div className="text-sm mt-2">
            Courses Count: {learningContent.courses.length} | 
            Source: {loading ? 'Loading...' : error ? 'Fallback Data' : 'Live API'} | 
            Time: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Category Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-slate-800 rounded-lg p-1">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-md transition-colors ${
                  activeCategory === category.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Section */}
        {activeCategory === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningContent.courses.map(course => (
              <div key={course.id} className="bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-750 transition-colors">
                <div className="p-6">
                  <div className="text-4xl mb-4 text-center">{course.thumbnail}</div>
                  <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                  <p className="text-gray-400 mb-4">{course.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Duration:</span>
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Lessons:</span>
                      <span>{course.lessons}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Level:</span>
                      <span>{course.level}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-2">Topics covered:</div>
                    <div className="flex flex-wrap gap-1">
                      {course.topics.map((topic, index) => (
                        <span key={index} className="bg-slate-700 text-xs px-2 py-1 rounded">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-emerald-400">{course.price}</span>
                    <button className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors">
                      {course.price === 'Free' ? 'Start Learning' : 'Enroll Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Videos Section */}
        {activeCategory === 'videos' && (
          <div>
            {/* Debug Info */}
            <div className="bg-blue-900 border border-blue-700 p-4 rounded-lg mb-6">
              <h3 className="font-bold text-blue-300 mb-2">📹 Video Management Status</h3>
              <div className="text-sm text-blue-200 space-y-1">
                <p>• Total Videos Available: {learningContent.videos.length}</p>
                <p>• Source: {loading ? 'Loading...' : error ? 'Fallback Data' : 'Live API'}</p>
                <p>• Last Updated: {new Date().toLocaleTimeString()}</p>
                <p>• Admin Panel: Use Ctrl+Alt+dagi.. to add/edit videos</p>
                {learningContent.videos.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-300 hover:text-blue-100">
                      🔍 Show Video Details ({learningContent.videos.length} videos)
                    </summary>
                    <div className="mt-2 pl-4 space-y-1">
                      {learningContent.videos.map((video, index) => (
                        <div key={video.id} className="text-xs">
                          {index + 1}. <strong>{video.title}</strong>
                          <br />
                          &nbsp;&nbsp;&nbsp;URL: {video.video_url || 'No URL'}
                          <br />
                          &nbsp;&nbsp;&nbsp;Type: {video.video_url?.startsWith('/uploads/') ? 'Uploaded File' : 
                                                   video.video_url?.includes('youtube') ? 'YouTube' : 
                                                   video.video_url?.includes('vimeo') ? 'Vimeo' : 'External URL'}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
            
            {learningContent.videos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📹</div>
                <h3 className="text-xl font-bold mb-2">No Videos Available</h3>
                <p className="text-gray-400 mb-4">Use the admin panel to add your first video</p>
                <div className="bg-yellow-900 border border-yellow-700 p-4 rounded-lg max-w-md mx-auto">
                  <p className="text-yellow-300 text-sm">
                    <strong>How to add videos:</strong><br/>
                    1. Press Ctrl+Alt+dagi..<br/>
                    2. Enter password: LEAP2024Admin!<br/>
                    3. Go to "Learning Management" tab<br/>
                    4. Click "+ Upload Video"
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningContent.videos.map(video => (
                <div key={video.id} className="bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-750 transition-colors cursor-pointer"
                     onClick={() => setSelectedVideo(video)}>
                  <div className="aspect-video bg-slate-700 flex items-center justify-center text-4xl">
                    {video.thumbnail}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-2">{video.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{video.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="bg-emerald-900 text-emerald-300 px-2 py-1 rounded">
                        {video.category}
                      </span>
                      <div className="text-gray-400">
                        {video.duration} • {video.views} views
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}

            {/* Video Modal */}
            {selectedVideo && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold">{selectedVideo.title}</h2>
                      <button
                        onClick={() => setSelectedVideo(null)}
                        className="text-gray-400 hover:text-white text-2xl"
                      >
                        ×
                      </button>
                    </div>
                    <div className="aspect-video bg-slate-700 rounded-lg mb-4 flex items-center justify-center">
                      {(() => {
                        const videoUrl = selectedVideo.video_url;
                        console.log('Playing video:', selectedVideo.title, 'URL:', videoUrl);
                        
                        // YouTube embed URLs
                        if (videoUrl && (videoUrl.includes('youtube.com/embed') || videoUrl.includes('youtu.be'))) {
                          return (
                            <iframe
                              src={videoUrl}
                              className="w-full h-full rounded-lg"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={selectedVideo.title}
                            ></iframe>
                          );
                        }
                        
                        // Vimeo embed URLs
                        if (videoUrl && videoUrl.includes('vimeo.com')) {
                          return (
                            <iframe
                              src={videoUrl}
                              className="w-full h-full rounded-lg"
                              frameBorder="0"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                              title={selectedVideo.title}
                            ></iframe>
                          );
                        }
                        
                        // Uploaded files (server-hosted)
                        if (videoUrl && videoUrl.startsWith('/uploads/')) {
                          const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;
                          const fullVideoUrl = `${API_BASE_URL}${videoUrl}`;
                          return (
                            <video
                              src={fullVideoUrl}
                              className="w-full h-full rounded-lg"
                              controls
                              title={selectedVideo.title}
                              onError={(e) => {
                                console.error('Video load error:', e);
                                console.log('Attempted URL:', fullVideoUrl);
                              }}
                            >
                              Your browser does not support the video tag.
                            </video>
                          );
                        }
                        
                        // Direct video URLs (external hosting)
                        if (videoUrl && videoUrl.startsWith('http') && 
                            (videoUrl.includes('.mp4') || videoUrl.includes('.webm') || videoUrl.includes('.ogg'))) {
                          return (
                            <video
                              src={videoUrl}
                              className="w-full h-full rounded-lg"
                              controls
                              title={selectedVideo.title}
                              onError={(e) => {
                                console.error('Video load error:', e);
                                console.log('Attempted URL:', videoUrl);
                              }}
                            >
                              Your browser does not support the video tag.
                            </video>
                          );
                        }
                        
                        // Fallback for any other HTTP URLs (try as video first, then show info)
                        if (videoUrl && videoUrl.startsWith('http')) {
                          return (
                            <div className="text-center">
                              <video
                                src={videoUrl}
                                className="w-full h-full rounded-lg mb-4"
                                controls
                                title={selectedVideo.title}
                                onError={(e) => {
                                  console.error('Video load error:', e);
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'block';
                                }}
                              >
                                Your browser does not support the video tag.
                              </video>
                              <div style={{display: 'none'}} className="text-center">
                                <div className="text-6xl mb-4">{selectedVideo.thumbnail || '🎥'}</div>
                                <p className="text-gray-400">Video format not supported in browser</p>
                                <p className="text-sm text-gray-500 mt-2">
                                  <a href={videoUrl} target="_blank" rel="noopener noreferrer" 
                                     className="text-blue-400 hover:text-blue-300 underline">
                                    Open video in new tab
                                  </a>
                                </p>
                              </div>
                            </div>
                          );
                        }
                        
                        // No video URL provided
                        return (
                          <div className="text-center">
                            <div className="text-6xl mb-4">{selectedVideo.thumbnail || '🎥'}</div>
                            <p className="text-gray-400">Video preview</p>
                            <p className="text-sm text-gray-500 mt-2">
                              {videoUrl ? `Video URL: ${videoUrl}` : 'No video URL provided'}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                    <p className="text-gray-300">{selectedVideo.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resources Section */}
        {activeCategory === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningContent.resources.map(resource => (
              <div key={resource.id} className="bg-slate-800 rounded-lg p-6 hover:bg-slate-750 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{resource.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{resource.title}</h3>
                    <p className="text-gray-400 mb-4">{resource.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-400">
                        <div>Type: {resource.type}</div>
                        <div>Format: {resource.format}</div>
                        <div>Size: {resource.size}</div>
                      </div>
                    </div>
                    <button className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors w-full">
                      {resource.type === 'Download' ? 'Download' : 'Access Tool'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* About Instructor */}
        <div className="mt-12 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">👨‍💼</div>
            <h2 className="text-3xl font-bold mb-4">About Dagim Tariku</h2>
          </div>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-300 mb-6">
              Professional forex trader with over 5 years of experience in financial markets. 
              Specializes in price action trading, risk management, and trading psychology. 
              Has helped hundreds of traders develop profitable trading strategies through 
              comprehensive education and mentorship programs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-400">500+</div>
                <div className="text-gray-400">Students Taught</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">5+ Years</div>
                <div className="text-gray-400">Trading Experience</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">95%</div>
                <div className="text-gray-400">Student Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningHubSimple;