import React from 'react'
import Register from './pages/Register'
import ReactDOM from "react-dom/client";
import Login from './pages/Login'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
     <BrowserRouter>
      <Routes>

        {/* <Route path='/' element={<Register />} /> */}
        <Route path='/login' element= {<Login/>}/>
        {/* <Route path='/admin-dashboard' element={<AdminDashboard/>}/> */}
        <Route path='/' element={<AdminDashboard />} />
      </Routes>
      </BrowserRouter>
     
  )
}

export default App