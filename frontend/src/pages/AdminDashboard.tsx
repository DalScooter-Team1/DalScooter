import React, { useState, useEffect } from 'react';
import LeftBar from '../components/admin/LeftBar';
import WorkArea from '../components/admin/WorkArea';
import useAuth from '../hooks/useAuth';

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user, isLoading, requireAdmin } = useAuth();

  useEffect(() => {
    // Check if user is admin, redirect if not
    requireAdmin();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 mb-2">Access Denied</h3>
            <p className="text-red-600">You don't have permission to access the admin dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <LeftBar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <WorkArea activeSection={activeSection} />
    </div>
  );
}

export default AdminDashboard;