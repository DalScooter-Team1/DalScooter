import React from 'react'
import Register from './pages/Register'
import ReactDOM from "react-dom/client";
import Login from './pages/Login'
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
     <BrowserRouter>
      <Routes>
        <Route path='/' element={<Register />} />
        <Route path='/login' element= {<Login/>}/>
      </Routes>
      </BrowserRouter>
     
  )
}

export default App