import React from 'react';

interface BikeIconProps {
  bikeType: string;
  className?: string;
}

export const BikeIcon: React.FC<BikeIconProps> = ({ bikeType, className = "w-8 h-8" }) => {
  switch (bikeType) {
    case 'Gyroscooter':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="gyro-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="gyro-wheels" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          {/* Wheels with gradient */}
          <circle cx="6" cy="18" r="3" fill="url(#gyro-wheels)" stroke="#1E3A8A" strokeWidth="1.5"/>
          <circle cx="18" cy="18" r="3" fill="url(#gyro-wheels)" stroke="#1E3A8A" strokeWidth="1.5"/>
          {/* Platform */}
          <rect x="8" y="16.5" width="8" height="3" rx="1.5" fill="url(#gyro-gradient)" stroke="#1E3A8A" strokeWidth="1"/>
          {/* Vertical post */}
          <rect x="11.5" y="6" width="1" height="11" fill="url(#gyro-gradient)"/>
          {/* Handle platform */}
          <rect x="9" y="7" width="6" height="2" rx="1" fill="url(#gyro-gradient)" stroke="#1E3A8A" strokeWidth="1"/>
          {/* Rider indicator */}
          <circle cx="12" cy="4" r="1.5" fill="#F59E0B"/>
          {/* LED indicators */}
          <circle cx="10" cy="17.5" r="0.3" fill="#10B981"/>
          <circle cx="14" cy="17.5" r="0.3" fill="#EF4444"/>
        </svg>
      );
    case 'eBikes':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="ebike-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="ebike-frame" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          {/* Wheels */}
          <circle cx="6" cy="18" r="3" fill="url(#ebike-gradient)" stroke="#065F46" strokeWidth="1.5"/>
          <circle cx="18" cy="18" r="3" fill="url(#ebike-gradient)" stroke="#065F46" strokeWidth="1.5"/>
          {/* Frame */}
          <path d="M9 18L12 12L15 18" stroke="url(#ebike-frame)" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M12 12L15 6H17" stroke="url(#ebike-frame)" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M12 12L9 6H7" stroke="url(#ebike-frame)" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M15 6L12 3" stroke="url(#ebike-frame)" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Electric battery */}
          <rect x="10" y="9" width="4" height="2" rx="1" fill="#F59E0B" stroke="#D97706" strokeWidth="1"/>
          {/* Lightning bolt */}
          <path d="M13 10.5l-1 1h1l-1 1" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          {/* Spokes */}
          <line x1="6" y1="15" x2="6" y2="21" stroke="#065F46" strokeWidth="1"/>
          <line x1="3" y1="18" x2="9" y2="18" stroke="#065F46" strokeWidth="1"/>
          <line x1="18" y1="15" x2="18" y2="21" stroke="#065F46" strokeWidth="1"/>
          <line x1="15" y1="18" x2="21" y2="18" stroke="#065F46" strokeWidth="1"/>
        </svg>
      );
    case 'Segway':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="segway-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
            <linearGradient id="segway-wheels" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#92400E" />
              <stop offset="100%" stopColor="#451A03" />
            </linearGradient>
          </defs>
          {/* Wheels */}
          <circle cx="6" cy="18" r="3" fill="url(#segway-wheels)" stroke="#92400E" strokeWidth="1.5"/>
          <circle cx="18" cy="18" r="3" fill="url(#segway-wheels)" stroke="#92400E" strokeWidth="1.5"/>
          {/* Platform */}
          <rect x="8" y="16" width="8" height="4" rx="2" fill="url(#segway-gradient)" stroke="#92400E" strokeWidth="1"/>
          {/* Vertical post */}
          <rect x="11.5" y="4" width="1" height="13" fill="url(#segway-gradient)"/>
          {/* Handlebars */}
          <rect x="8" y="4" width="8" height="1.5" rx="0.75" fill="url(#segway-gradient)" stroke="#92400E" strokeWidth="1"/>
          {/* Knee pad */}
          <rect x="10" y="12" width="4" height="2" rx="1" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
          {/* Control panel */}
          <rect x="11" y="5.5" width="2" height="1.5" rx="0.5" fill="#1F2937"/>
          <circle cx="11.5" cy="6.2" r="0.2" fill="#10B981"/>
          <circle cx="12.5" cy="6.2" r="0.2" fill="#EF4444"/>
          {/* Foot sensors */}
          <rect x="9" y="17" width="2" height="1" rx="0.5" fill="#6B7280"/>
          <rect x="13" y="17" width="2" height="1" rx="0.5" fill="#6B7280"/>
        </svg>
      );
    case 'Electric Scooter':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="escooter-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
            <linearGradient id="escooter-wheels" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6D28D9" />
              <stop offset="100%" stopColor="#BE185D" />
            </linearGradient>
          </defs>
          {/* Wheels */}
          <circle cx="6" cy="19" r="2.5" fill="url(#escooter-wheels)" stroke="#581C87" strokeWidth="1.5"/>
          <circle cx="18" cy="19" r="2.5" fill="url(#escooter-wheels)" stroke="#581C87" strokeWidth="1.5"/>
          {/* Deck */}
          <rect x="7" y="17.5" width="10" height="2" rx="1" fill="url(#escooter-gradient)" stroke="#581C87" strokeWidth="1"/>
          {/* Stem */}
          <rect x="15.5" y="5" width="1" height="13" fill="url(#escooter-gradient)"/>
          {/* Handlebars */}
          <rect x="12" y="4.5" width="8" height="1.5" rx="0.75" fill="url(#escooter-gradient)" stroke="#581C87" strokeWidth="1"/>
          {/* Display */}
          <rect x="14" y="7" width="3" height="2" rx="0.5" fill="#1F2937" stroke="#374151" strokeWidth="1"/>
          <rect x="14.5" y="7.5" width="2" height="1" rx="0.2" fill="#10B981"/>
          {/* Brake lever */}
          <circle cx="12.5" cy="5.2" r="0.5" fill="#EF4444"/>
          {/* Throttle */}
          <circle cx="19.5" cy="5.2" r="0.5" fill="#10B981"/>
          {/* LED strip */}
          <rect x="8" y="16.8" width="8" height="0.4" rx="0.2" fill="#3B82F6"/>
          {/* Folding mechanism */}
          <circle cx="15.5" cy="12" r="1" fill="#6B7280" stroke="#374151" strokeWidth="1"/>
        </svg>
      );
    case 'Bike':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="bike-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6B7280" />
              <stop offset="100%" stopColor="#374151" />
            </linearGradient>
            <linearGradient id="bike-wheels" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4B5563" />
              <stop offset="100%" stopColor="#1F2937" />
            </linearGradient>
          </defs>
          {/* Wheels */}
          <circle cx="6" cy="18" r="3" fill="url(#bike-wheels)" stroke="#111827" strokeWidth="1.5"/>
          <circle cx="18" cy="18" r="3" fill="url(#bike-wheels)" stroke="#111827" strokeWidth="1.5"/>
          {/* Frame */}
          <path d="M9 18L12 12L15 18" stroke="url(#bike-gradient)" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M12 12L15 6H17" stroke="url(#bike-gradient)" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M12 12L9 6H7" stroke="url(#bike-gradient)" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M15 6L12 3" stroke="url(#bike-gradient)" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Seat */}
          <ellipse cx="15" cy="6" rx="1.5" ry="0.5" fill="#1F2937" stroke="#111827" strokeWidth="1"/>
          {/* Pedals */}
          <circle cx="12" cy="12" r="1" fill="#374151" stroke="#111827" strokeWidth="1"/>
          <rect x="10.5" y="11.5" width="3" height="1" rx="0.5" fill="#6B7280"/>
          {/* Spokes */}
          <line x1="6" y1="15" x2="6" y2="21" stroke="#374151" strokeWidth="1"/>
          <line x1="3" y1="18" x2="9" y2="18" stroke="#374151" strokeWidth="1"/>
          <line x1="18" y1="15" x2="18" y2="21" stroke="#374151" strokeWidth="1"/>
          <line x1="15" y1="18" x2="21" y2="18" stroke="#374151" strokeWidth="1"/>
          {/* Chain */}
          <path d="M12 13 Q15 15 18 15" stroke="#1F2937" strokeWidth="1.5" fill="none"/>
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="default-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9CA3AF" />
              <stop offset="100%" stopColor="#6B7280" />
            </linearGradient>
          </defs>
          {/* Generic vehicle icon */}
          <circle cx="6" cy="18" r="3" fill="url(#default-gradient)" stroke="#4B5563" strokeWidth="1.5"/>
          <circle cx="18" cy="18" r="3" fill="url(#default-gradient)" stroke="#4B5563" strokeWidth="1.5"/>
          <rect x="8" y="16" width="8" height="4" rx="2" fill="url(#default-gradient)" stroke="#4B5563" strokeWidth="1"/>
          <rect x="11.5" y="10" width="1" height="7" fill="url(#default-gradient)"/>
          <circle cx="12" cy="8" r="2" fill="#F59E0B"/>
          <text x="12" y="9" textAnchor="middle" fontSize="8" fill="white">?</text>
        </svg>
      );
  }
};
