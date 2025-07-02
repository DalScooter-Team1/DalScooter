import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'


function Form() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [securityQuestions, setSecurityQuestions] = useState<string[]>(['', '', '']);
  const [securityAnswers, setSecurityAnswers] = useState<string[]>(['', '', '']);

  const navigate = useNavigate();
  const availableQuestions = [
    "What was the name of your first teacher?",
    "What is the title of your favorite childhood book?",
    "What was the name of your first stuffed animal or toy?",
    "In what city did your parents meet?",
    "What was your favorite food as a child?"
  ];

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
    try {
      // Format security questions and answers into required structure
      const formattedSecurityQuestions = securityQuestions.map((question, index) => ({
        question: question,
        answer: securityAnswers[index]
      }));

      const response = await fetch(`${import.meta.env.VITE_SERVER}/prod/register`, {
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
        // Handle registration failure (e.g., show error message)
      }
    } catch (error) {
      console.error('Error during registration:', error);
      // Handle network errors
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Register</h2>
        
        <div className="space-y-2">
          <label htmlFor="firstName" className="block text-sm text-left font-medium text-gray-700">First Name</label>
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

        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-700">Security Questions</h3>
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
        </div>

        <div className="flex">
          <button 
            type="button" 
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-200"
            onClick={handleRegister}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  )
}

export default Form