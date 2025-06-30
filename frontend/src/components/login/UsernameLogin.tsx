import React, { useState } from 'react';
import {
  CognitoUser,
  CognitoUserPool,
  AuthenticationDetails,
  CognitoUserSession
} from 'amazon-cognito-identity-js';
import QuestionAnswer from './QuestionAnswer';
import CaeserCipher from './CaeserCipher';

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
                    setError(err.message);
                    setLoading(false);
                },
                customChallenge: (params: any) => {
                    setChallengeParams(params);
                    
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
            setError(error.message);
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
                setError(err.message);
                setLoading(false);
            },
            customChallenge: (params: any) => {
                setChallengeParams(params);
                
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
            <div>
                <h1>DALScooter Login - Step 1 of 3</h1>
                <form onSubmit={handleLogin}>
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    {error && <div style={{color: 'red'}}>{error}</div>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Continue'}
                    </button>
                </form>
            </div>
        );
    }

    if (currentStep === 'factor2') {
        return (
            <div>
                <h1>DALScooter Login - Step 2 of 3</h1>
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
            <div>
                <h1>DALScooter Login - Step 3 of 3</h1>
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
        return (
            <div>
                <h1>Authentication Successful!</h1>
                <p>Welcome to DALScooter!</p>
                <button onClick={handleLogout}>Logout</button>
            </div>
        );
    }

    return <div>Unknown step</div>;
};

export default UsernameLogin;