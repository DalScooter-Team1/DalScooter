// Authentication utility functions

export interface UserInfo {
  sub: string;
  email: string;
  given_name: string;
  family_name: string;
  'cognito:groups': string[];
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  try {
    const decodedToken = localStorage.getItem('decodedToken');
    const accessToken = localStorage.getItem('accessToken');
    
    if (!decodedToken || !accessToken) {
      return false;
    }
    
    const token = JSON.parse(decodedToken);
    return !!(token.sub || token.email);
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Get current user info
 */
export const getCurrentUser = (): UserInfo | null => {
  try {
    const decodedToken = localStorage.getItem('decodedToken');
    if (!decodedToken) return null;
    
    return JSON.parse(decodedToken);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Check if user has specific role
 */
export const hasRole = (role: string): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  return user['cognito:groups']?.includes(role) || false;
};

/**
 * Check if user is a customer
 */
export const isCustomer = (): boolean => {
  return hasRole('customers');
};

/**
 * Check if user is an admin/franchise
 */
export const isAdmin = (): boolean => {
  return hasRole('franchise');
};
