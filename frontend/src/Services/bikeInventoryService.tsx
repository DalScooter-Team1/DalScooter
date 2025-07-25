import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_SERVER;

// Create axios instance with default config
const bikeInventoryAPI = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
bikeInventoryAPI.interceptors.request.use(
    (config) => {
        // Always use ID token for admin endpoints as it contains cognito:groups claim
        const token = localStorage.getItem('idToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.error('No ID token found for bike inventory request');
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
bikeInventoryAPI.interceptors.response.use(
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

// Type definitions
export type BikeType = 'Gyroscooter' | 'eBikes' | 'Segway';

export interface Bike {
    bike_id: string;
    bike_type: BikeType;
    model: string;
    features: string[];
    hourly_rate: number;
    availability: boolean;
    franchise_id: string;
    created_at: string;
    updated_at: string;
}

export interface BikeCreateRequest {
    bike_type: BikeType;
    model: string;
    features: string[];
    hourly_rate: number;
    availability?: boolean;
}

export interface BikeUpdateRequest {
    bike_type?: BikeType;
    model?: string;
    features?: string[];
    hourly_rate?: number;
    availability?: boolean;
}

export interface DiscountCode {
    code: string;
    discount_percentage: number;
    expiry_date: string;
    is_active: boolean;
    franchise_id: string;
    created_at: string;
    updated_at: string;
}

export interface DiscountCodeCreateRequest {
    code: string;
    discount_percentage: number;
    expiry_hours: number; // 0-48 hours (0-2 days)
}

export interface DiscountCodeUpdateRequest {
    discount_percentage?: number;
    expiry_hours?: number;
    is_active?: boolean;
}

export interface BikeInventoryResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface BikeListResponse {
    success: boolean;
    bikes: Bike[];
    message?: string;
}

export interface DiscountCodeListResponse {
    success: boolean;
    discount_codes: DiscountCode[];
    message?: string;
}

export interface BikeAvailabilityResponse {
    success: boolean;
    available_bikes: {
        bike_type: BikeType;
        bikes: Bike[];
    }[];
    message?: string;
}

// Bike Inventory Service functions
export const bikeInventoryService = {
    // ===== BIKE MANAGEMENT =====

    // Get all bikes for the franchise
    getBikes: async (): Promise<BikeListResponse> => {
        const response = await bikeInventoryAPI.get('/bikes');
        return response.data;
    },

    // Get bike by ID
    getBike: async (bikeId: string): Promise<BikeInventoryResponse<Bike>> => {
        const response = await bikeInventoryAPI.get(`/bikes/${bikeId}`);
        return response.data;
    },

    // Create a new bike
    createBike: async (bikeData: BikeCreateRequest): Promise<BikeInventoryResponse<Bike>> => {
        const response = await bikeInventoryAPI.post('/bikes', bikeData);
        return response.data;
    },

    // Update an existing bike
    updateBike: async (bikeId: string, bikeData: BikeUpdateRequest): Promise<BikeInventoryResponse<Bike>> => {
        const response = await bikeInventoryAPI.put(`/bikes/${bikeId}`, bikeData);
        return response.data;
    },

    // Delete a bike
    deleteBike: async (bikeId: string): Promise<BikeInventoryResponse> => {
        const response = await bikeInventoryAPI.delete(`/bikes/${bikeId}`);
        return response.data;
    },

    // ===== DISCOUNT CODE MANAGEMENT =====

    // Get all discount codes for the franchise
    getDiscountCodes: async (): Promise<DiscountCodeListResponse> => {
        const response = await bikeInventoryAPI.get('/discount-codes');
        return response.data;
    },

    // Get discount code by code
    getDiscountCode: async (code: string): Promise<BikeInventoryResponse<DiscountCode>> => {
        const response = await bikeInventoryAPI.get(`/discount-codes/${code}`);
        return response.data;
    },

    // Create a new discount code
    createDiscountCode: async (discountData: DiscountCodeCreateRequest): Promise<BikeInventoryResponse<DiscountCode>> => {
        const response = await bikeInventoryAPI.post('/discount-codes', discountData);
        return response.data;
    },

    // Update an existing discount code
    updateDiscountCode: async (code: string, discountData: DiscountCodeUpdateRequest): Promise<BikeInventoryResponse<DiscountCode>> => {
        const response = await bikeInventoryAPI.put(`/discount-codes/${code}`, discountData);
        return response.data;
    },

    // Deactivate a discount code
    deactivateDiscountCode: async (code: string): Promise<BikeInventoryResponse> => {
        const response = await bikeInventoryAPI.delete(`/discount-codes/${code}`);
        return response.data;
    },

    // ===== PUBLIC BIKE AVAILABILITY (No auth required) =====

    // Get available bikes for customers (public endpoint)
    getAvailableBikes: async (): Promise<BikeAvailabilityResponse> => {
        // Use the base API without auth interceptors for public endpoint
        const response = await axios.get(`${API_BASE_URL}/bikes/availability`);
        return response.data;
    },

    // ===== VALIDATION HELPERS =====

    // Validate discount percentage (5-15%)
    isValidDiscountPercentage: (percentage: number): boolean => {
        return percentage >= 5 && percentage <= 15;
    },

    // Validate expiry hours (0-48 hours)
    isValidExpiryHours: (hours: number): boolean => {
        return hours >= 0 && hours <= 48;
    },

    // Validate bike type
    isValidBikeType: (type: string): type is BikeType => {
        return ['Gyroscooter', 'eBikes', 'Segway'].includes(type);
    },

    // Format currency for display
    formatCurrency: (amount: number): string => {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
        }).format(amount);
    },

    // Format date for display
    formatDate: (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    },
};

export default bikeInventoryService;
