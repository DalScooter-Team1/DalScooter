import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import type { Bike, Feedback, FeedbackStats, SentimentFilter } from '../components/bike-details/types';

export const useBikeDetails = () => {
  const { bikeId } = useParams<{ bikeId: string }>();
  const location = useLocation();
  
  // State management
  const [bike, setBike] = useState<Bike | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSentiment, setSelectedSentiment] = useState<SentimentFilter>('all');

  // Fetch bike details and feedbacks on component mount
  useEffect(() => {
    const fetchBikeDetails = async () => {
      try {
        setLoading(true);
        const SERVER = import.meta.env.VITE_SERVER;

        // Get bike data from navigation state
        const current_bike = location.state?.bike || null;
        setBike(current_bike);

        // Fetch feedbacks for this bike
        if (bikeId) {
          try {
            const response = await fetch(`${SERVER}/feedback/${bikeId}`);
            if (response.ok) {
              const data = await response.json();
              console.log('Feedbacks fetched:', data);
              if (data.success && data.feedbacks) {
                // Convert API data to display format
                const displayFeedbacks = data.feedbacks.map((feedback: any) => ({
                  id: feedback.uuid,
                  user: feedback.first_name && feedback.last_name 
                    ? `${feedback.first_name} ${feedback.last_name}`
                    : feedback.email.split('@')[0],
                  rating: feedback.polarity === 'POSITIVE' ? 5 : feedback.polarity === 'NEGATIVE' ? 2 : 3,
                  comment: feedback.feedback_text,
                  sentiment: feedback.polarity?.toLowerCase() || 'neutral',
                  date: new Date(feedback.timestamp).toLocaleDateString()
                }));
                setFeedbacks(displayFeedbacks);
              }  
            }  
          } catch (error) {
            console.error('Error fetching feedbacks:', error);
          }
        }
      } catch (error) {
        console.error("Error fetching bike details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBikeDetails();
  }, [bikeId, location.state]);

  // Helper function to refresh feedbacks
  const refreshFeedbacks = async () => {
    if (bikeId) {
      try {
        const SERVER = import.meta.env.VITE_SERVER;
        const response = await fetch(`${SERVER}/feedback/${bikeId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.feedbacks) {
            const displayFeedbacks = data.feedbacks.map((feedback: any) => ({
              id: feedback.uuid,
              user: feedback.first_name && feedback.last_name 
                ? `${feedback.first_name} ${feedback.last_name}`
                : feedback.email.split('@')[0],
              rating: feedback.polarity === 'POSITIVE' ? 5 : feedback.polarity === 'NEGATIVE' ? 2 : 3,
              comment: feedback.feedback_text,
              sentiment: feedback.polarity?.toLowerCase() || 'neutral',
              date: new Date(feedback.timestamp).toLocaleDateString()
            }));
            setFeedbacks(displayFeedbacks);
          }
        }
      } catch (error) {
        console.error('Error refreshing feedbacks:', error);
      }
    }
  };

  // Helper functions for feedback filtering and statistics
  const getFilteredFeedbacks = (): Feedback[] => {
    if (selectedSentiment === 'all') return feedbacks;
    return feedbacks.filter(feedback => feedback.sentiment === selectedSentiment);
  };

  const getFeedbackStats = (): FeedbackStats => {
    const total = feedbacks.length;
    const positive = feedbacks.filter(f => f.sentiment === 'positive').length;
    const neutral = feedbacks.filter(f => f.sentiment === 'neutral').length;
    const negative = feedbacks.filter(f => f.sentiment === 'negative').length;
    const mixed = feedbacks.filter(f => f.sentiment === 'mixed').length;
    
    return { total, positive, neutral, negative, mixed };
  };

  const getAverageRating = (): string => {
    if (feedbacks.length === 0) return '0';
    const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    return (totalRating / feedbacks.length).toFixed(1);
  };

  return {
    bike,
    setBike,
    feedbacks,
    setFeedbacks,
    loading,
    selectedSentiment,
    setSelectedSentiment,
    refreshFeedbacks,
    getFilteredFeedbacks,
    getFeedbackStats,
    getAverageRating
  };
};
