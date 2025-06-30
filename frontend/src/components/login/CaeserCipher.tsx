
import React, { useState } from 'react';

interface CaesarCipherProps {
    cipherText: string;
    shift: string;
    onSolve: (solution: string) => void;
    loading: boolean;
    error: string;
}

const CaeserCipher: React.FC<CaesarCipherProps> = ({ cipherText, shift, onSolve, loading, error }) => {
    const [solution, setSolution] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSolve(solution.toUpperCase());
    };

    return (
        <div>
            <h2>Caesar Cipher Challenge</h2>
            <p><strong>Encrypted Text:</strong> {cipherText}</p>
            <p><strong>Shift:</strong> {shift}</p>
            <p><strong>Instructions:</strong> Decode the text and enter the original word</p>
            
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Solution:</label>
                    <input
                        type="text"
                        value={solution}
                        onChange={(e) => setSolution(e.target.value.toUpperCase())}
                        required
                        disabled={loading}
                        placeholder="Enter decoded text"
                    />
                </div>
                {error && <div style={{color: 'red'}}>{error}</div>}
                <button type="submit" disabled={loading || !solution}>
                    {loading ? 'Verifying...' : 'Submit Solution'}
                </button>
            </form>
        </div>
    );
};

export default CaeserCipher;