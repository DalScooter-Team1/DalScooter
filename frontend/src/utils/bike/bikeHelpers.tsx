import React from 'react';

/**
 * Get bike icon based on bike type
 */
export const getBikeIcon = (bikeType: string): React.ReactElement => {
  switch (bikeType) {
    case 'Gyroscooter':
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'Electric Scooter':
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'Bike':
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

/**
 * Get battery color based on battery life percentage
 */
export const getBatteryColor = (batteryLife: number): string => {
  if (batteryLife >= 80) return 'text-green-600';
  if (batteryLife >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

/**
 * Get sentiment color classes for feedback
 */
export const getSentimentColor = (sentiment: string): string => {
  switch (sentiment) {
    case 'positive': return 'bg-green-100 text-green-800 border-green-200';
    case 'negative': return 'bg-red-100 text-red-800 border-red-200';
    case 'neutral': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'mixed': return 'bg-purple-100 text-purple-800 border-purple-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Get sentiment emoji icon
 */
export const getSentimentIcon = (sentiment: string): string => {
  switch (sentiment) {
    case 'positive': return '😊';
    case 'negative': return '😞';
    case 'neutral': return '😐';
    case 'mixed': return '🤔';
    default: return '😐';
  }
};

/**
 * Format date to readable string
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-CA', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
