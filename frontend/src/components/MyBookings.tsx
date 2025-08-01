import React, { useState, useEffect } from 'react';
import { bookingService, type Booking, type MyBookingsResponse } from '../Services/bookingService';

interface MyBookingsProps {
  className?: string;
}

const MyBookings: React.FC<MyBookingsProps> = ({ className = '' }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: MyBookingsResponse = await bookingService.getMyBookings();
      
      if (response.success) {
        setBookings(response.bookings);
      } else {
        setError(response.error || 'Failed to fetch bookings');
      }
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-gradient-to-r from-yellow-400 to-orange-400';
      case 'approved':
        return 'bg-gradient-to-r from-green-400 to-emerald-500';
      case 'rejected':
        return 'bg-gradient-to-r from-red-400 to-rose-500';
      case 'completed':
        return 'bg-gradient-to-r from-blue-400 to-indigo-500';
      case 'cancelled':
        return 'bg-gradient-to-r from-gray-400 to-slate-500';
      default:
        return 'bg-gradient-to-r from-gray-400 to-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'approved':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'rejected':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const durationMs = end.getTime() - start.getTime();
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${minutes}m`;
      }
    } catch {
      return 'N/A';
    }
  };

  const calculatePrice = (startTime: string, endTime: string) => {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const durationMs = end.getTime() - start.getTime();
      const hours = durationMs / (1000 * 60 * 60);
      
      // Base rate: $5 per hour with a $2 minimum charge
      const baseRate = 5;
      const minimumCharge = 2;
      const calculatedPrice = Math.max(hours * baseRate, minimumCharge);
      
      return `$${calculatedPrice.toFixed(2)}`;
    } catch {
      return 'N/A';
    }
  };

  const getBookingStatus = (booking: Booking) => {
    if (booking.status) {
      return booking.status;
    }
    // Derive status from other fields if status is not available
    const now = new Date();
    const endTime = new Date(booking.endTime);
    
    if (booking.isUsed) {
      return 'completed';
    } else if (endTime < now) {
      return 'cancelled';
    } else {
      return 'approved';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const status = getBookingStatus(booking);
    return selectedStatus === 'all' || status.toLowerCase() === selectedStatus;
  });

  const statusCounts = bookings.reduce((acc, booking) => {
    const status = getBookingStatus(booking).toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br from-white via-amber-50/30 to-yellow-50/50 rounded-2xl shadow-xl border border-amber-100/50 p-8 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 to-yellow-400/5"></div>
        <div className="relative flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent absolute inset-0"></div>
          </div>
          <div className="text-center">
            <p className="text-gray-700 font-medium text-lg">Loading your bookings...</p>
            <p className="text-gray-500 text-sm mt-1">Please wait while we fetch your data</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 rounded-2xl shadow-xl border border-red-100/50 p-8 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-red-400/5 to-rose-400/5"></div>
        <div className="relative text-center">
          <div className="inline-flex p-4 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl mb-6 shadow-lg">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={fetchBookings}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-rose-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-white via-gray-50/50 to-amber-50/30 rounded-2xl shadow-2xl border border-gray-200/50 backdrop-blur-sm ${className}`}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-100/20 to-yellow-100/10 rounded-full -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100/15 to-indigo-100/10 rounded-full translate-y-24 -translate-x-24"></div>
      
      {/* Header */}
      <div className="relative p-8 border-b border-gray-200/50 bg-gradient-to-r from-transparent to-amber-50/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">My Bookings</h2>
              <p className="text-gray-600 mt-1 font-medium">Track your scooter reservations and history</p>
            </div>
          </div>
          <button
            onClick={fetchBookings}
            className="group p-3 bg-white/80 backdrop-blur-sm text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            title="Refresh bookings"
          >
            <svg className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="relative p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/50">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`group relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
              selectedStatus === 'all'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-200'
                : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-amber-50 hover:text-amber-700 border border-gray-200/50 shadow-sm hover:shadow-md'
            }`}
          >
            <span className="relative z-10">All ({bookings.length})</span>
            {selectedStatus === 'all' && (
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl blur opacity-30"></div>
            )}
          </button>
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`group relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 capitalize ${
                selectedStatus === status
                  ? 'text-white shadow-lg transform scale-105'
                  : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:text-gray-800 border border-gray-200/50 shadow-sm hover:shadow-md'
              } ${selectedStatus === status ? getStatusGradient(status) : 'hover:bg-gray-50'}`}
            >
              <span className="relative z-10">{status} ({count})</span>
              {selectedStatus === status && (
                <div className={`absolute inset-0 rounded-xl blur opacity-30 ${getStatusGradient(status)}`}></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="relative p-8">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mb-8 shadow-lg">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedStatus === 'all' ? 'No bookings found' : `No ${selectedStatus} bookings`}
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
              {selectedStatus === 'all' 
                ? 'You haven\'t made any bookings yet. Visit the bikes section to make your first reservation!'
                : `You don't have any ${selectedStatus} bookings.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            {filteredBookings.map((booking, index) => (
              <div
                key={booking.bookingId}
                className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-2xl hover:shadow-amber-100/20 transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02] opacity-0 animate-fade-in-up"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'forwards'
                }}
              >
                {/* Card decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/20 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100/15 to-transparent rounded-2xl"></div>
                
                <div className="relative flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-sm">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          Bike #{booking.bikeId}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`relative inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-lg ${getStatusColor(getBookingStatus(booking))} transform transition-all duration-300 hover:scale-105 group`}
                          >
                            <span className="relative z-10 flex items-center space-x-1">
                              {getStatusIcon(getBookingStatus(booking))}
                              <span className="capitalize">{getBookingStatus(booking)}</span>
                            </span>
                            {/* Animated background for completed status */}
                            {getBookingStatus(booking).toLowerCase() === 'completed' && (
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            )}
                            {/* Pulse animation for pending status */}
                            {getBookingStatus(booking).toLowerCase() === 'pending' && (
                              <div className="absolute inset-0 rounded-xl bg-yellow-400 animate-pulse opacity-20"></div>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-blue-800">Duration</p>
                            <p className="text-blue-700 font-semibold">{calculateDuration(booking.startTime, booking.endTime)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-green-800">Price</p>
                            <p className="text-green-700 font-semibold text-lg">{booking?.price}</p>
                          </div>
                        </div>
                        {booking.accessCode && (
                          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                            <div className="p-2 bg-amber-100 rounded-lg">
                              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-amber-800">Access Code</p>
                              <p className="font-mono font-bold text-amber-700 text-lg tracking-wider">{booking.accessCode}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-blue-800">Booking ID</p>
                            <p className="font-mono text-blue-700 font-semibold">{booking.bookingId.slice(-8)}</p>
                          </div>
                        </div>
                        {booking.createdAt && (
                          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-purple-800">Booked On</p>
                              <p className="text-purple-700 font-semibold">{formatDate(booking.createdAt)}</p>
                            </div>
                          </div>
                        )}
                        {booking.updatedAt && (
                          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">Last Updated</p>
                              <p className="text-gray-700 font-semibold">{formatDate(booking.updatedAt)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {(booking.bikeName || booking.bikeModel || booking.bikeLocation) && (
                      <div className="mt-6 pt-6 border-t border-gray-200/50">
                        <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Additional Information
                          </h4>
                          <div className="space-y-2 text-sm">
                            {booking.bikeName && <p><span className="font-medium text-gray-700">Model:</span> <span className="text-gray-600">{booking.bikeName}</span></p>}
                            {booking.bikeLocation && <p><span className="font-medium text-gray-700">Location:</span> <span className="text-gray-600">{booking.bikeLocation}</span></p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
