import React, { useState, useEffect } from 'react';
import Chatbot from './Chatbot';

const ChatbotWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // Check if user is on specific pages where chatbot should be positioned differently
    useEffect(() => {
        const checkVisibility = () => {
            const currentPath = window.location.pathname;
            // Show chatbot on all pages including admin pages
            // No paths are excluded - chatbot available everywhere
            setIsVisible(true);
        };

        checkVisibility();

        // Listen for route changes (for SPA navigation)
        const originalPushState = window.history.pushState;
        const originalReplaceState = window.history.replaceState;

        window.history.pushState = function (...args) {
            originalPushState.apply(window.history, args);
            setTimeout(checkVisibility, 0);
        };

        window.history.replaceState = function (...args) {
            originalReplaceState.apply(window.history, args);
            setTimeout(checkVisibility, 0);
        };

        // Listen for popstate (back/forward buttons)
        const handlePopState = () => {
            setTimeout(checkVisibility, 0);
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.history.pushState = originalPushState;
            window.history.replaceState = originalReplaceState;
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    // Check for guest user access
    const isGuestUser = () => {
        const accessToken = localStorage.getItem('accessToken');
        const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
        return !accessToken || userRoles.length === 0;
    };

    // Add pulse animation for new users
    useEffect(() => {
        const hasSeenChatbot = localStorage.getItem('hasSeenChatbot');
        if (!hasSeenChatbot) {
            setHasNewMessage(true);
            // Remove the notification after 10 seconds
            const timer = setTimeout(() => {
                setHasNewMessage(false);
                localStorage.setItem('hasSeenChatbot', 'true');
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, []);

    // Simulate new message notification for inactive users
    useEffect(() => {
        if (!isOpen && isVisible) {
            const timer = setTimeout(() => {
                setHasNewMessage(true);
            }, 30000); // Show notification after 30 seconds of inactivity

            return () => clearTimeout(timer);
        }
    }, [isOpen, isVisible]);

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setHasNewMessage(false);
            localStorage.setItem('hasSeenChatbot', 'true');
        }

        // Announce to screen readers
        const announcement = isOpen ? 'Chatbot closed' : 'Chatbot opened';
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.textContent = announcement;
        document.body.appendChild(announcer);
        setTimeout(() => document.body.removeChild(announcer), 1000);
    };

    // Show chatbot on all pages (including admin pages)
    if (!isVisible) return null;

    return (
        <>
            {/* Floating Action Button - Positioned at bottom right */}
            <div className="fixed bottom-6 right-6 z-40">
                <button
                    onClick={toggleChatbot}
                    className={`group relative w-14 h-14 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-amber-300 focus:ring-opacity-50 ${hasNewMessage ? 'animate-pulse' : ''
                        }`}
                    aria-label={isOpen ? 'Close chat window' : 'Open chat window'}
                    aria-expanded={isOpen}
                    aria-controls="chatbot-window"
                >
                    {/* Chat Icon */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isOpen ? 'opacity-0 rotate-180' : 'opacity-100 rotate-0'
                        }`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>

                    {/* Close Icon */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'
                        }`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>

                    {/* New Message Indicator */}
                    {hasNewMessage && !isOpen && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce">
                            <div className="w-full h-full bg-red-500 rounded-full animate-ping"></div>
                            <span className="sr-only">New message available</span>
                        </div>
                    )}

                    {/* Breathing effect for guest users */}
                    {isGuestUser() && !isOpen && (
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 animate-ping opacity-30"></div>
                    )}
                </button>
            </div>

            {/* Enhanced Chatbot Modal with phone-like dimensions */}
            <div id="chatbot-window" role="dialog" aria-modal="true" aria-labelledby="chatbot-title">
                <Chatbot
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    isGuest={isGuestUser()}
                />
            </div>

            {/* Custom styles for animations */}
            <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
        </>
    );
};

export default ChatbotWidget;
