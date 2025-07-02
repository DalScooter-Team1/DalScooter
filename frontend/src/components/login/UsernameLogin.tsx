import React, { useState } from 'react';
import {
  CognitoUser,
  CognitoUserPool,
  AuthenticationDetails,
  CognitoUserSession
} from 'amazon-cognito-identity-js';
import QuestionAnswer from './QuestionAnswer';
import CaeserCipher from './CaeserCipher';
import { formatAuthError } from '../../utils/errorHandler';

const COGNITO_CONFIG = {
    UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID
};

const UsernameLogin: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<string>('login');
    const [cognitoUser, setCognitoUser] = useState<CognitoUser | null>(null);
    const [challengeParams, setChallengeParams] = useState<any>({});
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const userPool = new CognitoUserPool(COGNITO_CONFIG);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const authDetails = new AuthenticationDetails({
                Username: email,
                Password: password,
            });

            const user = new CognitoUser({
                Username: email,
                Pool: userPool,
            });

            setCognitoUser(user);

            user.initiateAuth(authDetails, {
                onSuccess: (result: CognitoUserSession) => {
                    setCurrentStep('success');
                    storeTokens(result);
                    setLoading(false);
                },
                onFailure: (err: Error) => {
                    setError(formatAuthError(err.message, 'login'));
                    setLoading(false);
                },
                customChallenge: (params: any) => {
                    setChallengeParams(params);
                    
                    // Check if there's an error message from previous challenge
                    if (params.errorCode) {
                        setError(formatAuthError(params.errorMessage || params.errorCode, 
                            params.errorCode === 'SECURITY_QUESTION' ? 'factor2' : 'factor3'));
                    }
                    
                    if (params.challengeType === 'SECURITY_QUESTION') {
                        setCurrentStep('factor2');
                    } else if (params.challengeType === 'CAESAR_CIPHER') {
                        setCurrentStep('factor3');
                    }
                    
                    setLoading(false);
                }
            });
        } catch (err: unknown) {
            const error = err as Error;
            setError(formatAuthError(error.message, 'login'));
            setLoading(false);
        }
    };

    const handleChallengeResponse = async (answerValue: string) => {
        setLoading(true);
        setError('');

        if (!cognitoUser) return;

        cognitoUser.sendCustomChallengeAnswer(answerValue, {
            onSuccess: (result: CognitoUserSession) => {
                setCurrentStep('success');
                storeTokens(result);
                setLoading(false);
            },
            onFailure: (err: Error) => {
                // Use the current step to determine which error message to show
                const authStage = currentStep === 'factor2' ? 'factor2' : 'factor3';
                setError(formatAuthError(err.message, authStage));
                setLoading(false);
            },
            customChallenge: (params: any) => {
                setChallengeParams(params);
                
                // Check if there's an error message from previous challenge
                if (params.errorCode) {
                    setError(formatAuthError(params.errorMessage || params.errorCode, 
                        params.challengeType === 'SECURITY_QUESTION' ? 'factor2' : 'factor3'));
                }
                
                if (params.challengeType === 'CAESAR_CIPHER') {
                    setCurrentStep('factor3');
                }
                
                setLoading(false);
            }
        });
    };

    const storeTokens = (result: CognitoUserSession) => {
        const accessToken = result.getAccessToken().getJwtToken();
        const idToken = result.getIdToken().getJwtToken();
        const refreshToken = result.getRefreshToken().getToken();
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('idToken', idToken);
        localStorage.setItem('refreshToken', refreshToken);
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');
        setCurrentStep('login');
        setEmail('');
        setPassword('');
    };

    if (currentStep === 'login') {
        return (
            <div className="flex min-h-[80vh] items-center justify-center">
                <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-blue-600">DALScooter Login</h1>
                        <p className="mt-2 text-sm text-gray-600">Step 1 of 3</p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                />
                            </div>
                        </div>
                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                                <div className="flex items-start">
                                    <svg className="h-5 w-5 text-red-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="font-medium">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                            >
                                {loading ? 'Authenticating...' : 'Continue'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    if (currentStep === 'factor2') {
        return (
            <div className="flex min-h-[80vh] items-center justify-center">
                <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-blue-600">DALScooter Login</h1>
                        <p className="mt-2 text-sm text-gray-600">Step 2 of 3</p>
                    </div>
                    <QuestionAnswer
                        question={challengeParams.question}
                        onAnswer={handleChallengeResponse}
                        loading={loading}
                        error={error}
                    />
                </div>
            </div>
        );
    }

    if (currentStep === 'factor3') {
        return (
            <div className="flex min-h-[80vh] items-center justify-center">
                <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-blue-600">DALScooter Login</h1>
                        <p className="mt-2 text-sm text-gray-600">Step 3 of 3</p>
                    </div>
                    <CaeserCipher
                        cipherText={challengeParams.cipherText}
                        shift={challengeParams.shift}
                        onSolve={handleChallengeResponse}
                        loading={loading}
                        error={error}
                    />
                </div>
            </div>
        );
    }

    if (currentStep === 'success') {
        return (
            <div className="flex min-h-[80vh] items-center justify-center">
                <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md text-center">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                            <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="mt-3 text-3xl font-bold text-green-600">Authentication Successful!</h1>
                        <p className="mt-4 text-lg text-gray-600">Welcome to DALScooter!</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="mt-8 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    return <div>Unknown step</div>;
};

export default UsernameLogin;