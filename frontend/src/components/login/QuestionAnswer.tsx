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
        <div>
            <h2>Security Question</h2>
            <p><strong>Question:</strong> {question}</p>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Answer:</label>
                    <input
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                {error && <div style={{color: 'red'}}>{error}</div>}
                <button type="submit" disabled={loading || !answer}>
                    {loading ? 'Verifying...' : 'Submit Answer'}
                </button>
            </form>
        </div>
    );
};

export default QuestionAnswer;