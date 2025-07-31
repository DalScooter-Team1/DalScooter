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

// Backend response format (what comes from Lambda)
export interface BikeBackendResponse {
    bikeId: string;
    bikeType: BikeType;
    accessCode: string;
    hourlyRate: number;
    status: string;
    franchiseId: string;
    features: {
        heightAdjustment: boolean;
        batteryLife: number;
        maxSpeed: number;
        weight: number;
    };
    location: {
        latitude: number;
        longitude: number;
        address: string;
    };
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
}

// Frontend display format (converted from backend)
export interface Bike {
    bike_id: string;
    bike_type: BikeType;
    access_code: string;
    hourly_rate: number;
    status: string;
    availability: boolean;
    franchise_id: string;
    features: string[];
    location: string;
    created_at: string;
    updated_at: string;
}

// Backend request format (what we send to Lambda)
export interface BikeCreateRequest {
    bikeType: BikeType;
    accessCode: string;
    hourlyRate: number;
    franchiseId?: string;
    heightAdjustment?: boolean;
    batteryLife?: number;
    maxSpeed?: number;
    weight?: number;
    latitude?: number;
    longitude?: number;
    address?: string;
}

export interface BikeUpdateRequest {
    accessCode?: string;
    hourlyRate?: number;
    status?: string;
    features?: {
        heightAdjustment?: boolean;
        batteryLife?: number;
        maxSpeed?: number;
        weight?: number;
    };
    location?: {
        latitude?: number;
        longitude?: number;
        address?: string;
    };
}

export interface DiscountCode {
    codeId: string;  // UUID identifier for backend operations
    code: string;    // Human-readable discount code
    discount_percentage: number;
    expiry_date: string;
    is_active: boolean;
    franchise_id: string;
    created_at: string;
    updated_at: string;
}

export interface DiscountCodeCreateRequest {
    code: string;
    discountPercentage: number;
    expiryHours: number; // 0-48 hours (0-2 days)
}

export interface DiscountCodeUpdateRequest {
    discountPercentage?: number;
    expiryHours?: number;
    isActive?: boolean;
}

export interface BikeInventoryResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface BikeListResponse {
    success: boolean;
    bikes: BikeBackendResponse[];
    message?: string;
    count?: number;
}

export interface DiscountCodeListResponse {
    success: boolean;
    discount_codes: DiscountCode[];
    message?: string;
}

export interface BikeAvailabilityResponse {
    success: boolean;
    bikes: BikeBackendResponse[];
    totalAvailable: number;
    lastUpdated: string;
}

// Bike Inventory Service functions
export const bikeInventoryService = {
    // ===== CONVERSION HELPERS =====

    // Convert backend bike response to frontend format
    convertBackendBikeToFrontend: (backendBike: BikeBackendResponse): Bike => {
        return {
            bike_id: backendBike.bikeId,
            bike_type: backendBike.bikeType,
            access_code: backendBike.accessCode,
            hourly_rate: backendBike.hourlyRate,
            status: backendBike.status,
            availability: backendBike.status === 'available',
            franchise_id: backendBike.franchiseId,
            features: [
                backendBike.features.heightAdjustment ? 'Height Adjustment' : '',
                `Battery Life: ${backendBike.features.batteryLife}%`,
                `Max Speed: ${backendBike.features.maxSpeed} km/h`,
                `Weight: ${backendBike.features.weight} kg`
            ].filter(Boolean),
            location: backendBike.location.address,
            created_at: backendBike.createdAt,
            updated_at: backendBike.updatedAt,
        };
    },

    // ===== BIKE MANAGEMENT =====

    // Get all bikes for the franchise
    getBikes: async (): Promise<{ success: boolean; bikes: Bike[]; message?: string; }> => {
        const response = await bikeInventoryAPI.get('/bikes');
        const data = response.data;

        if (data.success && data.bikes) {
            const convertedBikes = data.bikes.map((bike: BikeBackendResponse) =>
                bikeInventoryService.convertBackendBikeToFrontend(bike)
            );
            return {
                success: true,
                bikes: convertedBikes,
                message: data.message
            };
        }

        return {
            success: data.success,
            bikes: [],
            message: data.message
        };
    },

    // Get bike by ID
    getBike: async (bikeId: string): Promise<BikeInventoryResponse<Bike>> => {
        const response = await bikeInventoryAPI.get(`/bikes/${bikeId}`);
        const data = response.data;

        if (data.success && data.bike) {
            return {
                success: true,
                data: bikeInventoryService.convertBackendBikeToFrontend(data.bike)
            };
        }

        return data;
    },

    // Create a new bike
    createBike: async (bikeData: BikeCreateRequest): Promise<BikeInventoryResponse<Bike>> => {
        const response = await bikeInventoryAPI.post('/bikes', bikeData);
        const data = response.data;

        if (data.success && data.bike) {
            return {
                success: true,
                data: bikeInventoryService.convertBackendBikeToFrontend(data.bike)
            };
        }

        return data;
    },

    // Update an existing bike
    updateBike: async (bikeId: string, bikeData: BikeUpdateRequest): Promise<BikeInventoryResponse<Bike>> => {
        const response = await bikeInventoryAPI.put(`/bikes/${bikeId}`, bikeData);
        const data = response.data;

        if (data.success && data.bike) {
            return {
                success: true,
                data: bikeInventoryService.convertBackendBikeToFrontend(data.bike)
            };
        }

        return data;
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

    // Create a new discount code
    createDiscountCode: async (discountData: DiscountCodeCreateRequest): Promise<BikeInventoryResponse<DiscountCode>> => {
        // Send the data as-is since backend now expects discountPercentage and expiryHours
        const response = await bikeInventoryAPI.post('/discount-codes', discountData);
        return response.data;
    },

    // Update an existing discount code
    updateDiscountCode: async (codeId: string, discountData: DiscountCodeUpdateRequest): Promise<BikeInventoryResponse<DiscountCode>> => {
        const response = await bikeInventoryAPI.put(`/discount-codes/${codeId}`, discountData);
        return response.data;
    },

    // Deactivate a discount code
    deactivateDiscountCode: async (codeId: string): Promise<BikeInventoryResponse> => {
        const response = await bikeInventoryAPI.delete(`/discount-codes/${codeId}`);
        return response.data;
    },

    // ===== PUBLIC BIKE AVAILABILITY (No auth required) =====

    // Get available bikes for customers (public endpoint)
    getAvailableBikes: async (): Promise<BikeAvailabilityResponse> => {
        // Use the base API without auth interceptors for public endpoint
        const response = await axios.get(`${API_BASE_URL}/bike-availability`);
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
