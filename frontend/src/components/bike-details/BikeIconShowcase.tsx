import React from 'react';
import { BikeIcon } from './BikeIcon';
import { getBikeTypeInfo } from '../../utils/bike/bikeHelpers';

interface BikeIconShowcaseProps {
  className?: string;
}

export const BikeIconShowcase: React.FC<BikeIconShowcaseProps> = ({ className = "" }) => {
  const bikeTypes = ['Gyroscooter', 'eBikes', 'Segway', 'Electric Scooter', 'Bike'];

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Available Vehicle Types</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bikeTypes.map((bikeType) => {
          const typeInfo = getBikeTypeInfo(bikeType);
          return (
            <div
              key={bikeType}
              className={`${typeInfo.bgColor} ${typeInfo.borderColor} border rounded-lg p-4 transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-center mb-3">
                <div className={`${typeInfo.textColor} mr-3`}>
                  <BikeIcon bikeType={bikeType} className="w-8 h-8" />
                </div>
                <div>
                  <h4 className={`font-semibold ${typeInfo.textColor}`}>
                    {typeInfo.displayName}
                  </h4>
                </div>
              </div>
              <p className="text-sm text-gray-600">{typeInfo.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
