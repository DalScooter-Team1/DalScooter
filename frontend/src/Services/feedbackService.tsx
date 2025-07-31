 import React from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://j5kvxocoah.execute-api.us-east-1.amazonaws.com/prod';

export interface Feedback {
  uuid: string;
  email: string;
  first_name?: string;
  last_name?: string;
  feedback_text: string;
  bike_type: string;
  bike_id: string;
  booking_reference: string;
  timestamp: string;
  polarity: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'unknown';
  analyzed_at?: string;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  bike_id: string;
  feedbacks: Feedback[];
  count: number;
}

class FeedbackService {
  private getPublicHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  async getFeedbacksByBikeId(bikeId: string): Promise<FeedbackResponse> {
    try {
      const headers = this.getPublicHeaders();
      const response = await fetch(`${API_BASE_URL}/feedback/${bikeId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      throw error;
    }
  }

  async postFeedback(feedbackData: {
    email: string;
    first_name?: string;
    last_name?: string;
    feedback_text: string;
    bike_type: string;
    bike_id: string;
    booking_reference: string;
  }): Promise<{ success: boolean; message: string; feedback_id?: string }> {
    try {
      const token = localStorage.getItem('idToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };

      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error posting feedback:', error);
      throw error;
    }
  }

  convertFeedbackToDisplay(feedback: Feedback) {
    // Convert the backend feedback format to display format
    const sentiment = feedback.polarity?.toLowerCase() as 'positive' | 'negative' | 'neutral' || 'neutral';
    
    return {
      id: feedback.uuid,
      user: feedback.first_name && feedback.last_name 
        ? `${feedback.first_name} ${feedback.last_name}`
        : feedback.email.split('@')[0], // Use email prefix if no name
      rating: this.getRatingFromSentiment(sentiment),
      comment: feedback.feedback_text,
      sentiment: sentiment,
      date: new Date(feedback.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      originalFeedback: feedback
    };
  }

  private getRatingFromSentiment(sentiment: 'positive' | 'negative' | 'neutral'): number {
    switch (sentiment) {
      case 'positive':
        return Math.floor(Math.random() * 2) + 4; // 4-5 stars
      case 'negative':
        return Math.floor(Math.random() * 2) + 1; // 1-2 stars
      case 'neutral':
        return Math.floor(Math.random() * 2) + 3; // 3-4 stars
      default:
        return 3;
    }
  }
}

export const feedbackService = new FeedbackService(); 