import React from 'react';
import type { Bike } from './types';

interface BookingSidebarProps {
  bike: Bike;
  selectedHours: number;
  setSelectedHours: (hours: number) => void;
  bookingLoading: boolean;
  bookingSuccess: boolean;
  onBooking: () => void;
  onBookAnother: () => void;
  discountCode?: string;
  onDiscountCodeChange?: (code: string) => void;
}

export const BookingSidebar: React.FC<BookingSidebarProps> = ({
  bike,
  selectedHours,
  setSelectedHours,
  bookingLoading,
  bookingSuccess,
  onBooking,
  onBookAnother,
  discountCode = '',
  onDiscountCodeChange
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <svg className="w-6 h-6 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0v10a2 2 0 002 2h4a2 2 0 002-2V7m-8 0H4a2 2 0 00-2 2v9a2 2 0 002 2h1" />
        </svg>
        Book This Bike
      </h3>
      
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
            onClick={onBookAnother}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
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

          {/* Discount Code Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Discount Code (Optional)
            </label>
            <input
              type="text"
              value={discountCode}
              onChange={(e) => onDiscountCodeChange?.(e.target.value)}
              placeholder="Enter discount code"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            {discountCode && (
              <p className="text-xs text-gray-500 mt-1">
                Code entered: {discountCode}
              </p>
            )}
          </div>

          <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 font-medium">Rate per hour</span>
              <span className="text-gray-900 font-semibold">${bike.hourlyRate}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 font-medium">Duration</span>
              <span className="text-gray-900 font-semibold">{selectedHours} {selectedHours === 1 ? 'hour' : 'hours'}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-amber-600">${bike.hourlyRate * selectedHours}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onBooking}
            disabled={bookingLoading || bike.status !== 'available' || bike.isActive === false}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
              bookingLoading || bike.status !== 'available' || bike.isActive === false
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transform hover:scale-105 shadow-lg'
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
  );
};
