import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
    const [message, setMessage] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when component mounts or becomes enabled
    useEffect(() => {
        if (!disabled && inputRef.current) {
            inputRef.current.focus();
        }
    }, [disabled]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <div className="flex-1 relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={disabled ? "Bot is typing..." : "Type your message..."}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />

                {/* Character counter for long messages */}
                {message.length > 200 && (
                    <div className="absolute -top-6 right-0 text-xs text-gray-500">
                        {message.length}/500
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={disabled || !message.trim()}
                className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white p-2 rounded-full hover:from-amber-500 hover:to-yellow-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
                <svg className="w-4 h-4 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            </button>
        </form>
    );
};

export default ChatInput;
