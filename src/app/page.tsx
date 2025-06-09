import React from 'react';

const HelloWorld: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
          Hello World! 🌍
        </h1>
        <p className="text-xl text-white/90 mb-8">
          Welcome to my React TypeScript app
        </p>
        <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-200 shadow-lg">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default HelloWorld;