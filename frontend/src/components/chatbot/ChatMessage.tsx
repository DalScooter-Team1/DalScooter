import React from 'react';
import type { Message } from './Chatbot';

interface ChatMessageProps {
    message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.sender === 'user';

    const formatTime = (timestamp: Date) => {
        return timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
            <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow-sm ${isUser
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-800'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}>
                {/* Message text */}
                <div className="text-sm whitespace-pre-wrap break-words">
                    {message.text}
                </div>

                {/* Timestamp */}
                <div className={`text-xs mt-1 ${isUser ? 'text-amber-800' : 'text-gray-500'
                    }`}>
                    {formatTime(message.timestamp)}
                </div>
            </div>

            {/* Avatar for bot messages */}
            {!isUser && (
                <div className="w-6 h-6 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center ml-2 mt-1 flex-shrink-0">
                    <span className="text-white text-xs">🤖</span>
                </div>
            )}
        </div>
    );
};

export default ChatMessage;
