import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';
import CustomerMessaging from '../components/messaging/CustomerMessaging';
import { heartbeatService } from '../Services/heartbeatService';

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'messaging'>('dashboard');

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
        {/* Navigation Tabs */}
        <div className="px-4 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveSection('dashboard')}
                className={`${activeSection === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveSection('messaging')}
                className={`${activeSection === 'messaging'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Messages & Support
              </button>
            </nav>
          </div>
        </div>

        <div className="px-4 py-6 sm:px-0">
          {activeSection === 'dashboard' && (
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

                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="text-lg font-medium text-orange-900 mb-2">
                      💬 Messages & Support
                    </h3>
                    <p className="text-orange-700 mb-3">
                      Need help? Submit concerns and get support from our team.
                    </p>
                    <button
                      onClick={() => setActiveSection('messaging')}
                      className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-200"
                    >
                      Go to Messages
                    </button>
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
          )}

          {activeSection === 'messaging' && (
            <CustomerMessaging />
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
