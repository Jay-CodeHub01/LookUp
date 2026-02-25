import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router";
import { useAuth } from "./context/AuthContext.jsx";
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

function App() {
  const { user, setuser } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
