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
        <div className="mt-4">
            <h2 className="text-xl font-medium text-gray-800 mb-4">Security Question</h2>
            <div className="bg-blue-50 p-4 rounded-md mb-6">
                <p className="text-blue-800">
                    <span className="font-semibold">Question:</span> {question}
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="security-answer" className="block text-sm font-medium text-gray-700">
                        Your Answer:
                    </label>
                    <input
                        id="security-answer"
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        required
                        disabled={loading}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                </div>
                {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
                <button 
                    type="submit" 
                    disabled={loading || !answer}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                    {loading ? 'Verifying...' : 'Submit Answer'}
                </button>
            </form>
        </div>
    );
};

export default QuestionAnswer;