import React, { useState, useEffect } from 'react';
import { bikeInventoryService } from '../Services/bikeInventoryService';
import type { BikeAvailabilityResponse } from '../Services/bikeInventoryService';

// Interface for individual bike data
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

interface BikeAvailabilitySectionProps {
  title?: string;
  showHeader?: boolean;
}

const BikeAvailabilitySection: React.FC<BikeAvailabilitySectionProps> = ({ 
  title = "Available Bikes",
  showHeader = true 
}) => {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [showModal, setShowModal] = useState(false);

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
    setSelectedBike(bike);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBike(null);
  };

  const getBikeIcon = (bikeType: string) => {
    switch (bikeType) {
      case 'Gyroscooter':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'eBikes':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Segway':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                onClick={() => handleBikeClick(bike)}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
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

                {/* Header with Icon */}
                <div className="bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white bg-opacity-90 p-4 rounded-2xl shadow-lg">
                        <div className="text-amber-600">
                          {getBikeIcon(bike.bikeType)}
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
                  <button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold py-3 px-4 rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 transform hover:scale-105 shadow-lg">
                    View Details
                  </button>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"></div>
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

      {/* Enhanced Modal */}
      {showModal && selectedBike && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
            {/* Modal Header */}
                          <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-white p-8">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white bg-opacity-90 p-4 rounded-2xl shadow-lg">
                      <div className="text-amber-600">
                        {getBikeIcon(selectedBike.bikeType)}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">{selectedBike.bikeId}</h2>
                      <p className="text-amber-100 text-lg">{selectedBike.bikeType}</p>
                    </div>
                  </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-amber-100 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8 max-h-[calc(90vh-200px)] overflow-y-auto">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-2xl border border-amber-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-500 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-700">Rate</p>
                      <p className="text-xl font-bold text-amber-900">${selectedBike.hourlyRate}/hr</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <span className="text-white text-lg">🔋</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700">Battery</p>
                      <p className={`text-xl font-bold ${getBatteryColor(selectedBike.features.batteryLife)}`}>
                        {selectedBike.features.batteryLife}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">Speed</p>
                      <p className="text-xl font-bold text-blue-900">{selectedBike.features.maxSpeed} km/h</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-700">Weight</p>
                      <p className="text-xl font-bold text-purple-900">{selectedBike.features.weight} kg</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Location Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Address</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedBike.location.address}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Latitude</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedBike.location.latitude}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Longitude</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedBike.location.longitude}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Features */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Additional Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Height Adjustment</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedBike.features.heightAdjustment 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {selectedBike.features.heightAdjustment ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedBike.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {selectedBike.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Timestamps
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-600 mb-1">Created</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(selectedBike.createdAt)}</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-600 mb-1">Last Updated</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(selectedBike.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                >
                  Close
                </button>
                <button className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 transform hover:scale-105 shadow-lg">
                  Reserve This Bike
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BikeAvailabilitySection; 