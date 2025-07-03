import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../assets/Loader_Animation.json';

interface LoaderAnimationProps {
  isLoading: boolean;
}

const LoaderAnimation: React.FC<LoaderAnimationProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Blurred background overlay */}
      <div className="absolute inset-0 bg-gray-800 bg-opacity-50 backdrop-blur-sm"></div>
      
      {/* Animation container */}
      <div className="relative w-64 h-64">
        <Lottie animationData={animationData} loop={true} />
      </div>
    </div>
  );
};

export default LoaderAnimation;