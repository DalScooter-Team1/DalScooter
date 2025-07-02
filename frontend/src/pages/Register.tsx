import React from 'react'
import Form from '../components/register/Form'
import dalImage from '../assets/Dal image.jpg'
import { Link } from 'react-router-dom'
 
function register() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="flex w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden relative">
        {/* Left side - Image with overlay text */}
        <div className="hidden md:block w-1/2 relative">
          <img 
            src={dalImage}
            alt="Dalhousie University" 
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay - darker version */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/30 to-black/50 pointer-events-none"></div>
          
          {/* Overlay text - shifted to right side */}
          <div className="absolute inset-0 flex flex-col justify-center items-end pr-12 text-white">
            <div className="max-w-xs">
              <h2 className="text-3xl font-bold mb-2 text-right drop-shadow-lg">DALScooter</h2>
              <p className="text-xl font-medium mb-6 text-right drop-shadow-lg">Sustainable Campus Mobility</p>
              <div className="space-y-3">
                <div className="flex items-center justify-end">
                  <p className="text-sm drop-shadow-lg text-right mr-3">Easy campus transportation</p>
                  <div className="bg-white/20 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.349-2.907L6.2 9.206l1.458-.638L9 10.469l3.742-3.55 1.458.637-5.549 5.537z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <p className="text-sm drop-shadow-lg text-right mr-3">Eco-friendly & sustainable</p>
                  <div className="bg-white/20 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.349-2.907L6.2 9.206l1.458-.638L9 10.469l3.742-3.55 1.458.637-5.549 5.537z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <p className="text-sm drop-shadow-lg text-right mr-3">Convenient for students & faculty</p>
                  <div className="bg-white/20 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.349-2.907L6.2 9.206l1.458-.638L9 10.469l3.742-3.55 1.458.637-5.549 5.537z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Form */}
        <div className="w-full md:w-1/2 p-6 relative z-10" style={{ justifyItems: 'center' }}>
          <Form />
          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-amber-600 hover:text-amber-800 font-medium">
              Login
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

export default register