import React, { useState, useEffect } from 'react';
import LeftBar from '../components/admin/LeftBar';
import WorkArea from '../components/admin/WorkArea';
 
function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('analytics');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Add a small delay for smooth entrance animation
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <LeftBar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <WorkArea activeSection={activeSection} />
    </div>
  );
}

export default AdminDashboard;