import React, { createContext, useContext, useState } from 'react';

// Define auth state type
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  authStep: 'username' | 'securityQuestion' | 'caesarCipher' | 'complete';
  challengeData: any | null;
}

// Define context type
interface AuthContextType {
  authState: AuthState;
  signIn: (username: string, password: string) => Promise<any>;
  answerSecurityQuestion: (answer: string) => Promise<any>;
  answerCaesarCipher: (answer: string) => Promise<any>;
  signOut: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    authStep: 'username',
    challengeData: null
  });

  // Mock signIn for development
  const signIn = async (username: string, password: string) => {
    // Simulate API call
    setAuthState({
      ...authState,
      user: { username },
      authStep: 'securityQuestion',
      challengeData: { 
        question: "What was your first pet's name?" 
      }
    });
    
    return { success: true };
  };

  // Mock answerSecurityQuestion for development
  const answerSecurityQuestion = async (answer: string) => {
    // Simulate API call
    setAuthState({
      ...authState,
      authStep: 'caesarCipher',
      challengeData: { 
        cipherText: "GDOVFRRWHU", 
        shift: "1" 
      }
    });
    
    return { success: true };
  };

  // Mock answerCaesarCipher for development
  const answerCaesarCipher = async (answer: string) => {
    // Simulate API call
    setAuthState({
      ...authState,
      isAuthenticated: true,
      authStep: 'complete',
      challengeData: null
    });
    
    return { success: true };
  };

  // Mock signOut for development
  const signOut = async () => {
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      authStep: 'username',
      challengeData: null
    });
  };

  const value = {
    authState,
    signIn,
    answerSecurityQuestion,
    answerCaesarCipher,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
