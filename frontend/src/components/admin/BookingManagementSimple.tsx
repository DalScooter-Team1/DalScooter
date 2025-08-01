import React, { useState, useEffect } from 'react';
import { adminService, type Booking } from '../../Services/adminService';

const BookingManagementSimple: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    // Fetch all bookings
    const fetchBookings = async () => {
        setLoading(true);
        setError('');

        try {
            console.log('Fetching bookings...');
            const response = await adminService.getAllBookings();
            console.log('Bookings response:', response);

            if (response.success) {
                setBookings(response.bookings || []);
            } else {
                setError(response.message || 'Failed to fetch bookings');
            }
        } catch (error: any) {
            console.error('Error fetching bookings:', error);
            setError(error.message || 'Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold text-gray-900">Loading Bookings...</h3>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-8">
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                    <div className="text-center py-12">
                        <div className="text-red-500 mb-6">
                            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Bookings</h3>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={fetchBookings}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900">Booking Management</h3>
                        <p className="text-gray-600 mt-2">Monitor and manage all customer bookings</p>
                    </div>
                    <button
                        onClick={fetchBookings}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2 font-semibold"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Refresh</span>
                    </button>
                </div>
                <div className="p-8">
                    {bookings.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-gray-400 mb-8">
                                <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Bookings Found</h3>
                            <p className="text-gray-600">No customer bookings have been made yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600">
                                    Showing {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="grid gap-6">
                                {bookings.map((booking, index) => (
                                    <div
                                        key={booking.bookingId}
                                        className="flex items-center space-x-6 p-6 border border-gray-200 rounded-3xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 transform hover:scale-[1.02] shadow-sm hover:shadow-xl"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="relative">
                                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg">
                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xl font-bold text-gray-900 truncate">
                                                Booking #{booking.bookingId}
                                            </p>
                                            <p className="text-gray-600 truncate">User: {booking.userId}</p>
                                            <p className="text-gray-600 truncate">Bike: {booking.bikeId}</p>
                                            <div className="mt-2 space-y-1">
                                                <p className="text-sm text-gray-500">
                                                    Start: {booking.startTimeFormatted || booking.startTime}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    End: {booking.endTimeFormatted || booking.endTime}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end space-y-4">
                                            <div className="flex space-x-3">
                                                <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold border ${booking.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200' :
                                                        booking.status === 'Approved' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                            'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                                <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold border ${booking.isUsed ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-gray-100 text-gray-800 border-gray-200'
                                                    }`}>
                                                    {booking.isUsed ? 'Used' : 'Unused'}
                                                </span>
                                            </div>
                                            {booking.price && (
                                                <div className="text-lg font-bold text-green-600">
                                                    ${booking.price}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingManagementSimple;
