import React from 'react';

const LearningHubSimple = ({ onBack }) => {
  console.log('LearningHubSimple component is rendering!', new Date().toISOString());
  
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="bg-green-600 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">✅ LEARNING HUB IS WORKING!</h1>
        <p>Time: {new Date().toLocaleTimeString()}</p>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <button
          onClick={onBack}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg mb-6"
        >
          ← Back to Dashboard
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-lg">
            <div className="text-4xl mb-4 text-center">🎓</div>
            <h3 className="text-xl font-bold mb-2">Complete Forex Trading Mastery</h3>
            <p className="text-gray-400 mb-4">Master the fundamentals of forex trading</p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-emerald-400">Free</span>
              <button className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg">
                Start Learning
              </button>
            </div>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-lg">
            <div className="text-4xl mb-4 text-center">📊</div>
            <h3 className="text-xl font-bold mb-2">Advanced Price Action Strategies</h3>
            <p className="text-gray-400 mb-4">Learn professional price action techniques</p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-emerald-400">$99</span>
              <button className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg">
                Enroll Now
              </button>
            </div>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-lg">
            <div className="text-4xl mb-4 text-center">🧠</div>
            <h3 className="text-xl font-bold mb-2">Trading Psychology Mastery</h3>
            <p className="text-gray-400 mb-4">Develop mental discipline for trading</p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-emerald-400">$79</span>
              <button className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg">
                Enroll Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningHubSimple;