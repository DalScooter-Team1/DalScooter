import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_SERVER;

// Create axios instance for messaging
const messagingAPI = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
messagingAPI.interceptors.request.use(
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
messagingAPI.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Authentication failed for messaging API');
            // Could redirect to login here if needed
        }
        return Promise.reject(error);
    }
);

export interface Message {
    messageId: string;
    timestamp: number;
    userId: string;
    franchiseId?: string;
    content: string;
    messageType: 'concern' | 'response';
    status: 'pending' | 'assigned' | 'resolved';
    userEmail?: string;
    createdAt?: string;
}

export interface Conversation {
    conversationId: string;
    concern: Message;
    responses: Message[];
    latestActivity: number;
    hasResponse: boolean;
    status: string;
}

export interface SubmitConcernRequest {
    content: string;
    bookingReference?: string;
}

export interface SubmitConcernResponse {
    success: boolean;
    message: string;
    messageId: string;
    timestamp: number;
}

export interface GetMessagesResponse {
    success: boolean;
    messages: Message[];
    totalCount: number;
}

export interface GetCustomerMessagesResponse {
    success: boolean;
    conversations: Conversation[];
    totalCount: number;
}

export interface RespondConcernRequest {
    messageId: string;
    content: string;
    originalTimestamp: number;
}

export interface RespondConcernResponse {
    success: boolean;
    message: string;
    responseMessageId: string;
}

// Messaging Service functions
export const messagingService = {
    // Submit a concern (for customers)
    submitConcern: async (request: SubmitConcernRequest): Promise<SubmitConcernResponse> => {
        try {
            const response = await messagingAPI.post('/submit-concern', request);
            return response.data;
        } catch (error: any) {
            console.error('Error submitting concern:', error);
            throw new Error(error.response?.data?.error || 'Failed to submit concern');
        }
    },

    // Get all messages (for franchise operators)
    getMessages: async (): Promise<GetMessagesResponse> => {
        try {
            const response = await messagingAPI.get('/messages');
            const data = response.data;
            console.log('Backend response for getMessages:', data); // Debug log

            // Backend now consistently returns 'messages' field
            const messages = data.messages || [];

            return {
                success: data.success || false,
                messages: messages,
                totalCount: data.totalCount || messages.length
            };
        } catch (error: any) {
            console.error('Error fetching messages:', error);
            throw new Error(error.response?.data?.error || 'Failed to fetch messages');
        }
    },

    // Get customer's own messages and responses (for customers)
    getCustomerMessages: async (): Promise<GetCustomerMessagesResponse> => {
        try {
            const response = await messagingAPI.get('/customer-messages');
            return response.data;
        } catch (error: any) {
            console.error('Error fetching customer messages:', error);
            throw new Error(error.response?.data?.error || 'Failed to fetch customer messages');
        }
    },

    // Respond to a concern (for franchise operators)
    respondToConcern: async (request: RespondConcernRequest): Promise<RespondConcernResponse> => {
        try {
            const response = await messagingAPI.post('/respond-concern', request);
            return response.data;
        } catch (error: any) {
            console.error('Error responding to concern:', error);
            throw new Error(error.response?.data?.error || 'Failed to respond to concern');
        }
    },

    // Utility function to format timestamp
    formatTimestamp: (timestamp: number): string => {
        return new Date(timestamp * 1000).toLocaleString();
    },

    // Utility function to get time ago
    getTimeAgo: (timestamp: number): string => {
        const now = Date.now();
        const messageTime = timestamp * 1000;
        const diffInMs = now - messageTime;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        return `${diffInDays} days ago`;
    }
};

export default messagingService;
