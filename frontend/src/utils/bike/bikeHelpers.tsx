import React from 'react';

/**
 * Get bike icon based on bike type
 * Note: For consistency, consider using the BikeIcon component instead
 */
export const getBikeIcon = (bikeType: string, className: string = "w-8 h-8"): React.ReactElement => {
  switch (bikeType) {
    case 'Gyroscooter':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {/* Gyroscooter - balanced platform icon */}
          <circle cx="6" cy="18" r="3" strokeWidth="2"/>
          <circle cx="18" cy="18" r="3" strokeWidth="2"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18h6" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18V8" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 8h4a1 1 0 011 1v1a1 1 0 01-1 1h-4a1 1 0 01-1-1V9a1 1 0 011-1z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v3" />
          <circle cx="12" cy="4" r="1" fill="currentColor"/>
        </svg>
      );
    case 'eBikes':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {/* Electric Bike - bicycle with electric elements */}
          <circle cx="6" cy="18" r="3" strokeWidth="2"/>
          <circle cx="18" cy="18" r="3" strokeWidth="2"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18L12 12L15 18" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12L15 6H17" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12L9 6H7" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 6L12 3" />
          {/* Electric symbol */}
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V8l2 2h-2v2l-2-2h2z" fill="currentColor"/>
        </svg>
      );
    case 'Segway':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {/* Segway - two wheels with platform and handle */}
          <circle cx="6" cy="18" r="3" strokeWidth="2"/>
          <circle cx="18" cy="18" r="3" strokeWidth="2"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18h6" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18V6" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6h4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V3" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3h6" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 15h4" />
        </svg>
      );
    case 'Electric Scooter':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {/* Electric Scooter - smaller wheels with vertical handle */}
          <circle cx="6" cy="19" r="2" strokeWidth="2"/>
          <circle cx="18" cy="19" r="2" strokeWidth="2"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 19h8" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 19L14 8" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 8V3" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3h4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 8h6" />
        </svg>
      );
    case 'Bike':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {/* Regular Bike */}
          <circle cx="6" cy="18" r="3" strokeWidth="2"/>
          <circle cx="18" cy="18" r="3" strokeWidth="2"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18L12 12L15 18" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12L15 6H17" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12L9 6H7" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 6L12 3" />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {/* Default - generic vehicle icon */}
          <circle cx="6" cy="18" r="3" strokeWidth="2"/>
          <circle cx="18" cy="18" r="3" strokeWidth="2"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18h6" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18V12" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
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
 * Get bike type display name and color scheme
 */
export const getBikeTypeInfo = (bikeType: string) => {
  switch (bikeType) {
    case 'Gyroscooter':
      return {
        displayName: 'Gyroscooter',
        description: 'Self-balancing electric vehicle',
        colorScheme: 'from-blue-400 to-purple-500',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    case 'eBikes':
      return {
        displayName: 'Electric Bike',
        description: 'Eco-friendly electric bicycle',
        colorScheme: 'from-green-400 to-emerald-500',
        textColor: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    case 'Segway':
      return {
        displayName: 'Segway',
        description: 'Two-wheeled personal transporter',
        colorScheme: 'from-amber-400 to-orange-500',
        textColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200'
      };
    case 'Electric Scooter':
      return {
        displayName: 'Electric Scooter',
        description: 'Compact electric scooter',
        colorScheme: 'from-purple-400 to-pink-500',
        textColor: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      };
    case 'Bike':
      return {
        displayName: 'Regular Bike',
        description: 'Traditional bicycle',
        colorScheme: 'from-gray-400 to-gray-600',
        textColor: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      };
    default:
      return {
        displayName: bikeType || 'Unknown Vehicle',
        description: 'Personal transportation device',
        colorScheme: 'from-gray-400 to-gray-600',
        textColor: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      };
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
