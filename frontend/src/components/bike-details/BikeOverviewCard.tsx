import React from 'react';
import type { Bike } from './types';
import { BikeIcon } from './BikeIcon';

interface BikeOverviewCardProps {
  bike: Bike;
}

export const BikeOverviewCard: React.FC<BikeOverviewCardProps> = ({ bike }) => {
  const getBatteryColor = (batteryLife: number) => {
    if (batteryLife >= 80) return 'text-green-600';
    if (batteryLife >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-CA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-6">
            <div className="bg-white bg-opacity-90 p-4 rounded-2xl shadow-lg backdrop-blur-sm">
              <div className="text-amber-600">
                <BikeIcon bikeType={bike.bikeType} />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">{bike.bikeId}</h1>
              <p className="text-amber-100 text-lg font-medium">{bike.bikeType}</p>
              <div className="flex items-center mt-3">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                  bike.isActive === false
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : bike.status === 'available' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    bike.isActive === false 
                      ? 'bg-red-500'
                      : bike.status === 'available' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></span>
                  {bike.isActive === false ? 'In Use Currently' : bike.status === 'available' ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100 hover:shadow-md transition-shadow">
            <p className="text-2xl font-bold text-amber-600">${bike.hourlyRate}</p>
            <p className="text-sm text-gray-600 font-medium">per hour</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100 hover:shadow-md transition-shadow">
            <p className={`text-2xl font-bold ${getBatteryColor(bike.features.batteryLife)}`}>
              {bike.features.batteryLife}%
            </p>
            <p className="text-sm text-gray-600 font-medium">battery</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
            <p className="text-2xl font-bold text-blue-600">{bike.features.maxSpeed}</p>
            <p className="text-sm text-gray-600 font-medium">km/h max</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100 hover:shadow-md transition-shadow">
            <p className="text-2xl font-bold text-purple-600">{bike.features.weight}</p>
            <p className="text-sm text-gray-600 font-medium">kg weight</p>
          </div>
        </div>

        {/* Location */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Location
          </h3>
          <p className="text-gray-700">{bike.location.address}</p>
          <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
            <span>Lat: {bike.location.latitude}</span>
            <span>Lng: {bike.location.longitude}</span>
          </div>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Height Adjustment</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                bike.features.heightAdjustment 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {bike.features.heightAdjustment ? 'Available' : 'Not Available'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Created</span>
              <span className="text-sm text-gray-600">{formatDate(bike.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
