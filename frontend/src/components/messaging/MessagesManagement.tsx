import React, { useState, useEffect } from 'react';
import { messagingService, type Message, type RespondConcernRequest } from '../../Services/messagingService';

const MessagesManagement: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [responseContent, setResponseContent] = useState('');
    const [responding, setResponding] = useState(false);
    const [responseError, setResponseError] = useState('');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await messagingService.getMessages();
            if (response.success) {
                // Sort messages by timestamp, newest first
                const sortedMessages = response.messages.sort((a, b) => b.timestamp - a.timestamp);
                setMessages(sortedMessages);
            }
        } catch (error: any) {
            setError(error.message || 'Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    };

    const handleRespondClick = (message: Message) => {
        if (message.messageType === 'concern' && message.status === 'pending') {
            setSelectedMessage(message);
            setResponseContent('');
            setResponseError('');
        }
    };

    const handleCancelResponse = () => {
        setSelectedMessage(null);
        setResponseContent('');
        setResponseError('');
    };

    const handleSubmitResponse = async () => {
        if (!selectedMessage || !responseContent.trim()) {
            setResponseError('Please enter a response');
            return;
        }

        setResponding(true);
        setResponseError('');

        try {
            const request: RespondConcernRequest = {
                messageId: selectedMessage.messageId,
                content: responseContent.trim(),
                originalTimestamp: selectedMessage.timestamp
            };

            const response = await messagingService.respondToConcern(request);

            if (response.success) {
                // Refresh messages to show the updated status
                await fetchMessages();
                setSelectedMessage(null);
                setResponseContent('');
            }
        } catch (error: any) {
            setResponseError(error.message || 'Failed to submit response');
        } finally {
            setResponding(false);
        }
    };

    const getStatusBadge = (message: Message) => {
        if (message.messageType === 'response') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Response
                </span>
            );
        }

        if (message.status === 'resolved') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Resolved
                </span>
            );
        }

        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending
            </span>
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="flex items-center space-x-3">
                        <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-gray-600">Loading messages...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Customer Messages</h2>
                            <p className="text-sm text-gray-600">Manage customer concerns and responses</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchMessages}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
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

            {/* Messages List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {messages.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Customer concerns will appear here when submitted.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {messages.map((message) => (
                            <div key={`${message.messageId}-${message.timestamp}`} className="p-6 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            {getStatusBadge(message)}
                                            <span className="text-sm text-gray-500">
                                                {messagingService.getTimeAgo(message.timestamp)}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {messagingService.formatTimestamp(message.timestamp)}
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-2 mb-3">
                                            <span className="text-sm font-medium text-gray-900">
                                                {message.userEmail || message.userId}
                                            </span>
                                            <span className="text-sm text-gray-500">•</span>
                                            <span className="text-sm text-gray-500">
                                                ID: {message.messageId.substring(0, 8)}...
                                            </span>
                                        </div>

                                        <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                                    </div>

                                    <div className="ml-4">
                                        {message.messageType === 'concern' && message.status === 'pending' && (
                                            <button
                                                onClick={() => handleRespondClick(message)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded-md transition duration-200"
                                            >
                                                Respond
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Response Modal */}
            {selectedMessage && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Respond to Customer Concern</h3>
                                <button
                                    onClick={handleCancelResponse}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Original Message */}
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Original Concern:</p>
                                <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.content}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    From: {selectedMessage.userEmail || selectedMessage.userId} •
                                    {messagingService.formatTimestamp(selectedMessage.timestamp)}
                                </p>
                            </div>

                            {/* Response Form */}
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Response
                                    </label>
                                    <textarea
                                        id="response"
                                        rows={6}
                                        value={responseContent}
                                        onChange={(e) => setResponseContent(e.target.value)}
                                        placeholder="Type your response to help resolve the customer's concern..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        disabled={responding}
                                    />
                                </div>

                                {responseError && (
                                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                                        {responseError}
                                    </div>
                                )}

                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleSubmitResponse}
                                        disabled={responding || !responseContent.trim()}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex justify-center items-center disabled:bg-blue-300 disabled:cursor-not-allowed"
                                    >
                                        {responding ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Sending Response...
                                            </>
                                        ) : (
                                            'Send Response'
                                        )}
                                    </button>

                                    <button
                                        onClick={handleCancelResponse}
                                        disabled={responding}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition duration-200 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagesManagement;
