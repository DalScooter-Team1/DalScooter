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
    const [sessionId, setSessionId] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const userType = isGuest ? '' : localStorage.getItem('userRole') || '';
    const userId   = isGuest ? '' : localStorage.getItem('userId')   || '';

    const API_URL = import.meta.env.VITE_SERVER;

    // Initialize with welcome message
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMessage: Message = {
                id: '1',
                text: isGuest
                    ? "Hello! 👋 Welcome to DALScooter! I'm your assistant and I'm here to help you even as a guest. How can I assist you today?"
                    : "Hello! 👋 I'm your DALScooter assistant. How can I help you today?",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages([welcomeMessage]);
        }
    }, [isOpen, messages.length, isGuest]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Clear on logout
    useEffect(() => {
        const handleStorageChange = () => {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setMessages([]);
                setSessionId('');
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

        const rawToken = localStorage.getItem('decodedToken');
        const decoded = JSON.parse(rawToken) as {
            'cognito:username': string;
            'cognito:groups': string[];
        };
        const userId = decoded['cognito:username'];
        const userType = decoded['cognito:groups'][0];

        console.log(userType +"----"+userId)
        // 1) Show user bubble
        const userMessage: Message = {
            id: Date.now().toString(),
            text: text.trim(),
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        // 2) Build payload
        const payload: any = { text: text.trim() };
        if (sessionId) payload.sessionId = sessionId;
        if (userType)  payload.userType  = userType;
        if (userId)    payload.userId    = userId;

        try {
            // 3) Call the BotHandler API
            const res = await fetch(`${API_URL}/bot`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Unknown error");
            }

            const data = await res.json();

            if (data.authorized === false) {
                // show as system message
                const sysMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: data.message,
                    sender: 'bot',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, sysMsg]);
            } else {

                const botMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: data.message,
                    sender: 'bot',
                    timestamp: new Date()
                };

                setMessages(prev => [...prev, botMessage]);

                if (data.sessionId) {
                    setSessionId(data.sessionId);
                }
            }
        } catch (e: any) {
            console.error("Chatbot error:", e);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I'm having trouble connecting right now. Please try again later.",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = () => {
        setMessages([]);
        setSessionId("");
        const welcomeMessage: Message = {
            id: '1',
            text: isGuest
                ? "Hello! 👋 Welcome back to DALScooter! I'm your assistant and I'm here to help you even as a guest. How can I assist you today?"
                : "Hello! 👋 I'm your DALScooter assistant. How can I help you today?",
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
                {/* ... header unchanged ... */}
            </div>

            {/* Messages */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
                role="log"
                aria-live="polite"
                aria-label="Chat messages"
                style={{ minHeight: '320px' }}
            >
                {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
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

            {/* Input */}
            <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
                <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
            </div>
        </div>
    );
};

export default Chatbot;
