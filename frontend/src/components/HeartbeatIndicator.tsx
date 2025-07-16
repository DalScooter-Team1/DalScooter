import React, { useState, useEffect } from 'react';

interface HeartbeatIndicatorProps {
  className?: string;
}

const HeartbeatIndicator: React.FC<HeartbeatIndicatorProps> = ({ className = '' }) => {
  const [isActive, setIsActive] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);

  useEffect(() => {
    // Check if user is a customer and has active tokens
    const checkHeartbeatStatus = () => {
      try {
        const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
        const accessToken = localStorage.getItem('accessToken');
        
        const customerRole = userRoles.includes('customers');
        const hasToken = !!accessToken;
        
        setIsCustomer(customerRole);
        setIsActive(customerRole && hasToken);
      } catch (error) {
        setIsActive(false);
        setIsCustomer(false);
      }
    };

    // Check status immediately
    checkHeartbeatStatus();

    // Set up interval to check status periodically
    const interval = setInterval(checkHeartbeatStatus, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Only show indicator for customers
  if (!isCustomer) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 text-xs ${className}`}>
      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
      <span className={`${isActive ? 'text-green-600' : 'text-gray-500'}`}>
        {isActive ? 'Online' : 'Offline'}
      </span>
    </div>
  );
};

export default HeartbeatIndicator;
