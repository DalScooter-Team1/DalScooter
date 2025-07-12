import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CognitoUser,
  CognitoUserPool,
  AuthenticationDetails,
  CognitoUserSession
} from 'amazon-cognito-identity-js';
import QuestionAnswer from './QuestionAnswer';
import CaeserCipher from './CaeserCipher';
import { formatAuthError } from '../../utils/errorHandler';
 import { jwtDecode } from 'jwt-decode';
import LoaderAnimation from '../LoaderAnimation';



const COGNITO_CONFIG = {
    UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID
};

const UsernameLogin: React.FC = () => {
    const navigate = useNavigate();
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
        
        // Check if user is admin and navigate automatically
        try {
            const decodedToken: any = jwtDecode(idToken);
            const roles = decodedToken['cognito:groups'] || [];
            localStorage.setItem('userRoles', JSON.stringify(roles));
            
            // If user is an admin (franchise role), navigate to admin dashboard after a short delay
            if (roles.includes('franchise')) {
                setTimeout(() => {
                    navigate('/admin-dashboard');
                }, 2000); // 2 second delay to show success message
            }
        } catch (error) {
            console.error('Error checking user roles:', error);
        }
    };

    const getUserRolesFromToken = (): string[] => {
        const token = localStorage.getItem('idToken');
        
        if (token) {
            try {
                // Decode the ID token to get user information
                const decodedToken: any = jwtDecode(token);
                
                // Extract roles from decoded token
                const roles = decodedToken['cognito:groups'] || [];
                localStorage.setItem('userRoles', JSON.stringify(roles));
                console.log('Decoded Token:', decodedToken);
                return roles as string[];
            } catch (error) {
                console.error('Error decoding token:', error);
                return [];
            }
        } else {
            console.warn('No token found in localStorage');
            return [];
        }
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
            <div className="space-y-6">
                <LoaderAnimation isLoading={loading} />
                <h2 className="text-xl font-medium text-gray-800 mb-6">Welcome Back 👋</h2>
                <p className="text-sm text-gray-600 mb-4">Step 1 of 3: Enter your credentials</p>
                <form className="space-y-4" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm text-left font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                placeholder="Enter your email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm text-left font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                placeholder="Enter your password"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100"
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end">
                        <a href="#" className="text-sm text-amber-600 hover:text-amber-800">
                            Forgot password?
                        </a>
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
                    
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#ffd501] hover:bg-amber-500 text-white font-medium py-3 px-4 rounded-md transition duration-200 flex justify-center items-center disabled:bg-amber-300"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Authenticating...
                                </>
                            ) : 'Continue'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    if (currentStep === 'factor2') {
        return (
            <div className="space-y-6">
                <LoaderAnimation isLoading={loading} />
                <div className="flex items-center mb-4">
                    <button 
                        type="button"
                        onClick={() => setCurrentStep('login')}
                        className="mr-3 text-black hover:text-gray-700"
                        aria-label="Back to previous step"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <h2 className="text-xl font-medium text-gray-800">Security Verification</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">Step 2 of 3: Answer your security question</p>
                
                <QuestionAnswer
                    question={challengeParams.question}
                    onAnswer={handleChallengeResponse}
                    loading={loading}
                    error={error}
                />
            </div>
        );
    }

    if (currentStep === 'factor3') {
        return (
            <div className="space-y-6">
                <LoaderAnimation isLoading={loading} />
                <div className="flex items-center mb-4">
                    <button 
                        type="button"
                        onClick={() => setCurrentStep('factor2')}
                        className="mr-3 text-black hover:text-gray-700"
                        aria-label="Back to previous step"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <h2 className="text-xl font-medium text-gray-800">Final Verification</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">Step 3 of 3: Solve the cipher challenge</p>
                
                <CaeserCipher
                    cipherText={challengeParams.cipherText}
                    shift={challengeParams.shift}
                    onSolve={handleChallengeResponse}
                    loading={loading}
                    error={error}
                />
            </div>
        );
    }

    if (currentStep === 'success') {
        //TO DO: replace this with actual redirection pages.
        
        // Get user roles from token
        const userRoles = getUserRolesFromToken();
        const isAdmin = userRoles.includes('franchise');
        
        return (
            <div className="space-y-6 text-center py-4">
                <LoaderAnimation isLoading={loading} />
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100">
                    <svg className="h-10 w-10 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-amber-600 mt-4">Login Successful!</h2>
                <p className="text-gray-600 mb-6">Welcome to DALScooter! You're all set to ride.</p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-gray-500 mb-2">You are now logged in as</p>
                    <p className="text-lg font-medium">{email}</p>
                    
                    {userRoles.length > 0 && (
                        <div className="mt-3">
                            <p className="text-sm text-gray-500 mb-1">Your roles:</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {userRoles.map((role, index) => (
                                    <span 
                                        key={index} 
                                        className={`text-xs px-2 py-1 rounded-full ${
                                            role === 'franchise' 
                                                ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                                : 'bg-gray-100 text-gray-800 border border-gray-300'
                                        }`}
                                    >
                                        {role}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                {isAdmin && (
                    <div className="mb-6 bg-amber-50 p-3 rounded-lg border border-amber-200">
                        <p className="text-amber-800 font-medium">Admin Access Granted</p>
                        <p className="text-xs text-amber-700 mt-1">You have administrative privileges</p>
                        <p className="text-xs text-amber-600 mt-2">Redirecting to Admin Dashboard...</p>
                    </div>
                )}
                
                <div className="space-y-3">
                    {isAdmin && (
                        <button 
                            onClick={() => navigate('/admin-dashboard')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-200 flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Go to Admin Dashboard
                        </button>
                    )}
                    
                    <button 
                        onClick={handleLogout}
                        className="w-full bg-[#ffd501] hover:bg-amber-500 text-white font-medium py-3 px-4 rounded-md transition duration-200"
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