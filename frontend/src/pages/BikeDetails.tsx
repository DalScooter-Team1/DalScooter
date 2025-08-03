import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BikeOverviewCard,
  BookingSidebar,
  ReviewsSection,
  FeedbackPopup,
  LoginPromptModal
} from '../components/bike-details';
import { useBikeDetails, useBooking, useFeedback } from '../hooks';
import { bookingService } from '../Services/bookingService';

const BikeDetails: React.FC = () => {
  const navigate = useNavigate();
  
  // Custom hooks
  const {
    bike,
    feedbacks,
    loading,
    selectedSentiment,
    setSelectedSentiment,
    refreshFeedbacks,
    getFilteredFeedbacks,
    getFeedbackStats,
    getAverageRating
  } = useBikeDetails();

  const {
    bookingLoading,
    bookingSuccess,
    bookingReference,
    showLoginPrompt,
    setShowLoginPrompt,
    handleBooking,
    handleBookAnother,
    setBookingSuccess
  } = useBooking();

  const {
    showFeedbackPopup,
    setShowFeedbackPopup,
    feedbackText,
    setFeedbackText,
    feedbackLoading,
    handleFeedbackSubmit,
    closeFeedbackPopup
  } = useFeedback();

  // Local state for booking sidebar
  const [selectedHours, setSelectedHours] = useState(1);
  const [discountCode, setDiscountCode] = useState('');
  const [discountStatus, setDiscountStatus] = useState<{
    isVerifying: boolean;
    isValid: boolean | null;
    message: string;
    discountPercentage?: number;
  }>({
    isVerifying: false,
    isValid: null,
    message: '',
  });

  // Handle discount code verification
  const verifyDiscountCode = useCallback(async (code: string) => {
    if (!code.trim()) {
      setDiscountStatus({
        isVerifying: false,
        isValid: null,
        message: '',
      });
      return;
    }

    setDiscountStatus({
      isVerifying: true,
      isValid: null,
      message: 'Verifying...',
    });

    try {
      const result = await bookingService.verifyDiscountCode(code.trim());
      
      if (result.success) {
        setDiscountStatus({
          isVerifying: false,
          isValid: true,
          message: result.message,
          discountPercentage: result.discountPercentage,
        });
      } else {
        setDiscountStatus({
          isVerifying: false,
          isValid: false,
          message: result.message,
        });
      }
    } catch (error) {
      setDiscountStatus({
        isVerifying: false,
        isValid: false,
        message: 'Failed to verify discount code. Please try again.',
      });
    }
  }, []);

  // Debounce discount code verification
  useEffect(() => {
    const timer = setTimeout(() => {
      verifyDiscountCode(discountCode);
    }, 800); // Wait 800ms after user stops typing

    return () => clearTimeout(timer);
  }, [discountCode, verifyDiscountCode]);

  const handleDiscountCodeChange = (code: string) => {
    setDiscountCode(code);
    
    // Reset status immediately if code is empty
    if (!code.trim()) {
      setDiscountStatus({
        isVerifying: false,
        isValid: null,
        message: '',
      });
    }
  };

  // Handler functions for child components
  const onBooking = () => handleBooking(bike, selectedHours, () => setShowFeedbackPopup(true));
  const onFeedbackSubmit = () => handleFeedbackSubmit(bike, bookingReference, refreshFeedbacks);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bike details...</p>
        </div>
      </div>
    );
  }

  if (!bike) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bike Not Found</h2>
          <p className="text-gray-600 mb-4">The bike you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-amber-600 transition-colors group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Bikes
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Bike Details</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bike Overview Card */}
            <BikeOverviewCard bike={bike} />

            {/* Customer Reviews */}
            <ReviewsSection
              feedbacks={feedbacks}
              selectedSentiment={selectedSentiment}
              setSelectedSentiment={setSelectedSentiment}
            />
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <BookingSidebar
              bike={bike}
              selectedHours={selectedHours}
              setSelectedHours={setSelectedHours}
              bookingLoading={bookingLoading}
              bookingSuccess={bookingSuccess}
              onBooking={onBooking}
              onBookAnother={handleBookAnother}
              discountCode={discountCode}
              onDiscountCodeChange={handleDiscountCodeChange}
              discountStatus={discountStatus}
            />
          </div>
        </div>
      </div>

      {/* Feedback Popup */}
      {showFeedbackPopup && (
        <FeedbackPopup
          show={showFeedbackPopup}
          bike={bike}
          feedbackText={feedbackText}
          setFeedbackText={setFeedbackText}
          feedbackLoading={feedbackLoading}
          bookingReference={bookingReference}
          onSubmit={onFeedbackSubmit}
          onClose={closeFeedbackPopup}
        />
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <LoginPromptModal
          show={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
        />
      )}
    </div>
  );
};

export default BikeDetails;
