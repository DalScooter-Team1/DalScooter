import { useState } from 'react';
import { feedbackService } from '../Services/feedbackService';
import { showNotification } from '../utils/notifications';
import type { Bike } from '../components/bike-details/types';

export const useFeedback = () => {
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const handleFeedbackSubmit = async (
    bike: Bike | null,
    bookingReference: string,
    onRefreshFeedbacks: () => Promise<void>
  ) => {
    if (!feedbackText.trim()) {
      alert('Please enter your feedback before submitting.');
      return;
    }

    setFeedbackLoading(true);

    try {
      const decodedToken = localStorage.getItem('decodedToken');
      const token = JSON.parse(decodedToken || '{}');

      const feedbackData = {
        email: token.email || '',
        first_name: token.given_name || '',
        last_name: token.family_name || '',
        feedback_text: feedbackText.trim(),
        bike_id: bike?.bikeId || '',
        booking_reference: bookingReference || 'N/A'
      };

      console.log('Submitting feedback:', feedbackData);

      const result = await feedbackService.postFeedback(feedbackData);

      if (result.success) {
        console.log('Feedback submitted successfully');
        setShowFeedbackPopup(false);
        setFeedbackText('');
        
        // Show success message
        showNotification('Thank you for your feedback!', 'success');
        
        // Refresh feedbacks to show the new one
        await onRefreshFeedbacks();
      } else {
        console.error('Feedback submission failed:', result.message);
        showNotification('Failed to submit feedback. Please try again.', 'error');
      }

    } catch (error) {
      console.error('Error submitting feedback:', error);
      showNotification('Network error. Please check your connection and try again.', 'error');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const closeFeedbackPopup = () => {
    setShowFeedbackPopup(false);
    setFeedbackText('');
  };

  return {
    showFeedbackPopup,
    setShowFeedbackPopup,
    feedbackText,
    setFeedbackText,
    feedbackLoading,
    handleFeedbackSubmit,
    closeFeedbackPopup
  };
};
