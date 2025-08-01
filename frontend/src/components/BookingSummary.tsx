import React, { useState, useEffect } from 'react';
import { bookingService, type MyBookingsResponse } from '../Services/bookingService';

interface BookingSummaryProps {
  onViewBookings: () => void;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ onViewBookings }) => {
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingStats();
  }, []);

  const fetchBookingStats = async () => {
    try {
      const response: MyBookingsResponse = await bookingService.getMyBookings();
      
      if (response.success) {
        const stats = response.bookings.reduce(
          (acc, booking) => {
            acc.total++;
            switch (booking.status.toLowerCase()) {
              case 'pending':
                acc.pending++;
                break;
              case 'approved':
                acc.approved++;
                break;
              case 'completed':
                acc.completed++;
                break;
            }
            return acc;
          },
          { total: 0, pending: 0, approved: 0, completed: 0 }
        );
        setBookingStats(stats);
      }
    } catch (error) {
      console.error('Error fetching booking stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className="p-3 bg-purple-100 rounded-lg">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{bookingStats.total}</p>
            </div>
            <button
              onClick={onViewBookings}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium hover:underline"
            >
              View All →
            </button>
          </div>
          
          {bookingStats.total > 0 && (
            <div className="mt-3 flex space-x-4 text-xs">
              {bookingStats.pending > 0 && (
                <span className="text-yellow-600">
                  {bookingStats.pending} Pending
                </span>
              )}
              {bookingStats.approved > 0 && (
                <span className="text-green-600">
                  {bookingStats.approved} Approved
                </span>
              )}
              {bookingStats.completed > 0 && (
                <span className="text-blue-600">
                  {bookingStats.completed} Completed
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
