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

  return (
    <>
      {showHeader && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
            <div className="text-sm text-gray-600">
              {totalAvailable} available • Updated {lastUpdated ? formatDate(lastUpdated) : 'N/A'}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {bikes.length > 0 ? (
            bikes.map((bike) => (
              <div
                key={bike.bikeId}
                onClick={() => handleBikeClick(bike)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg">
                        {bike.bikeType === 'Gyroscooter' && (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                        {bike.bikeType === 'eBikes' && (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {bike.bikeType === 'Segway' && (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{bike.bikeId}</h4>
                        <p className="text-sm text-gray-600">{bike.bikeType}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <p>{bike.location.address}</p>
                        <p>Battery: {bike.features.batteryLife}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-amber-600">${bike.hourlyRate}/hr</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bike.status === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {bike.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500">No bikes available at this time.</p>
            </div>
          )}
        </div>
      )}

      {/* Individual Bike Details Modal */}
      {showModal && selectedBike && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{selectedBike.bikeId}</h2>
                  <p className="text-amber-100">{selectedBike.bikeType}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-amber-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Bike Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h3 className="font-semibold text-amber-900 mb-2">Bike ID</h3>
                  <p className="text-lg font-bold text-amber-600">{selectedBike.bikeId}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Hourly Rate</h3>
                  <p className="text-lg font-bold text-blue-600">${selectedBike.hourlyRate}/hr</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">Status</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedBike.status === 'available' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedBike.status}
                  </span>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">Battery Life</h3>
                  <p className="text-lg font-bold text-green-600">{selectedBike.features.batteryLife}%</p>
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Address</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedBike.location.address}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Latitude</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedBike.location.latitude}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Longitude</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedBike.location.longitude}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bike Features */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bike Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Max Speed</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedBike.features.maxSpeed} km/h</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Weight</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedBike.features.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Height Adjustment</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedBike.features.heightAdjustment ? 'Available' : 'Not Available'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timestamps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Created</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(selectedBike.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Updated</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(selectedBike.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-lg hover:from-amber-500 hover:to-yellow-600 transition-all">
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