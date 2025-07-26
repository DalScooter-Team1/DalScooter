import React, { useState } from 'react';
import { messagingService, type SubmitConcernRequest } from '../../Services/messagingService';

interface SubmitConcernProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

const SubmitConcern: React.FC<SubmitConcernProps> = ({ onSuccess, onCancel }) => {
    const [content, setContent] = useState('');
    const [bookingReference, setBookingReference] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            setError('Please describe your concern');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const request: SubmitConcernRequest = {
                content: content.trim(),
                ...(bookingReference.trim() && { bookingReference: bookingReference.trim() })
            };

            const response = await messagingService.submitConcern(request);

            if (response.success) {
                setSuccess('Your concern has been submitted successfully! Our team will respond soon.');
                setContent('');
                setBookingReference('');

                // Call success callback after a delay
                setTimeout(() => {
                    if (onSuccess) onSuccess();
                }, 2000);
            }
        } catch (error: any) {
            setError(error.message || 'Failed to submit concern');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Submit a Concern</h2>
                    <p className="text-sm text-gray-600">Have an issue? Let us know and we'll help you resolve it.</p>
                </div>
            </div>

            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-800">{success}</p>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="bookingReference" className="block text-sm font-medium text-gray-700 mb-1">
                        Booking Reference (Optional)
                    </label>
                    <input
                        type="text"
                        id="bookingReference"
                        value={bookingReference}
                        onChange={(e) => setBookingReference(e.target.value)}
                        placeholder="Enter your booking reference if applicable"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                        Describe Your Concern <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="content"
                        rows={6}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Please provide details about your concern or issue..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                        disabled={loading}
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Be specific about the issue you're experiencing for faster resolution.
                    </p>
                </div>

                <div className="flex space-x-3 pt-4">
                    <button
                        type="submit"
                        disabled={loading || !content.trim()}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex justify-center items-center disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </>
                        ) : (
                            'Submit Concern'
                        )}
                    </button>

                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition duration-200 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default SubmitConcern;
