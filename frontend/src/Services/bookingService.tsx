import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_SERVER;

// Create axios instance for booking requests
const bookingAPI = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // Increase timeout to 30 seconds
    validateStatus: function (status) {
        // Consider any status less than 500 as success to avoid axios throwing errors on 4xx
        return status < 500;
    },
});

// Add request interceptor to include auth token
bookingAPI.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('idToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
bookingAPI.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Authentication failed for booking API');
            // Redirect to login if needed
            localStorage.removeItem('accessToken');
            localStorage.removeItem('idToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export interface BookingRequest {
    bikeId: string;
    userId: string;
    startTime: string;
    endTime: string;
}

export interface BookingResponse {
    success?: boolean;
    message?: string;
    bookingId?: string;
    error?: string;
}

export interface Booking {
    bookingId: string;
    bikeId: string;
    userId: string;
    startTime: string;
    endTime: string;
    status?: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
    isUsed?: boolean;   
    accessCode?: string;
    price?: string | number;
    createdAt?: string;
    updatedAt?: string;
    bikeName?: string;
    bikeModel?: string;
    bikeLocation?: string;
}

export interface MyBookingsResponse {
    success: boolean;
    bookings: Booking[];
    count: number;
    error?: string;
}

// Booking Service functions
export const bookingService = {
    // Create a new booking request
    createBooking: async (bookingData: BookingRequest): Promise<BookingResponse> => {
        try {
            console.log('Sending booking request:', bookingData);
            console.log('API URL:', `${API_BASE_URL}/booking/request`);
            
            const response = await bookingAPI.post('/booking/request', bookingData);
            
            console.log('Booking response status:', response.status);
            console.log('Booking response headers:', response.headers);
            console.log('Booking response data:', response.data);
            
            // Handle different response formats from the backend
            if (response.data) {
                // Check if response has success indicators
                if (response.data.message || response.data.bookingId) {
                    return {
                        success: true,
                        message: response.data.message || 'Booking created successfully',
                        bookingId: response.data.bookingId,
                    };
                }
                
                // Otherwise return the data as-is with success true
                return {
                    success: true,
                    ...response.data,
                };
            }
            
            // Fallback for successful response without data
            return {
                success: true,
                message: 'Booking created successfully',
            };
            
        } catch (error: any) {
            console.error('Error creating booking:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                response: error.response,
                request: error.request,
                config: error.config
            });
            
            // Handle different types of errors
            if (error.response) {
                // Server responded with error status
                const errorData = error.response.data;
                console.log('Server error response:', errorData);
                return {
                    success: false,
                    error: errorData?.error || errorData?.message || `Server error: ${error.response.status}`,
                };
            } else if (error.request) {
                // Request was made but no response received (network/CORS issue)
                console.log('Network error - no response received:', error.request);
                return {
                    success: false,
                    error: 'Network error. Please check your connection and try again.',
                };
            } else {
                // Something else happened
                console.log('Other error:', error.message);
                return {
                    success: false,
                    error: error.message || 'An unexpected error occurred.',
                };
            }
        }
    },

    // Get user's booking history
    getMyBookings: async (): Promise<MyBookingsResponse> => {
        try {
            // Get userId from decoded token
            const decodedToken = JSON.parse(localStorage.getItem('decodedToken') || '{}');
            const userId = decodedToken.sub || decodedToken.email;
            
            if (!userId) {
                return {
                    success: false,
                    bookings: [],
                    count: 0,
                    error: 'User ID not found. Please login again.',
                };
            }
            
            console.log('Fetching user bookings for userId:', userId);
            console.log('Fetching from:', `${API_BASE_URL}/booking/my-bookings?userId=${userId}`);
            
            const response = await bookingAPI.get(`/booking/my-bookings?userId=${userId}`);
            
            console.log('My bookings response status:', response.status);
            console.log('My bookings response data:', response.data);
            
            if (response.status === 200 && response.data) {
                if (response.data.success && Array.isArray(response.data.bookings)) {
                    return {
                        success: true,
                        bookings: response.data.bookings,
                        count: response.data.count || response.data.bookings.length,
                    };
                } else if (Array.isArray(response.data)) {
                    // Handle case where response.data is directly an array
                    return {
                        success: true,
                        bookings: response.data,
                        count: response.data.length,
                    };
                }
            }
            
            // Handle empty response or no bookings
            return {
                success: true,
                bookings: [],
                count: 0,
            };
            
        } catch (error: any) {
            console.error('Error fetching user bookings:', error);
            
            if (error.response) {
                const errorData = error.response.data;
                return {
                    success: false,
                    bookings: [],
                    count: 0,
                    error: errorData?.error || errorData?.message || `Server error: ${error.response.status}`,
                };
            } else if (error.request) {
                return {
                    success: false,
                    bookings: [],
                    count: 0,
                    error: 'Network error. Please check your connection and try again.',
                };
            } else {
                return {
                    success: false,
                    bookings: [],
                    count: 0,
                    error: error.message || 'An unexpected error occurred while fetching bookings.',
                };
            }
        }
    },

    // Verify discount code
    verifyDiscountCode: async (code: string): Promise<{ success: boolean; message: string; discountPercentage?: number }> => {
        try {
            console.log('Verifying discount code:', code);
            
            const response = await axios.get(`${API_BASE_URL}/verify-discount/${code}`, {
                timeout: 10000,
                validateStatus: function (status) {
                    return status < 500;
                },
            });
            
            console.log('Discount verification response:', response.data);
            
            if (response.status === 200 && response.data) {
                // Backend returns 'flag' instead of 'success'
                const isSuccess = response.data.flag === 'success';
                return {
                    success: isSuccess,
                    message: response.data.message || (isSuccess ? 'Discount code verified' : 'Failed to verify discount code'),
                    discountPercentage: response.data.discount_percentage,
                };
            } else {
                return {
                    success: false,
                    message: response.data?.message || 'Failed to verify discount code',
                };
            }
            
        } catch (error: any) {
            console.error('Error verifying discount code:', error);
            
            if (error.response) {
                const errorData = error.response.data;
                return {
                    success: false,
                    message: errorData?.message || `Server error: ${error.response.status}`,
                };
            } else if (error.request) {
                return {
                    success: false,
                    message: 'Network error. Please check your connection and try again.',
                };
            } else {
                return {
                    success: false,
                    message: error.message || 'An unexpected error occurred while verifying discount code.',
                };
            }
        }
    },
};