
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
        <div className="mt-4">
            <h2 className="text-xl font-medium text-gray-800 mb-4">Caesar Cipher Challenge</h2>
            <div className="bg-purple-50 p-4 rounded-md mb-6 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-800">Encrypted Text:</span>
                    <span className="text-purple-900 font-mono text-lg">{cipherText}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-800">Shift:</span>
                    <span className="text-purple-900 font-mono text-lg">{shift}</span>
                </div>
                <p className="text-sm text-purple-700 pt-2">
                    <span className="font-semibold">Instructions:</span> Decode the text by shifting each letter back by the number shown above, then enter the original word.
                </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="cipher-solution" className="block text-sm font-medium text-gray-700">
                        Decoded Solution:
                    </label>
                    <input
                        id="cipher-solution"
                        type="text"
                        value={solution}
                        onChange={(e) => setSolution(e.target.value.toUpperCase())}
                        required
                        disabled={loading}
                        placeholder="Enter decoded text"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm font-mono focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                    />
                </div>
                {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
                <button 
                    type="submit" 
                    disabled={loading || !solution}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                    {loading ? 'Verifying...' : 'Submit Solution'}
                </button>
            </form>
        </div>
    );
};

export default CaeserCipher;