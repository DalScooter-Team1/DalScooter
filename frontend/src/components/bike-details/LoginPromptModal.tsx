import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginPromptModalProps {
  show: boolean;
  onClose: () => void;
}

export const LoginPromptModal: React.FC<LoginPromptModalProps> = ({ show, onClose }) => {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 p-6 text-center">
          <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Join DalScooter!</h2>
          <p className="text-amber-800 text-sm">Create an account to book this amazing ride</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to explore campus?</h3>
            <p className="text-gray-600 text-sm">
              Join thousands of students and faculty who use DalScooter for convenient, eco-friendly transportation around campus.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-gray-700">Quick & easy registration</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7" />
                </svg>
              </div>
              <span className="text-sm text-gray-700">Instant access to all bikes</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="text-sm text-gray-700">Affordable student rates</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                onClose();
                navigate('/');
              }}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold py-3 px-4 rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Create Account - It's Free!
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/login');
              }}
              className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Already have an account? Sign In
            </button>
            <button
              onClick={onClose}
              className="w-full text-gray-500 text-sm py-2 hover:text-gray-700 transition-colors"
            >
              Continue browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
