// Shared types for bike details components
export interface Bike {
  bikeId: string;
  bikeType: string;
  hourlyRate: number;
  status: string;
  isActive: boolean;
  features: {
    batteryLife: number;
    maxSpeed: number;
    weight: number;
    heightAdjustment: boolean;
  };
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  user: string;
  rating: number;
  comment: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  date: string;
}

export type SentimentFilter = 'all' | 'positive' | 'neutral' | 'negative' | 'mixed';

export interface FeedbackStats {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  mixed: number;
}
