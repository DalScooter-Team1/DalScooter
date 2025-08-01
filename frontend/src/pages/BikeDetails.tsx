// To do : Instead of mock bike details, pass the bike data from the previous page.
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useParams, useNavigate } from 'react-router-dom';
import { bikeInventoryService } from '../Services/bikeInventoryService';
import { bookingService } from '../Services/bookingService';
import { feedbackService } from '../Services/feedbackService';
import { isAuthenticated } from '../utils/authUtils';

interface Bike {
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

interface Feedback {
  id: string;
  user: string;
  rating: number;
  comment: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  date: string;
}

const BikeDetails: React.FC = () => {
  const { bikeId } = useParams<{ bikeId: string }>();
   const location = useLocation();
  const navigate = useNavigate();
  const [bike, setBike] = useState<Bike | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHours, setSelectedHours] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedSentiment, setSelectedSentiment] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [bookingReference, setBookingReference] = useState<string>('');
  

  useEffect(() => {
    
    const fetchBikeDetails = async () => {
      try {
        setLoading(true);
        const SERVER = import.meta.env.VITE_SERVER 

       
        const current_bike = location.state?.bike || null;
        
        setBike(current_bike);

        // Simple API call for feedbacks
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
  }, [bikeId]);

  const getBikeIcon = (bikeType: string) => {
    switch (bikeType) {
      case 'Gyroscooter':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'eBikes':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Segway':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  const getBatteryColor = (batteryLife: number) => {
    if (batteryLife >= 80) return 'text-green-600';
    if (batteryLife >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      case 'neutral': return '😐';
      default: return '😐';
    }
  };

const handleBooking = async () => {
  setBookingLoading(true);

  try {
    // Check if user is authenticated first
    if (!isAuthenticated()) {
      setShowLoginPrompt(true);
      setBookingLoading(false);
      return;
    }

    const decodedToken = localStorage.getItem('decodedToken'); 
    const token = JSON.parse(decodedToken || '{}');

    if (!token.sub) {
      setShowLoginPrompt(true);
      setBookingLoading(false);
      return;
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + selectedHours * 60 * 60 * 1000);

    const bookingData = {
      bikeId: bike?.bikeId || '',
      userId: token.sub,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      price: bike?.hourlyRate * selectedHours
    };

    console.log('Creating booking with data:', bookingData);

    // Use the booking service (same pattern as other working services)
    const result = await bookingService.createBooking(bookingData);
    
    console.log('Booking result received:', result);

    if (result.success) {
      console.log('Booking successful');
      setBookingSuccess(true);
      
      // Set booking reference - use provided bookingId or generate a fallback
      const bookingRef = result.bookingId || `BK-${Date.now()}`;
      console.log('Booking ID:', bookingRef);
      setBookingReference(bookingRef);
      
      // Show feedback popup after successful booking
      console.log('Setting timeout to show feedback popup in 1.5 seconds...');
      setTimeout(() => {
        console.log('Showing feedback popup now');
        setShowFeedbackPopup(true);
      }, 1500); // Show feedback popup after a short delay
    } else {
      console.error('Booking failed:', result.error);
      alert(`Booking failed: ${result.error}`);
    }

  } catch (error) {
    console.error('Error during booking:', error);
    alert('There was an error processing your booking. Please try again.');
  } finally {
    setBookingLoading(false);
  }
};

const handleFeedbackSubmit = async () => {
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
      alert('Thank you for your feedback!');
      
      // Refresh feedbacks to show the new one
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
    } else {
      console.error('Feedback submission failed:', result.message);
      alert(`Failed to submit feedback: ${result.message}`);
    }

  } catch (error) {
    console.error('Error submitting feedback:', error);
    alert('There was an error submitting your feedback. Please try again.');
  } finally {
    setFeedbackLoading(false);
  }
};


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-CA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper functions for feedback filtering and statistics
  const getFilteredFeedbacks = () => {
    if (selectedSentiment === 'all') return feedbacks;
    return feedbacks.filter(feedback => feedback.sentiment === selectedSentiment);
  };

  const getFeedbackStats = () => {
    const total = feedbacks.length;
    const positive = feedbacks.filter(f => f.sentiment === 'positive').length;
    const neutral = feedbacks.filter(f => f.sentiment === 'neutral').length;
    const negative = feedbacks.filter(f => f.sentiment === 'negative').length;
    
    return { total, positive, neutral, negative };
  };

  const getAverageRating = () => {
    if (feedbacks.length === 0) return 0;
    const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    return (totalRating / feedbacks.length).toFixed(1);
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 p-8 text-white">
                <div className="flex items-center space-x-6">
                  <div className="bg-white bg-opacity-90 p-4 rounded-2xl shadow-lg">
                    <div className="text-amber-600">
                      {getBikeIcon(bike.bikeType)}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{bike.bikeId}</h1>
                    <p className="text-amber-100 text-lg">{bike.bikeType}</p>
                    <div className="flex items-center mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        bike.isActive === false
                          ? 'bg-gray-100 text-gray-600 border border-gray-300'
                          : bike.status === 'available' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          bike.isActive === false 
                            ? 'bg-gray-500'
                            : bike.status === 'available' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></span>
                        {bike.isActive === false ? 'In Use Currently' : bike.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="text-center p-4 bg-amber-50 rounded-xl">
                    <p className="text-2xl font-bold text-amber-600">${bike.hourlyRate}</p>
                    <p className="text-sm text-gray-600">per hour</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <p className={`text-2xl font-bold ${getBatteryColor(bike.features.batteryLife)}`}>
                      {bike.features.batteryLife}%
                    </p>
                    <p className="text-sm text-gray-600">battery</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <p className="text-2xl font-bold text-blue-600">{bike.features.maxSpeed}</p>
                    <p className="text-sm text-gray-600">km/h max</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <p className="text-2xl font-bold text-purple-600">{bike.features.weight}</p>
                    <p className="text-sm text-gray-600">kg weight</p>
                  </div>
                </div>

                {/* Location */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Location
                  </h3>
                  <p className="text-gray-700">{bike.location.address}</p>
                  <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                    <span>Lat: {bike.location.latitude}</span>
                    <span>Lng: {bike.location.longitude}</span>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Height Adjustment</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        bike.features.heightAdjustment 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {bike.features.heightAdjustment ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Created</span>
                      <span className="text-sm text-gray-600">{formatDate(bike.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                {feedbacks.length > 0 && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(Number(getAverageRating())) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-lg font-semibold text-gray-900">{getAverageRating()}</span>
                      <span className="text-gray-500">({feedbacks.length} reviews)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback Statistics */}
              {feedbacks.length > 0 && (
                <div className="mb-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(() => {
                      const stats = getFeedbackStats();
                      return [
                        { label: 'All', count: stats.total, color: 'bg-blue-100 text-blue-800', border: 'border-blue-200' },
                        { label: 'Positive', count: stats.positive, color: 'bg-green-100 text-green-800', border: 'border-green-200' },
                        { label: 'Neutral', count: stats.neutral, color: 'bg-gray-100 text-gray-800', border: 'border-gray-200' },
                        { label: 'Negative', count: stats.negative, color: 'bg-red-100 text-red-800', border: 'border-red-200' }
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => setSelectedSentiment(item.label.toLowerCase() as any)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            selectedSentiment === item.label.toLowerCase() || (selectedSentiment === 'all' && item.label === 'All')
                              ? `${item.color} ${item.border} shadow-md`
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl font-bold">{item.count}</div>
                            <div className="text-sm font-medium">{item.label}</div>
                          </div>
                        </button>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {/* Sentiment Filter Tabs */}
              {/* {feedbacks.length > 0 && (
                <div className="mb-6">
                  <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    {[
                      { key: 'all', label: 'All Reviews', icon: '📝' },
                      { key: 'positive', label: 'Positive', icon: '😊' },
                      { key: 'neutral', label: 'Neutral', icon: '😐' },
                      { key: 'negative', label: 'Negative', icon: '😞' }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setSelectedSentiment(tab.key as any)}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                          selectedSentiment === tab.key
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-lg">{tab.icon}</span>
                          <span>{tab.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )} */}

              {/* Reviews List */}
              <div className="space-y-6">
                {getFilteredFeedbacks().length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No {selectedSentiment === 'all' ? '' : selectedSentiment} Reviews
                    </h3>
                    <p className="text-gray-600">
                      {selectedSentiment === 'all' 
                        ? 'Be the first to review this bike!' 
                        : `No ${selectedSentiment} reviews found.`}
                    </p>
                  </div>
                ) : (
                  getFilteredFeedbacks().map((feedback) => (
                    <div key={feedback.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-amber-600 font-semibold">
                              {feedback.user.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{feedback.user}</p>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">{feedback.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getSentimentIcon(feedback.sentiment)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getSentimentColor(feedback.sentiment)}`}>
                            {feedback.sentiment}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700">{feedback.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Book This Bike</h3>
              
              {bookingSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Booking Successful!</h4>
                  <p className="text-gray-600 mb-4">Your bike has been reserved for today.</p>
                  <button
                    onClick={() => {
                      setBookingSuccess(false);
                      setShowFeedbackPopup(false);
                      setFeedbackText('');
                    }}
                    className="w-full bg-amber-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-amber-600 transition-colors"
                  >
                    Book Another
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (Hours)
                    </label>
                    <select
                      value={selectedHours}
                      onChange={(e) => setSelectedHours(Number(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((hours) => (
                        <option key={hours} value={hours}>
                          {hours} {hours === 1 ? 'hour' : 'hours'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Rate per hour</span>
                      <span className="text-gray-900">${bike.hourlyRate}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Duration</span>
                      <span className="text-gray-900">{selectedHours} {selectedHours === 1 ? 'hour' : 'hours'}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-amber-600">${bike.hourlyRate * selectedHours}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={bookingLoading || bike.status !== 'available' || bike.isActive === false}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
                      bookingLoading || bike.status !== 'available' || bike.isActive === false
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 transform hover:scale-105 shadow-lg'
                    }`}
                  >
                    {bookingLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      'Book Now'
                    )}
                  </button>

                  {(bike.status !== 'available' || bike.isActive === false) && (
                    <p className="text-red-600 text-sm text-center mt-2">
                      {bike.isActive === false ? 'This bike is currently in use' : 'This bike is currently unavailable'}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Popup */}
      {(() => {
        console.log('Rendering feedback popup check, showFeedbackPopup:', showFeedbackPopup);
        return showFeedbackPopup;
      })() && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999}}>
          {/* Backdrop blur */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setShowFeedbackPopup(false)}
            style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
          ></div>
          
          {/* Popup content */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="flex items-center mb-6">
              <div className="bg-amber-100 p-3 rounded-lg mr-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Rate Your Experience</h3>
                <p className="text-sm text-gray-600">How was your booking experience?</p>
              </div>
              <button
                onClick={() => setShowFeedbackPopup(false)}
                className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Bike info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="bg-white p-2 rounded-lg mr-3">
                  {getBikeIcon(bike?.bikeType || '')}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{bike?.bikeType}</p>
                  <p className="text-sm text-gray-600">Bike ID: {bike?.bikeId}</p>
                  <p className="text-sm text-gray-600">Booking: {bookingReference}</p>
                </div>
              </div>
            </div>

            {/* Feedback form */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share your feedback
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us about your experience with this bike..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{feedbackText.length}/500 characters</p>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFeedbackPopup(false)}
                className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={feedbackLoading}
              >
                Skip
              </button>
              <button
                onClick={handleFeedbackSubmit}
                disabled={feedbackLoading || !feedbackText.trim()}
                className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {feedbackLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 p-6 text-center">
              <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Join DalScooter!</h2>
              <p className="text-amber-800 text-sm">Create an account to book this amazing ride</p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to explore campus?</h3>
                <p className="text-gray-600 text-sm">
                  Join thousands of students and faculty who use DalScooter for convenient, eco-friendly transportation around campus.
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">Quick & easy registration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">Instant access to all bikes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">Affordable student rates</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowLoginPrompt(false);
                    navigate('/');
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold py-3 px-4 rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Create Account - It's Free!
                </button>
                <button
                  onClick={() => {
                    setShowLoginPrompt(false);
                    navigate('/login');
                  }}
                  className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Already have an account? Sign In
                </button>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="w-full text-gray-500 text-sm py-2 hover:text-gray-700 transition-colors"
                >
                  Continue browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BikeDetails;