import React from 'react';
import type { Bike } from './types';
import { BikeIcon } from './BikeIcon';

interface FeedbackPopupProps {
  show: boolean;
  bike: Bike | null;
  feedbackText: string;
  setFeedbackText: (text: string) => void;
  feedbackLoading: boolean;
  bookingReference: string;
  onClose: () => void;
  onSubmit: () => void;
}

export const FeedbackPopup: React.FC<FeedbackPopupProps> = ({
  show,
  bike,
  feedbackText,
  setFeedbackText,
  feedbackLoading,
  bookingReference,
  onClose,
  onSubmit
}) => {
  if (!show || !bike) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999}}>
      {/* Backdrop blur */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
        style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
      ></div>
      
      {/* Popup content */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100 border border-gray-100">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-3 rounded-lg mr-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Rate Your Experience</h3>
            <p className="text-sm text-gray-600">How was your booking experience?</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Bike info */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 mb-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-white p-2 rounded-lg mr-3 shadow-sm border border-gray-200">
              <BikeIcon bikeType={bike.bikeType} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{bike.bikeType}</p>
              <p className="text-sm text-gray-600">Bike ID: {bike.bikeId}</p>
              <p className="text-sm text-gray-600">Booking: {bookingReference}</p>
            </div>
          </div>
        </div>

        {/* Feedback form */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Share your feedback
          </label>
          <div className="relative">
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Tell us about your experience with this bike... What did you like? Any suggestions for improvement?"
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none bg-gradient-to-br from-gray-50 to-white transition-all duration-200"
              maxLength={500}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded">
              {feedbackText.length}/500
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 text-gray-600 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium border border-gray-300"
            disabled={feedbackLoading}
          >
            Skip for now
          </button>
          <button
            onClick={onSubmit}
            disabled={feedbackLoading || !feedbackText.trim()}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center font-medium shadow-lg transform hover:scale-105 disabled:transform-none"
          >
            {feedbackLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
