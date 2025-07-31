import React from 'react'
import { Link } from 'react-router-dom'
import dalImage from '../assets/Dal image.jpg'
import BikeAvailabilitySection from '../components/BikeAvailabilitySection'

function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">DALScooter</h1>
            </div>
            <div className="flex space-x-4">
              <Link to="/login" className="bg-black text-white px-4 py-2 rounded-lg hover:bg-yellow-500 hover:text-black transition-all duration-200">
                Login
              </Link>
              <Link to="/register" className="bg-black text-white px-4 py-2 rounded-lg hover:bg-yellow-500 hover:text-black transition-all duration-200">
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Bike Availability Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BikeAvailabilitySection title="Available Bikes" showHeader={true} />
      </div>

      {/* Hero Section with Animated Illustration at Bottom */}
      <div className="relative bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-4">Sustainable Campus Mobility</h2>
              <p className="text-xl text-amber-800 mb-6">
                Easy, eco-friendly transportation for students and faculty at Dalhousie University
              </p>
              <div className="flex space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Easy campus transportation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Eco-friendly & sustainable</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center">
              {/* Animated SVG Illustration */}
              <svg
                width="320"
                height="200"
                viewBox="0 0 320 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="animate-float"
              >
                <style>{`
                  .animate-float { animation: float 3s ease-in-out infinite; }
                  @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-16px); }
                  }
                  .wheel-spin { animation: spin 2s linear infinite; transform-origin: 50% 50%; }
                  @keyframes spin {
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
                {/* Scooter Body */}
                <rect x="80" y="120" width="120" height="16" rx="8" fill="#fff8e1" stroke="#f59e42" strokeWidth="3" />
                <rect x="180" y="80" width="12" height="40" rx="6" fill="#f59e42" />
                <rect x="90" y="100" width="60" height="12" rx="6" fill="#fbbf24" />
                {/* Handlebar */}
                <rect x="185" y="60" width="2" height="20" rx="1" fill="#f59e42" />
                <rect x="180" y="58" width="12" height="6" rx="3" fill="#fbbf24" />
                {/* Wheels */}
                <circle cx="90" cy="140" r="18" fill="#fff8e1" stroke="#f59e42" strokeWidth="4" className="wheel-spin" />
                <circle cx="190" cy="140" r="18" fill="#fff8e1" stroke="#f59e42" strokeWidth="4" className="wheel-spin" />
                {/* Headlight */}
                <ellipse cx="192" cy="86" rx="4" ry="2" fill="#fffde7" />
                {/* Cartoon Sparkles */}
                <circle cx="220" cy="60" r="3" fill="#fbbf24" opacity="0.7" />
                <circle cx="250" cy="100" r="2" fill="#f59e42" opacity="0.5" />
                <circle cx="120" cy="60" r="2.5" fill="#fbbf24" opacity="0.6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
