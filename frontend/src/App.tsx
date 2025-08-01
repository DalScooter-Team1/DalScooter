import React from 'react'
import Register from './pages/Register'
import ReactDOM from "react-dom/client";
import Login from './pages/Login'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import BikeDetails from './pages/BikeDetails';
import { useHeartbeatInitializer } from './hooks/useHeartbeatInitializer';
import Home from './pages/Home';
import ChatbotWidget from './components/chatbot/ChatbotWidget';

function App() {
  // Initialize heartbeat service for customers
  useHeartbeatInitializer();

  return (
    <BrowserRouter>
      <Routes>

        <Route path='/' element={<Home />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/admin-dashboard' element={<AdminDashboard />} />
        <Route path='/customer-dashboard' element={<CustomerDashboard />} />
        <Route path='/bike/:bikeId' element={<BikeDetails />} />

      </Routes>

      {/* Global Chatbot Widget - accessible from all pages */}
      <ChatbotWidget />
    </BrowserRouter>

  )
}

export default App