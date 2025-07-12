import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LeftBarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const LeftBar: React.FC<LeftBarProps> = ({ activeSection, onSectionChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  // Function to handle logout
  const handleLogout = () => {
    // Clear all authentication tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRoles');
    localStorage.removeItem('decodedToken');
    
    // Redirect to login page
    navigate('/login');
  };

  // Function to get user initials
  const getUserInitials = () => {
    const decodedTokenString = localStorage.getItem('decodedToken');
    if (decodedTokenString) {
      try {
        const decodedToken = JSON.parse(decodedTokenString);
        const firstName = decodedToken.given_name || 'Admin';
        const lastName = decodedToken.family_name || 'User';
        
        // Extract first letter of each name
        const firstInitial = firstName.charAt(0).toUpperCase();
        const lastInitial = lastName.charAt(0).toUpperCase();
        
        return `${firstInitial}${lastInitial}`;
      } catch (error) {
        console.error('Error parsing decoded token:', error);
        return 'AU'; // Default initials
      }
    }
    return 'AU'; // Default initials
  };

  // Function to get user info
  const getUserInfo = () => {
    const decodedTokenString = localStorage.getItem('decodedToken');
    if (decodedTokenString) {
      try {
        const decodedToken = JSON.parse(decodedTokenString);
        return {
          firstName: decodedToken.given_name || 'Admin',
          lastName: decodedToken.family_name || 'User',
          email: decodedToken.email || 'admin@dalscooter.com'
        };
      } catch (error) {
        console.error('Error parsing decoded token:', error);
        return {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@dalscooter.com'
        };
      }
    }
    return {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@dalscooter.com'
    };
  };

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v14l-5-3-5 3V5z" />
        </svg>
      )
    },
    {
      id: 'customers',
      name: 'Customers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      id: 'scooters',
      name: 'Scooters',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: 'bookings',
      name: 'Bookings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  const userInfo = getUserInfo();
  const userInitials = getUserInitials();

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 h-screen flex flex-col shadow-xl ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-white">DS</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white">DalScooter</span>
                <p className="text-xs text-gray-400">Admin Portal</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
                activeSection === item.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
              title={isCollapsed ? item.name : undefined}
            >
              <div className={`${activeSection === item.id ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors`}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.name}</span>
              )}
              {!isCollapsed && activeSection === item.id && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-700">
          <div className="bg-gray-800 rounded-xl p-4 transition-all hover:bg-gray-750">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-sm font-medium text-white">{userInitials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userInfo.firstName} {userInfo.lastName}</p>
                <p className="text-xs text-gray-400 truncate">{userInfo.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Footer - Logout Button */}
      {isCollapsed && (
        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={handleLogout}
            className="w-full p-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200"
            title="Logout"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default LeftBar;