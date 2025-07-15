import React from 'react';
import HeartbeatIndicator from './HeartbeatIndicator';

interface CustomerHeaderProps {
  userName?: string;
  onLogout?: () => void;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ userName, onLogout }) => {
  const getUserInfo = () => {
    try {
      const decodedToken = JSON.parse(localStorage.getItem('decodedToken') || '{}');
      return {
        firstName: decodedToken.given_name || 'Customer',
        lastName: decodedToken.family_name || 'User',
        email: decodedToken.email || 'customer@dalscooter.com'
      };
    } catch (error) {
      return {
        firstName: 'Customer',
        lastName: 'User', 
        email: 'customer@dalscooter.com'
      };
    }
  };

  const userInfo = getUserInfo();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">DalScooter</h1>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            {/* Heartbeat Indicator */}
            <HeartbeatIndicator className="mr-4" />
            
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {userInfo.firstName[0]}{userInfo.lastName[0]}
                </span>
              </div>
              <div className="text-sm">
                <p className="text-gray-900 font-medium">{userInfo.firstName} {userInfo.lastName}</p>
                <p className="text-gray-500">{userInfo.email}</p>
              </div>
            </div>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
