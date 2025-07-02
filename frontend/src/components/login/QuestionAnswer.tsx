import React, { useState } from 'react';

interface QuestionAnswerProps {
    question: string;
    onAnswer: (answer: string) => void;
    loading: boolean;
    error: string;
}

const QuestionAnswer: React.FC<QuestionAnswerProps> = ({ question, onAnswer, loading, error }) => {
    const [answer, setAnswer] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAnswer(answer);
    };

    return (
        <div className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <div className="flex items-center mb-2">
                    <div className="bg-amber-100 p-1.5 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h3 className="font-medium text-amber-800">Your Security Question</h3>
                </div>
                <p className="text-amber-800 ml-9">
                    {question}
                </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="security-answer" className="block text-sm font-medium text-gray-700">
                        Your Answer
                    </label>
                    <input
                        id="security-answer"
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        required
                        disabled={loading}
                        placeholder="Enter your answer exactly as registered"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100"
                    />
                </div>
                
                {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                        <div className="flex items-start">
                            <svg className="h-5 w-5 text-red-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="font-medium">{error}</p>
                                <p className="text-xs mt-1">Please ensure your answer matches exactly what you provided during registration.</p>
                            </div>
                        </div>
                    </div>
                )}
                
                <button 
                    type="submit" 
                    disabled={loading || !answer}
                    className="w-full bg-[#ffd501] hover:bg-amber-500 text-black font-medium py-3 px-4 rounded-md transition duration-200 flex justify-center items-center disabled:bg-amber-300"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying...
                        </>
                    ) : 'Submit Answer'}
                </button>
            </form>
        </div>
    );
};

export default QuestionAnswer;