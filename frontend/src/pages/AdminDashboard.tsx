import React, { useState, useEffect } from 'react';
import LeftBar from '../components/admin/LeftBar';
import WorkArea from '../components/admin/WorkArea';
 
function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
 

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