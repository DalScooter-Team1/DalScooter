import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';
import CustomerMessaging from '../components/messaging/CustomerMessaging';
import { heartbeatService } from '../Services/heartbeatService';
import { bikeInventoryService } from '../Services/bikeInventoryService';
import type { BikeAvailabilityResponse } from '../Services/bikeInventoryService';

// Interface for the bike availability data
interface BikeAvailability {
  bikeType: string;
  availableCount: number;
  status: string;
  pricing: {
    minHourlyRate: number;
    maxHourlyRate: number;
    avgHourlyRate: number;
  };
  features: {
    maxSpeed: string;
    batteryLife: string;
    weightCapacity: string;
    specialFeatures: string[];
  };
  sampleBikes: any[];
}

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'messaging' | 'bikes'>('dashboard');
  const [bikeAvailability, setBikeAvailability] = useState<BikeAvailability[]>([]);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        setLoading(true);
        const response = await bikeInventoryService.getAvailableBikes();
        console.log(response);
        if (response.success && response.bikeAvailability) {
          setBikeAvailability(response.bikeAvailability);
          setTotalAvailable(response.totalAvailable);
          setLastUpdated(response.lastUpdated);
        }
      } catch (error) {
        console.error("Error fetching available bikes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBikes();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-CA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50">
      <CustomerHeader onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {/* Enhanced Navigation Tabs */}
        <div className="px-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
            <nav className="flex space-x-2" aria-label="Tabs">
              <button
                onClick={() => setActiveSection('dashboard')}
                className={`${
                  activeSection === 'dashboard'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                } flex items-center space-x-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveSection('bikes')}
                className={`${
                  activeSection === 'bikes'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                } flex items-center space-x-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Available Bikes</span>
              </button>
              <button
                onClick={() => setActiveSection('messaging')}
                className={`${
                  activeSection === 'messaging'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                } flex items-center space-x-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Messages & Support</span>
              </button>
            </nav>
          </div>
        </div>

        <div className="px-4 py-6 sm:px-0">
          {activeSection === 'dashboard' && (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-amber-400 to-yellow-500 rounded-2xl shadow-lg p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Welcome back! 👋</h2>
                    <p className="text-amber-100 text-lg">
                      Ready to explore campus with DalScooter?
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Available Bikes</p>
                      <p className="text-2xl font-bold text-gray-900">{totalAvailable}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Nearby Locations</p>
                      <p className="text-2xl font-bold text-gray-900">3</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Trips</p>
                      <p className="text-2xl font-bold text-gray-900">12</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Feature Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Scooter Reservations</h3>
                      <p className="text-gray-600 mb-4">
                        Book and manage your scooter reservations. Find available scooters near you.
                      </p>
                      <button className="text-amber-600 hover:text-amber-700 font-medium text-sm group-hover:underline">
                        Browse Available Bikes →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Services</h3>
                      <p className="text-gray-600 mb-4">
                        View nearby scooter locations and plan your trips efficiently.
                      </p>
                      <button className="text-green-600 hover:text-green-700 font-medium text-sm group-hover:underline">
                        View Map →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-xl text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment & History</h3>
                      <p className="text-gray-600 mb-4">
                        Manage payment methods and view your trip history.
                      </p>
                      <button className="text-purple-600 hover:text-purple-700 font-medium text-sm group-hover:underline">
                        View History →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages & Support</h3>
                      <p className="text-gray-600 mb-4">
                        Need help? Submit concerns and get support from our team.
                      </p>
                      <button
                        onClick={() => setActiveSection('messaging')}
                        className="text-orange-600 hover:text-orange-700 font-medium text-sm group-hover:underline"
                      >
                        Get Support →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Heartbeat Status Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Heartbeat Status</h3>
                    <p className="text-gray-600 mb-2">
                      Your session is being tracked automatically. You should see an "Online" indicator in the header.
                    </p>
                    <p className="text-sm text-amber-600">
                      This helps administrators monitor active users and system usage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'bikes' && (
            <div>
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">Available Bikes</h3>
                  <div className="text-sm text-gray-600">
                    {totalAvailable} available • Updated {lastUpdated ? formatDate(lastUpdated) : 'N/A'}
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bikeAvailability.length > 0 ? (
                    bikeAvailability.map((bike, index) => (
                      <div
                        key={index}
                        className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                          bike.status === 'available' ? 'border-green-200' : 'border-gray-200'
                        }`}
                      >
                        {/* Card Header */}
                        <div className="p-6 border-b border-gray-100">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-lg font-semibold text-gray-900">{bike.bikeType}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              bike.status === 'available' 
                                ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                : 'bg-gray-100 text-gray-400 border border-gray-200'
                            }`}>
                              {bike.availableCount} available
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-amber-600">
                            ${bike.pricing.avgHourlyRate}/hr
                          </div>
                        </div>

                        {/* Features */}
                        {bike.features.specialFeatures.length > 0 && (
                          <div className="p-6 border-b border-gray-100">
                            <div className="flex flex-wrap gap-2">
                              {bike.features.specialFeatures.slice(0, 3).map((feature, featureIndex) => (
                                <span
                                  key={featureIndex}
                                  className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-md border border-amber-200"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Sample Bikes */}
                        {bike.sampleBikes && bike.sampleBikes.length > 0 && (
                          <div className="p-6">
                            <p className="text-sm font-medium text-gray-700 mb-3">Available Bikes</p>
                            <div className="space-y-2">
                              {bike.sampleBikes.slice(0, 2).map((sampleBike, bikeIndex) => (
                                <div
                                  key={bikeIndex}
                                  className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-100"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-gray-800">
                                      {sampleBike.bikeId}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {sampleBike.location.address}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                      sampleBike.status === 'available' 
                                        ? 'bg-amber-200 text-amber-900 border-amber-300' 
                                        : 'bg-gray-200 text-gray-400 border-gray-300'
                                    }`}>
                                      {sampleBike.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {bike.sampleBikes.length > 2 && (
                                <p className="text-xs text-amber-600 text-center">
                                  +{bike.sampleBikes.length - 2} more bikes
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {bike.sampleBikes && bike.sampleBikes.length === 0 && bike.status === 'available' && (
                          <div className="p-6 text-center">
                            <p className="text-sm text-gray-500">No bikes currently available</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">No bike information available at this time.</p>
                    </div>
                  )}
                </div>
              )}
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
