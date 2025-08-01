import { useState } from 'react';
import { bookingService } from '../Services/bookingService';
import { isAuthenticated } from '../utils/authUtils';
import type { Bike } from '../components/bike-details/types';

export const useBooking = () => {
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState<string>('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleBooking = async (
    bike: Bike | null,
    selectedHours: number,
    onFeedbackPopup: () => void
  ) => {
    setBookingLoading(true);

    try {
      // Check if user is authenticated first
      if (!isAuthenticated()) {
        setShowLoginPrompt(true);
        setBookingLoading(false);
        return;
      }

      const decodedToken = localStorage.getItem('decodedToken'); 
      const token = JSON.parse(decodedToken || '{}');

      if (!token.sub) {
        setShowLoginPrompt(true);
        setBookingLoading(false);
        return;
      }

      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + selectedHours * 60 * 60 * 1000);

      const bookingData = {
        bikeId: bike?.bikeId || '',
        userId: token.sub,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        price: bike?.hourlyRate ? bike.hourlyRate * selectedHours : 0
      };

      console.log('Creating booking with data:', bookingData);

      // Use the booking service
      const result = await bookingService.createBooking(bookingData);
      
      console.log('Booking result received:', result);

      if (result.success) {
        console.log('Booking successful');
        setBookingSuccess(true);
        
        // Set booking reference
        const bookingRef = result.bookingId || `BK-${Date.now()}`;
        console.log('Booking ID:', bookingRef);
        setBookingReference(bookingRef);
        
        // Show feedback popup after successful booking
        console.log('Setting timeout to show feedback popup in 1.5 seconds...');
        setTimeout(() => {
          console.log('Showing feedback popup now');
          onFeedbackPopup();
        }, 1500);
      } else {
        console.error('Booking failed:', result.error);
        alert(`Booking failed: ${result.error}`);
      }

    } catch (error) {
      console.error('Error during booking:', error);
      alert('There was an error processing your booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBookAnother = () => {
    setBookingSuccess(false);
  };

  return {
    bookingLoading,
    bookingSuccess,
    bookingReference,
    showLoginPrompt,
    setShowLoginPrompt,
    handleBooking,
    handleBookAnother,
    setBookingSuccess
  };
};
