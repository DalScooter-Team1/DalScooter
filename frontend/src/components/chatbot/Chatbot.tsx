import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    isTyping?: boolean;
}

interface ChatbotProps {
    isOpen: boolean;
    onClose: () => void;
    isGuest?: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, isGuest = false }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Initialize with welcome message
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMessage: Message = {
                id: '1',
                text: isGuest
                    ? 'Hello! 👋 Welcome to DALScooter! I\'m your assistant and I\'m here to help you even as a guest. How can I assist you today?'
                    : 'Hello! 👋 I\'m your DALScooter assistant. How can I help you today?',
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages([welcomeMessage]);
        }
    }, [isOpen, messages.length, isGuest]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Clear messages when user logs out (listen for auth changes)
    useEffect(() => {
        const handleStorageChange = () => {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                // User logged out, clear messages
                setMessages([]);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            text: text.trim(),
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // Simulate bot typing delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Here you'll integrate with your friend's Amazon Lex backend
            // For now, we'll use a mock response
            const botResponse = await generateBotResponse(text);

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponse,
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Mock bot response - replace this with your Amazon Lex integration
    const generateBotResponse = async (userInput: string): Promise<string> => {
        const input = userInput.toLowerCase();

        if (input.includes('hello') || input.includes('hi')) {
            return isGuest
                ? 'Hello! Welcome to DALScooter! As a guest, you can browse our bikes, check pricing, and learn about our services. Would you like to see available bikes or learn more about our rental process?'
                : 'Hello! How can I assist you with DALScooter today?';
        } else if (input.includes('guest') || input.includes('register') || input.includes('account')) {
            return isGuest
                ? 'As a guest, you can browse bikes and get information, but to book a bike you\'ll need to register for an account. Would you like me to guide you through the registration process?'
                : 'I can help you with account-related questions. What would you like to know?';
        } else if (input.includes('bike') || input.includes('scooter')) {
            return 'I can help you find available bikes, check pricing, or assist with bookings. What would you like to know?';
        } else if (input.includes('price') || input.includes('cost')) {
            return 'Our bikes start at $10/hour. Prices may vary by bike type. Would you like to see available bikes and their pricing?';
        } else if (input.includes('book') || input.includes('rent')) {
            return isGuest
                ? 'To book a bike, you\'ll need to create an account first. As a guest, you can browse available bikes and their pricing. Would you like me to help you find bikes or guide you to registration?'
                : 'To book a bike, you can browse available bikes on our main page or go to your dashboard. Need help finding a specific type of bike?';
        } else if (input.includes('help')) {
            return isGuest
                ? 'I can help you with:\n• Browsing available bikes\n• Pricing information\n• Registration guidance\n• General information about DALScooter\n\nWhat would you like to know more about?'
                : 'I can help you with:\n• Finding available bikes\n• Booking information\n• Pricing details\n• Account questions\n• General support\n\nWhat would you like to know more about?';
        } else {
            return isGuest
                ? 'Thanks for your interest in DALScooter! As a guest, I can help you learn about our bikes, pricing, and services. To book a bike, you\'ll need to register. What would you like to know?'
                : 'Thanks for your message! I\'m here to help with bike rentals, bookings, and any questions about DALScooter. Could you tell me more about what you need assistance with?';
        }
    };

    const handleClearChat = () => {
        setMessages([]);
        // Re-add welcome message
        const welcomeMessage: Message = {
            id: '1',
            text: isGuest
                ? 'Hello! 👋 Welcome back to DALScooter! I\'m your assistant and I\'m here to help you even as a guest. How can I assist you today?'
                : 'Hello! 👋 I\'m your DALScooter assistant. How can I help you today?',
            sender: 'bot',
            timestamp: new Date()
        };
        setMessages([welcomeMessage]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed top-20 right-6 z-50 w-80 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col animate-scale-in overflow-hidden" style={{ maxWidth: '90vw', maxHeight: '80vh' }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-800 p-4 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <span className="text-amber-600 font-bold text-sm">🤖</span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm" id="chatbot-title">DALScooter Assistant</h3>
                        <p className="text-xs opacity-80">
                            {isGuest ? 'Guest Access • Online' : 'Online'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {/* Clear chat button */}
                    <button
                        onClick={handleClearChat}
                        className="text-gray-700 hover:text-gray-900 transition-colors p-1 rounded"
                        title="Clear chat"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
                style={{ minHeight: '320px' }}
                role="log"
                aria-live="polite"
                aria-label="Chat messages"
            >
                {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white rounded-lg p-3 max-w-xs shadow-sm">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
                <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
            </div>
        </div>
    );
};

export default Chatbot;
