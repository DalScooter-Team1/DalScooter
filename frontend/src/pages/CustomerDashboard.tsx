import React from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';
import { heartbeatService } from '../Services/heartbeatService';

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Stop heartbeat service
    heartbeatService.stopHeartbeat();
    
    // Clear tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRoles');
    localStorage.removeItem('decodedToken');
    
    // Navigate to login
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to DalScooter Customer Portal
              </h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">
                    🛴 Scooter Reservations
                  </h3>
                  <p className="text-blue-700">
                    Book and manage your scooter reservations. Find available scooters near you.
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-green-900 mb-2">
                    📍 Location Services
                  </h3>
                  <p className="text-green-700">
                    View nearby scooter locations and plan your trips efficiently.
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-900 mb-2">
                    💳 Payment & History
                  </h3>
                  <p className="text-purple-700">
                    Manage payment methods and view your trip history.
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="text-lg font-medium text-yellow-900 mb-2">
                    🔄 Heartbeat Status
                  </h3>
                  <p className="text-yellow-700 mb-2">
                    Your session is being tracked automatically. You should see an "Online" indicator in the header.
                  </p>
                  <p className="text-sm text-yellow-600">
                    This helps administrators monitor active users and system usage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
