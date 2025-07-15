import { useEffect } from 'react';
import { heartbeatService } from '../Services/heartbeatService';

/**
 * Hook to automatically start heartbeat service for logged in customers
 * Should be called at the app level (in App.tsx or main layout component)
 */
export const useHeartbeatInitializer = () => {
  useEffect(() => {
    // Check if user is already logged in and start heartbeat if they're a customer
    const checkAndStartHeartbeat = () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const userRoles = localStorage.getItem('userRoles');
        
        if (accessToken && userRoles) {
          const roles = JSON.parse(userRoles);
          
          // Only start heartbeat for customers
          if (roles.includes('customers')) {
            heartbeatService.startHeartbeatIfCustomer();
          }
        }
      } catch (error) {
        console.error('Error initializing heartbeat:', error);
      }
    };

    // Start heartbeat on mount if user is already logged in
    checkAndStartHeartbeat();

    // Stop heartbeat on component unmount (app shutdown)
    return () => {
      heartbeatService.stopHeartbeat();
    };
  }, []);

  // Listen for beforeunload event to stop heartbeat when page is closing
  useEffect(() => {
    const handleBeforeUnload = () => {
      heartbeatService.stopHeartbeat();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};

export default useHeartbeatInitializer;
