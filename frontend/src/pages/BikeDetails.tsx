import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bikeInventoryService } from '../Services/bikeInventoryService';

interface Bike {
  bikeId: string;
  bikeType: string;
  hourlyRate: number;
  status: string;
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
  const navigate = useNavigate();
  const [bike, setBike] = useState<Bike | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHours, setSelectedHours] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Simple demo feedback data
  const demoFeedbacks: Feedback[] = [
    {
      id: '1',
      user: 'Sarah M.',
      rating: 5,
      comment: 'Amazing ride! The bike was in perfect condition and the battery lasted the entire trip. Highly recommend!',
      sentiment: 'positive',
      date: '2024-01-15'
    },
    {
      id: '2',
      user: 'Mike R.',
      rating: 4,
      comment: 'Great experience overall. The bike was clean and easy to use. Would book again.',
      sentiment: 'positive',
      date: '2024-01-14'
    },
    {
      id: '3',
      user: 'Emma L.',
      rating: 3,
      comment: 'The bike was okay, but the seat could be more comfortable for longer rides.',
      sentiment: 'neutral',
      date: '2024-01-13'
    }
  ];

  useEffect(() => {
    const fetchBikeDetails = async () => {
      try {
        setLoading(true);
        // Simulate API call - replace with actual service call
        const mockBike: Bike = {
          bikeId: bikeId || 'GYR-CF201CD8',
          bikeType: 'Gyroscooter',
          hourlyRate: 15,
          status: 'available',
          features: {
            batteryLife: 85,
            maxSpeed: 25,
            weight: 12.5,
            heightAdjustment: true,
          },
          location: {
            address: '123 Main Street, Halifax, NS B3J 2K9',
            latitude: 44.6488,
            longitude: -63.5752,
          },
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-15T14:30:00Z',
        };
        setBike(mockBike);
        
        // Simple API call for feedbacks
        if (bikeId) {
          try {
            const response = await fetch(`https://j5kvxocoah.execute-api.us-east-1.amazonaws.com/prod/feedback/${bikeId}`);
            if (response.ok) {
              const data = await response.json();
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
              } else {
                setFeedbacks(demoFeedbacks);
              }
            } else {
              setFeedbacks(demoFeedbacks);
            }
          } catch (error) {
            console.error('Error fetching feedbacks:', error);
            setFeedbacks(demoFeedbacks);
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
    // Simulate booking process
    setTimeout(() => {
      setBookingSuccess(true);
      setBookingLoading(false);
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-CA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
                        bike.status === 'available' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          bike.status === 'available' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></span>
                        {bike.status}
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
              <div className="space-y-6">
                {feedbacks.map((feedback) => (
                  <div key={feedback.id} className="border border-gray-200 rounded-xl p-6">
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
                ))}
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
                    onClick={() => setBookingSuccess(false)}
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
                    disabled={bookingLoading || bike.status !== 'available'}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
                      bookingLoading || bike.status !== 'available'
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

                  {bike.status !== 'available' && (
                    <p className="text-red-600 text-sm text-center mt-2">
                      This bike is currently unavailable
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BikeDetails; 