import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router";
import { useAuth } from "./context/AuthContext.jsx";
import RegisterPage from './pages/RegisterPage.jsx';

function App() {
  const { user, setuser } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
