import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import dalImage from "../assets/Dal image.jpg";
import { bikeInventoryService } from "../Services/bikeInventoryService";
import type { BikeAvailabilityResponse } from "../Services/bikeInventoryService";

// Interface for the bike availability data
interface BikeAvailability {
  bikeType: string;
  availableCount: number;
  status: string;
  pricing: {
    minHourlyRate: number;
    maxHourlyRate: number;
    avgHourlyRate: number;
  };
  features: {
    maxSpeed: string;
    batteryLife: string;
    weightCapacity: string;
    specialFeatures: string[];
  };
  sampleBikes: any[];
}

function Home() {
  const [bikeAvailability, setBikeAvailability] = useState<BikeAvailability[]>([]);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        setLoading(true);
        const response = await bikeInventoryService.getAvailableBikes();
        console.log(response);
        if (response.success && response.bikeAvailability) {
          setBikeAvailability(response.bikeAvailability);
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex h-screen">
      {/* Left Panel with Image */}
      <div className="hidden md:block w-1/2 relative">
        <img
          src={dalImage}
          alt="Dalhousie University"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-black/50 to-black/70 pointer-events-none text-white p-8 flex flex-col space-y-3"
          style={{ justifyContent: "center", alignItems: "flex-end" }}
        >
          <h1 className="text-4xl font-bold">DALScooter</h1>
          <p className="text-xl">Sustainable Campus Mobility</p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Easy campus transportation</li>
            <li>Eco-friendly & sustainable</li>
            <li>Convenient for students & faculty</li>
          </ul>
        </div>
      </div>

      {/* Right Panel with Bikes */}
      <div className="w-1/2 p-10 flex flex-col overflow-y-auto">
        <div className="flex justify-end space-x-4 mb-4">
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </div>
        
        <div className="mb-6">
          <h2 className="text-3xl font-semibold mb-2">Available Bikes</h2>
          <p className="text-gray-600 text-sm">
            Total Available: {totalAvailable} • Last Updated: {lastUpdated ? formatDate(lastUpdated) : 'N/A'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-gray-500">Loading bike availability...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bikeAvailability.length > 0 ? (
              bikeAvailability.map((bike, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-6 shadow-sm ${
                    bike.status === 'available' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{bike.bikeType}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bike.status === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {bike.status === 'available' ? 'Available' : 'Unavailable'}
                        </span>
                        <span className="text-sm text-gray-600">
                          {bike.availableCount} bikes
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        ${bike.pricing.avgHourlyRate}/hr
                      </p>
                      {bike.pricing.minHourlyRate !== bike.pricing.maxHourlyRate && (
                        <p className="text-sm text-gray-500">
                          ${bike.pricing.minHourlyRate} - ${bike.pricing.maxHourlyRate}/hr
                        </p>
                      )}
                    </div>
                  </div>

                  {bike.features.specialFeatures.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                      <div className="flex flex-wrap gap-2">
                        {bike.features.specialFeatures.map((feature, featureIndex) => (
                          <span
                            key={featureIndex}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sample Bikes Section */}
                  {bike.sampleBikes && bike.sampleBikes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-3">Available Bikes:</p>
                      <div className="space-y-3">
                        {bike.sampleBikes.map((sampleBike, bikeIndex) => (
                          <div
                            key={bikeIndex}
                            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-gray-800 text-sm">
                                  Bike ID: {sampleBike.bikeId}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Access Code: {sampleBike.accessCode}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  sampleBike.status === 'available' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {sampleBike.status}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <p className="text-gray-600">Location:</p>
                                <p className="text-gray-800 font-medium">{sampleBike.location.address}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Rate:</p>
                                <p className="text-gray-800 font-medium">${sampleBike.hourlyRate}/hr</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Battery:</p>
                                <p className="text-gray-800 font-medium">{sampleBike.features.batteryLife}%</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Max Speed:</p>
                                <p className="text-gray-800 font-medium">{sampleBike.features.maxSpeed} km/h</p>
                              </div>
                            </div>

                            {sampleBike.features.heightAdjustment && (
                              <div className="mt-2">
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                  Height Adjustable
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {bike.sampleBikes && bike.sampleBikes.length === 0 && bike.status === 'available' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500 text-center py-2">
                        No individual bikes currently available
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No bike information available at this time.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
