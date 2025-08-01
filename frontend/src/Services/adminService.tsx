import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_SERVER;

// Create axios instance with default config
const adminAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
adminAPI.interceptors.request.use(
  (config) => {
    // Always use ID token for admin endpoints as it contains cognito:groups claim
    const token = localStorage.getItem('idToken');


    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.error('No ID token found for admin request');
      // Redirect to login if no token
      window.location.href = '/login';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface Customer {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  userStatus: string;
  enabled: boolean;
  userCreateDate: string;
  userLastModifiedDate?: string;
  emailVerified: boolean;
}

export interface CustomersResponse {
  success: boolean;
  users: Customer[];
  totalCount: number;
  limit: number;
  paginationToken?: string;
  message?: string;
}

export interface AdminCreationRequest {
  email: string;
}

export interface AdminCreationResponse {
  success: boolean;
  message: string;
}

export interface ActiveUser {
  email: string;
  firstName: string;
  lastName: string;
  userType: 'customer' | 'franchise';
  userId: string;
  status: 'online' | 'away';
  last_seen: string;
  lastSeen: string;
  expires_at: number;
}

export interface ActiveUsersResponse {
  success: boolean;
  users: ActiveUser[];
  totalCount: number;
  timestamp?: number;
  message?: string;
}

export interface Booking {
  bookingId: string;
  userId: string;
  bikeId: string;
  startTime: string;
  endTime: string;
  startTimeFormatted: string;
  endTimeFormatted: string;
  accessCode?: string;
  isUsed: boolean;
  status: 'Pending' | 'Approved' | 'Completed';
  price?: number;
}

export interface BookingsResponse {
  success: boolean;
  bookings: Booking[];
  total: number;
  message?: string;
}

// Admin Service functions
export const adminService = {
  // Get all customers
  getCustomers: async (params?: {
    limit?: number;
    paginationToken?: string;
    group?: 'customers' | 'franchise' | 'all';
  }): Promise<CustomersResponse> => {
    const response = await adminAPI.get('/customers', { params });
    return response.data;
  },

  // Create a new admin
  createAdmin: async (email: string): Promise<AdminCreationResponse> => {
    const response = await adminAPI.post('/admin', { email });
    return response.data;
  },

  // Get user details by ID
  getUserDetails: async (userId: string): Promise<Customer> => {
    const response = await adminAPI.get(`/users/${userId}`);
    return response.data;
  },

  // Update user status
  updateUserStatus: async (userId: string, status: string): Promise<{ success: boolean; message: string }> => {
    const response = await adminAPI.patch(`/users/${userId}/status`, { status });
    return response.data;
  },

  // Delete/Suspend user
  suspendUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
    const response = await adminAPI.patch(`/users/${userId}/suspend`);
    return response.data;
  },

  // Get active/online users (admin only)
  getActiveUsers: async (): Promise<ActiveUsersResponse> => {
    const response = await adminAPI.get('/active-users');
    return response.data;
  },

  // Get all customer bookings (admin only)
  getAllBookings: async (): Promise<BookingsResponse> => {
    try {
      const response = await adminAPI.get('/booking/admin');
      return {
        success: true,
        bookings: response.data.bookings || [],
        total: response.data.total || 0
      };
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      return {
        success: false,
        bookings: [],
        total: 0,
        message: error.response?.data?.error || 'Failed to fetch bookings'
      };
    }
  },
};

export default adminService;
