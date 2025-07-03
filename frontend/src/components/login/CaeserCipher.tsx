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
        <div className="space-y-4">
            <div className="bg-amber-50 p-5 rounded-lg border border-amber-100">
                <div className="flex items-center mb-4">
                    <div className="bg-amber-100 p-1.5 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h3 className="font-medium text-amber-800">Caesar Cipher Challenge</h3>
                </div>
                
                <div className="ml-9 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <span className="text-sm font-medium text-amber-800">Encrypted Text:</span>
                        <span className="font-mono text-lg bg-amber-100 px-3 py-1 rounded mt-1 md:mt-0 text-amber-900">{cipherText}</span>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <span className="text-sm font-medium text-amber-800">Shift Value:</span>
                        <span className="font-mono text-lg bg-amber-100 px-3 py-1 rounded mt-1 md:mt-0 text-amber-900">{shift}</span>
                    </div>
                    
                    <div className="bg-amber-100/50 p-2 rounded mt-2">
                        <p className="text-sm text-amber-700">
                            <span className="font-medium">Instructions:</span> Decode the text by shifting each letter back by the number shown above, then enter the original word.
                        </p>
                    </div>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="cipher-solution" className="block text-sm font-medium text-gray-700">
                        Your Solution
                    </label>
                    <input
                        id="cipher-solution"
                        type="text"
                        value={solution}
                        onChange={(e) => setSolution(e.target.value.toUpperCase())}
                        required
                        disabled={loading}
                        placeholder="Enter decoded text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm font-mono focus:outline-none focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100"
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
                    className="w-full bg-[#ffd501] hover:bg-amber-500 text-white font-medium py-3 px-4 rounded-md transition duration-200 flex justify-center items-center disabled:bg-amber-300"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying...
                        </>
                    ) : 'Submit Solution'}
                </button>
            </form>
        </div>
    );
};

export default CaeserCipher;