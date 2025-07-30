import React, { useEffect, useState } from 'react';
import type { BikeAvailabilityResponse, BikeBackendResponse, BikeType } from '../Services/bikeInventoryService';


export type BookingData = {
  bikeId: string;
  startTime: string;
  endTime: string;
};


type BookingModalContentProps = {
  data: Array<BikeModalData> | undefined;
  onSubmit: (data: BookingData) => void;
};


export interface BikeModalData {
  type: string;
  inventory: number;
  label: string;
  hourlyRate: number;
}



const BookingModalContent: React.FC<BookingModalContentProps> = ({ data, onSubmit }) => {
  const [bikes, setBikes] = useState(data || []);
  const [selectedBike, setSelectedBike] = useState<string>('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState('');

  function handleBooking() {
    const bookingData: BookingData = {
      bikeId: selectedBike,
      startTime,
      endTime
    };
    onSubmit(bookingData);
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-6 max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">Reserve Your Ride</h2>

      <div className="w-full max-w-md space-y-4">
        <select
          className="w-full p-2 border rounded"
          value={selectedBike || ''}
          onChange={(e) => setSelectedBike(e.target.value)}
        >
          <option value="">Select Bike Type</option>
          {bikes.map((bike: any) => (
            <option key={bike.bikeId} value={bike.bikeId}>
              {bike.label} | ${bike.hourlyRate}/hr
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          className="w-full p-2 border rounded"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        <input
          type="datetime-local"
          className="w-full p-2 border rounded"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />

        <button
          onClick={handleBooking}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          Book Ride
        </button>

        {message && <p className="text-center text-green-600 mt-2">{message}</p>}
      </div>
    </div>
  );
};

export default BookingModalContent;
