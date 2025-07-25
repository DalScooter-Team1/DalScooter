import React, { useState, useEffect } from 'react';
import SubmitConcern from './SubmitConcern';
import { messagingService, type Message, type Conversation } from '../../Services/messagingService';

const CustomerMessaging: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch customer messages when history tab is selected
    useEffect(() => {
        if (activeTab === 'history') {
            fetchCustomerMessages();
        }
    }, [activeTab]);

    const fetchCustomerMessages = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await messagingService.getCustomerMessages();
            if (response.success) {
                setConversations(response.conversations || []);
            } else {
                setError('Failed to fetch messages');
                setConversations([]);
            }
        } catch (error: any) {
            setError(error.message || 'Failed to fetch messages');
            setConversations([]);
        } finally {
            setLoading(false);
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

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('submit')}
                            className={`${activeTab === 'submit'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            Submit Concern
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`${activeTab === 'history'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            My Messages
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'submit' && (
                        <div>
                            <SubmitConcern onSuccess={fetchCustomerMessages} />
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div>
                            {/* Header with Refresh Button */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">My Messages</h3>
                                <button
                                    onClick={fetchCustomerMessages}
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-200 flex items-center space-x-2 disabled:opacity-50"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>Refresh</span>
                                </button>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
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

                            {/* Loading State */}
                            {loading && (
                                <div className="text-center py-12">
                                    <div className="flex items-center justify-center space-x-3">
                                        <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="text-gray-600">Loading messages...</span>
                                    </div>
                                </div>
                            )}

                            {/* Messages List */}
                            {!loading && !error && (
                                <>
                                    {(conversations || []).length === 0 ? (
                                        <div className="text-center py-12">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Your submitted concerns and responses will appear here.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {(conversations || []).map((conversation) => (
                                                <div key={conversation.conversationId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                    {/* Original Concern */}
                                                    <div className="mb-4">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex items-center space-x-3">
                                                                {getStatusBadge(conversation.concern)}
                                                                <span className="text-sm text-gray-500">
                                                                    {messagingService.getTimeAgo(conversation.concern.timestamp)}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-gray-400">
                                                                {messagingService.formatTimestamp(conversation.concern.timestamp)}
                                                            </span>
                                                        </div>
                                                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="text-sm font-medium text-gray-900">Your Concern</h4>
                                                            </div>
                                                            <p className="text-gray-700 text-sm leading-relaxed">{conversation.concern.content}</p>
                                                        </div>
                                                    </div>

                                                    {/* Responses */}
                                                    {conversation.responses && conversation.responses.length > 0 && (
                                                        <div className="space-y-3">
                                                            <h5 className="text-sm font-medium text-gray-600">Responses:</h5>
                                                            {conversation.responses.map((response) => (
                                                                <div key={`${response.messageId}-${response.timestamp}`} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className="text-xs text-blue-600 font-medium">Franchise Response</span>
                                                                        <span className="text-xs text-gray-500">
                                                                            {messagingService.formatTimestamp(response.timestamp)}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-gray-700 text-sm leading-relaxed">{response.content}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-blue-900">How It Works</h3>
                        </div>
                    </div>
                    <ul className="mt-3 text-sm text-blue-800 space-y-1">
                        <li>• Submit your concern with details</li>
                        <li>• Our team reviews and responds</li>
                        <li>• Get notified when resolved</li>
                    </ul>
                </div>

                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-lg mr-3">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-green-900">Response Time</h3>
                        </div>
                    </div>
                    <p className="mt-3 text-sm text-green-800">
                        Most concerns are resolved within 24-48 hours during business days.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CustomerMessaging;
