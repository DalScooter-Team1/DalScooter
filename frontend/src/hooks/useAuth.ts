import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface AuthUser {
  email: string;
  roles: string[];
  isAdmin: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('idToken');
      
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const decodedToken: any = jwtDecode(token);
      
      // Check if token is expired
      if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
        logout();
        return;
      }

      const roles = decodedToken['cognito:groups'] || [];
      const email = decodedToken.email || '';
      const isAdmin = roles.includes('franchise');

      setUser({
        email,
        roles,
        isAdmin
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking auth status:', error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRoles');
    setUser(null);
    setIsLoading(false);
    navigate('/login');
  };

  const requireAdmin = () => {
    if (!user || !user.isAdmin) {
      navigate('/login');
      return false;
    }
    return true;
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    logout,
    requireAdmin,
    checkAuthStatus
  };
};

export default useAuth;
