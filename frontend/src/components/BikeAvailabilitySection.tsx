import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bikeInventoryService } from '../Services/bikeInventoryService';
import type { BikeAvailabilityResponse } from '../Services/bikeInventoryService';
import { BikeIcon } from './bike-details/BikeIcon';

// Interface for individual bike data
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

interface BikeAvailabilitySectionProps {
  title?: string;
  showHeader?: boolean;
}

const BikeAvailabilitySection: React.FC<BikeAvailabilitySectionProps> = ({ 
  title = "Available Bikes",
  showHeader = true 
}) => {
  const navigate = useNavigate();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        setLoading(true);
        const response = await bikeInventoryService.getAvailableBikes();
        console.log(response);
        if (response.success && response.bikes) {
          setBikes(response.bikes);
          setTotalAvailable(response.totalAvailable);
          setLastUpdated(response.lastUpdated);
        }
      } catch (error) {
        console.error("Error fetching available bikes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBikes();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-CA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBikeClick = (bike: Bike) => {
    navigate(`/bike/${bike.bikeId}`, { state: { bike } });
  };

  const getBatteryColor = (batteryLife: number) => {
    if (batteryLife >= 80) return 'text-green-600';
    if (batteryLife >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBatteryIcon = (batteryLife: number) => {
    if (batteryLife >= 80) return '🔋';
    if (batteryLife >= 50) return '🔋';
    return '🔋';
  };

  return (
    <>
      {showHeader && (
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                {title}
              </h3>
              <p className="text-gray-600 mt-1">Find your perfect ride</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full border border-green-200">
                <span className="text-green-800 font-semibold">{totalAvailable} available</span>
              </div>
              <div className="text-sm text-gray-500">
                Updated {lastUpdated ? formatDate(lastUpdated) : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-600"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-amber-400 opacity-20"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading available bikes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bikes.length > 0 ? (
            bikes.map((bike, index) => (
              <div
                key={bike.bikeId}
                onClick={() => bike.isActive !== false && handleBikeClick(bike)}
                className={`group relative bg-white rounded-2xl shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden ${
                  bike.isActive === false 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:shadow-2xl transform hover:-translate-y-2 cursor-pointer'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
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

                {/* Header with Icon */}
                <div className="bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white bg-opacity-90 p-4 rounded-2xl shadow-lg">
                        <div className="text-amber-600">
                          <BikeIcon bikeType={bike.bikeType} className="w-6 h-6" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{bike.bikeId}</h4>
                        <p className="text-amber-100 text-sm">{bike.bikeType}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Price */}
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">${bike.hourlyRate}</p>
                    <p className="text-gray-500 text-sm">per hour</p>
                  </div>

                  {/* Battery Status */}
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getBatteryIcon(bike.features.batteryLife)}</span>
                      <span className="text-sm font-medium text-gray-700">Battery</span>
                    </div>
                    <span className={`font-bold ${getBatteryColor(bike.features.batteryLife)}`}>
                      {bike.features.batteryLife}%
                    </span>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium">Location</span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{bike.location.address}</p>
                  </div>

                  {/* Features Preview */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Max Speed: {bike.features.maxSpeed} km/h</span>
                    <span>{bike.features.weight} kg</span>
                  </div>

                  {/* Action Button */}
                  <button 
                    className={`w-full font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg ${
                      bike.isActive === false || bike.status !== 'available'
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 transform hover:scale-105'
                    }`}
                    disabled={bike.isActive === false || bike.status !== 'available'}
                  >
                    {bike.isActive === false ? 'Currently In Use' : 'View Details'}
                  </button>
                </div>

                {/* Hover Effect Overlay */}
                {bike.isActive !== false && (
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"></div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-2xl">
                  <div className="text-gray-400 mb-6">
                    <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bikes Available</h3>
                  <p className="text-gray-500">Check back later for available bikes in your area.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      
    </>
  );
};

export default BikeAvailabilitySection; 