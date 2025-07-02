import React from 'react'
import Form from '../components/register/Form'
import dalImage from '../assets/Dal image.jpg'
 
function register() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="flex w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left side - Image */}
        <div className="hidden md:block w-1/2">
          <img 
            src={dalImage}
            alt="Dalhousie University" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Right side - Form */}
        <div className="w-full md:w-1/2 p-6">
          <Form />
        </div>
      </div>
    </div>
  )
}

export default register