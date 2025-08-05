import React, { useState, useEffect } from 'react';
import { adminService, type Customer, type ActiveUser } from '../../Services/adminService';
import { heartbeatService } from '../../Services/heartbeatService';
import MessagesManagement from '../messaging/MessagesManagement';
import BikeInventoryManagement from './BikeInventoryManagement';

// Import the simple booking management component
import BookingManagementSimple from './BookingManagementSimple';

interface WorkAreaProps {
  activeSection: string;
}

const WorkArea: React.FC<WorkAreaProps> = ({ activeSection }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [adminCreationLoading, setAdminCreationLoading] = useState(false);
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string>('');

  // Create admin from customer
  const createAdminFromCustomer = async (email: string) => {
    setAdminCreationLoading(true);
    try {
      const result = await adminService.createAdmin(email);
      if (result.success) {
        alert(`Success: ${result.message}`);
        // Refresh the customer list
        fetchCustomers();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      alert(`Error: ${error.response?.data?.message || error.message || 'Failed to create admin'}`);
    } finally {
      setAdminCreationLoading(false);
    }
  };

  // Fetch customers from API using admin service
  const fetchCustomers = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await adminService.getCustomers({ group: 'customers' });
      if (data.success) {
        setCustomers(data.users || []);
      } else {
        setError(data.message || 'Failed to fetch customers');
      }
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers when component mounts
  useEffect(() => {
    if (activeSection === 'customers') {
      fetchCustomers();
    }
  }, [activeSection]);

  const renderCustomers = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-6 border border-gray-200 rounded-2xl">
                  <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <div className="text-center py-12">
            <div className="text-red-500 mb-6">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Customers</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchCustomers}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900">Customer Management</h3>
              <p className="text-gray-600 mt-2">Manage and monitor your customer base</p>
            </div>
            <button
              onClick={fetchCustomers}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2 font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
          <div className="p-8">
            {customers.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-8">
                  <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Customers Found</h3>
                <p className="text-gray-600">No customers have been registered yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Showing {customers.length} customer{customers.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="grid gap-6">
                  {customers.map((customer, index) => (
                    <div
                      key={customer.userId}
                      className="flex items-center space-x-6 p-6 border border-gray-200 rounded-3xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 transform hover:scale-[1.02] shadow-sm hover:shadow-xl"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg">
                          <span className="text-xl font-bold text-white">
                            {customer.firstName[0]}{customer.lastName[0]}
                          </span>
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xl font-bold text-gray-900 truncate">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-gray-600 truncate">{customer.email}</p>
                        <p className="text-sm text-gray-500">
                          Joined: {new Date(customer.userCreateDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-4">
                        <div className="flex space-x-3">
                          <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold border ${customer.userStatus === 'CONFIRMED' ? 'bg-green-100 text-green-800 border-green-200' :
                            customer.userStatus === 'UNCONFIRMED' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              'bg-red-100 text-red-800 border-red-200'
                            }`}>
                            {customer.userStatus}
                          </span>
                          <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold border ${customer.emailVerified ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                            {customer.emailVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                        <button
                          onClick={() => createAdminFromCustomer(customer.email)}
                          disabled={adminCreationLoading}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg text-sm font-semibold"
                        >
                          {adminCreationLoading ? 'Creating...' : 'Make Admin'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'customers':
        return renderCustomers();
      case 'messages':
        return <MessagesManagement />;
      case 'scooters':
        return <BikeInventoryManagement />;
      case 'bookings':
        return <BookingManagementSimple />;
      case 'analytics':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <iframe width="780" height="600" src="https://lookerstudio.google.com/embed/reporting/924da47b-7aa9-47d0-9777-865b51613efe/page/ZXqSF" sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">System Settings</h2>
              <p className="text-gray-600">Settings panel coming soon...</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <iframe width="780" height="600" src="https://lookerstudio.google.com/embed/reporting/924da47b-7aa9-47d0-9777-865b51613efe/page/ZXqSF" sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h1>
          <p className="text-gray-600 mt-2">Manage your DalScooter operations efficiently</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default WorkArea;