import React from 'react';
import UsernameLogin from '../components/login/UsernameLogin';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-xl bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Top Header Section */}
                <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-6 text-gray-800">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">DALScooter</h1>
                            <p className="text-amber-800 text-sm">Access your account</p>
                        </div>
                        <div className="rounded-full bg-white/20 p-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6">
                    <div className="mb-6">
                        <div className="flex items-center space-x-2">
                            <div className="h-1 flex-1 bg-amber-500"></div>
                            <p className="text-sm font-medium text-gray-500">Secure Login</p>
                            <div className="h-1 flex-1 bg-gray-200"></div>
                        </div>
                    </div>
                    
                    <UsernameLogin />
                    
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{" "}
                            <Link to="/" className="text-amber-600 hover:text-amber-800 font-medium">
                                Register here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;