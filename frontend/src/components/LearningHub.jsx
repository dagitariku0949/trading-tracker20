import React, { useState } from 'react';
import { useLearning } from '../contexts/LearningContext';

const LearningHub = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState('courses');
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  const { publishedContent, learningContent: rawContent, loading, error, forceRefresh } = useLearning();

  // TEMPORARY FIX: Hardcoded content to bypass API issues
  const hardcodedContent = {
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

  // DEBUG: Log the actual content
  console.log('=== LEARNING HUB DEBUG ===');
  console.log('Published Content:', publishedContent);
  console.log('Courses:', publishedContent?.courses);
  console.log('Courses Count:', publishedContent?.courses?.length);
  console.log('========================');

  // BYPASS LOADING AND ERROR STATES - Use hardcoded content immediately
  // Use hardcoded content first, then try to use API content if available
  const learningContent = (publishedContent && publishedContent.courses && publishedContent.courses.length > 0) 
    ? publishedContent 
    : hardcodedContent;

  const categories = [
    { id: 'courses', label: 'Courses', icon: '🎓' },
    { id: 'videos', label: 'Videos', icon: '🎥' },
    { id: 'resources', label: 'Resources', icon: '📚' }
  ];

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
                onClick={() => {
                  console.log('Refresh button clicked!');
                  if (forceRefresh) {
                    forceRefresh();
                  } else {
                    console.error('forceRefresh function not available');
                    // Fallback: clear localStorage and reload
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="flex items-center gap-2 bg-red-500/80 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors font-semibold"
                title="Force refresh content - clears all caches"
              >
                🔄 FORCE REFRESH
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
        {/* STATUS BANNER - Shows content source */}
        <div className={`text-white p-4 rounded-lg mb-6 text-center ${
          (publishedContent && publishedContent.courses && publishedContent.courses.length > 0) 
            ? 'bg-green-600' 
            : 'bg-orange-600'
        }`}>
          <div className="text-xl font-bold">
            {(publishedContent && publishedContent.courses && publishedContent.courses.length > 0) 
              ? '✅ LIVE CONTENT - API Connected' 
              : '🔧 FALLBACK CONTENT - API Reconnecting'}
          </div>
          <div className="text-sm mt-2">
            Courses Count: {learningContent.courses?.length || 0} | 
            Source: {(publishedContent && publishedContent.courses && publishedContent.courses.length > 0) ? 'API' : 'Hardcoded'} | 
            Time: {new Date().toLocaleTimeString()}
          </div>
          <div className="text-xs mt-1">
            {(publishedContent && publishedContent.courses && publishedContent.courses.length > 0) 
              ? 'Content updates will sync automatically' 
              : 'Content is temporarily hardcoded while API reconnects'}
          </div>
        </div>

        {/* Category Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
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
            
            {/* Refresh Button */}
            <button
              onClick={() => {
                console.log('Secondary refresh button clicked!');
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-bold"
            >
              🔄 REFRESH CONTENT
            </button>
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
                      <div className="text-center">
                        <div className="text-6xl mb-4">🎥</div>
                        <p className="text-gray-400">Video player would be embedded here</p>
                        <p className="text-sm text-gray-500 mt-2">
                          In production, this would show the actual video content
                        </p>
                      </div>
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

export default LearningHub;