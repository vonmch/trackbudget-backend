// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

// 1. Define your Backend URLs explicitly (Same logic as api.js)
const LOCAL_URL = 'http://127.0.0.1:4000/api';
const PROD_URL = 'https://trackbudgetbuild.onrender.com';

// 2. AUTOMATIC SWITCHER
const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? LOCAL_URL
  : PROD_URL;

const API_URL = `${BASE_URL}/auth`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setUser({ email: 'User' }); 
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log(`Attempting login to: ${API_URL}/login`); 
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Login Network Error:", error);
      return { success: false, error: 'Network error: Could not reach server.' };
    }
  };

  const signup = async (email, password, fullName) => {
    try {
      console.log(`Attempting signup to: ${API_URL}/signup`);
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Signup Network Error:", error);
      return { success: false, error: 'Network error: Could not reach server.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    window.location.href = '/signup'; 
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, signup, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);