import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoaderAnimation from '../LoaderAnimation'


function Form() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [securityQuestions, setSecurityQuestions] = useState<string[]>(['', '', '']);
  const [securityAnswers, setSecurityAnswers] = useState<string[]>(['', '', '']);
  const [currentStep, setCurrentStep] = useState(1);
  const [isFlipping, setIsFlipping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const navigate = useNavigate();
  const availableQuestions = [
    "What was the name of your first teacher?",
    "What is the title of your favorite childhood book?",
    "What was the name of your first stuffed animal or toy?",
    "In what city did your parents meet?",
    "What was your favorite food as a child?"
  ];

  const nextStep = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentStep(2);
      setIsFlipping(false);
    }, 300);
  };

  const prevStep = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentStep(1);
      setIsFlipping(false);
    }, 300);
  };
  
  const handleSecurityQuestionChange = (index: number, question: string) => {
    const updatedQuestions = [...securityQuestions];
    updatedQuestions[index] = question;
    setSecurityQuestions(updatedQuestions);
  };

  const handleSecurityAnswerChange = (index: number, answer: string) => {
    const updatedAnswers = [...securityAnswers];
    updatedAnswers[index] = answer;
    setSecurityAnswers(updatedAnswers);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      // Format security questions and answers into required structure
      const formattedSecurityQuestions = securityQuestions.map((question, index) => ({
        question: question,
        answer: securityAnswers[index]
      }));

      const response = await fetch(`${import.meta.env.VITE_SERVER}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          userType: "customer",
          securityQuestions: formattedSecurityQuestions
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        console.log('Registration successful:', data);
        navigate("/login")
        // Handle successful registration (e.g., show success message, redirect)
      } else {
        console.error('Registration failed:', data);
        setError('Registration failed. Please try again.');
        // Handle registration failure (e.g., show error message)
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError('An error occurred. Please check your network connection and try again.');
      // Handle network errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto">
      <LoaderAnimation isLoading={loading} />
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Open DalScooter account 🎉</h2>
        
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
        
        <div className={`perspective-1000 ${isFlipping ? 'pointer-events-none' : ''}`}>
          <div className={`relative transition-transform duration-300 ${isFlipping ? 'scale-95 opacity-90' : ''}`}>
            {currentStep === 1 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm text-left font-medium text-700 text-black">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="Enter your first name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm text-left font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Enter your last name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm text-left font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm text-left font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex mt-8">
                  <button 
                    type="button" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-200"
                    onClick={nextStep}
                    disabled={!firstName || !lastName || !email || !password}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <button 
                    type="button"
                    onClick={prevStep}
                    className="mr-3 text-white hover:text-gray-700"
                    aria-label="Back to previous step"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <h3 className="text-xl font-medium text-gray-700">Security Questions</h3>
                </div>
                <p className="text-sm text-gray-500">Please select and answer three security questions</p>
                
                {[0, 1, 2].map((index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-medium text-black">
                      Security Question {index + 1}
                    </label>
                    <select
                      value={securityQuestions[index]}
                      onChange={(e) => handleSecurityQuestionChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                      required
                    >
                      <option value="">Select a security question</option>
                      {availableQuestions.map((question, qIndex) => (
                        <option 
                          key={qIndex} 
                          value={question}
                          disabled={securityQuestions.includes(question) && securityQuestions[index] !== question}
                          className="text-black"
                        >
                          {question}
                        </option>
                      ))}
                    </select>
                    
                    {securityQuestions[index] && (
                      <>
                        <label className="block text-sm font-medium text-black mt-2">Your Answer</label>
                        <input
                          type="text"
                          value={securityAnswers[index]}
                          onChange={(e) => handleSecurityAnswerChange(index, e.target.value)}
                          placeholder="Your answer"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </>
                    )}
                  </div>
                ))}

                <div className="flex mt-8">
                  <button 
                    type="button" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-200"
                    onClick={handleRegister}
                    disabled={securityQuestions.some(q => !q) || securityAnswers.some(a => !a) || loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Registering...
                      </span>
                    ) : (
                      'Register'
                    )}
                  </button>
                </div>

                {error && (
                  <div className="mt-4 text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Form