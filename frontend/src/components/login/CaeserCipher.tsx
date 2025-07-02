
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
                {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                        <div className="flex items-start">
                            <svg className="h-5 w-5 text-red-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="font-medium">{error}</p>
                                <p className="text-xs mt-1">Remember to decode by shifting each letter back by the number provided and enter the original word.</p>
                            </div>
                        </div>
                    </div>
                )}
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